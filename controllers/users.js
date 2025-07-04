const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-refreshToken -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Format response
  const formattedUser = {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    bio: user.bio,
    skillType: user.skillType,
    country: user.country,
    personalGoal: user.personalGoal,
    website: user.website,
    followers: user.followers.length,
    following: user.following.length,
    points: user.points,
    isOnboarded: user.isOnboarded,
    createdAt: user.createdAt
  };

  res.status(200).json({
    success: true,
    data: formattedUser
  });
});

// @desc    Follow user
// @route   PUT /api/v1/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
  // Check if user exists
  const userToFollow = await User.findById(req.params.id);

  if (!userToFollow) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check if user is trying to follow themselves
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse(`You cannot follow yourself`, 400));
  }

  // Check if already following
  const currentUser = await User.findById(req.user.id);
  
  if (currentUser.following.includes(req.params.id)) {
    return next(new ErrorResponse(`You are already following this user`, 400));
  }

  // Add to following
  currentUser.following.push(req.params.id);
  await currentUser.save();

  // Add to followers
  userToFollow.followers.push(req.user.id);
  await userToFollow.save();

  // Create notification
  await Notification.create({
    recipientId: req.params.id,
    senderId: req.user.id,
    type: 'follow',
    text: `${req.user.fullName} started following you`
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Unfollow user
// @route   PUT /api/v1/users/:id/unfollow
// @access  Private
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  // Check if user exists
  const userToUnfollow = await User.findById(req.params.id);

  if (!userToUnfollow) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Check if user is trying to unfollow themselves
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse(`You cannot unfollow yourself`, 400));
  }

  // Check if actually following
  const currentUser = await User.findById(req.user.id);
  
  if (!currentUser.following.includes(req.params.id)) {
    return next(new ErrorResponse(`You are not following this user`, 400));
  }

  // Remove from following
  currentUser.following = currentUser.following.filter(
    id => id.toString() !== req.params.id
  );
  await currentUser.save();

  // Remove from followers
  userToUnfollow.followers = userToUnfollow.followers.filter(
    id => id.toString() !== req.user.id
  );
  await userToUnfollow.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user followers
// @route   GET /api/v1/users/:id/followers
// @access  Public
exports.getUserFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const followers = await User.find({ _id: { $in: user.followers } })
    .select('fullName username profilePicture bio');

  res.status(200).json({
    success: true,
    count: followers.length,
    data: followers
  });
});

// @desc    Get user following
// @route   GET /api/v1/users/:id/following
// @access  Public
exports.getUserFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const following = await User.find({ _id: { $in: user.following } })
    .select('fullName username profilePicture bio');

  res.status(200).json({
    success: true,
    count: following.length,
    data: following
  });
});
