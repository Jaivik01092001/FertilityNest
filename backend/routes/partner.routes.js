const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');

/**
 * @route GET /api/partners/info
 * @desc Get partner information
 * @access Private
 */
router.get('/info', authenticate, partnerController.getPartnerInfo);

/**
 * @route GET /api/partners/cycles
 * @desc Get partner's cycle information
 * @access Private
 */
router.get('/cycles', authenticate, partnerController.getPartnerCycles);

/**
 * @route GET /api/partners/medications
 * @desc Get partner's medication information
 * @access Private
 */
router.get('/medications', authenticate, partnerController.getPartnerMedications);

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
