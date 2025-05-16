import os
import logging
import openai
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class OpenAIClient:
    """Client for interacting with OpenAI API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize OpenAI client
        
        Args:
            api_key: OpenAI API key (defaults to environment variable)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        openai.api_key = self.api_key
    
    def get_chat_response(
        self, 
        system_message: str, 
        user_message: str, 
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """Get response from OpenAI chat completion API
        
        Args:
            system_message: System message for context
            user_message: User message
            chat_history: Previous chat messages
            
        Returns:
            AI response text
        """
        try:
            messages = [{"role": "system", "content": system_message}]
            
            # Add chat history if provided
            if chat_history:
                messages.extend(chat_history)
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"Error getting chat response: {str(e)}")
            # Return fallback response
            return "I apologize, but I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment?"
    
    def get_completion(self, prompt: str, max_tokens: int = 500) -> str:
        """Get response from OpenAI completion API
        
        Args:
            prompt: Text prompt
            max_tokens: Maximum tokens in response
            
        Returns:
            AI completion text
        """
        try:
            response = openai.Completion.create(
                model="text-davinci-003",
                prompt=prompt,
                temperature=0.7,
                max_tokens=max_tokens,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            return response.choices[0].text.strip()
        
        except Exception as e:
            logger.error(f"Error getting completion: {str(e)}")
            # Return fallback response
            return "I apologize, but I'm having trouble generating a response right now. Please try again later."
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using OpenAI
        
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
            import json
            try:
                result = json.loads(response)
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
