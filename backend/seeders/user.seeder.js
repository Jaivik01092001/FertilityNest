/**
 * User Seeder
 *
 * Creates test users with different roles and partner connections
 */

const User = require('../models/user.model');
const { faker } = require('@faker-js/faker');

// Default password for all seeded users
const DEFAULT_PASSWORD = 'Password123!';

// Sample profile pictures (can be replaced with actual URLs)
const PROFILE_PICTURES = [
  'default-profile.png',
  'profile-1.jpg',
  'profile-2.jpg',
  'profile-3.jpg',
  'profile-4.jpg'
];

// Fertility stages
const FERTILITY_STAGES = [
  'Trying to Conceive',
  'IVF',
  'IUI',
  'PCOS Management',
  'Pregnancy',
  'Postpartum',
  'Other'
];

// Journey types
const JOURNEY_TYPES = [
  'Natural',
  'IVF',
  'IUI',
  'PCOS',
  'Other'
];

// Community categories
const COMMUNITY_CATEGORIES = [
  'IVF Warriors',
  'PCOS Support',
  'LGBTQ+',
  'Single Moms by Choice',
  'Pregnancy Loss',
  'Fertility Journey',
  'General',
  'Other'
];

/**
 * Create a single user with specified role
 * @param {String} role - User role
 * @param {Number} index - Index for generating unique data
 * @returns {Object} Created user document
 */
const createUser = async (role, index) => {
  const gender = faker.person.sex();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;

  // Create a deterministic but unique email based on role and index
  const email = `${role.toLowerCase()}${index}@anaira.test`;

  // We'll let the pre-save hook in the user model handle password hashing
  const password = DEFAULT_PASSWORD;

  // Generate random data for the user
  const user = new User({
    name,
    email,
    password,
    profilePicture: faker.helpers.arrayElement(PROFILE_PICTURES),
    fertilityStage: faker.helpers.arrayElement(FERTILITY_STAGES),
    journeyType: faker.helpers.arrayElement(JOURNEY_TYPES),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 45, mode: 'age' }),
    phone: faker.phone.number(),
    role,
    isVerified: true,
    preferences: {
      notifications: {
        email: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        sms: faker.datatype.boolean()
      },
      privacy: {
        shareWithPartner: faker.datatype.boolean(),
        anonymousInCommunity: faker.datatype.boolean()
      },
      theme: faker.helpers.arrayElement(['light', 'dark', 'auto'])
    },
    communityPreferences: generateCommunityPreferences(),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent()
  });

  // Generate partner code for regular users
  if (role === 'user' || role === 'partner') {
    user.generatePartnerCode();
  }

  // Add emergency contacts for some users
  if (faker.datatype.boolean(0.7)) {
    user.emergencyContacts = [{
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
    }];

    // Add a second emergency contact sometimes
    if (faker.datatype.boolean(0.3)) {
      user.emergencyContacts.push({
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend'])
      });
    }
  }

  await user.save();
  return user;
};

/**
 * Generate community preferences for a user
 * @returns {Array} Array of community preference objects
 */
const generateCommunityPreferences = () => {
  const preferences = [];
  const numPreferences = faker.number.int({ min: 1, max: 4 });

  // Get random categories without duplicates
  const categories = faker.helpers.arrayElements(
    COMMUNITY_CATEGORIES,
    numPreferences
  );

  categories.forEach(category => {
    preferences.push({
      category,
      preferenceLevel: faker.number.int({ min: 1, max: 5 })
    });
  });

  return preferences;
};

/**
 * Seed users with different roles
 * @param {Object} counts - Number of users to create by role
 * @returns {Array} Array of created user documents
 */
const seedUsers = async (counts) => {
  const users = [];

  // Create regular users
  for (let i = 1; i <= 1; i++) {
    const user = await createUser('user', i);
    users.push(user);
  }

  // Create partner users
  for (let i = 1; i <= 1; i++) {
    const user = await createUser('partner', i);
    users.push(user);
  }

  // Create admin users
  for (let i = 1; i <= 1; i++) {
    const user = await createUser('admin', i);
    users.push(user);
  }


  return users;
};

/**
 * Create partner connections between users
 * @param {Array} users - Array of user documents
 * @returns {Array} Array of updated user pairs
 */
const createPartnerConnections = async (users) => {
  const connections = [];
  const regularUsers = users.filter(u => u.role === 'user');
  const partnerUsers = users.filter(u => u.role === 'partner');

  // Connect some regular users with partner users
  const numConnections = Math.min(regularUsers.length, partnerUsers.length);

  for (let i = 0; i < numConnections; i++) {
    const user = regularUsers[i];
    const partner = partnerUsers[i];

    // Update both users with partner IDs
    user.partnerId = partner._id;
    partner.partnerId = user._id;

    await user.save();
    await partner.save();

    connections.push({ user, partner });
  }

  // Connect some regular users with each other (if there are enough)
  const remainingUsers = regularUsers.slice(numConnections);

  if (remainingUsers.length >= 2) {
    for (let i = 0; i < Math.floor(remainingUsers.length / 2); i++) {
      const user1 = remainingUsers[i * 2];
      const user2 = remainingUsers[i * 2 + 1];

      user1.partnerId = user2._id;
      user2.partnerId = user1._id;

      await user1.save();
      await user2.save();

      connections.push({ user: user1, partner: user2 });
    }
  }

  return connections;
};

module.exports = {
  seedUsers,
  createPartnerConnections
};
