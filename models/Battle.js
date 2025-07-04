const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  skillCategory: {
    type: String,
    required: [true, 'Please provide a skill category']
  },
  participantA: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mediaUrl: {
      type: String,
      required: [true, 'Please provide a media URL']
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  participantB: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mediaUrl: {
      type: String,
      required: [true, 'Please provide a media URL']
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Battle', BattleSchema);
