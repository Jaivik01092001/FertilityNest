import re
import logging
import string
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class TextProcessor:
    """Utility class for processing and normalizing text"""
    
    def __init__(self):
        """Initialize text processor"""
        # Common fertility and medical abbreviations
        self.abbreviations = {
            'af': 'aunt flo (period)',
            'bbt': 'basal body temperature',
            'bd': 'baby dance (intercourse)',
            'bfn': 'big fat negative (negative pregnancy test)',
            'bfp': 'big fat positive (positive pregnancy test)',
            'cd': 'cycle day',
            'cm': 'cervical mucus',
            'dpo': 'days post ovulation',
            'ewcm': 'egg white cervical mucus',
            'fet': 'frozen embryo transfer',
            'fsh': 'follicle stimulating hormone',
            'hcg': 'human chorionic gonadotropin',
            'hsg': 'hysterosalpingogram',
            'icsi': 'intracytoplasmic sperm injection',
            'ivf': 'in vitro fertilization',
            'iui': 'intrauterine insemination',
            'lh': 'luteinizing hormone',
            'lp': 'luteal phase',
            'mc': 'miscarriage',
            'o': 'ovulation',
            'ohss': 'ovarian hyperstimulation syndrome',
            'opk': 'ovulation predictor kit',
            'pcos': 'polycystic ovary syndrome',
            'pg': 'pregnant',
            'pms': 'premenstrual syndrome',
            're': 'reproductive endocrinologist',
            'sa': 'semen analysis',
            'ttc': 'trying to conceive',
            'tww': 'two week wait'
        }
        
        # Common fertility-related medical terms
        self.medical_terms = [
            'ovulation', 'menstruation', 'follicle', 'embryo', 'implantation',
            'progesterone', 'estrogen', 'testosterone', 'endometrium', 'cervix',
            'uterus', 'ovary', 'fallopian', 'sperm', 'egg', 'zygote', 'blastocyst',
            'trophoblast', 'placenta', 'gestation', 'trimester', 'conception',
            'fertility', 'infertility', 'miscarriage', 'pregnancy', 'insemination'
        ]
    
    def preprocess(self, text: str) -> str:
        """Preprocess text for AI processing
        
        Args:
            text: Raw text input
            
        Returns:
            Preprocessed text
        """
        if not text:
            return ""
        
        # Expand common abbreviations
        expanded_text = self.expand_abbreviations(text)
        
        # Remove excessive punctuation
        cleaned_text = self.clean_punctuation(expanded_text)
        
        return cleaned_text
    
    def expand_abbreviations(self, text: str) -> str:
        """Expand common fertility and medical abbreviations
        
        Args:
            text: Text with possible abbreviations
            
        Returns:
            Text with expanded abbreviations
        """
        words = text.split()
        result = []
        
        for word in words:
            # Check if word is an abbreviation (case insensitive)
            word_lower = word.lower().strip(string.punctuation)
            if word_lower in self.abbreviations:
                # Add original word and expansion in parentheses
                expanded = self.abbreviations[word_lower]
                result.append(f"{word} ({expanded})")
            else:
                result.append(word)
        
        return ' '.join(result)
    
    def clean_punctuation(self, text: str) -> str:
        """Clean excessive punctuation while preserving meaning
        
        Args:
            text: Text to clean
            
        Returns:
            Cleaned text
        """
        # Replace multiple periods with single ellipsis
        text = re.sub(r'\.{3,}', '...', text)
        
        # Replace multiple exclamation or question marks with max 2
        text = re.sub(r'!{2,}', '!!', text)
        text = re.sub(r'\?{2,}', '??', text)
        
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of extracted keywords
        """
        text_lower = text.lower()
        keywords = []
        
        # Extract medical terms
        for term in self.medical_terms:
            if term in text_lower:
                keywords.append(term)
        
        # Extract abbreviations
        for abbr in self.abbreviations:
            if re.search(r'\b' + re.escape(abbr) + r'\b', text_lower):
                keywords.append(abbr)
        
        return keywords
    
    def summarize(self, text: str, max_length: int = 100) -> str:
        """Create a short summary of text
        
        Args:
            text: Text to summarize
            max_length: Maximum length of summary
            
        Returns:
            Summarized text
        """
        if len(text) <= max_length:
            return text
        
        # Simple summarization by truncating and adding ellipsis
        return text[:max_length].rsplit(' ', 1)[0] + '...'
