# ANAIRA Backend Scripts

This directory contains utility scripts for the ANAIRA application.

## Available Scripts

### Database Check and Seeding Script (`check-db.js`)

This script checks the status of the database and allows manual seeding.

#### Usage

```bash
# Check database status
npm run db:check

# Seed database (only if empty)
npm run db:seed

# Clear and reseed database
npm run db:reset
```

Or directly with Node:

```bash
# Check database status
node scripts/check-db.js

# Seed database
node scripts/check-db.js --seed

# Clear and seed database
node scripts/check-db.js --seed --clear

# Force seeding in production
node scripts/check-db.js --seed --force
```

#### Options

- `--seed`: Run the seeders
- `--clear`: Clear existing data before seeding
- `--force`: Force seeding even in production

#### Features

- Displays collection counts
- Shows user statistics by role
- Checks if database is empty
- Provides intelligent seeding (skips if data exists)
- Supports forced clearing and reseeding

## Adding New Scripts

To add a new script:

1. Create a new JavaScript file in the `scripts` directory
2. Add documentation at the top of the file
3. Add a corresponding npm script in `package.json`
4. Document the script in this README
