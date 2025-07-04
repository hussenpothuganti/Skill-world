const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user conversations
// @route   GET /api/v1/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user.id] }
  }).sort('-lastMessageTime');

  // Populate other participant info for each conversation
  const populatedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      // Find the other participant (not the current user)
      const otherParticipantId = conversation.participants.find(
        p => p.toString() !== req.user.id
      );
      
      const otherParticipant = await User.findById(otherParticipantId)
        .select('fullName username profilePicture');
      
      // Count unread messages
      const unreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: req.user.id },
        isRead: false
      });
      
      return {
        _id: conversation._id,
        otherParticipant,
        lastMessage: conversation.lastMessage,
        lastMessageTime: conversation.lastMessageTime,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      };
    })
  );

  res.status(200).json({
    success: true,
    count: populatedConversations.length,
    data: populatedConversations
  });
});

// @desc    Get single conversation
// @route   GET /api/v1/conversations/:id
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is part of the conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this conversation`, 401));
  }

  // Find the other participant
  const otherParticipantId = conversation.participants.find(
    p => p.toString() !== req.user.id
  );
  
  const otherParticipant = await User.findById(otherParticipantId)
    .select('fullName username profilePicture');

  // Get messages for this conversation
  const messages = await Message.find({ conversationId: conversation._id })
    .sort('createdAt');

  // Mark messages as read
  await Message.updateMany(
    { 
      conversationId: conversation._id,
      senderId: { $ne: req.user.id },
      isRead: false
    },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    data: {
      _id: conversation._id,
      otherParticipant,
      messages,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    }
  });
});

// @desc    Create or get conversation with user
// @route   POST /api/v1/conversations
// @access  Private
exports.createConversation = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  // Check if userId is provided
  if (!userId) {
    return next(new ErrorResponse('Please provide a user ID', 400));
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, userId] }
  });

  if (conversation) {
    // Return existing conversation
    return res.status(200).json({
      success: true,
      data: conversation
    });
  }

  // Create new conversation
  conversation = await Conversation.create({
    participants: [req.user.id, userId],
    lastMessage: '',
    lastMessageTime: Date.now()
  });

  res.status(201).json({
    success: true,
    data: conversation
  });
});

// @desc    Send message
// @route   POST /api/v1/conversations/:id/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is part of the conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to send messages in this conversation`, 401));
  }

  // Create message
  const message = await Message.create({
    conversationId: conversation._id,
    senderId: req.user.id,
    text: req.body.text
  });

  // Update conversation with last message
  conversation.lastMessage = req.body.text;
  conversation.lastMessageTime = Date.now();
  await conversation.save();

  // Find recipient (other participant)
  const recipientId = conversation.participants.find(
    p => p.toString() !== req.user.id
  );

  // Create notification for recipient
  await Notification.create({
    recipientId,
    senderId: req.user.id,
    type: 'comment',
    contentId: conversation._id,
    contentType: null,
    text: `${req.user.fullName} sent you a message`
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/v1/conversations/:id/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(new ErrorResponse(`Conversation not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is part of the conversation
  if (!conversation.participants.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access messages in this conversation`, 401));
  }

  // Get messages
  const messages = await Message.find({ conversationId: conversation._id })
    .sort('createdAt');

  // Mark messages as read
  await Message.updateMany(
    { 
      conversationId: conversation._id,
      senderId: { $ne: req.user.id },
      isRead: false
    },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});
