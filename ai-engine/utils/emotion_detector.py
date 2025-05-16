import re
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

class EmotionDetector:
    """Utility class for detecting emotions in text"""
    
    def __init__(self):
        """Initialize emotion detector with emotion keywords"""
        # Emotion keywords dictionary
        self.emotion_keywords = {
            'happy': [
                'happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good',
                'delighted', 'pleased', 'glad', 'thrilled', 'ecstatic', 'content',
                'cheerful', 'joyful', 'elated', 'overjoyed', 'blissful', 'grateful'
            ],
            'sad': [
                'sad', 'unhappy', 'depressed', 'down', 'blue', 'upset', 'cry',
                'miserable', 'heartbroken', 'gloomy', 'somber', 'melancholy',
                'tearful', 'sorrowful', 'grief', 'mourning', 'dejected'
            ],
            'angry': [
                'angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated',
                'outraged', 'enraged', 'infuriated', 'livid', 'seething', 'hostile',
                'resentful', 'bitter', 'indignant', 'irate', 'fuming'
            ],
            'anxious': [
                'anxious', 'worried', 'nervous', 'stress', 'afraid', 'fear',
                'uneasy', 'apprehensive', 'concerned', 'distressed', 'panicked',
                'frightened', 'terrified', 'scared', 'dread', 'alarmed', 'tense'
            ],
            'distressed': [
                'help', 'emergency', 'pain', 'hurt', 'terrible', 'unbearable',
                'suicidal', 'hopeless', 'desperate', 'overwhelmed', 'suffering',
                'agony', 'anguish', 'torment', 'torture', 'trauma', 'crisis'
            ],
            'hopeful': [
                'hope', 'optimistic', 'looking forward', 'positive', 'better',
                'promising', 'encouraged', 'reassured', 'confident', 'expectant',
                'anticipating', 'eager', 'enthusiastic', 'motivated', 'inspired'
            ]
        }
        
        # Distress keywords with severity levels
        self.distress_keywords = {
            # High severity (level 8-10)
            'suicidal': 10,
            'kill myself': 10,
            'end my life': 10,
            'want to die': 9,
            'can\'t go on': 9,
            'unbearable pain': 9,
            'emergency': 8,
            'severe pain': 8,
            'extreme pain': 8,
            
            # Medium severity (level 5-7)
            'hopeless': 7,
            'desperate': 7,
            'suffering': 7,
            'overwhelmed': 6,
            'crisis': 6,
            'trauma': 6,
            'terrible pain': 6,
            'agony': 5,
            'anguish': 5,
            
            # Low severity (level 2-4)
            'distressed': 4,
            'hurting': 4,
            'painful': 3,
            'upset': 3,
            'worried': 2,
            'anxious': 2
        }
    
    def detect_emotion(self, text: str) -> str:
        """Detect primary emotion in text
        
        Args:
            text: Text to analyze
            
        Returns:
            Detected emotion (happy, sad, angry, anxious, distressed, hopeful, or neutral)
        """
        if not text:
            return 'neutral'
        
        text_lower = text.lower()
        emotion_scores = {}
        
        # Count occurrences of emotion keywords
        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            for keyword in keywords:
                # Count occurrences of keyword
                count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_lower))
                score += count
            
            emotion_scores[emotion] = score
        
        # Get emotion with highest score
        max_score = max(emotion_scores.values())
        if max_score == 0:
            return 'neutral'
        
        # Get all emotions with max score
        max_emotions = [e for e, s in emotion_scores.items() if s == max_score]
        
        # Prioritize distressed if it's one of the max emotions
        if 'distressed' in max_emotions:
            return 'distressed'
        
        # Return first max emotion
        return max_emotions[0]
    
    def detect_distress_level(self, text: str) -> int:
        """Detect distress level in text on a scale of 0-10
        
        Args:
            text: Text to analyze
            
        Returns:
            Distress level (0-10)
        """
        if not text:
            return 0
        
        text_lower = text.lower()
        max_level = 0
        
        # Check for distress keywords
        for keyword, level in self.distress_keywords.items():
            if keyword in text_lower:
                max_level = max(max_level, level)
        
        return max_level
    
    def detect_emotion_and_distress(self, text: str) -> Tuple[str, int]:
        """Detect both emotion and distress level
        
        Args:
            text: Text to analyze
            
        Returns:
            Tuple of (emotion, distress_level)
        """
        emotion = self.detect_emotion(text)
        distress_level = self.detect_distress_level(text)
        
        return emotion, distress_level
