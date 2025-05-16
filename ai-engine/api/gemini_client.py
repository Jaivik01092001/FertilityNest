import os
import logging
import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini client
        
        Args:
            api_key: Gemini API key (defaults to environment variable)
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
        
        # Default model for chat
        self.chat_model = "gemini-1.5-pro"
        
    def get_chat_response(
        self, 
        system_message: str, 
        user_message: str, 
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """Get response from Gemini chat API
        
        Args:
            system_message: System message for context
            user_message: User message
            chat_history: Previous chat messages
            
        Returns:
            AI response text
        """
        try:
            # Initialize the model
            model = genai.GenerativeModel(self.chat_model)
            
            # Start a chat session
            chat = model.start_chat(history=[])
            
            # Add system message as the first message
            if system_message:
                # In Gemini, we need to add the system message as part of the first user message
                # or use it to initialize the chat
                chat = model.start_chat(history=[
                    {"role": "user", "parts": [system_message]},
                    {"role": "model", "parts": ["I understand. I'll act as Anaira, an empathetic AI companion for FertilityNest."]}
                ])
            
            # Add chat history if provided
            if chat_history:
                for msg in chat_history:
                    role = "user" if msg["role"] == "user" else "model"
                    chat.history.append({"role": role, "parts": [msg["content"]]})
            
            # Send the user message and get response
            response = chat.send_message(user_message)
            
            return response.text
        
        except Exception as e:
            logger.error(f"Error getting chat response: {str(e)}")
            # Return fallback response
            return "I apologize, but I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment?"
    
    def get_completion(self, prompt: str, max_tokens: int = 500) -> str:
        """Get response from Gemini completion API
        
        Args:
            prompt: Text prompt
            max_tokens: Maximum tokens in response
            
        Returns:
            AI completion text
        """
        try:
            # Initialize the model
            model = genai.GenerativeModel(self.chat_model)
            
            # Generate content with the prompt
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                    top_p=1.0
                )
            )
            
            return response.text
        
        except Exception as e:
            logger.error(f"Error getting completion: {str(e)}")
            # Return fallback response
            return "I apologize, but I'm having trouble generating a response right now. Please try again later."
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using Gemini
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment analysis
        """
        try:
            prompt = f"""Analyze the sentiment and emotion in the following text. 
            Return a JSON object with keys for 'sentiment' (positive, negative, or neutral), 
            'emotion' (happy, sad, angry, anxious, distressed, hopeful, or neutral), 
            and 'distressLevel' (0-10 scale).
            
            Text: "{text}"
            
            JSON:"""
            
            response = self.get_completion(prompt)
            
            # Parse JSON response
            try:
                # Clean the response to ensure it's valid JSON
                # Sometimes the model might include markdown formatting or extra text
                json_str = response.strip()
                if json_str.startswith("```json"):
                    json_str = json_str[7:]
                if json_str.endswith("```"):
                    json_str = json_str[:-3]
                
                json_str = json_str.strip()
                result = json.loads(json_str)
                return result
            except json.JSONDecodeError:
                logger.error(f"Error parsing sentiment analysis JSON: {response}")
                return {
                    "sentiment": "neutral",
                    "emotion": "neutral",
                    "distressLevel": 0
                }
        
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return {
                "sentiment": "neutral",
                "emotion": "neutral",
                "distressLevel": 0
            }
