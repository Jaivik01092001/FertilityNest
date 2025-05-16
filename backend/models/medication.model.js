const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'twice daily', 'three times daily', 'weekly', 'as needed', 'other'],
    required: true
  },
  customFrequency: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  timeOfDay: [{
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'custom'],
    required: true
  }],
  customTimes: [{
    type: String
  }],
  daysOfWeek: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  instructions: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['fertility', 'hormone', 'vitamin', 'supplement', 'pain relief', 'other'],
    default: 'other'
  },
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: Number, // Minutes before scheduled time
      default: 15
    },
    notificationMethod: {
      type: String,
      enum: ['push', 'email', 'sms', 'all'],
      default: 'push'
    }
  },
  logs: [{
    date: {
      type: Date,
      required: true
    },
    taken: {
      type: Boolean,
      default: false
    },
    actualTime: {
      type: Date
    },
    skipped: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  refillInfo: {
    refillDate: Date,
    quantity: Number,
    pharmacy: String,
    prescriber: String,
    reminder: {
      enabled: {
        type: Boolean,
        default: false
      },
      daysBeforeRefill: {
        type: Number,
        default: 7
      }
    }
  },
  sideEffects: [{
    date: {
      type: Date,
      required: true
    },
    effect: {
      type: String,
      required: true
    },
    severity: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Method to check if medication is due today
medicationSchema.methods.isDueToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(this.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = this.endDate ? new Date(this.endDate) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);
  
  // Check if today is within the medication date range
  if (today < startDate || (endDate && today > endDate)) {
    return false;
  }
  
  // Check if medication is scheduled for specific days of the week
  if (this.daysOfWeek && this.daysOfWeek.length > 0) {
    const daysMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    const todayDay = today.getDay();
    const scheduledDays = this.daysOfWeek.map(day => daysMap[day.toLowerCase()]);
    
    return scheduledDays.includes(todayDay);
  }
  
  return true;
};

// Method to get today's medication logs
medicationSchema.methods.getTodayLogs = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  return this.logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= today && logDate <= todayEnd;
  });
};

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
