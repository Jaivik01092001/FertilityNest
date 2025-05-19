const User = require('../models/user.model');
const Community = require('../models/community.model');
const Cycle = require('../models/cycle.model');
const Medication = require('../models/medication.model');
const ChatSession = require('../models/chat.model');
const Notification = require('../models/notification.model');
const TrackerConfiguration = require('../models/tracker.model');
const mongoose = require('mongoose');

/**
 * Get all users
 * @route GET /api/admin/users
 * @access Private - Admin only
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find users
    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total users
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/admin/users/:id
 * @access Private - Admin only
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Find user
    const user = await User.findById(id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's cycles
    const cycles = await Cycle.find({ user: id })
      .sort({ startDate: -1 })
      .limit(5);

    // Get user's medications
    const medications = await Medication.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's chat sessions
    const chatSessions = await ChatSession.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get user's communities
    const communities = await Community.find({ 'members.user': id })
      .select('name category')
      .limit(5);

    res.status(200).json({
      success: true,
      user,
      userData: {
        cycles,
        medications,
        chatSessions,
        communities
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user
 * @route PUT /api/admin/users/:id
 * @access Private - Admin only
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, fertilityStage, journeyType, isVerified } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (fertilityStage) user.fertilityStage = fertilityStage;
    if (journeyType) user.journeyType = journeyType;
    if (isVerified !== undefined) user.isVerified = isVerified;

    // Save user
    await user.save();

    // Create notification for user
    await Notification.create({
      recipient: user._id,
      type: 'system_notification',
      title: 'Profile Updated',
      message: 'Your profile has been updated by an administrator',
      priority: 'normal'
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user status (ban/suspend/reactivate)
 * @route PUT /api/admin/users/:id/status
 * @access Private - Admin only
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Validate status
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, suspended, or banned'
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status
    user.isActive = status === 'active';
    user.status = status;
    user.statusReason = reason || '';
    user.statusUpdatedAt = Date.now();
    user.statusUpdatedBy = req.user._id;

    // Save user
    await user.save();

    // Create notification for user
    let notificationMessage = '';

    if (status === 'active') {
      notificationMessage = 'Your account has been reactivated';
    } else if (status === 'suspended') {
      notificationMessage = `Your account has been temporarily suspended. Reason: ${reason || 'Violation of terms of service'}`;
    } else if (status === 'banned') {
      notificationMessage = `Your account has been banned. Reason: ${reason || 'Violation of terms of service'}`;
    }

    await Notification.create({
      recipient: user._id,
      type: 'system_notification',
      title: 'Account Status Updated',
      message: notificationMessage,
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      message: `User ${status === 'active' ? 'reactivated' : status} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all communities
 * @route GET /api/admin/communities
 * @access Private - Admin only
 */
exports.getCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find communities
    const communities = await Community.find(query)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Count total communities
    const total = await Community.countDocuments(query);

    res.status(200).json({
      success: true,
      communities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get communities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching communities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new community
 * @route POST /api/admin/communities
 * @access Private - Admin only
 */
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, category, rules, isPrivate, requiresApproval } = req.body;

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community with this name already exists'
      });
    }

    // Create new community
    const community = new Community({
      name,
      description,
      category,
      rules: rules || [],
      isPrivate: isPrivate || false,
      requiresApproval: requiresApproval || false,
      isVerified: true,
      verificationDetails: {
        verifiedBy: req.user._id,
        verificationDate: Date.now(),
        verificationNotes: 'Created by admin'
      },
      createdBy: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin',
        joinedAt: Date.now()
      }]
    });

    // Save community
    await community.save();

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community
    });
  } catch (error) {
    console.error('Create community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating community',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update community
 * @route PUT /api/admin/communities/:id
 * @access Private - Admin only
 */
exports.updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, rules, isPrivate, requiresApproval, isActive } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID'
      });
    }

    // Find community
    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Update fields
    if (name) community.name = name;
    if (description) community.description = description;
    if (category) community.category = category;
    if (rules) community.rules = rules;
    if (isPrivate !== undefined) community.isPrivate = isPrivate;
    if (requiresApproval !== undefined) community.requiresApproval = requiresApproval;
    if (isActive !== undefined) community.isActive = isActive;

    // Save community
    await community.save();

    res.status(200).json({
      success: true,
      message: 'Community updated successfully',
      community
    });
  } catch (error) {
    console.error('Update community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating community',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete community
 * @route DELETE /api/admin/communities/:id
 * @access Private - Admin only
 */
exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID'
      });
    }

    // Find community
    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Delete community
    await Community.findByIdAndDelete(id);

    // Update users who were members of this community
    await User.updateMany(
      { joinedCommunities: id },
      { $pull: { joinedCommunities: id } }
    );

    res.status(200).json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('Delete community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting community',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all reported content
 * @route GET /api/admin/reports
 * @access Private - Admin only
 */
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { 'posts.isReported': true };

    if (status === 'pending') {
      query['posts.isModerated'] = false;
    } else if (status === 'resolved') {
      query['posts.isModerated'] = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find communities with reported posts
    const communities = await Community.find(query)
      .populate('posts.author', 'name email')
      .populate('posts.reports.user', 'name email')
      .sort({ 'posts.reports.createdAt': -1 });

    // Extract reported posts
    const reportedPosts = [];

    communities.forEach(community => {
      community.posts.forEach(post => {
        if (post.isReported) {
          reportedPosts.push({
            postId: post._id,
            communityId: community._id,
            communityName: community.name,
            author: post.author,
            content: post.content,
            isAnonymous: post.isAnonymous,
            reports: post.reports,
            isModerated: post.isModerated,
            moderationNotes: post.moderationNotes,
            createdAt: post.createdAt
          });
        }
      });
    });

    // Sort by most recent report
    reportedPosts.sort((a, b) => {
      const aLatestReport = a.reports.reduce((latest, report) => {
        return report.createdAt > latest ? report.createdAt : latest;
      }, 0);

      const bLatestReport = b.reports.reduce((latest, report) => {
        return report.createdAt > latest ? report.createdAt : latest;
      }, 0);

      return bLatestReport - aLatestReport;
    });

    // Apply pagination to the sorted array
    const paginatedReports = reportedPosts.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      reports: paginatedReports,
      pagination: {
        total: reportedPosts.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(reportedPosts.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update report status
 * @route PUT /api/admin/reports/:id
 * @access Private - Admin only
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { communityId, action, moderationNotes } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(communityId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Validate action
    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approve, reject, or delete'
      });
    }

    // Find community
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Find post
    const postIndex = community.posts.findIndex(post => post._id.toString() === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const post = community.posts[postIndex];

    // Update post based on action
    if (action === 'approve') {
      // Mark as moderated but keep the post
      post.isModerated = true;
      post.moderationNotes = moderationNotes || 'Approved by admin';

      // Notify the author
      await Notification.create({
        recipient: post.author,
        type: 'system_notification',
        title: 'Post Approved',
        message: `Your reported post in ${community.name} has been reviewed and approved.`,
        priority: 'normal',
        actionLink: `/community/${communityId}`
      });
    } else if (action === 'reject') {
      // Mark as moderated and hide the post
      post.isModerated = true;
      post.isHidden = true;
      post.moderationNotes = moderationNotes || 'Rejected by admin';

      // Notify the author
      await Notification.create({
        recipient: post.author,
        type: 'system_notification',
        title: 'Post Rejected',
        message: `Your post in ${community.name} has been removed for violating community guidelines.`,
        priority: 'high',
        actionLink: `/community/${communityId}`
      });
    } else if (action === 'delete') {
      // Remove the post entirely
      community.posts.splice(postIndex, 1);

      // Notify the author
      await Notification.create({
        recipient: post.author,
        type: 'system_notification',
        title: 'Post Deleted',
        message: `Your post in ${community.name} has been deleted for violating community guidelines.`,
        priority: 'high',
        actionLink: `/community/${communityId}`
      });
    }

    // Save community
    await community.save();

    res.status(200).json({
      success: true,
      message: `Post ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'deleted'} successfully`
    });
  } catch (error) {
    console.error('Update report status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating report status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all tracker configurations
 * @route GET /api/admin/trackers
 * @access Private - Admin only
 */
exports.getTrackerConfigurations = async (req, res) => {
  try {
    const { journeyType, category, isActive } = req.query;

    // Build query
    const query = {};

    if (journeyType) {
      query.journeyType = journeyType;
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Find tracker configurations
    const trackerConfigurations = await TrackerConfiguration.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ category: 1, journeyType: 1, name: 1 });

    res.status(200).json({
      success: true,
      trackerConfigurations
    });
  } catch (error) {
    console.error('Get tracker configurations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching tracker configurations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new tracker configuration
 * @route POST /api/admin/trackers
 * @access Private - Admin only
 */
exports.createTrackerConfiguration = async (req, res) => {
  try {
    const { name, description, journeyType, category, fields } = req.body;

    // Check if tracker configuration already exists
    const existingTracker = await TrackerConfiguration.findOne({ name });

    if (existingTracker) {
      return res.status(400).json({
        success: false,
        message: 'Tracker configuration with this name already exists'
      });
    }

    // Create new tracker configuration
    const trackerConfiguration = new TrackerConfiguration({
      name,
      description,
      journeyType,
      category,
      fields: fields || [],
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // Save tracker configuration
    await trackerConfiguration.save();

    res.status(201).json({
      success: true,
      message: 'Tracker configuration created successfully',
      trackerConfiguration
    });
  } catch (error) {
    console.error('Create tracker configuration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating tracker configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update tracker configuration
 * @route PUT /api/admin/trackers/:id
 * @access Private - Admin only
 */
exports.updateTrackerConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, journeyType, category, fields, isActive } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracker configuration ID'
      });
    }

    // Find tracker configuration
    const trackerConfiguration = await TrackerConfiguration.findById(id);

    if (!trackerConfiguration) {
      return res.status(404).json({
        success: false,
        message: 'Tracker configuration not found'
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== trackerConfiguration.name) {
      const existingTracker = await TrackerConfiguration.findOne({ name });

      if (existingTracker) {
        return res.status(400).json({
          success: false,
          message: 'Tracker configuration with this name already exists'
        });
      }
    }

    // Update fields
    if (name) trackerConfiguration.name = name;
    if (description) trackerConfiguration.description = description;
    if (journeyType) trackerConfiguration.journeyType = journeyType;
    if (category) trackerConfiguration.category = category;
    if (fields) trackerConfiguration.fields = fields;
    if (isActive !== undefined) trackerConfiguration.isActive = isActive;

    // Update updatedBy and updatedAt
    trackerConfiguration.updatedBy = req.user._id;
    trackerConfiguration.updatedAt = Date.now();

    // Save tracker configuration
    await trackerConfiguration.save();

    res.status(200).json({
      success: true,
      message: 'Tracker configuration updated successfully',
      trackerConfiguration
    });
  } catch (error) {
    console.error('Update tracker configuration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating tracker configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete tracker configuration
 * @route DELETE /api/admin/trackers/:id
 * @access Private - Admin only
 */
exports.deleteTrackerConfiguration = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracker configuration ID'
      });
    }

    // Find tracker configuration
    const trackerConfiguration = await TrackerConfiguration.findById(id);

    if (!trackerConfiguration) {
      return res.status(404).json({
        success: false,
        message: 'Tracker configuration not found'
      });
    }

    // Delete tracker configuration
    await TrackerConfiguration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Tracker configuration deleted successfully'
    });
  } catch (error) {
    console.error('Delete tracker configuration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting tracker configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get system statistics
 * @route GET /api/admin/stats
 * @access Private - Admin only
 */
exports.getSystemStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get community statistics
    const totalCommunities = await Community.countDocuments();
    const activeCommunities = await Community.countDocuments({ isActive: true });
    const communitiesByCategory = await Community.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get cycle statistics
    const totalCycles = await Cycle.countDocuments();

    // Get medication statistics
    const totalMedications = await Medication.countDocuments();
    const activeMedications = await Medication.countDocuments({ isActive: true });

    // Get chat statistics
    const totalChatSessions = await ChatSession.countDocuments();
    const distressDetected = await ChatSession.countDocuments({ distressDetected: true });

    // Format role counts
    const roleStats = {};
    usersByRole.forEach(role => {
      roleStats[role._id || 'undefined'] = role.count;
    });

    // Format category counts
    const categoryStats = {};
    communitiesByCategory.forEach(category => {
      categoryStats[category._id || 'undefined'] = category.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: roleStats
        },
        communities: {
          total: totalCommunities,
          active: activeCommunities,
          byCategory: categoryStats
        },
        cycles: {
          total: totalCycles
        },
        medications: {
          total: totalMedications,
          active: activeMedications
        },
        chat: {
          total: totalChatSessions,
          distressDetected
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};