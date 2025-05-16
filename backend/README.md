# FertilityNest Backend

This is the backend server for FertilityNest, a comprehensive fertility support platform. Built with Node.js and Express, it provides RESTful APIs, real-time communication, and database integration for the frontend application.

## Features

- **User Authentication & Management**
  - JWT-based authentication
  - Password reset and account recovery
  - User profile management
  - Role-based access control

- **Cycle & Medication Tracking**
  - Cycle data storage and retrieval
  - Medication scheduling and reminders
  - Protocol-specific data models

- **AI Integration**
  - Communication with AI engine
  - User message history management
  - Distress detection forwarding

- **Partner Connectivity**
  - Partner invitation and connection
  - Shared data management
  - Notification system

- **Community Management**
  - Group creation and moderation
  - Post and comment management
  - Content filtering and reporting

- **Real-time Communication**
  - Socket.IO integration
  - Live updates and notifications
  - Chat functionality

## Tech Stack

- Node.js + Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time communication
- Nodemailer for email notifications
- Multer for file uploads

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── services/           # Business logic
├── utils/              # Utility functions
├── server.js           # Server entry point
└── package.json        # Backend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fertilitynest
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   AI_ENGINE_URL=http://localhost:5001/api
   CLIENT_URL=http://localhost:5173
   ```

### Running the Application

1. Start the development server
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

2. The server will be running at `http://localhost:5000`

### API Documentation

The API endpoints are organized into the following categories:

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/cycles` - Cycle tracking
- `/api/medications` - Medication management
- `/api/partners` - Partner connectivity
- `/api/communities` - Community features
- `/api/chat` - AI chat integration

For detailed API documentation, refer to the Postman collection or Swagger documentation (if available).

## Testing

```
npm run test
```
or
```
yarn test
```

## Deployment

For production deployment:

```
npm run start
```
or
```
yarn start
```
