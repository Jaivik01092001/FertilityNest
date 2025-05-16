const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * @route PUT /api/users/change-password
 * @desc Change password
 * @access Private
 */
router.put('/change-password', authenticate, userController.changePassword);

/**
 * @route POST /api/users/emergency-contacts
 * @desc Add emergency contact
 * @access Private
 */
router.post('/emergency-contacts', authenticate, userController.addEmergencyContact);

/**
 * @route DELETE /api/users/emergency-contacts/:contactId
 * @desc Remove emergency contact
 * @access Private
 */
router.delete('/emergency-contacts/:contactId', authenticate, userController.removeEmergencyContact);

/**
 * @route POST /api/users/partner-code
 * @desc Generate partner code
 * @access Private
 */
router.post('/partner-code', authenticate, isVerified, userController.generatePartnerCode);

/**
 * @route POST /api/users/link-partner
 * @desc Link partner
 * @access Private
 */
router.post('/link-partner', authenticate, isVerified, userController.linkPartner);

module.exports = router;
