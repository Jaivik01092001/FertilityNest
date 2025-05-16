import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import tensorflow as tf
import numpy as np
from utils.emotion_detector import EmotionDetector
from utils.text_processor import TextProcessor
from api.gemini_client import GeminiClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Gemini client
ai_client = GeminiClient(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize emotion detector
emotion_detector = EmotionDetector()

# Initialize text processor
text_processor = TextProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'FertilityNest AI Engine'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint for processing user messages and generating AI responses"""
    try:
        data = request.json

        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400

        user_message = data['message']
        context = data.get('context', {})
        chat_history = data.get('history', [])

        # Detect emotion in user message
        emotion = emotion_detector.detect_emotion(user_message)
        distress_level = emotion_detector.detect_distress_level(user_message)

        # Process user message
        processed_message = text_processor.preprocess(user_message)

        # Prepare context for Gemini
        system_message = f"""You are Anaira, an empathetic AI companion for FertilityNest, a fertility support app.
        The user is on a {context.get('userJourneyType', 'fertility')} journey and is currently in the {context.get('fertilityStage', 'unknown')} stage.
        {f"They are on day {context.get('cycleDay')} of their cycle." if context.get('cycleDay') else ''}
        {f"They recently experienced these symptoms: {', '.join(context.get('recentSymptoms'))}." if context.get('recentSymptoms') else ''}
        {f"They are taking these medications: {', '.join(context.get('recentMedications'))}." if context.get('recentMedications') else ''}

        Be compassionate, informative, and supportive. Provide evidence-based information when possible, but clarify you're not a medical professional.
        If the user seems distressed, offer support and suggest they speak with a healthcare provider."""

        # Format chat history for Gemini
        formatted_history = []
        for msg in chat_history:
            role = 'user' if msg['sender'] == 'user' else 'assistant'
            formatted_history.append({
                'role': role,
                'content': msg['content']
            })

        # Get AI response
        ai_response = ai_client.get_chat_response(
            system_message=system_message,
            user_message=processed_message,
            chat_history=formatted_history
        )

        # Prepare response
        response = {
            'success': True,
            'response': ai_response,
            'emotion': emotion,
            'distressLevel': distress_level,
            'distressDetected': distress_level >= 7
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """Analyze emotion in text"""
    try:
        data = request.json

        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400

        text = data['text']

        # Detect emotion
        emotion = emotion_detector.detect_emotion(text)
        distress_level = emotion_detector.detect_distress_level(text)

        return jsonify({
            'success': True,
            'emotion': emotion,
            'distressLevel': distress_level,
            'distressDetected': distress_level >= 7
        })

    except Exception as e:
        logger.error(f"Error in analyze-emotion endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-insights', methods=['POST'])
def generate_insights():
    """Generate insights from user data"""
    try:
        data = request.json

        if not data:
            return jsonify({
                'success': False,
                'error': 'Data is required'
            }), 400

        cycles = data.get('cycles', [])
        symptoms = data.get('symptoms', [])
        medications = data.get('medications', [])

        # Generate insights prompt
        prompt = f"""Based on the following user data, provide helpful insights and patterns:

        Cycle Information: {json.dumps(cycles)}
        Symptoms: {json.dumps(symptoms)}
        Medications: {json.dumps(medications)}

        Please analyze this data and provide:
        1. Any patterns or correlations between symptoms and cycle phases
        2. Potential effects of medications on symptoms or cycle
        3. Suggestions for tracking additional data points that might be helpful
        4. General insights that might help the user better understand their fertility journey
        """

        # Get insights from Gemini
        insights = ai_client.get_completion(prompt)

        return jsonify({
            'success': True,
            'insights': insights
        })

    except Exception as e:
        logger.error(f"Error in generate-insights endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true')
