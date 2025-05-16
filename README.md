# FertilityNest

FertilityNest is a comprehensive fertility support platform designed to help users track their fertility journey, connect with partners, and access AI-powered support.

## Features

- **Cycle Tracking**
  - Track menstrual cycles, symptoms, and fertility windows
  - Record temperature, cervical mucus, and other fertility indicators
  - Visualize cycle data with intuitive charts

- **Medication Management**
  - Track fertility medications and supplements
  - Set reminders for medication doses
  - Monitor side effects and effectiveness

- **Anaira AI Chat Companion**
  - AI chat via Google Gemini API
  - Emotion detection and empathetic responses
  - Distress detection with emergency response
  - Users can connect their own Gemini API key

- **Partner Portal**
  - Partner connection via shared code/invite
  - Shared calendar and appointment notifications
  - Context-aware support tips based on cycle phase

- **Verified Community Circles**
  - Groups for IVF Warriors, PCOS Support, LGBTQ+, Single Moms by Choice, etc.
  - AI + manual moderation
  - Anonymous post support

- **Distress Button**
  - Emergency feature to notify selected contacts

## Tech Stack

### Frontend
- React.js (with Vite)
- Chakra UI for styling
- React Router for navigation
- Axios for API requests
- Socket.IO for real-time features
- FullCalendar for calendar integration

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time communication
- Nodemailer for email notifications

### AI Engine
- Python with Flask
- TensorFlow for emotion detection
- Google Gemini API integration

## Project Structure
```
fertilitynest/
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   └── package.json       # Frontend dependencies
│
├── backend/               # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── server.js          # Server entry point
│   └── package.json       # Backend dependencies
│
└── ai-engine/             # Python AI engine
    ├── api/               # API endpoints
    ├── models/            # ML models
    ├── utils/             # Utility functions
    ├── app.py             # Flask app
    └── requirements.txt   # Python dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Python 3.8+
- Google Gemini API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/fertilitynest.git
   cd fertilitynest
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies
   ```
   cd ../backend
   npm install
   ```

4. Install AI engine dependencies
   ```
   cd ../ai-engine
   pip install -r requirements.txt
   ```

5. Set up environment variables
   - Create `.env` file in the backend directory based on `.env.example`
   - Create `.env` file in the ai-engine directory with your Gemini API key

### Running the Application

1. Start the backend server
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm run dev
   ```

3. Start the AI engine
   ```
   cd ai-engine
   python app.py
   ```

## Using Your Own Gemini API Key

FertilityNest allows users to connect their own Google Gemini API key for enhanced privacy and control:

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Navigate to Settings > AI Settings in the FertilityNest app
3. Enter your API key in the provided field
4. Your conversations will now use your personal API key

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped build FertilityNest
- Special thanks to the open-source community for the amazing tools and libraries
