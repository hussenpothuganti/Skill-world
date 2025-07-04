const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  submitToChallenge,
  getChallengeSubmissions,
  voteSubmission
} = require('../controllers/challenges');

router.get('/', getChallenges);
router.get('/:id', getChallenge);
router.post('/', protect, createChallenge);
router.put('/:id', protect, updateChallenge);
router.delete('/:id', protect, deleteChallenge);
router.put('/:id/join', protect, joinChallenge);
router.post('/:id/submit', protect, submitToChallenge);
router.get('/:id/submissions', getChallengeSubmissions);
router.put('/submissions/:id/vote', protect, voteSubmission);

module.exports = router;
