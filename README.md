# FertilityNest

FertilityNest is a comprehensive fertility support web application designed to provide users with tools for tracking their fertility journey, managing medications, connecting with partners, and accessing community support.

## Features

- **Authentication & Profiles**
  - JWT-based secure login/signup
  - Google/social login integration
  - User profiles storing fertility stage, journey type, and preferences
  - Password reset flow

- **Cycle & Medication Tracker**
  - FullCalendar integration for menstrual and fertility cycles
  - Logs for IVF/IUI/Natural/PCOS protocols
  - Medication reminders and logging system

- **Anaira AI Chat Companion**
  - AI chat via OpenAI API
  - Emotion detection and empathetic responses
  - Distress detection with emergency response

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
- OpenAI API integration

## Project Structure

```
/
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
├── backend/                # Node.js + Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── server.js           # Server entry point
│   └── package.json        # Backend dependencies
│
└── ai-engine/              # Python AI engine
    ├── api/                # API endpoints
    ├── models/             # ML models
    ├── utils/              # Utility functions
    ├── app.py              # Flask app
    └── requirements.txt    # Python dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Python 3.8+
- OpenAI API key

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
   - Create `.env` file in the ai-engine directory with your OpenAI API key

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

4. Access the application at `http://localhost:5173`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for the AI capabilities
- The fertility community for inspiration and guidance
