/**
 * Database Status Check and Seeding Script
 * 
 * This script checks the status of the database and allows manual seeding.
 * 
 * Usage:
 * - Run with Node.js: node scripts/check-db.js
 * - Options:
 *   --seed: Run the seeders
 *   --clear: Clear existing data before seeding
 *   --force: Force seeding even in production
 * 
 * Examples:
 * - Check database status: node scripts/check-db.js
 * - Seed database: node scripts/check-db.js --seed
 * - Clear and seed database: node scripts/check-db.js --seed --clear
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { seedDatabase, shouldSkipSeeding, clearExistingData } = require('../seeders');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  seed: args.includes('--seed'),
  clear: args.includes('--clear'),
  force: args.includes('--force')
};

// Set environment variables based on options
if (options.clear) {
  process.env.CLEAR_EXISTING_DATA = 'true';
}

if (options.force) {
  process.env.ENABLE_PRODUCTION_SEEDING = 'true';
}

// Connect to MongoDB
async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fertilitynest');
    console.log('✅ Connected to MongoDB');

    // Check database status
    await checkDatabaseStatus();

    // Run seeders if requested
    if (options.seed) {
      const skipSeeding = await shouldSkipSeeding();
      
      if (!skipSeeding) {
        console.log('🌱 Starting database seeding...');
        
        if (options.clear) {
          console.log('🧹 Clearing existing data...');
          await clearExistingData();
        }
        
        const result = await seedDatabase();
        console.log('🎉 Database seeding completed successfully!');
        console.log('📊 Seeding summary:');
        Object.entries(result).forEach(([key, value]) => {
          console.log(`   - ${key}: ${value}`);
        });
      } else {
        console.log('⏭️ Database seeding skipped (disabled by configuration or data already exists)');
        console.log('   Use --clear to force clear existing data and reseed');
      }
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Check database status
async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...');
  
  // Get all collections
  const collections = mongoose.connection.collections;
  const collectionNames = Object.keys(collections);
  
  console.log(`📚 Found ${collectionNames.length} collections`);
  
  // Check counts for each collection
  for (const name of collectionNames) {
    const count = await collections[name].countDocuments();
    console.log(`   - ${name}: ${count} documents`);
  }
  
  // Check for specific models
  const User = require('../models/user.model');
  const userCount = await User.countDocuments();
  const adminCount = await User.countDocuments({ role: 'admin' });
  const partnerCount = await User.countDocuments({ role: 'partner' });
  const regularUserCount = await User.countDocuments({ role: 'user' });
  const moderatorCount = await User.countDocuments({ role: 'moderator' });
  
  console.log('\n👤 User statistics:');
  console.log(`   - Total users: ${userCount}`);
  console.log(`   - Admin users: ${adminCount}`);
  console.log(`   - Partner users: ${partnerCount}`);
  console.log(`   - Regular users: ${regularUserCount}`);
  console.log(`   - Moderator users: ${moderatorCount}`);
  
  // Check if database is empty
  if (userCount === 0) {
    console.log('\n⚠️ Database appears to be empty. Run with --seed to populate it.');
  } else {
    console.log('\n✅ Database contains data.');
  }
}

// Run the script
main();
