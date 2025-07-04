const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'userId',
      select: 'fullName username profilePicture'
    })
    .populate({
      path: 'commentsList',
      populate: {
        path: 'userId',
        select: 'fullName username profilePicture'
      }
    });

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Increment view count
  post.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user.id;

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is post owner
  if (post.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this post`, 401));
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is post owner
  if (post.userId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this post`, 401));
  }

  await post.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like/unlike post
// @route   PUT /api/v1/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  // Check if the post has already been liked by this user
  const isLiked = post.likes.includes(req.user.id);

  if (isLiked) {
    // Unlike the post
    post.likes = post.likes.filter(like => like.toString() !== req.user.id);
  } else {
    // Like the post
    post.likes.push(req.user.id);

    // Create notification if user is not liking their own post
    if (post.userId.toString() !== req.user.id) {
      await Notification.create({
        recipientId: post.userId,
        senderId: req.user.id,
        type: 'like',
        contentId: post._id,
        contentType: 'Post',
        text: `${req.user.fullName} liked your post "${post.title}"`
      });
    }
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Get posts by user
// @route   GET /api/v1/posts/user/:userId
// @access  Public
exports.getUserPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ userId: req.params.userId })
    .populate({
      path: 'userId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});

// @desc    Get posts by skill category
// @route   GET /api/v1/posts/category/:category
// @access  Public
exports.getCategoryPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ skillCategory: req.params.category })
    .populate({
      path: 'userId',
      select: 'fullName username profilePicture'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});
