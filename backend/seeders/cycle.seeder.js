/**
 * Cycle Seeder
 *
 * Creates test cycle data for users
 */

const Cycle = require('../models/cycle.model');
const { faker } = require('@faker-js/faker');

// Symptom types
const SYMPTOM_TYPES = [
  'cramps', 'headache', 'bloating', 'fatigue',
  'mood swings', 'breast tenderness', 'acne', 'other'
];

// Mood values
const MOOD_VALUES = [
  'happy', 'sad', 'anxious', 'irritable',
  'calm', 'energetic', 'tired', 'other'
];

// Cervical mucus types
const CERVICAL_MUCUS_TYPES = [
  'dry', 'sticky', 'creamy', 'watery', 'egg white', 'other'
];

// Ovulation test results
const OVULATION_TEST_RESULTS = [
  'positive', 'negative', 'invalid'
];

/**
 * Create a single cycle for a user
 * @param {String} userId - User ID
 * @param {Number} index - Index for generating sequential cycles
 * @returns {Object} Created cycle document
 */
const createCycle = async (userId, index) => {
  // Calculate dates for this cycle
  // Start with the most recent cycle and go backwards
  const now = new Date();
  const cycleLength = faker.number.int({ min: 25, max: 35 });
  const periodLength = faker.number.int({ min: 3, max: 7 });

  // Calculate start date (going backwards from now)
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (cycleLength * index));

  // Calculate end date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + periodLength);

  // Create cycle
  const cycle = new Cycle({
    user: userId,
    startDate,
    endDate,
    cycleLength,
    periodLength,
    symptoms: generateSymptoms(startDate, periodLength),
    mood: generateMoodEntries(startDate, cycleLength),
    temperature: generateTemperatureReadings(startDate, cycleLength),
    cervicalMucus: generateCervicalMucusEntries(startDate, cycleLength),
    ovulationTest: generateOvulationTests(startDate, cycleLength),
    intercourse: generateIntercourseEntries(startDate, cycleLength),
    notes: generateNotes(startDate, cycleLength),
    tags: generateTags(),
    isActive: index === 0, // Only the most recent cycle is active
    createdAt: startDate,
    updatedAt: faker.date.between({ from: startDate, to: now })
  });

  await cycle.save();
  return cycle;
};

/**
 * Generate symptom entries for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} periodLength - Length of period
 * @returns {Array} Array of symptom objects
 */
const generateSymptoms = (startDate, periodLength) => {
  const symptoms = [];
  const numSymptoms = faker.number.int({ min: 2, max: 5 });

  // Generate symptoms primarily during period days
  for (let i = 0; i < numSymptoms; i++) {
    const dayOffset = faker.number.int({ min: 0, max: periodLength - 1 });
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    symptoms.push({
      date,
      type: faker.helpers.arrayElement(SYMPTOM_TYPES),
      severity: faker.number.int({ min: 1, max: 5 }),
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : ''
    });
  }

  return symptoms;
};

/**
 * Generate mood entries for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} cycleLength - Length of cycle
 * @returns {Array} Array of mood objects
 */
const generateMoodEntries = (startDate, cycleLength) => {
  const moods = [];
  const numEntries = faker.number.int({ min: 3, max: 10 });

  for (let i = 0; i < numEntries; i++) {
    const dayOffset = faker.number.int({ min: 0, max: cycleLength - 1 });
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    moods.push({
      date,
      value: faker.helpers.arrayElement(MOOD_VALUES),
      notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : ''
    });
  }

  return moods;
};

/**
 * Generate temperature readings for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} cycleLength - Length of cycle
 * @returns {Array} Array of temperature objects
 */
const generateTemperatureReadings = (startDate, cycleLength) => {
  const readings = [];

  // Generate a reading for most days of the cycle
  for (let day = 0; day < cycleLength; day++) {
    // Skip some days randomly
    if (faker.datatype.boolean(0.2)) continue;

    const date = new Date(startDate);
    date.setDate(date.getDate() + day);

    // Base temperature around 97.0-99.0°F with a spike after ovulation
    let baseTemp = 97.0 + (faker.number.float({ min: 0, max: 0.7, multipleOf: 0.1 }));

    // Add temperature spike after ovulation (around day 14)
    if (day > 13) {
      baseTemp += 0.4 + (faker.number.float({ min: 0, max: 0.3, multipleOf: 0.1 }));
    }

    readings.push({
      date,
      value: baseTemp,
      time: faker.helpers.arrayElement(['06:30', '07:00', '07:30', '08:00'])
    });
  }

  return readings;
};

/**
 * Generate cervical mucus entries for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} cycleLength - Length of cycle
 * @returns {Array} Array of cervical mucus objects
 */
const generateCervicalMucusEntries = (startDate, cycleLength) => {
  const entries = [];
  const numEntries = faker.number.int({ min: 3, max: 8 });

  for (let i = 0; i < numEntries; i++) {
    const dayOffset = faker.number.int({ min: 0, max: cycleLength - 1 });
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    // More likely to have egg white around ovulation
    let type;
    if (dayOffset >= 10 && dayOffset <= 16) {
      type = faker.helpers.arrayElement(['watery', 'egg white', 'egg white', 'creamy']);
    } else {
      type = faker.helpers.arrayElement(CERVICAL_MUCUS_TYPES);
    }

    entries.push({
      date,
      type,
      notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : ''
    });
  }

  return entries;
};

/**
 * Generate ovulation test entries for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} cycleLength - Length of cycle
 * @returns {Array} Array of ovulation test objects
 */
const generateOvulationTests = (startDate, cycleLength) => {
  const tests = [];

  // Usually people test around days 10-16
  const testingDays = faker.number.int({ min: 2, max: 5 });

  for (let i = 0; i < testingDays; i++) {
    const dayOffset = faker.number.int({ min: 10, max: 16 });
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    // More likely to be positive around day 12-14
    let result;
    if (dayOffset >= 12 && dayOffset <= 14) {
      result = faker.helpers.arrayElement(['positive', 'positive', 'negative']);
    } else {
      result = faker.helpers.arrayElement(['negative', 'negative', 'negative', 'positive']);
    }

    tests.push({
      date,
      result,
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : ''
    });
  }

  return tests;
};

/**
 * Generate intercourse entries for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} cycleLength - Length of cycle
 * @returns {Array} Array of intercourse objects
 */
const generateIntercourseEntries = (startDate, cycleLength) => {
  const entries = [];
  const numEntries = faker.number.int({ min: 0, max: 6 });

  for (let i = 0; i < numEntries; i++) {
    const dayOffset = faker.number.int({ min: 0, max: cycleLength - 1 });
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    entries.push({
      date,
      protected: faker.datatype.boolean(0.2),
      notes: faker.datatype.boolean(0.1) ? faker.lorem.sentence() : ''
    });
  }

  return entries;
};

/**
 * Generate notes for a cycle
 * @param {Date} startDate - Cycle start date
 * @param {Number} cycleLength - Length of cycle
 * @returns {Array} Array of note objects
 */
const generateNotes = (startDate, cycleLength) => {
  const notes = [];
  const numNotes = faker.number.int({ min: 0, max: 3 });

  for (let i = 0; i < numNotes; i++) {
    const dayOffset = faker.number.int({ min: 0, max: cycleLength - 1 });
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    notes.push({
      date,
      content: faker.lorem.paragraph()
    });
  }

  return notes;
};

/**
 * Generate tags for a cycle
 * @returns {Array} Array of tag strings
 */
const generateTags = () => {
  const possibleTags = ['regular', 'irregular', 'stress', 'travel', 'medication', 'exercise', 'diet change'];
  return faker.helpers.arrayElements(possibleTags, faker.number.int({ min: 0, max: 3 }));
};

/**
 * Seed cycles for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Number} cyclesPerUser - Number of cycles to create per user
 * @returns {Array} Array of created cycle documents
 */
const seedCycles = async (userIds, cyclesPerUser) => {
  const cycles = [];

  for (const userId of userIds) {
    for (let i = 0; i < cyclesPerUser; i++) {
      const cycle = await createCycle(userId, i);
      cycles.push(cycle);
    }
  }

  return cycles;
};

module.exports = {
  seedCycles
};
