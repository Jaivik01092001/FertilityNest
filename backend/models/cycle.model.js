const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  cycleLength: {
    type: Number
  },
  periodLength: {
    type: Number
  },
  symptoms: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['cramps', 'headache', 'bloating', 'fatigue', 'mood swings', 'breast tenderness', 'acne', 'other'],
      required: true
    },
    severity: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }],
  mood: [{
    date: {
      type: Date,
      required: true
    },
    value: {
      type: String,
      enum: ['happy', 'sad', 'anxious', 'irritable', 'calm', 'energetic', 'tired', 'other'],
      required: true
    },
    notes: String
  }],
  temperature: [{
    date: {
      type: Date,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    time: String
  }],
  cervicalMucus: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['dry', 'sticky', 'creamy', 'watery', 'egg white', 'other'],
      required: true
    },
    notes: String
  }],
  ovulationTest: [{
    date: {
      type: Date,
      required: true
    },
    result: {
      type: String,
      enum: ['positive', 'negative', 'invalid'],
      required: true
    },
    image: String,
    notes: String
  }],
  intercourse: [{
    date: {
      type: Date,
      required: true
    },
    protected: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  notes: [{
    date: {
      type: Date,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  tags: [String],
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

// Virtual for calculating fertile window
cycleSchema.virtual('fertileWindow').get(function() {
  if (!this.startDate || !this.cycleLength) return null;
  
  const cycleStart = new Date(this.startDate);
  const ovulationDay = new Date(cycleStart);
  ovulationDay.setDate(cycleStart.getDate() + (this.cycleLength - 14));
  
  const fertileStart = new Date(ovulationDay);
  fertileStart.setDate(ovulationDay.getDate() - 5);
  
  const fertileEnd = new Date(ovulationDay);
  fertileEnd.setDate(ovulationDay.getDate() + 1);
  
  return {
    start: fertileStart,
    end: fertileEnd,
    ovulationDay
  };
});

// Method to predict next period
cycleSchema.methods.predictNextPeriod = function() {
  if (!this.startDate || !this.cycleLength) return null;
  
  const nextPeriodStart = new Date(this.startDate);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + this.cycleLength);
  
  return nextPeriodStart;
};

const Cycle = mongoose.model('Cycle', cycleSchema);

module.exports = Cycle;
