const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all challenges
// @route   GET /api/v1/challenges
// @access  Public
exports.getChallenges = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single challenge
// @route   GET /api/v1/challenges/:id
// @access  Public
exports.getChallenge = asyncHandler(async (req, res, next) => {
  const challenge = await Challenge.findById(req.params.id)
    .populate({
      path: 'participants',
      select: 'fullName username profilePicture'
    })
    .populate({
      path: 'submissions',
      populate: {
        path: 'userId',
        select: 'fullName username profilePicture'
      }
    });

  if (!challenge) {
    return next(new ErrorResponse(`Challenge not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: challenge
  });
});

// @desc    Create new challenge
// @route   POST /api/v1/challenges
// @access  Private (Admin only)
exports.createChallenge = asyncHandler(async (req, res, next) => {
  const challenge = await Challenge.create(req.body);

  // Notify users about new challenge
  // In a real app, you might want to notify only users interested in this category
  const users = await User.find();
  
  for (const user of users) {
    await Notification.create({
      recipientId: user._id,
      type: 'challenge',
      contentId: challenge._id,
      contentType: 'Challenge',
      text: `New challenge available: ${challenge.title}`
    });
  }

  res.status(201).json({
    success: true,
    data: challenge
  });
});

// @desc    Update challenge
// @route   PUT /api/v1/challenges/:id
// @access  Private (Admin only)
exports.updateChallenge = asyncHandler(async (req, res, next) => {
  let challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return next(new ErrorResponse(`Challenge not found with id of ${req.params.id}`, 404));
  }

  challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: challenge
  });
});

// @desc    Delete challenge
// @route   DELETE /api/v1/challenges/:id
// @access  Private (Admin only)
exports.deleteChallenge = asyncHandler(async (req, res, next) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return next(new ErrorResponse(`Challenge not found with id of ${req.params.id}`, 404));
  }

  // Delete all submissions for this challenge
  await Submission.deleteMany({ challengeId: challenge._id });

  await challenge.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join challenge
// @route   PUT /api/v1/challenges/:id/join
// @access  Private
exports.joinChallenge = asyncHandler(async (req, res, next) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return next(new ErrorResponse(`Challenge not found with id of ${req.params.id}`, 404));
  }

  // Check if user already joined
  if (challenge.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User already joined this challenge`, 400));
  }

  // Add user to participants
  challenge.participants.push(req.user.id);
  await challenge.save();

  res.status(200).json({
    success: true,
    data: challenge
  });
});

// @desc    Submit to challenge
// @route   POST /api/v1/challenges/:id/submit
// @access  Private
exports.submitToChallenge = asyncHandler(async (req, res, next) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return next(new ErrorResponse(`Challenge not found with id of ${req.params.id}`, 404));
  }

  // Check if challenge is still active
  if (new Date(challenge.deadline) < new Date()) {
    return next(new ErrorResponse(`Challenge deadline has passed`, 400));
  }

  // Check if user has already submitted
  const existingSubmission = await Submission.findOne({
    challengeId: challenge._id,
    userId: req.user.id
  });

  if (existingSubmission) {
    return next(new ErrorResponse(`You have already submitted to this challenge`, 400));
  }

  // Add user and challenge to req.body
  req.body.userId = req.user.id;
  req.body.challengeId = req.params.id;

  const submission = await Submission.create(req.body);

  // Add submission to challenge
  challenge.submissions.push(submission._id);
  
  // Add user to participants if not already
  if (!challenge.participants.includes(req.user.id)) {
    challenge.participants.push(req.user.id);
  }
  
  await challenge.save();

  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Get submissions for a challenge
// @route   GET /api/v1/challenges/:id/submissions
// @access  Public
exports.getChallengeSubmissions = asyncHandler(async (req, res, next) => {
  const challenge = await Challenge.findById(req.params.id);

  if (!challenge) {
    return next(new ErrorResponse(`Challenge not found with id of ${req.params.id}`, 404));
  }

  const submissions = await Submission.find({ challengeId: req.params.id })
    .populate({
      path: 'userId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Vote for a submission
// @route   PUT /api/v1/submissions/:id/vote
// @access  Private
exports.voteSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404));
  }

  // Check if user has already voted
  const hasVoted = submission.votes.includes(req.user.id);

  if (hasVoted) {
    // Remove vote
    submission.votes = submission.votes.filter(vote => vote.toString() !== req.user.id);
  } else {
    // Add vote
    submission.votes.push(req.user.id);

    // Create notification if user is not voting for their own submission
    if (submission.userId.toString() !== req.user.id) {
      const challenge = await Challenge.findById(submission.challengeId);
      
      await Notification.create({
        recipientId: submission.userId,
        senderId: req.user.id,
        type: 'like',
        contentId: submission._id,
        contentType: 'Challenge',
        text: `${req.user.fullName} voted for your submission in "${challenge.title}"`
      });
    }
  }

  await submission.save();

  res.status(200).json({
    success: true,
    data: submission
  });
});
