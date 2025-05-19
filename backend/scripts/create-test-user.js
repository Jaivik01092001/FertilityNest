/**
 * Script to create a test user directly in the database
 * Run with: node scripts/create-test-user.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fertilitynest');
    console.log('Connected to MongoDB');

    // Delete the test user if it exists
    await User.deleteOne({ email: 'test@example.com' });
    console.log('Deleted any existing test user');

    // Create a new test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!', // This will be hashed by the pre-save hook
      fertilityStage: 'Other',
      journeyType: 'Natural',
      role: 'user',
      isVerified: true
    });

    // Save the user - the password will be hashed by the pre-save hook
    await user.save();

    console.log('Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: Password123!');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error creating test user:', error);

    // Check if the error is a duplicate key error
    if (error.code === 11000) {
      console.log('User already exists. Try a different email.');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

createTestUser();
