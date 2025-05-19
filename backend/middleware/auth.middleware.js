const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to authenticate users using JWT
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Middleware to check if user is an admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required'
    });
  }
};

/**
 * Middleware to check if user is a moderator or admin
 */
exports.isModeratorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'moderator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Moderator privileges required'
    });
  }
};

/**
 * Middleware to check if user is a partner
 */
exports.isPartner = (req, res, next) => {
  if (req.user && req.user.role === 'partner') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Partner privileges required'
    });
  }
};

/**
 * Middleware to check if user is a partner or the user themselves
 * @param {String} userIdParam - The request parameter containing the user ID
 */
exports.isPartnerOrSelf = (userIdParam = 'userId') => {
  return async (req, res, next) => {
    try {
      const userId = req.params[userIdParam];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: `User ID not provided in parameter: ${userIdParam}`
        });
      }

      // Check if user is the requested user or their partner
      const isSelf = req.user._id.toString() === userId;
      const isPartnerOfUser = req.user.role === 'partner' && req.user.partnerId && req.user.partnerId.toString() === userId;
      const isAdmin = req.user.role === 'admin';

      if (isSelf || isPartnerOfUser || isAdmin) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to access this resource'
        });
      }
    } catch (error) {
      console.error('Authorization error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during authorization check'
      });
    }
  };
};

/**
 * Middleware to check if user is verified
 */
exports.isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Email verification required'
    });
  }
};

/**
 * Middleware to check if user owns the resource or is an admin
 * @param {String} modelName - The name of the model to check ownership
 * @param {String} paramName - The request parameter containing the resource ID
 */
exports.isOwnerOrAdmin = (modelName, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}.model`);
      const resourceId = req.params[paramName];

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: `Resource ID not provided in parameter: ${paramName}`
        });
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user is owner or admin
      const isOwner = resource.user && resource.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (isOwner || isAdmin) {
        req.resource = resource;
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to access this resource'
        });
      }
    } catch (error) {
      console.error('Authorization error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during authorization check'
      });
    }
  };
};
