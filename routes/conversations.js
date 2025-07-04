const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  getMessages
} = require('../controllers/conversations');

router.get('/', protect, getConversations);
router.get('/:id', protect, getConversation);
router.post('/', protect, createConversation);
router.post('/:id/messages', protect, sendMessage);
router.get('/:id/messages', protect, getMessages);

module.exports = router;
