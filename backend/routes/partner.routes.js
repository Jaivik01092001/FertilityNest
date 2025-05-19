const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const { authenticate, isVerified, isPartner, isPartnerOrSelf } = require('../middleware/auth.middleware');

/**
 * @route GET /api/partners/info
 * @desc Get partner information
 * @access Private
 */
router.get('/info', authenticate, partnerController.getPartnerInfo);

/**
 * @route GET /api/partners/cycles
 * @desc Get partner's cycle information
 * @access Private - Partner Role
 */
router.get('/cycles', authenticate, isPartner, partnerController.getPartnerCycles);

/**
 * @route GET /api/partners/cycles/:userId
 * @desc Get specific user's cycle information (for partners)
 * @access Private - Partner Role or Self
 */
router.get('/cycles/:userId', authenticate, isPartnerOrSelf('userId'), partnerController.getUserCycles);

/**
 * @route GET /api/partners/medications
 * @desc Get partner's medication information
 * @access Private - Partner Role
 */
router.get('/medications', authenticate, isPartner, partnerController.getPartnerMedications);

/**
 * @route GET /api/partners/medications/:userId
 * @desc Get specific user's medication information (for partners)
 * @access Private - Partner Role or Self
 */
router.get('/medications/:userId', authenticate, isPartnerOrSelf('userId'), partnerController.getUserMedications);

/**
 * @route POST /api/partners/reminders
 * @desc Send reminder to partner
 * @access Private - Partner Role
 */
router.post('/reminders', authenticate, isPartner, partnerController.sendPartnerReminder);

/**
 * @route POST /api/partners/distress
 * @desc Send distress signal to partner
 * @access Private
 */
router.post('/distress', authenticate, partnerController.sendDistressSignal);

/**
 * @route POST /api/partners/disconnect
 * @desc Disconnect from partner
 * @access Private
 */
router.post('/disconnect', authenticate, isVerified, partnerController.disconnectPartner);

module.exports = router;
