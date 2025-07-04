const mongoose = require('mongoose');

const SkillRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillCategory: {
    type: String,
    required: [true, 'Please provide a skill category']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isLive: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String,
    default: ''
  },
  roomUrl: {
    type: String,
    default: ''
  },
  scheduledFor: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillRoom', SkillRoomSchema);
