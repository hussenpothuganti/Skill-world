const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'challenge', 'battle_invite']
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType'
  },
  contentType: {
    type: String,
    enum: ['Post', 'Comment', 'Challenge', 'Battle', null]
  },
  text: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
