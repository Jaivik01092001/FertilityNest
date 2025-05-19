const User = require('../models/user.model');
const Cycle = require('../models/cycle.model');
const Medication = require('../models/medication.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

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
    const { message, location, urgency = 'high' } = req.body;

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
    const notification = await Notification.createNotification({
      recipient: partner._id,
      sender: req.user._id,
      type: 'distress_signal',
      title: 'URGENT: Distress Signal',
      message: message || `${req.user.name} needs your immediate attention!`,
      priority: 'urgent',
      actionLink: '/distress-response',
      metadata: {
        location,
        timestamp: Date.now(),
        urgency,
        userLocation: req.body.userLocation || 'Unknown'
      }
    });

    // Send notification to emergency contacts if provided
    if (req.user.emergencyContacts && req.user.emergencyContacts.length > 0) {
      // In a real app, this would send SMS or call emergency contacts
      console.log('Emergency contacts would be notified:', req.user.emergencyContacts);
    }

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      io.to(partner._id.toString()).emit('distressAlert', {
        type: 'distress_signal',
        data: {
          sender: {
            _id: req.user._id,
            name: req.user.name
          },
          message: message || `${req.user.name} needs your immediate attention!`,
          timestamp: Date.now(),
          urgency,
          location
        }
      });
    }

    // Log distress event
    console.log(`Distress signal sent from ${req.user.name} (${req.user._id}) to ${partner.name} (${partner._id})`);

    res.status(200).json({
      success: true,
      message: 'Distress signal sent successfully',
      notification
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

/**
 * Get specific user's cycle information (for partners)
 * @route GET /api/partners/cycles/:userId
 * @access Private - Partner Role or Self
 */
exports.getUserCycles = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If requesting as partner, check privacy settings
    if (req.user.role === 'partner' && req.user._id.toString() !== userId) {
      if (!user.preferences.privacy.shareWithPartner) {
        return res.status(403).json({
          success: false,
          message: 'User has chosen not to share cycle information'
        });
      }
    }

    // Get user's cycles
    const cycles = await Cycle.find({ user: userId })
      .sort({ startDate: -1 })
      .limit(10);

    // Get current cycle
    const today = new Date();
    const currentCycle = await Cycle.findOne({
      user: userId,
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

      // Calculate fertile window if method exists
      if (typeof currentCycle.fertileWindow === 'function') {
        cycleWithDay.fertileWindow = currentCycle.fertileWindow();
      }

      // Predict next period if method exists
      if (typeof currentCycle.predictNextPeriod === 'function') {
        cycleWithDay.nextPeriod = currentCycle.predictNextPeriod();
      }
    }

    res.status(200).json({
      success: true,
      cycles,
      currentCycle: cycleWithDay
    });
  } catch (error) {
    console.error('Get user cycles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user cycle information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get specific user's medication information (for partners)
 * @route GET /api/partners/medications/:userId
 * @access Private - Partner Role or Self
 */
exports.getUserMedications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If requesting as partner, check privacy settings
    if (req.user.role === 'partner' && req.user._id.toString() !== userId) {
      if (!user.preferences.privacy.shareWithPartner) {
        return res.status(403).json({
          success: false,
          message: 'User has chosen not to share medication information'
        });
      }
    }

    // Get user's active medications
    const medications = await Medication.find({
      user: userId,
      isActive: true
    }).sort({ createdAt: -1 });

    // Get today's medications
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Filter medications due today if method exists
    let medicationsDueToday = [];
    if (medications.length > 0 && typeof medications[0].isDueToday === 'function') {
      medicationsDueToday = medications.filter(medication => medication.isDueToday());
    } else {
      // Fallback if method doesn't exist
      medicationsDueToday = medications;
    }

    // Add today's logs to each medication if method exists
    const medicationsWithLogs = medicationsDueToday.map(medication => {
      const med = medication.toObject();
      if (typeof medication.getTodayLogs === 'function') {
        med.todayLogs = medication.getTodayLogs();
      }
      return med;
    });

    res.status(200).json({
      success: true,
      medications,
      todayMedications: medicationsWithLogs
    });
  } catch (error) {
    console.error('Get user medications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user medication information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send reminder to partner
 * @route POST /api/partners/reminders
 * @access Private - Partner Role
 */
exports.sendPartnerReminder = async (req, res) => {
  try {
    const { title, message, type, priority, actionLink } = req.body;

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

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create notification for partner
    const notification = new Notification({
      recipient: partner._id,
      sender: req.user._id,
      type: type || 'medication_reminder',
      title,
      message,
      priority: priority || 'normal',
      actionLink: actionLink || '/medications',
      metadata: {
        sentByPartner: true,
        timestamp: Date.now()
      }
    });

    await notification.save();

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      io.to(partner._id.toString()).emit('notification', {
        type: 'partner_reminder',
        data: notification
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send partner reminder error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error sending reminder',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
