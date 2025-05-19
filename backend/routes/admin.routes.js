const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route GET /api/admin/users
 * @desc Get all users
 * @access Private - Admin only
 */
router.get('/users', authenticate, isAdmin, adminController.getUsers);

/**
 * @route GET /api/admin/users/:id
 * @desc Get user by ID
 * @access Private - Admin only
 */
router.get('/users/:id', authenticate, isAdmin, adminController.getUserById);

/**
 * @route PUT /api/admin/users/:id
 * @desc Update user
 * @access Private - Admin only
 */
router.put('/users/:id', authenticate, isAdmin, adminController.updateUser);

/**
 * @route PUT /api/admin/users/:id/status
 * @desc Update user status (ban/suspend/reactivate)
 * @access Private - Admin only
 */
router.put('/users/:id/status', authenticate, isAdmin, adminController.updateUserStatus);

/**
 * @route GET /api/admin/communities
 * @desc Get all communities
 * @access Private - Admin only
 */
router.get('/communities', authenticate, isAdmin, adminController.getCommunities);

/**
 * @route POST /api/admin/communities
 * @desc Create a new community
 * @access Private - Admin only
 */
router.post('/communities', authenticate, isAdmin, adminController.createCommunity);

/**
 * @route PUT /api/admin/communities/:id
 * @desc Update community
 * @access Private - Admin only
 */
router.put('/communities/:id', authenticate, isAdmin, adminController.updateCommunity);

/**
 * @route DELETE /api/admin/communities/:id
 * @desc Delete community
 * @access Private - Admin only
 */
router.delete('/communities/:id', authenticate, isAdmin, adminController.deleteCommunity);

/**
 * @route GET /api/admin/reports
 * @desc Get all reported content
 * @access Private - Admin only
 */
router.get('/reports', authenticate, isAdmin, adminController.getReports);

/**
 * @route PUT /api/admin/reports/:id
 * @desc Update report status
 * @access Private - Admin only
 */
router.put('/reports/:id', authenticate, isAdmin, adminController.updateReportStatus);

/**
 * @route GET /api/admin/trackers
 * @desc Get all tracker configurations
 * @access Private - Admin only
 */
router.get('/trackers', authenticate, isAdmin, adminController.getTrackerConfigurations);

/**
 * @route POST /api/admin/trackers
 * @desc Create a new tracker configuration
 * @access Private - Admin only
 */
router.post('/trackers', authenticate, isAdmin, adminController.createTrackerConfiguration);

/**
 * @route PUT /api/admin/trackers/:id
 * @desc Update tracker configuration
 * @access Private - Admin only
 */
router.put('/trackers/:id', authenticate, isAdmin, adminController.updateTrackerConfiguration);

/**
 * @route DELETE /api/admin/trackers/:id
 * @desc Delete tracker configuration
 * @access Private - Admin only
 */
router.delete('/trackers/:id', authenticate, isAdmin, adminController.deleteTrackerConfiguration);

/**
 * @route GET /api/admin/stats
 * @desc Get system statistics
 * @access Private - Admin only
 */
router.get('/stats', authenticate, isAdmin, adminController.getSystemStats);

module.exports = router;
