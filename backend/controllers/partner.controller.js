const User = require('../models/user.model');
const Cycle = require('../models/cycle.model');
const Medication = require('../models/medication.model');
const Notification = require('../models/notification.model');

/**
 * Get partner information
 * @route GET /api/partners/info
 * @access Private
 */
exports.getPartnerInfo = async (req, res) => {
  try {
    // Check if user has a partner
    if (!req.user.partnerId) {
      return res.status(404).json({
        success: false,
        message: 'You are not connected with a partner'
      });
    }
    
    // Get partner information
    const partner = await User.findById(req.user.partnerId)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      partner
    });
  } catch (error) {
    console.error('Get partner info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching partner information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get partner's cycle information
 * @route GET /api/partners/cycles
 * @access Private
 */
exports.getPartnerCycles = async (req, res) => {
  try {
    // Check if user has a partner
    if (!req.user.partnerId) {
      return res.status(404).json({
        success: false,
        message: 'You are not connected with a partner'
      });
    }
    
    // Get partner
    const partner = await User.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Check if partner allows sharing cycle information
    if (!partner.preferences.privacy.shareWithPartner) {
      return res.status(403).json({
        success: false,
        message: 'Your partner has chosen not to share cycle information'
      });
    }
    
    // Get partner's cycles
    const cycles = await Cycle.find({ user: partner._id })
      .sort({ startDate: -1 })
      .limit(5);
    
    // Get current cycle
    const today = new Date();
    const currentCycle = await Cycle.findOne({
      user: partner._id,
      startDate: { $lte: today }
    }).sort({ startDate: -1 });
    
    let cycleWithDay = null;
    
    if (currentCycle) {
      // Calculate current cycle day
      const startDate = new Date(currentCycle.startDate);
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Add current day to response
      cycleWithDay = currentCycle.toObject();
      cycleWithDay.currentDay = diffDays;
      
      // Calculate fertile window
      cycleWithDay.fertileWindow = currentCycle.fertileWindow;
      
      // Predict next period
      cycleWithDay.nextPeriod = currentCycle.predictNextPeriod();
    }
    
    res.status(200).json({
      success: true,
      cycles,
      currentCycle: cycleWithDay
    });
  } catch (error) {
    console.error('Get partner cycles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching partner cycle information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get partner's medication information
 * @route GET /api/partners/medications
 * @access Private
 */
exports.getPartnerMedications = async (req, res) => {
  try {
    // Check if user has a partner
    if (!req.user.partnerId) {
      return res.status(404).json({
        success: false,
        message: 'You are not connected with a partner'
      });
    }
    
    // Get partner
    const partner = await User.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Check if partner allows sharing medication information
    if (!partner.preferences.privacy.shareWithPartner) {
      return res.status(403).json({
        success: false,
        message: 'Your partner has chosen not to share medication information'
      });
    }
    
    // Get partner's active medications
    const medications = await Medication.find({
      user: partner._id,
      isActive: true
    }).sort({ createdAt: -1 });
    
    // Get today's medications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
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
      medications,
      todayMedications: medicationsWithLogs
    });
  } catch (error) {
    console.error('Get partner medications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching partner medication information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send distress signal to partner
 * @route POST /api/partners/distress
 * @access Private
 */
exports.sendDistressSignal = async (req, res) => {
  try {
    const { message, location } = req.body;
    
    // Check if user has a partner
    if (!req.user.partnerId) {
      return res.status(404).json({
        success: false,
        message: 'You are not connected with a partner'
      });
    }
    
    // Get partner
    const partner = await User.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Create urgent notification for partner
    await Notification.createNotification({
      recipient: partner._id,
      sender: req.user._id,
      type: 'distress_signal',
      title: 'URGENT: Distress Signal',
      message: message || `${req.user.name} needs your immediate attention!`,
      priority: 'urgent',
      actionLink: '/distress-response',
      metadata: {
        location,
        timestamp: Date.now()
      }
    });
    
    // Send notification to emergency contacts if provided
    if (req.user.emergencyContacts && req.user.emergencyContacts.length > 0) {
      // In a real app, this would send SMS or call emergency contacts
      console.log('Emergency contacts would be notified:', req.user.emergencyContacts);
    }
    
    res.status(200).json({
      success: true,
      message: 'Distress signal sent successfully'
    });
  } catch (error) {
    console.error('Send distress signal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error sending distress signal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Disconnect from partner
 * @route POST /api/partners/disconnect
 * @access Private
 */
exports.disconnectPartner = async (req, res) => {
  try {
    // Check if user has a partner
    if (!req.user.partnerId) {
      return res.status(404).json({
        success: false,
        message: 'You are not connected with a partner'
      });
    }
    
    // Get partner
    const partner = await User.findById(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Update both users to remove partner connection
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { partnerId: 1 }
    });
    
    await User.findByIdAndUpdate(partner._id, {
      $unset: { partnerId: 1 }
    });
    
    // Create notification for partner
    await Notification.createNotification({
      recipient: partner._id,
      sender: req.user._id,
      type: 'system_notification',
      title: 'Partner Disconnected',
      message: `${req.user.name} has disconnected as your partner`,
      priority: 'high',
      actionLink: '/profile'
    });
    
    res.status(200).json({
      success: true,
      message: 'Partner disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect partner error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error disconnecting partner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
