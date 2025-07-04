const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  skillCategory: {
    type: String,
    required: [true, 'Please provide a skill category']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 100
  },
  deadline: {
    type: Date,
    required: [true, 'Please provide a deadline']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
