/**
 * Medication Seeder
 * 
 * Creates test medication data for users
 */

const Medication = require('../models/medication.model');
const { faker } = require('@faker-js/faker');

// Medication names by category
const MEDICATIONS = {
  fertility: [
    'Clomid', 'Letrozole', 'Femara', 'Gonal-F', 'Follistim', 
    'Menopur', 'Ovidrel', 'Pregnyl', 'Cetrotide', 'Lupron'
  ],
  hormone: [
    'Estradiol', 'Progesterone', 'Estrace', 'Prometrium', 'Crinone',
    'Endometrin', 'Levothyroxine', 'Synthroid', 'Metformin'
  ],
  vitamin: [
    'Prenatal Vitamin', 'Folic Acid', 'Vitamin D3', 'CoQ10', 'DHEA',
    'Vitamin E', 'Omega-3', 'Iron', 'Calcium', 'Magnesium'
  ],
  supplement: [
    'Myo-Inositol', 'D-Chiro-Inositol', 'Melatonin', 'L-Arginine',
    'Maca Root', 'Ashwagandha', 'Vitex', 'Ubiquinol'
  ],
  'pain relief': [
    'Ibuprofen', 'Acetaminophen', 'Naproxen', 'Midol', 'Pamprin'
  ],
  other: [
    'Doxycycline', 'Azithromycin', 'Medrol', 'Prednisone', 'Lovenox',
    'Baby Aspirin', 'Metformin', 'Cabergoline'
  ]
};

// Medication frequencies
const FREQUENCIES = [
  'once', 'daily', 'twice daily', 'three times daily', 'weekly', 'as needed'
];

// Time of day options
const TIME_OF_DAY = ['morning', 'afternoon', 'evening', 'night', 'custom'];

// Days of week
const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

// Medication categories
const CATEGORIES = Object.keys(MEDICATIONS);

/**
 * Create a single medication for a user
 * @param {String} userId - User ID
 * @param {Number} index - Index for generating unique medications
 * @returns {Object} Created medication document
 */
const createMedication = async (userId, index) => {
  // Select a random category and medication from that category
  const category = faker.helpers.arrayElement(CATEGORIES);
  const name = faker.helpers.arrayElement(MEDICATIONS[category]);
  
  // Generate random dosage
  const dosage = faker.number.int({ min: 1, max: 500 }).toString();
  const unit = faker.helpers.arrayElement(['mg', 'mcg', 'mL', 'IU', 'tablet', 'capsule']);
  
  // Generate frequency
  const frequency = faker.helpers.arrayElement(FREQUENCIES);
  const customFrequency = frequency === 'other' ? 'Every other day' : undefined;
  
  // Generate dates
  const now = new Date();
  const startDate = faker.date.past({ years: 1 });
  
  // 70% chance of having an end date
  const hasEndDate = faker.datatype.boolean(0.7);
  const endDate = hasEndDate ? 
    faker.date.between({ from: startDate, to: faker.date.future({ years: 1 }) }) : 
    undefined;
  
  // Generate time of day
  const numTimes = faker.number.int({ min: 1, max: 3 });
  const timeOfDay = faker.helpers.arrayElements(TIME_OF_DAY, numTimes);
  
  // Generate custom times if needed
  const customTimes = timeOfDay.includes('custom') ? 
    [faker.date.anytime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })] : 
    [];
  
  // Generate days of week for weekly medications
  const daysOfWeek = frequency === 'weekly' ? 
    faker.helpers.arrayElements(DAYS_OF_WEEK, faker.number.int({ min: 1, max: 3 })) : 
    [];
  
  // Create medication
  const medication = new Medication({
    user: userId,
    name,
    dosage,
    unit,
    frequency,
    customFrequency,
    startDate,
    endDate,
    timeOfDay,
    customTimes,
    daysOfWeek,
    instructions: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : '',
    purpose: faker.datatype.boolean(0.8) ? faker.lorem.sentence() : '',
    category,
    reminders: {
      enabled: faker.datatype.boolean(0.9),
      reminderTime: faker.helpers.arrayElement([5, 10, 15, 30, 60]),
      notificationMethod: faker.helpers.arrayElement(['push', 'email', 'sms', 'all'])
    },
    logs: generateMedicationLogs(startDate, endDate || now),
    refillInfo: generateRefillInfo(),
    sideEffects: generateSideEffects(startDate, endDate || now),
    isActive: !hasEndDate || endDate > now,
    createdAt: startDate,
    updatedAt: faker.date.between({ from: startDate, to: now })
  });
  
  await medication.save();
  return medication;
};

/**
 * Generate medication logs
 * @param {Date} startDate - Medication start date
 * @param {Date} endDate - Medication end date
 * @returns {Array} Array of medication log objects
 */
const generateMedicationLogs = (startDate, endDate) => {
  const logs = [];
  const now = new Date();
  
  // Calculate number of days between start and end (or today)
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // Generate logs for some of the days (not every day)
  const numLogs = Math.min(daysDiff, faker.number.int({ min: 5, max: 20 }));
  
  for (let i = 0; i < numLogs; i++) {
    const logDate = faker.date.between({ from: startDate, to: endDate });
    
    logs.push({
      date: logDate,
      taken: faker.datatype.boolean(0.8),
      actualTime: faker.date.between({ 
        from: new Date(logDate.setHours(6, 0, 0, 0)), 
        to: new Date(logDate.setHours(22, 0, 0, 0)) 
      }),
      skipped: faker.datatype.boolean(0.2),
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : ''
    });
  }
  
  return logs;
};

/**
 * Generate refill information
 * @returns {Object} Refill information object
 */
const generateRefillInfo = () => {
  const hasRefillInfo = faker.datatype.boolean(0.7);
  
  if (!hasRefillInfo) {
    return {};
  }
  
  return {
    refillDate: faker.date.future(),
    quantity: faker.number.int({ min: 30, max: 90 }),
    pharmacy: faker.company.name() + ' Pharmacy',
    prescriber: 'Dr. ' + faker.person.lastName(),
    reminder: {
      enabled: faker.datatype.boolean(0.8),
      daysBeforeRefill: faker.helpers.arrayElement([3, 5, 7, 10])
    }
  };
};

/**
 * Generate side effects
 * @param {Date} startDate - Medication start date
 * @param {Date} endDate - Medication end date
 * @returns {Array} Array of side effect objects
 */
const generateSideEffects = (startDate, endDate) => {
  const sideEffects = [];
  const hasSideEffects = faker.datatype.boolean(0.4);
  
  if (!hasSideEffects) {
    return [];
  }
  
  const numSideEffects = faker.number.int({ min: 1, max: 3 });
  const possibleEffects = [
    'Headache', 'Nausea', 'Dizziness', 'Fatigue', 'Bloating',
    'Mood swings', 'Hot flashes', 'Insomnia', 'Stomach pain',
    'Rash', 'Dry mouth', 'Constipation', 'Diarrhea'
  ];
  
  for (let i = 0; i < numSideEffects; i++) {
    sideEffects.push({
      date: faker.date.between({ from: startDate, to: endDate }),
      effect: faker.helpers.arrayElement(possibleEffects),
      severity: faker.number.int({ min: 1, max: 5 }),
      notes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : ''
    });
  }
  
  return sideEffects;
};

/**
 * Seed medications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Number} medicationsPerUser - Number of medications to create per user
 * @returns {Array} Array of created medication documents
 */
const seedMedications = async (userIds, medicationsPerUser) => {
  const medications = [];
  
  for (const userId of userIds) {
    for (let i = 0; i < medicationsPerUser; i++) {
      const medication = await createMedication(userId, i);
      medications.push(medication);
    }
  }
  
  return medications;
};

module.exports = {
  seedMedications
};
