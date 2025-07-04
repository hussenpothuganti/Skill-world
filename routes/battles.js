const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBattles,
  getBattle,
  createBattle,
  acceptBattle,
  voteBattle,
  getActiveBattles,
  getUserBattles
} = require('../controllers/battles');

router.get('/', getBattles);
router.get('/active', getActiveBattles);
router.get('/user', protect, getUserBattles);
router.get('/:id', getBattle);
router.post('/', protect, createBattle);
router.put('/:id/accept', protect, acceptBattle);
router.put('/:id/vote/:participant', protect, voteBattle);

module.exports = router;
