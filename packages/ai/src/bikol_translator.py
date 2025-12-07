"""
Bikol Translation Utility
Provides translation functions between Bikol, Filipino, and English.
Uses the translation mappings from the Bikol corpus for health assistant.

Usage:
    from bikol_translator import BikolTranslator
    
    translator = BikolTranslator()
    
    # Translate Bikol to Filipino
    filipino = translator.bikol_to_filipino("Saen an ospital?")
    
    # Get Bikol equivalent of English
    bikol = translator.english_to_bikol("hospital")
    
    # Detect language
    lang = translator.detect_language("Maray na aga!")  # Returns "bikol"
"""

import json
import os
import re
from typing import Optional, Literal


class BikolTranslator:
    """Translator for Bikol ↔ Filipino ↔ English."""
    
    def __init__(self, mappings_path: Optional[str] = None):
        """
        Initialize translator with translation mappings.
        
        Args:
            mappings_path: Path to translation_mappings.json.
                          If None, uses default knowledge-base location.
        """
        if mappings_path is None:
            # Default path relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            mappings_path = os.path.join(
                base_dir, 'knowledge-base', 'bikol-phrases', 'translation_mappings.json'
            )
        
        self.mappings = self._load_mappings(mappings_path)
        
        # Common Bikol words for language detection
        self.bikol_markers = {
            'saen', 'haen', 'tabi', 'maray', 'aldaw', 'dai', 'iyo', 'ano',
            'siisay', 'nuarin', 'pano', 'tano', 'pira', 'siya', 'sinda',
            'kamo', 'kami', 'kita', 'ini', 'idto', 'kaipuhan', 'igwa',
            'yaon', 'mayo', 'bago', 'pagkatapos', 'asin', 'pero', 'kun',
            'ta', 'ngonyan', 'duman', 'digdi', 'mabalos', 'kumusta'
        }
        
        self.filipino_markers = {
            'saan', 'nasaan', 'mabuti', 'araw', 'hindi', 'oo', 'sino',
            'kailan', 'paano', 'bakit', 'ilan', 'sila', 'kayo', 'tayo',
            'ito', 'iyon', 'kailangan', 'mayroon', 'wala', 'bago',
            'pagkatapos', 'at', 'pero', 'kung', 'ngayon', 'doon', 'dito',
            'salamat', 'kamusta', 'gusto', 'pwede', 'dapat', 'po'
        }
    
    def _load_mappings(self, path: str) -> dict:
        """Load translation mappings from JSON file."""
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "bikol_to_filipino": {},
            "bikol_to_english": {},
            "filipino_to_bikol": {},
            "english_to_bikol": {}
        }
    
    def detect_language(self, text: str) -> Literal["bikol", "filipino", "english", "unknown"]:
        """
        Detect the language of input text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Detected language: "bikol", "filipino", "english", or "unknown"
        """
        if not text:
            return "unknown"
        
        words = set(re.findall(r'\b\w+\b', text.lower()))
        
        bikol_count = len(words & self.bikol_markers)
        filipino_count = len(words & self.filipino_markers)
        
        # Check against translation mappings
        bikol_dict_count = sum(1 for w in words if w in self.mappings.get("bikol_to_filipino", {}))
        filipino_dict_count = sum(1 for w in words if w in self.mappings.get("filipino_to_bikol", {}))
        
        bikol_score = bikol_count * 2 + bikol_dict_count
        filipino_score = filipino_count * 2 + filipino_dict_count
        
        # Check for English patterns
        english_markers = {'the', 'is', 'are', 'what', 'where', 'when', 'how', 'why',
                          'can', 'do', 'does', 'have', 'has', 'need', 'want', 'please'}
        english_count = len(words & english_markers)
        
        if english_count > max(bikol_score, filipino_score):
            return "english"
        elif bikol_score > filipino_score and bikol_score > 0:
            return "bikol"
        elif filipino_score > bikol_score and filipino_score > 0:
            return "filipino"
        
        # Default to Filipino if can't determine (most common case)
        return "unknown"
    
    def translate_word(self, word: str, direction: str) -> Optional[str]:
        """
        Translate a single word.
        
        Args:
            word: Word to translate
            direction: One of "bikol_to_filipino", "bikol_to_english", 
                      "filipino_to_bikol", "english_to_bikol"
                      
        Returns:
            Translated word or None if not found
        """
        mapping = self.mappings.get(direction, {})
        return mapping.get(word.lower().strip())
    
    def bikol_to_filipino(self, text: str) -> str:
        """
        Translate Bikol text to Filipino.
        Does word-by-word translation, keeping unknown words as-is.
        """
        mapping = self.mappings.get("bikol_to_filipino", {})
        words = re.findall(r'\b\w+\b|\W+', text)
        
        result = []
        for word in words:
            if word.strip() and word[0].isalnum():
                translated = mapping.get(word.lower())
                if translated:
                    # Preserve capitalization
                    if word[0].isupper():
                        translated = translated.capitalize()
                    result.append(translated)
                else:
                    result.append(word)
            else:
                result.append(word)
        
        return ''.join(result)
    
    def bikol_to_english(self, text: str) -> str:
        """
        Translate Bikol text to English.
        Does word-by-word translation, keeping unknown words as-is.
        """
        mapping = self.mappings.get("bikol_to_english", {})
        words = re.findall(r'\b\w+\b|\W+', text)
        
        result = []
        for word in words:
            if word.strip() and word[0].isalnum():
                translated = mapping.get(word.lower())
                if translated:
                    if word[0].isupper():
                        translated = translated.capitalize()
                    result.append(translated)
                else:
                    result.append(word)
            else:
                result.append(word)
        
        return ''.join(result)
    
    def english_to_bikol(self, text: str) -> str:
        """
        Translate English text to Bikol.
        """
        mapping = self.mappings.get("english_to_bikol", {})
        words = re.findall(r'\b\w+\b|\W+', text)
        
        result = []
        for word in words:
            if word.strip() and word[0].isalnum():
                translated = mapping.get(word.lower())
                if translated:
                    if word[0].isupper():
                        translated = translated.capitalize()
                    result.append(translated)
                else:
                    result.append(word)
            else:
                result.append(word)
        
        return ''.join(result)
    
    def filipino_to_bikol(self, text: str) -> str:
        """
        Translate Filipino text to Bikol.
        """
        mapping = self.mappings.get("filipino_to_bikol", {})
        words = re.findall(r'\b\w+\b|\W+', text)
        
        result = []
        for word in words:
            if word.strip() and word[0].isalnum():
                translated = mapping.get(word.lower())
                if translated:
                    if word[0].isupper():
                        translated = translated.capitalize()
                    result.append(translated)
                else:
                    result.append(word)
            else:
                result.append(word)
        
        return ''.join(result)
    
    def get_bikol_health_terms(self, english_term: str) -> Optional[str]:
        """
        Get Bikol equivalent for common English health terms.
        Useful for inserting Bikol terminology in responses.
        """
        health_terms = {
            # Symptoms
            "headache": "kulog nin payo",
            "fever": "kalintura",
            "cold": "sipon",
            "cough": "ubo",
            "stomachache": "kulog nin tulak",
            "diarrhea": "kurso",
            "vomiting": "suka",
            "dizziness": "lipong",
            "pain": "kulog",
            "swelling": "paga",
            # Facilities
            "hospital": "ospital",
            "pharmacy": "botica",
            "clinic": "klinika",
            "doctor": "doktor",
            "nurse": "nars",
            # Treatment
            "medicine": "bulong",
            "prescription": "reseta",
            "vaccine": "bakuna",
        }
        return health_terms.get(english_term.lower())
    
    def add_bikol_terms_to_response(self, english_response: str) -> str:
        """
        Enhance an English response with Bikol health terminology.
        Adds Bikol terms in parentheses after English terms.
        
        Example:
            "Take medicine for fever" -> "Take medicine (bulong) for fever (kalintura)"
        """
        result = english_response
        
        # Terms to enhance
        terms_to_add = [
            ("headache", "kulog nin payo"),
            ("fever", "kalintura"),
            ("cough", "ubo"),
            ("cold", "sipon"),
            ("stomachache", "kulog nin tulak"),
            ("diarrhea", "kurso"),
            ("hospital", "ospital"),
            ("pharmacy", "botica"),
            ("medicine", "bulong"),
            ("doctor", "doktor"),
        ]
        
        for english, bikol in terms_to_add:
            # Case-insensitive replacement, add Bikol in parentheses
            pattern = re.compile(rf'\b{english}\b(?!\s*\()', re.IGNORECASE)
            result = pattern.sub(f'{english} ({bikol})', result)
        
        return result


def main():
    """Test the translator."""
    print("=" * 60)
    print("Bikol Translator Test")
    print("=" * 60)
    
    translator = BikolTranslator()
    
    # Test language detection
    test_texts = [
        "Saen an ospital?",
        "Saan ang ospital?",
        "Where is the hospital?",
        "May kalintura ako",
        "Mayroon akong lagnat",
        "I have a fever",
    ]
    
    print("\n[LANGUAGE DETECTION]")
    for text in test_texts:
        lang = translator.detect_language(text)
        print(f"  '{text}' -> {lang}")
    
    # Test translations
    print("\n[BIKOL → FILIPINO]")
    bikol_texts = [
        "Saen an ospital?",
        "May kalintura ako asin kulog nin payo",
        "Magkano an bulong?",
    ]
    for text in bikol_texts:
        translated = translator.bikol_to_filipino(text)
        print(f"  '{text}' -> '{translated}'")
    
    print("\n[BIKOL → ENGLISH]")
    for text in bikol_texts:
        translated = translator.bikol_to_english(text)
        print(f"  '{text}' -> '{translated}'")
    
    print("\n[RESPONSE ENHANCEMENT]")
    english_response = "If you have fever and headache, take medicine and visit a doctor at the hospital."
    enhanced = translator.add_bikol_terms_to_response(english_response)
    print(f"  Original: {english_response}")
    print(f"  Enhanced: {enhanced}")


if __name__ == "__main__":
    main()
