/**
 * Tracker Configuration Seeder
 * 
 * Creates test tracker configurations for the application
 */

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Import the tracker model
// Note: We're assuming the model is exported as 'TrackerConfiguration'
let TrackerConfiguration;
try {
  TrackerConfiguration = require('../models/tracker.model');
} catch (error) {
  // If the model is not directly exported, try to get it from mongoose
  TrackerConfiguration = mongoose.model('TrackerConfiguration');
}

// Field types for tracker configurations
const FIELD_TYPES = [
  'text', 'number', 'date', 'select', 'multiselect', 'boolean', 'range'
];

// Predefined tracker configurations
const PREDEFINED_TRACKERS = [
  {
    name: 'Cycle Tracking',
    description: 'Track your menstrual cycle, symptoms, and fertility signs',
    journeyType: 'Natural',
    category: 'cycle',
    fields: [
      {
        name: 'cycleDay',
        label: 'Cycle Day',
        type: 'number',
        required: true,
        options: [],
        min: 1,
        max: 45,
        defaultValue: '1'
      },
      {
        name: 'flow',
        label: 'Flow Intensity',
        type: 'select',
        required: false,
        options: ['None', 'Light', 'Medium', 'Heavy', 'Very Heavy'],
        defaultValue: 'None'
      },
      {
        name: 'symptoms',
        label: 'Symptoms',
        type: 'multiselect',
        required: false,
        options: ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood Swings', 'Breast Tenderness', 'Acne', 'Other'],
        defaultValue: []
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'select',
        required: false,
        options: ['Happy', 'Sad', 'Anxious', 'Irritable', 'Calm', 'Energetic', 'Tired', 'Other'],
        defaultValue: 'Calm'
      },
      {
        name: 'temperature',
        label: 'Basal Body Temperature',
        type: 'number',
        required: false,
        options: [],
        min: 96.0,
        max: 100.0,
        step: 0.1,
        defaultValue: '97.7'
      },
      {
        name: 'cervicalMucus',
        label: 'Cervical Mucus',
        type: 'select',
        required: false,
        options: ['Dry', 'Sticky', 'Creamy', 'Watery', 'Egg White', 'Other'],
        defaultValue: 'Dry'
      },
      {
        name: 'ovulationTest',
        label: 'Ovulation Test Result',
        type: 'select',
        required: false,
        options: ['Not Tested', 'Negative', 'Positive', 'Invalid'],
        defaultValue: 'Not Tested'
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        options: [],
        defaultValue: ''
      }
    ]
  },
  {
    name: 'IVF Treatment Tracker',
    description: 'Track medications, appointments, and results during IVF treatment',
    journeyType: 'IVF',
    category: 'other',
    fields: [
      {
        name: 'treatmentPhase',
        label: 'Treatment Phase',
        type: 'select',
        required: true,
        options: ['Preparation', 'Stimulation', 'Trigger', 'Retrieval', 'Transfer', 'Two Week Wait', 'Beta Testing'],
        defaultValue: 'Preparation'
      },
      {
        name: 'medications',
        label: 'Medications Taken',
        type: 'multiselect',
        required: false,
        options: ['Gonal-F', 'Follistim', 'Menopur', 'Cetrotide', 'Lupron', 'Estrace', 'Progesterone', 'Other'],
        defaultValue: []
      },
      {
        name: 'appointmentDate',
        label: 'Appointment Date',
        type: 'date',
        required: false,
        options: [],
        defaultValue: ''
      },
      {
        name: 'follicleCount',
        label: 'Follicle Count',
        type: 'number',
        required: false,
        options: [],
        min: 0,
        max: 50,
        defaultValue: '0'
      },
      {
        name: 'endometriumThickness',
        label: 'Endometrium Thickness (mm)',
        type: 'number',
        required: false,
        options: [],
        min: 0,
        max: 20,
        step: 0.1,
        defaultValue: '0'
      },
      {
        name: 'estrogenLevel',
        label: 'Estrogen Level',
        type: 'number',
        required: false,
        options: [],
        min: 0,
        defaultValue: '0'
      },
      {
        name: 'symptoms',
        label: 'Symptoms',
        type: 'multiselect',
        required: false,
        options: ['Bloating', 'Cramping', 'Fatigue', 'Headache', 'Mood Swings', 'Nausea', 'OHSS', 'Other'],
        defaultValue: []
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        options: [],
        defaultValue: ''
      }
    ]
  },
  {
    name: 'Medication Tracker',
    description: 'Track your fertility medications and supplements',
    journeyType: 'Other',
    category: 'medication',
    fields: [
      {
        name: 'medicationName',
        label: 'Medication Name',
        type: 'text',
        required: true,
        options: [],
        defaultValue: ''
      },
      {
        name: 'dosage',
        label: 'Dosage',
        type: 'text',
        required: true,
        options: [],
        defaultValue: ''
      },
      {
        name: 'timeTaken',
        label: 'Time Taken',
        type: 'select',
        required: true,
        options: ['Morning', 'Afternoon', 'Evening', 'Night', 'Other'],
        defaultValue: 'Morning'
      },
      {
        name: 'taken',
        label: 'Medication Taken',
        type: 'boolean',
        required: true,
        options: [],
        defaultValue: 'false'
      },
      {
        name: 'sideEffects',
        label: 'Side Effects',
        type: 'multiselect',
        required: false,
        options: ['None', 'Headache', 'Nausea', 'Dizziness', 'Fatigue', 'Mood Swings', 'Hot Flashes', 'Other'],
        defaultValue: ['None']
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        options: [],
        defaultValue: ''
      }
    ]
  }
];

/**
 * Create a single tracker configuration
 * @param {Number} index - Index for generating unique configurations
 * @param {String} adminId - Admin user ID for the creator
 * @returns {Object} Created tracker configuration document
 */
const createTrackerConfiguration = async (index, adminId) => {
  // Use predefined trackers if available, otherwise generate random ones
  if (index < PREDEFINED_TRACKERS.length) {
    const config = PREDEFINED_TRACKERS[index];
    
    const trackerConfig = new TrackerConfiguration({
      ...config,
      createdBy: adminId,
      updatedBy: adminId,
      isActive: true,
      createdAt: faker.date.past({ months: 6 }),
      updatedAt: faker.date.recent()
    });
    
    await trackerConfig.save();
    return trackerConfig;
  }
  
  // Generate random tracker configuration
  const journeyTypes = ['Natural', 'IVF', 'IUI', 'PCOS', 'Other'];
  const categories = ['cycle', 'medication', 'symptom', 'mood', 'temperature', 'other'];
  
  const trackerConfig = new TrackerConfiguration({
    name: `${faker.word.adjective()} ${faker.word.noun()} Tracker`,
    description: faker.lorem.sentence(),
    journeyType: faker.helpers.arrayElement(journeyTypes),
    category: faker.helpers.arrayElement(categories),
    fields: generateRandomFields(faker.number.int({ min: 3, max: 8 })),
    isActive: true,
    createdBy: adminId,
    updatedBy: adminId,
    createdAt: faker.date.past({ months: 6 }),
    updatedAt: faker.date.recent()
  });
  
  await trackerConfig.save();
  return trackerConfig;
};

/**
 * Generate random fields for a tracker configuration
 * @param {Number} count - Number of fields to generate
 * @returns {Array} Array of field objects
 */
const generateRandomFields = (count) => {
  const fields = [];
  
  for (let i = 0; i < count; i++) {
    const fieldType = faker.helpers.arrayElement(FIELD_TYPES);
    
    const field = {
      name: faker.lorem.word().toLowerCase(),
      label: faker.lorem.words({ min: 1, max: 3 }),
      type: fieldType,
      required: faker.datatype.boolean(0.3),
      options: [],
      defaultValue: ''
    };
    
    // Add type-specific properties
    switch (fieldType) {
      case 'select':
      case 'multiselect':
        field.options = Array.from({ length: faker.number.int({ min: 3, max: 7 }) }, 
          () => faker.lorem.word());
        field.defaultValue = fieldType === 'multiselect' ? [] : field.options[0];
        break;
      case 'number':
        field.min = faker.number.int({ min: 0, max: 10 });
        field.max = faker.number.int({ min: field.min + 10, max: field.min + 100 });
        field.step = faker.helpers.arrayElement([0.1, 0.5, 1, 5, 10]);
        field.defaultValue = field.min.toString();
        break;
      case 'range':
        field.min = faker.number.int({ min: 0, max: 10 });
        field.max = faker.number.int({ min: field.min + 10, max: field.min + 100 });
        field.defaultValue = field.min.toString();
        break;
      case 'boolean':
        field.defaultValue = faker.datatype.boolean().toString();
        break;
      default:
        field.defaultValue = '';
    }
    
    fields.push(field);
  }
  
  return fields;
};

/**
 * Seed tracker configurations
 * @param {Number} count - Number of configurations to create
 * @param {String} adminId - Admin user ID for the creator
 * @returns {Array} Array of created tracker configuration documents
 */
const seedTrackerConfigurations = async (count, adminId) => {
  const configurations = [];
  
  for (let i = 0; i < count; i++) {
    const config = await createTrackerConfiguration(i, adminId);
    configurations.push(config);
  }
  
  return configurations;
};

module.exports = {
  seedTrackerConfigurations
};
