const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment
} = require('../controllers/comments');

router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments', protect, addComment);
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.put('/comments/:id/like', protect, likeComment);

module.exports = router;
