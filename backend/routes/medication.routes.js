const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medication.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');
const { medicationValidation, validate } = require('../middleware/validation.middleware');

/**
 * @route GET /api/medications/today
 * @desc Get today's medications
 * @access Private
 */
router.get('/today', authenticate, medicationController.getTodayMedications);

/**
 * @route POST /api/medications
 * @desc Create a new medication
 * @access Private
 */
router.post('/', authenticate, isVerified, medicationValidation, validate, medicationController.createMedication);

/**
 * @route GET /api/medications
 * @desc Get all medications for current user
 * @access Private
 */
router.get('/', authenticate, medicationController.getMedications);

/**
 * @route GET /api/medications/:id
 * @desc Get a single medication
 * @access Private
 */
router.get('/:id', authenticate, medicationController.getMedication);

/**
 * @route PUT /api/medications/:id
 * @desc Update a medication
 * @access Private
 */
router.put('/:id', authenticate, isVerified, medicationController.updateMedication);

/**
 * @route DELETE /api/medications/:id
 * @desc Delete a medication
 * @access Private
 */
router.delete('/:id', authenticate, isVerified, medicationController.deleteMedication);

/**
 * @route POST /api/medications/:id/log
 * @desc Log medication
 * @access Private
 */
router.post('/:id/log', authenticate, medicationController.logMedication);

module.exports = router;
