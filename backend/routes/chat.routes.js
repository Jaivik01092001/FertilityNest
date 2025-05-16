const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route POST /api/chat/sessions
 * @desc Create a new chat session
 * @access Private
 */
router.post('/sessions', authenticate, chatController.createChatSession);

/**
 * @route GET /api/chat/sessions
 * @desc Get all chat sessions for current user
 * @access Private
 */
router.get('/sessions', authenticate, chatController.getChatSessions);

/**
 * @route GET /api/chat/sessions/:id
 * @desc Get a single chat session
 * @access Private
 */
router.get('/sessions/:id', authenticate, chatController.getChatSession);

/**
 * @route POST /api/chat/sessions/:id/messages
 * @desc Send message to chat session
 * @access Private
 */
router.post('/sessions/:id/messages', authenticate, chatController.sendMessage);

/**
 * @route DELETE /api/chat/sessions/:id
 * @desc Delete a chat session
 * @access Private
 */
router.delete('/sessions/:id', authenticate, chatController.deleteChatSession);

module.exports = router;
