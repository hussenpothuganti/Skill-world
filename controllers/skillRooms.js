const SkillRoom = require('../models/SkillRoom');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all skill rooms
// @route   GET /api/v1/skillrooms
// @access  Public
exports.getSkillRooms = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single skill room
// @route   GET /api/v1/skillrooms/:id
// @access  Public
exports.getSkillRoom = asyncHandler(async (req, res, next) => {
  const skillRoom = await SkillRoom.findById(req.params.id)
    .populate({
      path: 'hostId',
      select: 'fullName username profilePicture'
    })
    .populate({
      path: 'participants',
      select: 'fullName username profilePicture'
    });

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: skillRoom
  });
});

// @desc    Create new skill room
// @route   POST /api/v1/skillrooms
// @access  Private
exports.createSkillRoom = asyncHandler(async (req, res, next) => {
  // Add host to req.body
  req.body.hostId = req.user.id;
  
  // Add host to participants
  req.body.participants = [req.user.id];

  const skillRoom = await SkillRoom.create(req.body);

  res.status(201).json({
    success: true,
    data: skillRoom
  });
});

// @desc    Update skill room
// @route   PUT /api/v1/skillrooms/:id
// @access  Private
exports.updateSkillRoom = asyncHandler(async (req, res, next) => {
  let skillRoom = await SkillRoom.findById(req.params.id);

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is room host
  if (skillRoom.hostId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this skill room`, 401));
  }

  skillRoom = await SkillRoom.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: skillRoom
  });
});

// @desc    Delete skill room
// @route   DELETE /api/v1/skillrooms/:id
// @access  Private
exports.deleteSkillRoom = asyncHandler(async (req, res, next) => {
  const skillRoom = await SkillRoom.findById(req.params.id);

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is room host
  if (skillRoom.hostId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this skill room`, 401));
  }

  await skillRoom.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join skill room
// @route   PUT /api/v1/skillrooms/:id/join
// @access  Private
exports.joinSkillRoom = asyncHandler(async (req, res, next) => {
  const skillRoom = await SkillRoom.findById(req.params.id);

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  // Check if user already joined
  if (skillRoom.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User already joined this skill room`, 400));
  }

  // Add user to participants
  skillRoom.participants.push(req.user.id);
  await skillRoom.save();

  // Create notification for host
  if (skillRoom.hostId.toString() !== req.user.id) {
    await Notification.create({
      recipientId: skillRoom.hostId,
      senderId: req.user.id,
      type: 'follow',
      contentId: skillRoom._id,
      contentType: null,
      text: `${req.user.fullName} joined your skill room "${skillRoom.title}"`
    });
  }

  res.status(200).json({
    success: true,
    data: skillRoom
  });
});

// @desc    Leave skill room
// @route   PUT /api/v1/skillrooms/:id/leave
// @access  Private
exports.leaveSkillRoom = asyncHandler(async (req, res, next) => {
  const skillRoom = await SkillRoom.findById(req.params.id);

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  // Check if user is host
  if (skillRoom.hostId.toString() === req.user.id) {
    return next(new ErrorResponse(`Host cannot leave the skill room. Delete it instead.`, 400));
  }

  // Check if user is in the room
  if (!skillRoom.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User is not in this skill room`, 400));
  }

  // Remove user from participants
  skillRoom.participants = skillRoom.participants.filter(
    participant => participant.toString() !== req.user.id
  );
  await skillRoom.save();

  res.status(200).json({
    success: true,
    data: skillRoom
  });
});

// @desc    Start live skill room
// @route   PUT /api/v1/skillrooms/:id/start
// @access  Private
exports.startSkillRoom = asyncHandler(async (req, res, next) => {
  const skillRoom = await SkillRoom.findById(req.params.id);

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is room host
  if (skillRoom.hostId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to start this skill room`, 401));
  }

  // Check if room URL is provided
  if (!req.body.roomUrl) {
    return next(new ErrorResponse(`Please provide a room URL`, 400));
  }

  // Update room status and URL
  skillRoom.isLive = true;
  skillRoom.roomUrl = req.body.roomUrl;
  await skillRoom.save();

  // Notify all participants
  for (const participantId of skillRoom.participants) {
    if (participantId.toString() !== req.user.id) {
      await Notification.create({
        recipientId: participantId,
        senderId: req.user.id,
        type: 'challenge',
        contentId: skillRoom._id,
        contentType: null,
        text: `"${skillRoom.title}" skill room is now live!`
      });
    }
  }

  res.status(200).json({
    success: true,
    data: skillRoom
  });
});

// @desc    End live skill room
// @route   PUT /api/v1/skillrooms/:id/end
// @access  Private
exports.endSkillRoom = asyncHandler(async (req, res, next) => {
  const skillRoom = await SkillRoom.findById(req.params.id);

  if (!skillRoom) {
    return next(new ErrorResponse(`Skill room not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is room host
  if (skillRoom.hostId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to end this skill room`, 401));
  }

  // Update room status
  skillRoom.isLive = false;
  await skillRoom.save();

  res.status(200).json({
    success: true,
    data: skillRoom
  });
});

// @desc    Get live skill rooms
// @route   GET /api/v1/skillrooms/live
// @access  Public
exports.getLiveSkillRooms = asyncHandler(async (req, res, next) => {
  const skillRooms = await SkillRoom.find({ isLive: true })
    .populate({
      path: 'hostId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: skillRooms.length,
    data: skillRooms
  });
});

// @desc    Get upcoming skill rooms
// @route   GET /api/v1/skillrooms/upcoming
// @access  Public
exports.getUpcomingSkillRooms = asyncHandler(async (req, res, next) => {
  const skillRooms = await SkillRoom.find({
    isLive: false,
    scheduledFor: { $gt: new Date() }
  })
    .populate({
      path: 'hostId',
      select: 'fullName username profilePicture'
    })
    .sort('scheduledFor');

  res.status(200).json({
    success: true,
    count: skillRooms.length,
    data: skillRooms
  });
});
