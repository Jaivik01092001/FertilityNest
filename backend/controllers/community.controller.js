const Community = require('../models/community.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

/**
 * Create a new community
 * @route POST /api/community
 * @access Private
 */
exports.createCommunity = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      coverImage,
      icon,
      rules,
      isPrivate,
      requiresApproval
    } = req.body;
    
    // Check if community with same name exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'A community with this name already exists'
      });
    }
    
    // Create new community
    const community = new Community({
      name,
      description,
      category,
      coverImage,
      icon,
      rules,
      isPrivate: isPrivate || false,
      requiresApproval: requiresApproval || false,
      createdBy: req.user._id
    });
    
    // Add creator as admin
    community.members.push({
      user: req.user._id,
      role: 'admin',
      joinedAt: Date.now()
    });
    
    // Save community
    await community.save();
    
    // Add community to user's joined communities
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { joinedCommunities: community._id } }
    );
    
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
 * Get all communities
 * @route GET /api/community
 * @access Private
 */
exports.getCommunities = async (req, res) => {
  try {
    const { category, limit = 10, page = 1, search } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find communities
    const communities = await Community.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('members.user', 'name profilePicture')
      .populate('createdBy', 'name profilePicture');
    
    // Count total communities
    const total = await Community.countDocuments(query);
    
    // Add isMember flag to each community
    const communitiesWithMembership = communities.map(community => {
      const comm = community.toObject();
      comm.isMember = community.isMember(req.user._id);
      comm.memberCount = community.members.length;
      return comm;
    });
    
    res.status(200).json({
      success: true,
      count: communities.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      communities: communitiesWithMembership
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
 * Get a single community
 * @route GET /api/community/:id
 * @access Private
 */
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'name profilePicture')
      .populate('createdBy', 'name profilePicture')
      .populate('posts.author', 'name profilePicture')
      .populate('posts.comments.user', 'name profilePicture');
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    // Check if user is a member for private communities
    if (community.isPrivate && !community.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'This is a private community. You must be a member to view it.'
      });
    }
    
    // Add isMember flag
    const communityObj = community.toObject();
    communityObj.isMember = community.isMember(req.user._id);
    communityObj.isModeratorOrAdmin = community.isModeratorOrAdmin(req.user._id);
    communityObj.memberCount = community.members.length;
    
    // For non-members of private communities, limit the data returned
    if (community.isPrivate && !communityObj.isMember) {
      communityObj.posts = [];
    }
    
    res.status(200).json({
      success: true,
      community: communityObj
    });
  } catch (error) {
    console.error('Get community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching community',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Join a community
 * @route POST /api/community/:id/join
 * @access Private
 */
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    // Check if user is already a member
    if (community.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
    }
    
    // Check if community requires approval
    if (community.requiresApproval) {
      // Check if user already has a pending request
      const hasPendingRequest = community.pendingRequests.some(
        request => request.user.toString() === req.user._id.toString()
      );
      
      if (hasPendingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request to join this community'
        });
      }
      
      // Add to pending requests
      community.pendingRequests.push({
        user: req.user._id,
        requestDate: Date.now(),
        message: req.body.message || ''
      });
      
      await community.save();
      
      // Notify community admins
      const admins = community.members.filter(member => member.role === 'admin');
      
      for (const admin of admins) {
        await Notification.createNotification({
          recipient: admin.user,
          sender: req.user._id,
          type: 'community_invite',
          title: 'Join Request',
          message: `${req.user.name} has requested to join ${community.name}`,
          priority: 'normal',
          actionLink: `/community/${community._id}/requests`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Join request sent successfully. Waiting for approval.'
      });
    }
    
    // Add user to community
    const joined = await community.addMember(req.user._id);
    
    if (!joined) {
      return res.status(400).json({
        success: false,
        message: 'Failed to join community'
      });
    }
    
    // Add community to user's joined communities
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { joinedCommunities: community._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Joined community successfully'
    });
  } catch (error) {
    console.error('Join community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error joining community',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Leave a community
 * @route POST /api/community/:id/leave
 * @access Private
 */
exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    // Check if user is a member
    if (!community.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
      });
    }
    
    // Check if user is the only admin
    const isAdmin = community.members.find(
      member => member.user.toString() === req.user._id.toString()
    )?.role === 'admin';
    
    const adminCount = community.members.filter(
      member => member.role === 'admin'
    ).length;
    
    if (isAdmin && adminCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'You are the only admin. Please assign another admin before leaving.'
      });
    }
    
    // Remove user from community
    const removed = community.removeMember(req.user._id);
    
    if (!removed) {
      return res.status(400).json({
        success: false,
        message: 'Failed to leave community'
      });
    }
    
    await community.save();
    
    // Remove community from user's joined communities
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { joinedCommunities: community._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Left community successfully'
    });
  } catch (error) {
    console.error('Leave community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error leaving community',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a post in a community
 * @route POST /api/community/:id/posts
 * @access Private
 */
exports.createPost = async (req, res) => {
  try {
    const { content, isAnonymous, attachments, tags } = req.body;
    
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }
    
    // Check if user is a member
    if (!community.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to post in this community'
      });
    }
    
    // Create new post
    const post = {
      author: req.user._id,
      content,
      isAnonymous: isAnonymous || false,
      attachments: attachments || [],
      tags: tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Add post to community
    community.posts.push(post);
    await community.save();
    
    // Get the newly created post with populated author
    const newPost = community.posts[community.posts.length - 1];
    await Community.populate(newPost, { path: 'author', select: 'name profilePicture' });
    
    // Notify community members
    const members = community.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );
    
    for (const member of members) {
      await Notification.createNotification({
        recipient: member.user,
        sender: req.user._id,
        type: 'community_post',
        title: 'New Post',
        message: `New post in ${community.name}`,
        priority: 'normal',
        actionLink: `/community/${community._id}/posts/${newPost._id}`
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
