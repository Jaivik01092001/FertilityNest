const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google auth
    },
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  fertilityStage: {
    type: String,
    enum: ['Trying to Conceive', 'IVF', 'IUI', 'PCOS Management', 'Pregnancy', 'Postpartum', 'Other'],
    default: 'Other'
  },
  journeyType: {
    type: String,
    enum: ['Natural', 'IVF', 'IUI', 'PCOS', 'Other'],
    default: 'Natural'
  },
  dateOfBirth: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String
    }
  }],
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  partnerCode: {
    type: String,
    unique: true,
    sparse: true
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      shareWithPartner: {
        type: Boolean,
        default: true
      },
      anonymousInCommunity: {
        type: Boolean,
        default: false
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  geminiApiKey: {
    type: String,
    trim: true
  },
  joinedCommunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
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

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  const user = this;

  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate partner code
userSchema.methods.generatePartnerCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.partnerCode = code;
  return code;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
