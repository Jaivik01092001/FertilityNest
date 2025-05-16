const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycle.controller');
const { authenticate, isVerified } = require('../middleware/auth.middleware');
const { cycleValidation, validate } = require('../middleware/validation.middleware');

/**
 * @route POST /api/cycles
 * @desc Create a new cycle
 * @access Private
 */
router.post('/', authenticate, isVerified, cycleValidation, validate, cycleController.createCycle);

/**
 * @route GET /api/cycles
 * @desc Get all cycles for current user
 * @access Private
 */
router.get('/', authenticate, cycleController.getCycles);

/**
 * @route GET /api/cycles/current
 * @desc Get current cycle
 * @access Private
 */
router.get('/current', authenticate, cycleController.getCurrentCycle);

/**
 * @route GET /api/cycles/:id
 * @desc Get a single cycle
 * @access Private
 */
router.get('/:id', authenticate, cycleController.getCycle);

/**
 * @route PUT /api/cycles/:id
 * @desc Update a cycle
 * @access Private
 */
router.put('/:id', authenticate, isVerified, cycleController.updateCycle);

/**
 * @route DELETE /api/cycles/:id
 * @desc Delete a cycle
 * @access Private
 */
router.delete('/:id', authenticate, isVerified, cycleController.deleteCycle);

/**
 * @route POST /api/cycles/:id/symptoms
 * @desc Add symptom to cycle
 * @access Private
 */
router.post('/:id/symptoms', authenticate, isVerified, cycleController.addSymptom);

module.exports = router;
