const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'cycle_reminder', 
      'medication_reminder', 
      'partner_request', 
      'partner_accepted',
      'community_invite',
      'community_post',
      'comment_reply',
      'like',
      'distress_signal',
      'system_notification',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  actionLink: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  expiresAt: {
    type: Date
  },
  deliveryStatus: {
    app: {
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.updatedAt = Date.now();
  return this.save();
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status) {
  if (!this.deliveryStatus[channel]) return false;
  
  this.deliveryStatus[channel].sent = status;
  if (status) {
    this.deliveryStatus[channel].sentAt = Date.now();
  }
  
  this.updatedAt = Date.now();
  return this.save();
};

// Static method to create a notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadNotifications = function(userId) {
  return this.find({
    recipient: userId,
    read: false
  })
  .sort({ createdAt: -1 })
  .populate('sender', 'name profilePicture')
  .exec();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
