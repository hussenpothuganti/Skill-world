const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get comments for a post
// @route   GET /api/v1/posts/:postId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ postId: req.params.postId })
    .populate({
      path: 'userId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments
  });
});

// @desc    Add comment to post
// @route   POST /api/v1/posts/:postId/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.postId}`, 404));
  }

  // Add user and post to req.body
  req.body.userId = req.user.id;
  req.body.postId = req.params.postId;

  const comment = await Comment.create(req.body);

  // Update post comment count
  post.comments += 1;
  await post.save();

  // Create notification if user is not commenting on their own post
  if (post.userId.toString() !== req.user.id) {
    await Notification.create({
      recipientId: post.userId,
      senderId: req.user.id,
      type: 'comment',
      contentId: post._id,
      contentType: 'Post',
      text: `${req.user.fullName} commented on your post "${post.title}"`
    });
  }

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc    Update comment
// @route   PUT /api/v1/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is comment owner
  if (comment.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this comment`, 401));
  }

  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is comment owner
  if (comment.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this comment`, 401));
  }

  await comment.remove();

  // Update post comment count
  const post = await Post.findById(comment.postId);
  if (post) {
    post.comments = Math.max(0, post.comments - 1);
    await post.save();
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like/unlike comment
// @route   PUT /api/v1/comments/:id/like
// @access  Private
exports.likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }

  // Check if the comment has already been liked by this user
  const isLiked = comment.likes.includes(req.user.id);

  if (isLiked) {
    // Unlike the comment
    comment.likes = comment.likes.filter(like => like.toString() !== req.user.id);
  } else {
    // Like the comment
    comment.likes.push(req.user.id);

    // Create notification if user is not liking their own comment
    if (comment.userId.toString() !== req.user.id) {
      await Notification.create({
        recipientId: comment.userId,
        senderId: req.user.id,
        type: 'like',
        contentId: comment._id,
        contentType: 'Comment',
        text: `${req.user.fullName} liked your comment`
      });
    }
  }

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment
  });
});
