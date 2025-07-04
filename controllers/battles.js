const Battle = require('../models/Battle');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all battles
// @route   GET /api/v1/battles
// @access  Public
exports.getBattles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single battle
// @route   GET /api/v1/battles/:id
// @access  Public
exports.getBattle = asyncHandler(async (req, res, next) => {
  const battle = await Battle.findById(req.params.id)
    .populate({
      path: 'participantA.userId',
      select: 'fullName username profilePicture'
    })
    .populate({
      path: 'participantB.userId',
      select: 'fullName username profilePicture'
    });

  if (!battle) {
    return next(new ErrorResponse(`Battle not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: battle
  });
});

// @desc    Create new battle
// @route   POST /api/v1/battles
// @access  Private
exports.createBattle = asyncHandler(async (req, res, next) => {
  // Add creator as participant A
  req.body.participantA = {
    userId: req.user.id,
    mediaUrl: req.body.participantAMediaUrl,
    votes: []
  };

  // Check if participant B exists
  const participantB = await User.findById(req.body.participantBId);
  if (!participantB) {
    return next(new ErrorResponse(`User not found with id of ${req.body.participantBId}`, 404));
  }

  // Set participant B
  req.body.participantB = {
    userId: req.body.participantBId,
    mediaUrl: '', // Will be filled when they accept
    votes: []
  };

  // Remove unnecessary fields
  delete req.body.participantAMediaUrl;
  delete req.body.participantBId;

  const battle = await Battle.create(req.body);

  // Create notification for participant B
  await Notification.create({
    recipientId: battle.participantB.userId,
    senderId: req.user.id,
    type: 'battle_invite',
    contentId: battle._id,
    contentType: 'Battle',
    text: `${req.user.fullName} invited you to a battle: "${battle.title}"`
  });

  res.status(201).json({
    success: true,
    data: battle
  });
});

// @desc    Accept battle invitation
// @route   PUT /api/v1/battles/:id/accept
// @access  Private
exports.acceptBattle = asyncHandler(async (req, res, next) => {
  const battle = await Battle.findById(req.params.id);

  if (!battle) {
    return next(new ErrorResponse(`Battle not found with id of ${req.params.id}`, 404));
  }

  // Check if user is participant B
  if (battle.participantB.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to accept this battle`, 401));
  }

  // Check if battle is still active
  if (!battle.isActive) {
    return next(new ErrorResponse(`This battle is no longer active`, 400));
  }

  // Check if media URL is provided
  if (!req.body.mediaUrl) {
    return next(new ErrorResponse(`Please provide a media URL`, 400));
  }

  // Update participant B media URL
  battle.participantB.mediaUrl = req.body.mediaUrl;
  await battle.save();

  // Create notification for participant A
  await Notification.create({
    recipientId: battle.participantA.userId,
    senderId: req.user.id,
    type: 'battle_invite',
    contentId: battle._id,
    contentType: 'Battle',
    text: `${req.user.fullName} accepted your battle invitation: "${battle.title}"`
  });

  res.status(200).json({
    success: true,
    data: battle
  });
});

// @desc    Vote for a battle participant
// @route   PUT /api/v1/battles/:id/vote/:participant
// @access  Private
exports.voteBattle = asyncHandler(async (req, res, next) => {
  const battle = await Battle.findById(req.params.id);

  if (!battle) {
    return next(new ErrorResponse(`Battle not found with id of ${req.params.id}`, 404));
  }

  // Check if battle is still active
  if (!battle.isActive || new Date(battle.endTime) < new Date()) {
    return next(new ErrorResponse(`This battle is no longer active`, 400));
  }

  // Check if participant is valid
  if (req.params.participant !== 'A' && req.params.participant !== 'B') {
    return next(new ErrorResponse(`Invalid participant. Must be 'A' or 'B'`, 400));
  }

  const participant = req.params.participant === 'A' ? 'participantA' : 'participantB';
  const otherParticipant = req.params.participant === 'A' ? 'participantB' : 'participantA';

  // Check if user has already voted for either participant
  const hasVotedA = battle.participantA.votes.includes(req.user.id);
  const hasVotedB = battle.participantB.votes.includes(req.user.id);

  if (hasVotedA || hasVotedB) {
    return next(new ErrorResponse(`You have already voted in this battle`, 400));
  }

  // Add vote
  battle[participant].votes.push(req.user.id);
  await battle.save();

  // Create notification for the voted participant
  if (battle[participant].userId.toString() !== req.user.id) {
    await Notification.create({
      recipientId: battle[participant].userId,
      senderId: req.user.id,
      type: 'like',
      contentId: battle._id,
      contentType: 'Battle',
      text: `${req.user.fullName} voted for you in the battle "${battle.title}"`
    });
  }

  res.status(200).json({
    success: true,
    data: battle
  });
});

// @desc    Get active battles
// @route   GET /api/v1/battles/active
// @access  Public
exports.getActiveBattles = asyncHandler(async (req, res, next) => {
  const battles = await Battle.find({
    isActive: true,
    endTime: { $gt: new Date() },
    'participantB.mediaUrl': { $ne: '' } // Only battles where both participants have submitted
  })
    .populate({
      path: 'participantA.userId',
      select: 'fullName username profilePicture'
    })
    .populate({
      path: 'participantB.userId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: battles.length,
    data: battles
  });
});

// @desc    Get user battles
// @route   GET /api/v1/battles/user
// @access  Private
exports.getUserBattles = asyncHandler(async (req, res, next) => {
  const battles = await Battle.find({
    $or: [
      { 'participantA.userId': req.user.id },
      { 'participantB.userId': req.user.id }
    ]
  })
    .populate({
      path: 'participantA.userId',
      select: 'fullName username profilePicture'
    })
    .populate({
      path: 'participantB.userId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: battles.length,
    data: battles
  });
});
