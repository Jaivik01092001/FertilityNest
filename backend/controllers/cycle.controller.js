const Cycle = require('../models/cycle.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

/**
 * Create a new cycle
 * @route POST /api/cycles
 * @access Private
 */
exports.createCycle = async (req, res) => {
  try {
    const { startDate, endDate, cycleLength, periodLength } = req.body;
    
    // Create new cycle
    const cycle = new Cycle({
      user: req.user._id,
      startDate,
      endDate,
      cycleLength,
      periodLength
    });
    
    // Save cycle
    await cycle.save();
    
    // If user has a partner, create notification
    const user = await User.findById(req.user._id);
    if (user.partnerId) {
      await Notification.createNotification({
        recipient: user.partnerId,
        sender: req.user._id,
        type: 'cycle_reminder',
        title: 'New Cycle Started',
        message: `${user.name} has started a new cycle`,
        priority: 'normal',
        actionLink: '/calendar'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Cycle created successfully',
      cycle
    });
  } catch (error) {
    console.error('Create cycle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating cycle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all cycles for current user
 * @route GET /api/cycles
 * @access Private
 */
exports.getCycles = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find cycles
    const cycles = await Cycle.find(query)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total cycles
    const total = await Cycle.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: cycles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      cycles
    });
  } catch (error) {
    console.error('Get cycles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching cycles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single cycle
 * @route GET /api/cycles/:id
 * @access Private
 */
exports.getCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }
    
    res.status(200).json({
      success: true,
      cycle
    });
  } catch (error) {
    console.error('Get cycle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching cycle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a cycle
 * @route PUT /api/cycles/:id
 * @access Private
 */
exports.updateCycle = async (req, res) => {
  try {
    const { startDate, endDate, cycleLength, periodLength } = req.body;
    
    // Find cycle
    const cycle = await Cycle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }
    
    // Update fields
    if (startDate) cycle.startDate = startDate;
    if (endDate) cycle.endDate = endDate;
    if (cycleLength) cycle.cycleLength = cycleLength;
    if (periodLength) cycle.periodLength = periodLength;
    
    // Save cycle
    await cycle.save();
    
    res.status(200).json({
      success: true,
      message: 'Cycle updated successfully',
      cycle
    });
  } catch (error) {
    console.error('Update cycle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating cycle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a cycle
 * @route DELETE /api/cycles/:id
 * @access Private
 */
exports.deleteCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }
    
    await cycle.remove();
    
    res.status(200).json({
      success: true,
      message: 'Cycle deleted successfully'
    });
  } catch (error) {
    console.error('Delete cycle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting cycle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add symptom to cycle
 * @route POST /api/cycles/:id/symptoms
 * @access Private
 */
exports.addSymptom = async (req, res) => {
  try {
    const { date, type, severity, notes } = req.body;
    
    // Find cycle
    const cycle = await Cycle.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'Cycle not found'
      });
    }
    
    // Add symptom
    cycle.symptoms.push({
      date,
      type,
      severity,
      notes
    });
    
    // Save cycle
    await cycle.save();
    
    res.status(201).json({
      success: true,
      message: 'Symptom added successfully',
      symptoms: cycle.symptoms
    });
  } catch (error) {
    console.error('Add symptom error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error adding symptom',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current cycle
 * @route GET /api/cycles/current
 * @access Private
 */
exports.getCurrentCycle = async (req, res) => {
  try {
    const today = new Date();
    
    // Find the most recent cycle
    const cycle = await Cycle.findOne({
      user: req.user._id,
      startDate: { $lte: today }
    }).sort({ startDate: -1 });
    
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'No current cycle found'
      });
    }
    
    // Calculate current cycle day
    const startDate = new Date(cycle.startDate);
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Add current day to response
    const cycleWithDay = cycle.toObject();
    cycleWithDay.currentDay = diffDays;
    
    // Calculate fertile window
    cycleWithDay.fertileWindow = cycle.fertileWindow;
    
    // Predict next period
    cycleWithDay.nextPeriod = cycle.predictNextPeriod();
    
    res.status(200).json({
      success: true,
      cycle: cycleWithDay
    });
  } catch (error) {
    console.error('Get current cycle error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching current cycle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
