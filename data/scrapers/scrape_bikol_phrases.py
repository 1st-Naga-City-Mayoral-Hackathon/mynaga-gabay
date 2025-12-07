#!/usr/bin/env python3
"""
Bikol Language Phrases Scraper
Scrapes and consolidates Bikol/Bicolano phrases from multiple sources.

Sources:
- chillandtravel.com (49 practical phrases)
- omniglot.com (useful phrases)
- Curated medical/health phrases
"""

import json
import os
import re
import time
from typing import Any

import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent


def get_session() -> requests.Session:
    """Create session with fake user agent."""
    session = requests.Session()
    ua = UserAgent()
    session.headers.update({
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    })
    return session


def clean_text(text: str) -> str:
    """Clean extracted text."""
    if not text:
        return ""
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def get_curated_phrases() -> list[dict]:
    """
    Return curated Bikol phrases including health/medical context.
    These are manually curated for the MyNaga Gabay health assistant.
    """
    phrases = []
    
    # Greetings
    greetings = [
        {"bikol": "Kumusta ka?", "english": "How are you?", "category": "greetings"},
        {"bikol": "Maray na aldaw!", "english": "Good day!", "category": "greetings"},
        {"bikol": "Maray na aga!", "english": "Good morning!", "category": "greetings"},
        {"bikol": "Maray na hapon!", "english": "Good afternoon!", "category": "greetings"},
        {"bikol": "Maray na banggi!", "english": "Good evening!", "category": "greetings"},
        {"bikol": "Salamat po", "english": "Thank you", "category": "greetings"},
        {"bikol": "Tabi po", "english": "Please / Excuse me", "category": "greetings"},
        {"bikol": "Paaram!", "english": "Goodbye!", "category": "greetings"},
        {"bikol": "Mag iingat ka!", "english": "Take care!", "category": "greetings"},
        {"bikol": "Dios mabalos!", "english": "Thank you! (God reward you)", "category": "greetings"},
    ]
    phrases.extend(greetings)
    
    # Medical symptoms
    symptoms = [
        {"bikol": "Kulog nin payo", "english": "Headache", "category": "symptoms"},
        {"bikol": "Kalintura", "english": "Fever", "category": "symptoms"},
        {"bikol": "Sipon", "english": "Cold / Runny nose", "category": "symptoms"},
        {"bikol": "Ubo", "english": "Cough", "category": "symptoms"},
        {"bikol": "Kulog nin tulak", "english": "Stomach ache", "category": "symptoms"},
        {"bikol": "Pagduwal", "english": "Vomiting", "category": "symptoms"},
        {"bikol": "Kurso", "english": "Diarrhea", "category": "symptoms"},
        {"bikol": "Kulog nin likod", "english": "Back pain", "category": "symptoms"},
        {"bikol": "Kulog nin daghan", "english": "Chest pain", "category": "symptoms"},
        {"bikol": "Pagkapuod", "english": "Fatigue / Tiredness", "category": "symptoms"},
        {"bikol": "Lipong", "english": "Dizziness", "category": "symptoms"},
        {"bikol": "Hapdos", "english": "Pain / Hurt", "category": "symptoms"},
        {"bikol": "Hubog / Bangkag", "english": "Wound", "category": "symptoms"},
        {"bikol": "Paga", "english": "Swelling", "category": "symptoms"},
        {"bikol": "Hapulas", "english": "Rash", "category": "symptoms"},
        {"bikol": "Hingal", "english": "Difficulty breathing", "category": "symptoms"},
        {"bikol": "Suka", "english": "Vomit", "category": "symptoms"},
        {"bikol": "Mata ng pula", "english": "Red eyes / Sore eyes", "category": "symptoms"},
    ]
    phrases.extend(symptoms)
    
    # Medical facilities
    facilities = [
        {"bikol": "Ospital", "english": "Hospital", "category": "facilities"},
        {"bikol": "Botica", "english": "Pharmacy", "category": "facilities"},
        {"bikol": "Health center", "english": "Health center", "category": "facilities"},
        {"bikol": "Klinika", "english": "Clinic", "category": "facilities"},
        {"bikol": "Emergency room", "english": "Emergency room", "category": "facilities"},
    ]
    phrases.extend(facilities)
    
    # Medical personnel
    personnel = [
        {"bikol": "Doktor", "english": "Doctor", "category": "personnel"},
        {"bikol": "Nars", "english": "Nurse", "category": "personnel"},
        {"bikol": "Partera", "english": "Midwife", "category": "personnel"},
        {"bikol": "Barangay health worker", "english": "Barangay health worker", "category": "personnel"},
        {"bikol": "Parmasyutiko", "english": "Pharmacist", "category": "personnel"},
    ]
    phrases.extend(personnel)
    
    # Treatment & medicine
    treatment = [
        {"bikol": "Bulong", "english": "Medicine", "category": "treatment"},
        {"bikol": "Reseta", "english": "Prescription", "category": "treatment"},
        {"bikol": "Tableta", "english": "Tablet", "category": "treatment"},
        {"bikol": "Kapsul", "english": "Capsule", "category": "treatment"},
        {"bikol": "Syrup", "english": "Syrup", "category": "treatment"},
        {"bikol": "Iniksyon", "english": "Injection", "category": "treatment"},
        {"bikol": "Bakuna", "english": "Vaccine", "category": "treatment"},
        {"bikol": "Check-up", "english": "Check-up", "category": "treatment"},
        {"bikol": "BP reading", "english": "Blood pressure reading", "category": "treatment"},
    ]
    phrases.extend(treatment)
    
    # Common health questions
    questions = [
        {"bikol": "Saen an pinakahararaning ospital?", "english": "Where is the nearest hospital?", "category": "questions"},
        {"bikol": "Ano an namamatian mo?", "english": "What are you feeling?", "category": "questions"},
        {"bikol": "Sain an kulog?", "english": "Where does it hurt?", "category": "questions"},
        {"bikol": "Pira na ka aldaw na may kalintura ka?", "english": "How many days have you had a fever?", "category": "questions"},
        {"bikol": "May alerya ka sa bulong?", "english": "Do you have any drug allergies?", "category": "questions"},
        {"bikol": "Magkano an konsulta?", "english": "How much is the consultation?", "category": "questions"},
        {"bikol": "Kaipuhan ko nin reseta?", "english": "Do I need a prescription?", "category": "questions"},
        {"bikol": "Covered ba ini sa PhilHealth?", "english": "Is this covered by PhilHealth?", "category": "questions"},
        {"bikol": "Kaipuhan ko makahiling nin doktor?", "english": "Do I need to see a doctor?", "category": "questions"},
        {"bikol": "Arog kamo mabukas?", "english": "What time do you open?", "category": "questions"},
        {"bikol": "Ano an side effects kaini na bulong?", "english": "What are the side effects of this medicine?", "category": "questions"},
        {"bikol": "Pwede ko ini inumon kun bados ako?", "english": "Can I take this if I'm pregnant?", "category": "questions"},
        {"bikol": "May libre daw na bakuna?", "english": "Are there free vaccines?", "category": "questions"},
    ]
    phrases.extend(questions)
    
    # General useful phrases
    general = [
        {"bikol": "Tabang!", "english": "Help!", "category": "emergency"},
        {"bikol": "Emergency!", "english": "Emergency!", "category": "emergency"},
        {"bikol": "Apuron!", "english": "Hurry!", "category": "emergency"},
        {"bikol": "Iyo", "english": "Yes", "category": "general"},
        {"bikol": "Dai", "english": "No", "category": "general"},
        {"bikol": "Dai ko aram", "english": "I don't know", "category": "general"},
        {"bikol": "Dai ko nasasabutan", "english": "I don't understand", "category": "general"},
        {"bikol": "Nasasabutan ko", "english": "I understand", "category": "general"},
        {"bikol": "Patawarun mo ako", "english": "I'm sorry", "category": "general"},
        {"bikol": "Tabi", "english": "Please / Excuse me", "category": "general"},
        {"bikol": "Gurano ini?", "english": "How much is this?", "category": "general"},
        {"bikol": "Hain?", "english": "Where?", "category": "general"},
        {"bikol": "Ano man?", "english": "What?", "category": "general"},
        {"bikol": "Pano ako makaduman sa...?", "english": "How do I get to...?", "category": "general"},
    ]
    phrases.extend(general)
    
    # Numbers (for medical context)
    numbers = [
        {"bikol": "Saro", "english": "One (1)", "category": "numbers"},
        {"bikol": "Duwa", "english": "Two (2)", "category": "numbers"},
        {"bikol": "Tulo", "english": "Three (3)", "category": "numbers"},
        {"bikol": "Apat", "english": "Four (4)", "category": "numbers"},
        {"bikol": "Lima", "english": "Five (5)", "category": "numbers"},
        {"bikol": "Anom", "english": "Six (6)", "category": "numbers"},
        {"bikol": "Pito", "english": "Seven (7)", "category": "numbers"},
        {"bikol": "Walo", "english": "Eight (8)", "category": "numbers"},
        {"bikol": "Siyam", "english": "Nine (9)", "category": "numbers"},
        {"bikol": "Sampulo", "english": "Ten (10)", "category": "numbers"},
    ]
    phrases.extend(numbers)
    
    # Time expressions (medical context)
    time_expr = [
        {"bikol": "Ngonyan", "english": "Now", "category": "time"},
        {"bikol": "Kagab-i", "english": "Last night", "category": "time"},
        {"bikol": "Ngapit", "english": "Later / Soon", "category": "time"},
        {"bikol": "Aga", "english": "Morning", "category": "time"},
        {"bikol": "Hapon", "english": "Afternoon", "category": "time"},
        {"bikol": "Banggi", "english": "Evening / Night", "category": "time"},
        {"bikol": "Aldaw-aldaw", "english": "Every day", "category": "time"},
        {"bikol": "Pirang aldaw", "english": "How many days", "category": "time"},
        {"bikol": "Semana", "english": "Week", "category": "time"},
        {"bikol": "Bulan", "english": "Month", "category": "time"},
    ]
    phrases.extend(time_expr)
    
    return phrases


def scrape_chillandtravel(session: requests.Session) -> list[dict]:
    """
    Scrape Bicolano phrases from chillandtravel.com
    """
    url = "https://www.chillandtravel.com/bicolano-words-phrases/"
    phrases = []
    
    print(f"[WEB] Fetching: {url}")
    
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  [ERROR] Failed to fetch: {e}")
        return phrases
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all list items or paragraphs with phrase patterns
    content = soup.find('article') or soup.find('div', class_='entry-content') or soup.body
    
    if content:
        # Pattern: "Bikol phrase" = "English translation"
        text = content.get_text()
        
        # Match patterns like: "Bikol phrase" = "English meaning"
        pattern = r'"([^"]+)"\s*=\s*"([^"]+)"'
        matches = re.findall(pattern, text)
        
        for bikol, english in matches:
            bikol = clean_text(bikol)
            english = clean_text(english)
            
            if bikol and english and len(bikol) > 1:
                # Determine category from context
                category = "general"
                if any(word in english.lower() for word in ['hello', 'morning', 'evening', 'goodbye', 'welcome', 'how are']):
                    category = "greetings"
                elif any(word in english.lower() for word in ['where', 'how do i', 'lost', 'fare']):
                    category = "travel"
                elif any(word in english.lower() for word in ['eat', 'hungry', 'food', 'delicious', 'spicy']):
                    category = "food"
                elif any(word in english.lower() for word in ['how much', 'expensive', 'cheap', 'buy']):
                    category = "shopping"
                elif any(word in english.lower() for word in ['thank', 'sorry', 'please', 'yes', 'no', 'understand']):
                    category = "social"
                
                phrases.append({
                    "bikol": bikol,
                    "english": english,
                    "category": category,
                    "source": "chillandtravel.com"
                })
    
    print(f"[WEB] Found {len(phrases)} phrases")
    return phrases


def scrape_omniglot(session: requests.Session) -> list[dict]:
    """
    Scrape Bikol phrases from omniglot.com
    """
    url = "https://omniglot.com/language/phrases/bikol.htm"
    phrases = []
    
    print(f"[WEB] Fetching: {url}")
    
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  [ERROR] Failed to fetch: {e}")
        return phrases
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Omniglot uses tables for phrases
    tables = soup.find_all('table')
    
    for table in tables:
        rows = table.find_all('tr')
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                # Usually: English | Bikol | Pronunciation
                english = clean_text(cells[0].get_text())
                bikol = clean_text(cells[1].get_text())
                
                # Skip headers or empty rows
                if not bikol or not english or bikol.lower() == 'bikol' or english.lower() == 'english':
                    continue
                
                phrases.append({
                    "bikol": bikol,
                    "english": english,
                    "category": "general",
                    "source": "omniglot.com"
                })
    
    print(f"[WEB] Found {len(phrases)} phrases")
    return phrases


def deduplicate_phrases(phrases: list[dict]) -> list[dict]:
    """Remove duplicate phrases based on Bikol text."""
    seen = set()
    unique = []
    
    for phrase in phrases:
        key = phrase["bikol"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(phrase)
    
    return unique


def organize_by_category(phrases: list[dict]) -> dict:
    """Organize phrases by category."""
    organized = {}
    
    for phrase in phrases:
        category = phrase.get("category", "general")
        if category not in organized:
            organized[category] = []
        organized[category].append(phrase)
    
    return organized


def save_json(data: Any, filepath: str) -> None:
    """Save to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filepath}")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Bikol Language Phrases Scraper")
    print("=" * 60)
    
    session = get_session()
    all_phrases = []
    
    # Get curated phrases (health-focused)
    print("\n" + "-" * 40)
    print("CURATED HEALTH PHRASES")
    print("-" * 40)
    curated = get_curated_phrases()
    print(f"[CURATED] {len(curated)} phrases")
    all_phrases.extend(curated)
    
    # Scrape chillandtravel.com
    print("\n" + "-" * 40)
    print("SCRAPING CHILLANDTRAVEL.COM")
    print("-" * 40)
    chillandtravel = scrape_chillandtravel(session)
    for p in chillandtravel:
        p["source"] = "chillandtravel.com"
    all_phrases.extend(chillandtravel)
    
    time.sleep(0.5)
    
    # Scrape omniglot.com
    print("\n" + "-" * 40)
    print("SCRAPING OMNIGLOT.COM")
    print("-" * 40)
    omniglot = scrape_omniglot(session)
    for p in omniglot:
        p["source"] = "omniglot.com"
    all_phrases.extend(omniglot)
    
    # Deduplicate
    unique_phrases = deduplicate_phrases(all_phrases)
    print(f"\n[TOTAL] {len(unique_phrases)} unique phrases (from {len(all_phrases)} total)")
    
    # Organize by category
    organized = organize_by_category(unique_phrases)
    
    # Save outputs
    print("\n" + "-" * 40)
    print("SAVING OUTPUTS")
    print("-" * 40)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'output', 'bikol')
    kb_dir = os.path.join(script_dir, '..', 'knowledge-base', 'bikol-phrases')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Save full phrase list
    save_json({"phrases": unique_phrases, "total": len(unique_phrases)}, 
              os.path.join(output_dir, 'all_bikol_phrases.json'))
    
    # Save organized by category to knowledge base
    for category, phrases in organized.items():
        filename = f"{category.replace(' ', '-')}.json"
        save_json({
            "category": category,
            "phrases": phrases,
            "count": len(phrases),
            "note": "Central Bikol (Naga City dialect). Other Bikol dialects may vary."
        }, os.path.join(kb_dir, filename))
    
    # Summary
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    print(f"Total unique phrases: {len(unique_phrases)}")
    
    print("\n[BY CATEGORY]")
    for category, phrases in sorted(organized.items(), key=lambda x: -len(x[1])):
        print(f"  - {category}: {len(phrases)} phrases")


if __name__ == "__main__":
    main()
