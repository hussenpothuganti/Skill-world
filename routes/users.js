const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

module.exports = router;
