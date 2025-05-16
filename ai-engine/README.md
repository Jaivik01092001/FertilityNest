# FertilityNest AI Engine

This is the AI engine for FertilityNest, a comprehensive fertility support platform. Built with Python and Flask, it provides AI-powered chat capabilities, emotion detection, and distress monitoring for the platform.

## Features

- **AI Chat Companion (Anaira)**
  - Natural language processing
  - Context-aware responses
  - Fertility knowledge base integration
  - Personalized support

- **Emotion Detection**
  - Sentiment analysis
  - Emotional state recognition
  - Response adaptation based on user emotions
  - Empathetic conversation flow

- **Distress Monitoring**
  - Detection of user distress signals
  - Emergency response triggering
  - Escalation protocols
  - Safety monitoring

- **Knowledge Management**
  - Medical information verification
  - Up-to-date fertility research integration
  - Personalized recommendations
  - Evidence-based responses

## Tech Stack

- Python 3.8+
- Flask for API endpoints
- TensorFlow for emotion detection models
- Google Gemini API integration
- Pandas for data processing
- SQLite for local storage (optional)

## Project Structure

```
ai-engine/
├── api/                # API endpoints
├── models/             # ML models
│   ├── emotion/        # Emotion detection models
│   └── distress/       # Distress detection models
├── utils/              # Utility functions
├── data/               # Knowledge base data
├── app.py              # Flask app entry point
└── requirements.txt    # Python dependencies
```

## Getting Started

### Prerequisites
- Python 3.8+
- pip
- Google Gemini API key
- Virtual environment (recommended)

### Installation

1. Create and activate a virtual environment (recommended)
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5001
   BACKEND_URL=http://localhost:5000/api
   ```

### Running the Application

1. Start the Flask server
   ```
   python app.py
   ```
   or
   ```
   flask run --port=5001
   ```

2. The AI engine will be running at `http://localhost:5001`

## API Documentation

The API endpoints are organized into the following categories:

- `/api/chat` - AI chat functionality
- `/api/emotion` - Emotion detection
- `/api/distress` - Distress monitoring
- `/api/knowledge` - Knowledge base queries

For detailed API documentation, refer to the Swagger documentation (if available).

## Model Training

For information on training or fine-tuning the emotion detection models:

```
cd models/emotion
python train.py --data_path=../../data/emotion_dataset.csv
```

## Testing

```
pytest
```

## Deployment

For production deployment:

```
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```
