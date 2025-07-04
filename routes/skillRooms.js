const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSkillRooms,
  getSkillRoom,
  createSkillRoom,
  updateSkillRoom,
  deleteSkillRoom,
  joinSkillRoom,
  leaveSkillRoom,
  startSkillRoom,
  endSkillRoom,
  getLiveSkillRooms,
  getUpcomingSkillRooms
} = require('../controllers/skillRooms');

router.get('/', getSkillRooms);
router.get('/live', getLiveSkillRooms);
router.get('/upcoming', getUpcomingSkillRooms);
router.get('/:id', getSkillRoom);
router.post('/', protect, createSkillRoom);
router.put('/:id', protect, updateSkillRoom);
router.delete('/:id', protect, deleteSkillRoom);
router.put('/:id/join', protect, joinSkillRoom);
router.put('/:id/leave', protect, leaveSkillRoom);
router.put('/:id/start', protect, startSkillRoom);
router.put('/:id/end', protect, endSkillRoom);

module.exports = router;
