# ANAIRA Database Seeders

This directory contains database seeders for the ANAIRA application. These seeders automatically populate the MongoDB database with test data for development and testing purposes.

## Features

- Role-based user creation (User, Partner, Admin, Moderator)
- Cycle data generation
- Medication data generation
- Chat history generation with emotion detection
- Partner connections between users
- Community posts and interactions
- Tracker configurations

## Configuration

The seeder behavior can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DISABLE_SEEDING` | Set to `true` to disable automatic seeding | `false` |
| `CLEAR_EXISTING_DATA` | Set to `true` to clear existing data before seeding | `false` |
| `ENABLE_PRODUCTION_SEEDING` | Set to `true` to enable seeding in production (not recommended) | `false` |

## Seeded Data

### Users

The seeder creates users with different roles:

- **Regular Users**: Standard application users with cycle tracking, medication tracking, and chat functionality
- **Partner Users**: Users connected to regular users with shared data access
- **Admin Users**: Users with administrative privileges
- **Moderator Users**: Users with moderation privileges for communities

All seeded users have the default password: `Password123!`

### Cycles

For each user, the seeder creates multiple cycle records with:

- Cycle start and end dates
- Period length and cycle length
- Symptoms during the cycle
- Mood entries
- Temperature readings
- Cervical mucus observations
- Ovulation test results
- Intercourse records
- Notes

### Medications

For each user, the seeder creates medication records with:

- Medication name, dosage, and category
- Frequency and schedule
- Start and end dates
- Reminder settings
- Medication logs (taken/skipped)
- Side effects

### Chat Sessions

For each user, the seeder creates chat sessions with:

- Realistic conversation topics related to fertility
- User messages with detected emotions
- AI responses
- Context information (cycle day, fertility stage, etc.)

### Communities

The seeder creates community groups with:

- Different categories (IVF Warriors, PCOS Support, etc.)
- Members with different roles (admin, moderator, member)
- Posts and comments
- Likes and interactions

### Tracker Configurations

The seeder creates tracker configurations for:

- Cycle tracking
- IVF treatment tracking
- Medication tracking
- Custom trackers

## Usage

The seeders run automatically when the server starts in development mode. You can disable this behavior by setting `DISABLE_SEEDING=true` in your `.env` file.

To manually run the seeders:

```javascript
const { seedDatabase } = require('./seeders');

// Run all seeders
seedDatabase()
  .then(result => console.log('Seeding completed:', result))
  .catch(error => console.error('Seeding error:', error));
```

## Extending

To add new seeders:

1. Create a new seeder file in the `seeders` directory
2. Export a function that creates the data
3. Import and call the function from `index.js`

## Warning

The seeders will create a significant amount of test data. In production environments, seeding is disabled by default to prevent accidental data creation.
