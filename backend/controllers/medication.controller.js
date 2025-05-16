const Medication = require('../models/medication.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

/**
 * Create a new medication
 * @route POST /api/medications
 * @access Private
 */
exports.createMedication = async (req, res) => {
  try {
    const {
      name,
      dosage,
      unit,
      frequency,
      customFrequency,
      startDate,
      endDate,
      timeOfDay,
      customTimes,
      daysOfWeek,
      instructions,
      purpose,
      category,
      reminders,
      refillInfo
    } = req.body;
    
    // Create new medication
    const medication = new Medication({
      user: req.user._id,
      name,
      dosage,
      unit,
      frequency,
      customFrequency,
      startDate,
      endDate,
      timeOfDay,
      customTimes,
      daysOfWeek,
      instructions,
      purpose,
      category,
      reminders,
      refillInfo
    });
    
    // Save medication
    await medication.save();
    
    // If user has a partner, create notification
    const user = await User.findById(req.user._id);
    if (user.partnerId) {
      await Notification.createNotification({
        recipient: user.partnerId,
        sender: req.user._id,
        type: 'medication_reminder',
        title: 'New Medication Added',
        message: `${user.name} has added a new medication: ${name}`,
        priority: 'normal',
        actionLink: '/medications'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      medication
    });
  } catch (error) {
    console.error('Create medication error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating medication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all medications for current user
 * @route GET /api/medications
 * @access Private
 */
exports.getMedications = async (req, res) => {
  try {
    const { active, category, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find medications
    const medications = await Medication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Count total medications
    const total = await Medication.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: medications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      medications
    });
  } catch (error) {
    console.error('Get medications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching medications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single medication
 * @route GET /api/medications/:id
 * @access Private
 */
exports.getMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    res.status(200).json({
      success: true,
      medication
    });
  } catch (error) {
    console.error('Get medication error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching medication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a medication
 * @route PUT /api/medications/:id
 * @access Private
 */
exports.updateMedication = async (req, res) => {
  try {
    const {
      name,
      dosage,
      unit,
      frequency,
      customFrequency,
      startDate,
      endDate,
      timeOfDay,
      customTimes,
      daysOfWeek,
      instructions,
      purpose,
      category,
      reminders,
      refillInfo,
      isActive
    } = req.body;
    
    // Find medication
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    // Update fields
    if (name) medication.name = name;
    if (dosage) medication.dosage = dosage;
    if (unit) medication.unit = unit;
    if (frequency) medication.frequency = frequency;
    if (customFrequency) medication.customFrequency = customFrequency;
    if (startDate) medication.startDate = startDate;
    if (endDate) medication.endDate = endDate;
    if (timeOfDay) medication.timeOfDay = timeOfDay;
    if (customTimes) medication.customTimes = customTimes;
    if (daysOfWeek) medication.daysOfWeek = daysOfWeek;
    if (instructions) medication.instructions = instructions;
    if (purpose) medication.purpose = purpose;
    if (category) medication.category = category;
    if (reminders) medication.reminders = reminders;
    if (refillInfo) medication.refillInfo = refillInfo;
    if (isActive !== undefined) medication.isActive = isActive;
    
    // Save medication
    await medication.save();
    
    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      medication
    });
  } catch (error) {
    console.error('Update medication error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating medication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a medication
 * @route DELETE /api/medications/:id
 * @access Private
 */
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    await medication.remove();
    
    res.status(200).json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    console.error('Delete medication error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting medication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Log medication
 * @route POST /api/medications/:id/log
 * @access Private
 */
exports.logMedication = async (req, res) => {
  try {
    const { date, taken, actualTime, skipped, notes } = req.body;
    
    // Find medication
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }
    
    // Add log
    medication.logs.push({
      date,
      taken,
      actualTime,
      skipped,
      notes
    });
    
    // Save medication
    await medication.save();
    
    // If user has a partner and medication was taken, create notification
    if (taken) {
      const user = await User.findById(req.user._id);
      if (user.partnerId) {
        await Notification.createNotification({
          recipient: user.partnerId,
          sender: req.user._id,
          type: 'medication_reminder',
          title: 'Medication Taken',
          message: `${user.name} has taken their ${medication.name} medication`,
          priority: 'low',
          actionLink: '/medications'
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Medication logged successfully',
      logs: medication.logs
    });
  } catch (error) {
    console.error('Log medication error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error logging medication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get today's medications
 * @route GET /api/medications/today
 * @access Private
 */
exports.getTodayMedications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Find active medications
    const medications = await Medication.find({
      user: req.user._id,
      isActive: true,
      startDate: { $lte: todayEnd },
      $or: [
        { endDate: { $gte: today } },
        { endDate: null }
      ]
    });
    
    // Filter medications due today
    const medicationsDueToday = medications.filter(medication => 
      medication.isDueToday()
    );
    
    // Add today's logs to each medication
    const medicationsWithLogs = medicationsDueToday.map(medication => {
      const med = medication.toObject();
      med.todayLogs = medication.getTodayLogs();
      return med;
    });
    
    res.status(200).json({
      success: true,
      count: medicationsWithLogs.length,
      medications: medicationsWithLogs
    });
  } catch (error) {
    console.error('Get today medications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s medications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
