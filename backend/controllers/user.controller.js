const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const { sendEmail } = require('../utils/email.util');

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      fertilityStage,
      journeyType,
      dateOfBirth,
      phone,
      preferences
    } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (fertilityStage) user.fertilityStage = fertilityStage;
    if (journeyType) user.journeyType = journeyType;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (phone) user.phone = phone;
    
    // Update preferences if provided
    if (preferences) {
      if (preferences.notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...preferences.notifications
        };
      }
      
      if (preferences.privacy) {
        user.preferences.privacy = {
          ...user.preferences.privacy,
          ...preferences.privacy
        };
      }
      
      if (preferences.theme) {
        user.preferences.theme = preferences.theme;
      }
    }
    
    // Save updated user
    await user.save();
    
    // Remove sensitive data
    user.password = undefined;
    user.verificationToken = undefined;
    user.resetPasswordToken = undefined;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change password
 * @route PUT /api/users/change-password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'FertilityNest - Password Changed',
      html: `
        <h1>Password Changed</h1>
        <p>Your password has been successfully changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add emergency contact
 * @route POST /api/users/emergency-contacts
 * @access Private
 */
exports.addEmergencyContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add emergency contact
    user.emergencyContacts.push({
      name,
      phone,
      relationship
    });
    
    // Save user
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    console.error('Add emergency contact error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error adding emergency contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove emergency contact
 * @route DELETE /api/users/emergency-contacts/:contactId
 * @access Private
 */
exports.removeEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove emergency contact
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== contactId
    );
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Emergency contact removed successfully',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    console.error('Remove emergency contact error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error removing emergency contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate partner code
 * @route POST /api/users/partner-code
 * @access Private
 */
exports.generatePartnerCode = async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate partner code
    const partnerCode = user.generatePartnerCode();
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Partner code generated successfully',
      partnerCode
    });
  } catch (error) {
    console.error('Generate partner code error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating partner code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Link partner
 * @route POST /api/users/link-partner
 * @access Private
 */
exports.linkPartner = async (req, res) => {
  try {
    const { partnerCode } = req.body;
    
    // Find user with partner code
    const partner = await User.findOne({ partnerCode });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Invalid partner code'
      });
    }
    
    // Find current user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already linked to a partner
    if (user.partnerId) {
      return res.status(400).json({
        success: false,
        message: 'You are already linked to a partner'
      });
    }
    
    // Link partners
    user.partnerId = partner._id;
    partner.partnerId = user._id;
    partner.partnerCode = undefined;
    
    // Save both users
    await Promise.all([user.save(), partner.save()]);
    
    // Create notifications for both users
    await Notification.createNotification({
      recipient: partner._id,
      sender: user._id,
      type: 'partner_accepted',
      title: 'Partner Connected',
      message: `${user.name} has connected as your partner`,
      priority: 'high',
      actionLink: '/profile/partner'
    });
    
    await Notification.createNotification({
      recipient: user._id,
      sender: partner._id,
      type: 'partner_accepted',
      title: 'Partner Connected',
      message: `You are now connected with ${partner.name} as partners`,
      priority: 'high',
      actionLink: '/profile/partner'
    });
    
    res.status(200).json({
      success: true,
      message: 'Partner linked successfully',
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        profilePicture: partner.profilePicture
      }
    });
  } catch (error) {
    console.error('Link partner error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error linking partner',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
