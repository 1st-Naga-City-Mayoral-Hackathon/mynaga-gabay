#!/usr/bin/env python3
"""
One-Shot Web Scraper for Naga Health RAG Pipeline
Scrapes:
1. Bicol Medical Center (BMC) Psychiatry Schedule
2. Naga City Emergency Hotlines

Outputs clean JSON files for vector database ingestion.
"""

import json
import re
import time
from typing import Any

import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent


def get_session() -> requests.Session:
    """Create a session with fake user agent to avoid blocking."""
    session = requests.Session()
    ua = UserAgent()
    session.headers.update({
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    })
    return session


def clean_text(text: str) -> str:
    """Remove extra whitespace, newlines, and clean text."""
    if not text:
        return ""
    # Replace \r\n and multiple spaces
    text = re.sub(r'[\r\n]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def scrape_bmc_psychiatry(session: requests.Session) -> list[dict[str, Any]]:
    """
    Task 1: Scrape Bicol Medical Center Psychiatry Schedule
    Target: Clinical services for Adult, Child, and Forensic Psychiatry
    """
    url = "https://bmc.doh.gov.ph/patient-care/clinical-departments/psychiatry/clinical-services"
    results = []
    
    print(f"[BMC] Fetching: {url}")
    
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[BMC] Error fetching page: {e}")
        # Return fallback data structure if page is blocked
        return [
            {
                "category": "BMC Psychiatry - Adult",
                "content": "Unable to fetch live data. Please visit the BMC website directly for current schedule information.",
                "source_url": url,
                "status": "fetch_error"
            },
            {
                "category": "BMC Psychiatry - Child",
                "content": "Unable to fetch live data. Please visit the BMC website directly for current schedule information.",
                "source_url": url,
                "status": "fetch_error"
            },
            {
                "category": "BMC Psychiatry - Forensic Evaluation",
                "content": "Unable to fetch live data. Please visit the BMC website directly for current schedule information.",
                "source_url": url,
                "status": "fetch_error"
            }
        ]
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Try to find the main content area
    content_div = soup.find('div', class_='item-page')
    if not content_div:
        content_div = soup.find('article') or soup.find('main') or soup.find('div', class_='content')
    
    if not content_div:
        content_div = soup.body
    
    # Categories to extract
    categories = {
        "Adult Psychiatry": [],
        "Child Psychiatry": [],
        "Forensic Evaluation": []
    }
    
    # Strategy 1: Look for headers and following content
    all_text = content_div.get_text(separator='\n') if content_div else soup.get_text(separator='\n')
    
    # Parse the text looking for schedule patterns
    lines = all_text.split('\n')
    current_category = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if this line is a category header
        line_lower = line.lower()
        if 'adult psychiatry' in line_lower:
            if current_category and current_content:
                categories[current_category] = current_content
            current_category = "Adult Psychiatry"
            current_content = []
        elif 'child psychiatry' in line_lower:
            if current_category and current_content:
                categories[current_category] = current_content
            current_category = "Child Psychiatry"
            current_content = []
        elif 'forensic' in line_lower and ('evaluation' in line_lower or 'psychiatry' in line_lower):
            if current_category and current_content:
                categories[current_category] = current_content
            current_category = "Forensic Evaluation"
            current_content = []
        elif current_category:
            # Look for schedule-related content
            if any(kw in line_lower for kw in ['schedule', 'monday', 'tuesday', 'wednesday', 
                                                 'thursday', 'friday', 'saturday', 'sunday',
                                                 'am', 'pm', ':00', 'appointment']):
                current_content.append(line)
            elif re.search(r'\d+:\d+', line):  # Time pattern
                current_content.append(line)
            elif len(current_content) < 5 and len(line) > 10:  # First few lines after header
                current_content.append(line)
    
    # Don't forget the last category
    if current_category and current_content:
        categories[current_category] = current_content
    
    # Strategy 2: Look for table data if available
    tables = (content_div or soup).find_all('table')
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                header = clean_text(cells[0].get_text())
                content = clean_text(cells[1].get_text())
                
                header_lower = header.lower()
                if 'adult' in header_lower:
                    categories["Adult Psychiatry"].append(content)
                elif 'child' in header_lower:
                    categories["Child Psychiatry"].append(content)
                elif 'forensic' in header_lower:
                    categories["Forensic Evaluation"].append(content)
    
    # Build results
    for category, content_list in categories.items():
        content = clean_text(' '.join(content_list)) if content_list else "Schedule information not found on page"
        results.append({
            "category": category,
            "content": content,
            "source_url": url
        })
    
    print(f"[BMC] Extracted {len([r for r in results if 'not found' not in r['content']])} categories with content")
    return results


def scrape_naga_hotlines(session: requests.Session) -> list[dict[str, Any]]:
    """
    Task 2: Scrape Naga City Emergency Hotlines
    Extract: Central Command Center, Police, Fire Protection, Hospitals
    """
    url = "https://www2.naga.gov.ph/emergency-hotline/"
    results = []
    
    print(f"[NAGA] Fetching: {url}")
    
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[NAGA] Error fetching page: {e}")
        return [{
            "category": "Naga Emergency Hotlines",
            "content": "Unable to fetch live data. Please visit the Naga City website directly.",
            "source_url": url,
            "status": "fetch_error"
        }]
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Target the main content area
    content_div = soup.find('div', class_='entry-content')
    if not content_div:
        content_div = soup.find('article') or soup.find('main') or soup.find('div', class_='content')
    if not content_div:
        content_div = soup.body
    
    # Phone number patterns
    phone_patterns = [
        r'0\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}',  # 09XX-XXX-XXXX or 0XXX-XXX-XXXX
        r'\(0?54\)\s*\d{3}[-\s]?\d{4}',         # (054) XXX-XXXX
        r'\(\d{2,3}\)[-\s]?\d{3}[-\s]?\d{4}',   # (XX) XXX-XXXX
        r'\+63\s?\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}',  # +63 format
        r'\d{3}[-\s]?\d{4}',                     # Local: XXX-XXXX
        r'911',                                   # Emergency number
    ]
    combined_pattern = '|'.join(f'({p})' for p in phone_patterns)
    
    # Categories to extract
    target_sections = ["Central Command Center", "Police", "Fire Protection", "Hospitals"]
    section_data: dict[str, list[dict]] = {s: [] for s in target_sections}
    
    # Strategy 1: Find sections by headers
    headers = content_div.find_all(['h2', 'h3', 'h4', 'h5'])
    
    current_section = None
    for header in headers:
        header_text = clean_text(header.get_text())
        header_lower = header_text.lower()
        
        # Map header to target section
        matched_section = None
        if 'central command' in header_lower or 'command center' in header_lower:
            matched_section = "Central Command Center"
        elif 'police' in header_lower:
            matched_section = "Police"
        elif 'fire' in header_lower:
            matched_section = "Fire Protection"
        elif 'hospital' in header_lower:
            matched_section = "Hospitals"
        
        if matched_section:
            current_section = matched_section
            
            # Get content until next header
            content_elements = []
            sibling = header.find_next_sibling()
            while sibling and sibling.name not in ['h2', 'h3', 'h4', 'h5']:
                if sibling.name in ['p', 'div', 'ul', 'ol', 'table', 'address']:
                    text = clean_text(sibling.get_text())
                    if text:
                        content_elements.append(text)
                        # Extract phone numbers
                        phones = re.findall(combined_pattern, text)
                        for phone_match in phones:
                            phone = next((p for p in phone_match if p), None)
                            if phone:
                                section_data[current_section].append({
                                    "text": text,
                                    "phone": phone.strip()
                                })
                sibling = sibling.find_next_sibling()
    
    # Strategy 2: Parse all text with regex to find phone-label associations
    all_elements = content_div.find_all(['p', 'div', 'li', 'td', 'address', 'span'])
    
    for element in all_elements:
        text = clean_text(element.get_text())
        if not text or len(text) < 5:
            continue
        
        # Find phones in this text
        phones = re.findall(combined_pattern, text)
        if phones:
            # Determine which section this belongs to
            text_lower = text.lower()
            section = None
            
            if 'command center' in text_lower or 'cdrrmo' in text_lower:
                section = "Central Command Center"
            elif 'police' in text_lower or 'pnp' in text_lower:
                section = "Police"
            elif 'fire' in text_lower or 'bfp' in text_lower:
                section = "Fire Protection"
            elif 'hospital' in text_lower or 'medical' in text_lower or 'clinic' in text_lower:
                section = "Hospitals"
            
            if section:
                for phone_match in phones:
                    phone = next((p for p in phone_match if p), None)
                    if phone:
                        # Check if we already have this entry
                        existing = [d for d in section_data[section] if d.get('phone') == phone.strip()]
                        if not existing:
                            section_data[section].append({
                                "text": text[:200],  # Truncate long text
                                "phone": phone.strip()
                            })
    
    # Build final results
    for section in target_sections:
        entries = section_data[section]
        if entries:
            # Deduplicate by phone
            seen_phones = set()
            unique_entries = []
            for entry in entries:
                if entry['phone'] not in seen_phones:
                    seen_phones.add(entry['phone'])
                    unique_entries.append(entry)
            
            # Format content
            content_parts = []
            for entry in unique_entries[:10]:  # Limit to 10 entries per section
                label = entry['text'].split(entry['phone'])[0].strip()
                if len(label) > 100:
                    label = label[-100:]  # Take last 100 chars as label
                content_parts.append(f"{entry['phone']}")
            
            content = "; ".join(content_parts)
        else:
            content = "No phone numbers found for this section"
        
        results.append({
            "category": section,
            "content": content,
            "source_url": url
        })
    
    # Also extract raw consolidated hotline data
    raw_text = clean_text(content_div.get_text()) if content_div else ""
    all_phones = re.findall(combined_pattern, raw_text)
    unique_phones = list(set(
        next((p for p in match if p), None) 
        for match in all_phones 
        if any(match)
    ))
    
    if unique_phones:
        results.append({
            "category": "All Emergency Numbers (Raw)",
            "content": "; ".join(filter(None, unique_phones[:20])),
            "source_url": url
        })
    
    print(f"[NAGA] Extracted {len(results)} categories")
    return results


def save_json(data: list[dict], filename: str) -> None:
    """Save data to JSON file with pretty formatting."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filename}")


def main():
    """Main entry point for the scraper."""
    print("=" * 60)
    print("Naga Health RAG Scraper - One-Shot Execution")
    print("=" * 60)
    
    # Create session with fake user agent
    session = get_session()
    print(f"[INIT] Using User-Agent: {session.headers['User-Agent'][:50]}...")
    
    # Task 1: BMC Psychiatry
    print("\n" + "-" * 40)
    print("TASK 1: BMC Psychiatry Schedule")
    print("-" * 40)
    bmc_data = scrape_bmc_psychiatry(session)
    
    # Small delay between requests
    time.sleep(1)
    
    # Task 2: Naga Hotlines
    print("\n" + "-" * 40)
    print("TASK 2: Naga City Emergency Hotlines")
    print("-" * 40)
    naga_data = scrape_naga_hotlines(session)
    
    # Save outputs
    print("\n" + "-" * 40)
    print("SAVING OUTPUTS")
    print("-" * 40)
    
    # Get the script's directory to resolve relative paths
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_base = os.path.join(script_dir, '..', 'output')
    
    save_json(bmc_data, os.path.join(output_base, 'health', 'bmc_psych_schedule.json'))
    save_json(naga_data, os.path.join(output_base, 'emergency', 'naga_hotlines.json'))
    
    # Summary
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    print(f"  - bmc_psych_schedule.json: {len(bmc_data)} entries")
    print(f"  - naga_hotlines.json: {len(naga_data)} entries")
    
    return bmc_data, naga_data


if __name__ == "__main__":
    main()
