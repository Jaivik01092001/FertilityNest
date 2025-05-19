const mongoose = require('mongoose');

const trackerFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'range'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }],
  min: Number,
  max: Number,
  step: Number,
  defaultValue: mongoose.Schema.Types.Mixed,
  placeholder: String,
  helpText: String,
  order: {
    type: Number,
    default: 0
  }
});

const trackerConfigurationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  journeyType: {
    type: String,
    enum: ['Natural', 'IVF', 'IUI', 'PCOS', 'Other'],
    required: true
  },
  category: {
    type: String,
    enum: ['cycle', 'medication', 'symptom', 'mood', 'temperature', 'other'],
    required: true
  },
  fields: [trackerFieldSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

const TrackerConfiguration = mongoose.model('TrackerConfiguration', trackerConfigurationSchema);

module.exports = TrackerConfiguration;
