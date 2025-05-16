const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { authenticate, isVerified, isModeratorOrAdmin } = require('../middleware/auth.middleware');
const { communityValidation, postValidation, commentValidation, validate } = require('../middleware/validation.middleware');

/**
 * @route POST /api/community
 * @desc Create a new community
 * @access Private
 */
router.post('/', authenticate, isVerified, communityValidation, validate, communityController.createCommunity);

/**
 * @route GET /api/community
 * @desc Get all communities
 * @access Private
 */
router.get('/', authenticate, communityController.getCommunities);

/**
 * @route GET /api/community/:id
 * @desc Get a single community
 * @access Private
 */
router.get('/:id', authenticate, communityController.getCommunity);

/**
 * @route POST /api/community/:id/join
 * @desc Join a community
 * @access Private
 */
router.post('/:id/join', authenticate, isVerified, communityController.joinCommunity);

/**
 * @route POST /api/community/:id/leave
 * @desc Leave a community
 * @access Private
 */
router.post('/:id/leave', authenticate, communityController.leaveCommunity);

/**
 * @route POST /api/community/:id/posts
 * @desc Create a post in a community
 * @access Private
 */
router.post('/:id/posts', authenticate, isVerified, postValidation, validate, communityController.createPost);

module.exports = router;
