# FertilityNest Frontend

This is the frontend application for FertilityNest, a comprehensive fertility support platform. Built with React and Vite, it provides a responsive and intuitive user interface for fertility tracking, AI chat support, partner connectivity, and community engagement.

## Features

- **User Authentication & Profiles**
  - Secure login/signup with JWT
  - Social login integration
  - Customizable user profiles

- **Cycle & Medication Tracker**
  - Interactive calendar for tracking cycles
  - Medication reminders and logging
  - Protocol-specific tracking (IVF/IUI/Natural/PCOS)

- **Anaira AI Chat Companion**
  - Empathetic AI chat support
  - Emotion detection and appropriate responses
  - Distress detection with emergency support

- **Partner Portal**
  - Partner connection via shared code
  - Shared calendar and notifications
  - Support tips based on cycle phase

- **Community Circles**
  - Moderated support groups
  - Anonymous posting options
  - Topic-specific discussions

- **Distress Button**
  - Emergency contact notification

## Tech Stack

- React.js with Vite
- Chakra UI for styling
- React Router for navigation
- Axios for API requests
- Socket.IO for real-time features
- FullCalendar for calendar integration

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
└── package.json        # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14+)
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
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_AI_ENGINE_URL=http://localhost:5001/api
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

2. Access the application at `http://localhost:5173`

### Building for Production

```
npm run build
```
or
```
yarn build
```

## Testing

```
npm run test
```
or
```
yarn test
```
