/**
 * Database Seeder for ANAIRA Application
 *
 * This module provides functionality to seed the MongoDB database with test data
 * for development and testing purposes.
 *
 * Features:
 * - Role-based user creation (User, Partner, Admin, Moderator)
 * - Cycle data generation
 * - Medication data generation
 * - Chat history generation
 * - Partner connections
 * - Community posts and interactions
 *
 * Usage:
 * - Automatically runs when server starts in development mode
 * - Can be disabled via environment variable DISABLE_SEEDING=true
 */

const mongoose = require('mongoose');
const userSeeder = require('./user.seeder');
const cycleSeeder = require('./cycle.seeder');
const medicationSeeder = require('./medication.seeder');
const chatSeeder = require('./chat.seeder');
const communitySeeder = require('./community.seeder');
const trackerSeeder = require('./tracker.seeder');

// Configuration
const config = {
  // Set to true to clear existing data before seeding
  clearExistingData: process.env.CLEAR_EXISTING_DATA === 'true' || true, // Default to true for development

  // Number of records to create
  counts: {
    users: {
      regular: 10,
      partner: 5,
      admin: 2,
      moderator: 3
    },
    cyclesPerUser: 6,
    medicationsPerUser: 4,
    chatSessionsPerUser: 3,
    messagesPerChatSession: 10,
    communities: 5,
    postsPerCommunity: 8,
    commentsPerPost: 3,
    trackerConfigurations: 5
  }
};

/**
 * Main seeder function
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data if configured
    if (config.clearExistingData) {
      console.log('🧹 Clearing existing data...');
      await clearExistingData();
    }

    // Seed users first (we need them for relationships)
    console.log('👤 Seeding users...');
    const users = await userSeeder.seedUsers(config.counts.users);
    console.log(`✅ Created ${users.length} users`);

    // Extract user IDs by role for easier access
    const userIds = {
      regular: users.filter(u => u.role === 'user').map(u => u._id),
      partner: users.filter(u => u.role === 'partner').map(u => u._id),
      admin: users.filter(u => u.role === 'admin').map(u => u._id),
      moderator: users.filter(u => u.role === 'moderator').map(u => u._id)
    };

    // Create partner connections
    console.log('🔄 Creating partner connections...');
    const partnerConnections = await userSeeder.createPartnerConnections(users);
    console.log(`✅ Created ${partnerConnections.length} partner connections`);

    // Skip tracker configurations for now due to schema issues
    console.log('📋 Skipping tracker configurations due to schema issues...');
    const trackerConfigs = [];

    // Seed cycles
    console.log('🔄 Seeding cycle data...');
    const cycles = await cycleSeeder.seedCycles(
      userIds.regular.concat(userIds.partner),
      config.counts.cyclesPerUser
    );
    console.log(`✅ Created ${cycles.length} cycles`);

    // Seed medications
    console.log('💊 Seeding medication data...');
    const medications = await medicationSeeder.seedMedications(
      userIds.regular.concat(userIds.partner),
      config.counts.medicationsPerUser
    );
    console.log(`✅ Created ${medications.length} medications`);

    // Seed chat sessions
    console.log('💬 Seeding chat data...');
    const chatSessions = await chatSeeder.seedChatSessions(
      userIds.regular.concat(userIds.partner),
      config.counts.chatSessionsPerUser,
      config.counts.messagesPerChatSession
    );
    console.log(`✅ Created ${chatSessions.length} chat sessions`);

    // Seed communities
    console.log('👪 Seeding community data...');
    const communities = await communitySeeder.seedCommunities(
      config.counts.communities,
      users,
      config.counts.postsPerCommunity,
      config.counts.commentsPerPost
    );
    console.log(`✅ Created ${communities.length} communities`);

    console.log('🎉 Database seeding completed successfully!');

    // Return summary of created data
    return {
      users: users.length,
      partnerConnections: partnerConnections.length,
      trackerConfigurations: trackerConfigs.length,
      cycles: cycles.length,
      medications: medications.length,
      chatSessions: chatSessions.length,
      communities: communities.length
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Clear all existing data from the database
 */
const clearExistingData = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Check if seeding should be skipped
 */
const shouldSkipSeeding = () => {
  // Skip in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PRODUCTION_SEEDING !== 'true') {
    return true;
  }

  // Skip if explicitly disabled
  if (process.env.DISABLE_SEEDING === 'true') {
    return true;
  }

  return false;
};

module.exports = {
  seedDatabase,
  shouldSkipSeeding,
  clearExistingData,
  config
};
