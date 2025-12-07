#!/usr/bin/env python3
"""
TGP (The Generics Pharmacy) Medicine Scraper
Scrapes generic medicine names and prices from TGP Philippines website.

This scraper extracts:
- Generic name
- Brand/Product name
- Dosage form and strength
- Price (when available)
- Category (OTC/Prescription)
"""

import json
import re
import time
from typing import Any
from urllib.parse import urljoin

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
    """Remove extra whitespace and clean text."""
    if not text:
        return ""
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_medicine_name(name: str) -> dict[str, str]:
    """
    Parse medicine name to extract generic name, brand, dosage, and form.
    Example: "BENEDEX Amoxicillin 500mg Capsule" -> 
             {brand: "BENEDEX", generic: "Amoxicillin", strength: "500mg", form: "Capsule"}
    """
    result = {
        "brand_name": "",
        "generic_name": "",
        "strength": "",
        "dosage_form": "",
        "full_name": clean_text(name)
    }
    
    # Remove Rx: prefix if present
    name = re.sub(r'^Rx:\s*', '', name, flags=re.IGNORECASE)
    name = clean_text(name)
    
    # Common dosage forms
    forms = [
        'Tablet', 'Tab', 'Capsule', 'Cap', 'Syrup', 'Syr', 'Suspension', 'Susp',
        'Cream', 'Ointment', 'Gel', 'Solution', 'Sol', 'Drops', 'Injection', 'Inj',
        'Powder', 'Softgel', 'Film-coated', 'FCT', 'Oral', 'Topical', 'Inhaler',
        'PowSusp', 'Powder for Suspension'
    ]
    
    # Extract strength (e.g., 500mg, 10mg/ml, 250mg/60ml)
    strength_pattern = r'(\d+(?:\.\d+)?(?:mg|g|ml|mcg|iu|%|mg/ml|mg/\d+ml)?(?:/\d+(?:mg|ml)?)?)'
    strength_matches = re.findall(strength_pattern, name, re.IGNORECASE)
    if strength_matches:
        result["strength"] = ' '.join(strength_matches[:2])  # Take up to 2 strength values
    
    # Extract dosage form
    for form in forms:
        if re.search(rf'\b{form}\b', name, re.IGNORECASE):
            result["dosage_form"] = form
            break
    
    # Try to identify brand vs generic
    # Pattern: BRAND Generic Strength Form
    # TGP uses UPPERCASE for brand names
    words = name.split()
    if words:
        # Check if first word is all caps (likely brand)
        if words[0].isupper() and len(words[0]) > 2:
            result["brand_name"] = words[0]
            # Look for generic name (usually second word if not a strength)
            remaining = ' '.join(words[1:])
            # Extract the next word that's not a strength or form
            for word in words[1:]:
                if not re.match(r'^\d', word) and word.lower() not in [f.lower() for f in forms]:
                    if word not in ['HCl', 'HCI', 'DiCl', 'Trihyd', 'FC', 'FCT']:
                        result["generic_name"] = word
                        break
        else:
            # First word might be TGP brand prefix
            if words[0] == 'TGP' and len(words) > 1:
                result["brand_name"] = "TGP"
                result["generic_name"] = words[1] if len(words) > 1 else ""
            else:
                result["generic_name"] = words[0]
    
    return result


def extract_price(text: str) -> float | None:
    """Extract price from text."""
    # Pattern for Philippine Peso prices
    patterns = [
        r'₱\s*([\d,]+(?:\.\d{2})?)',
        r'PHP?\s*([\d,]+(?:\.\d{2})?)',
        r'P\s*([\d,]+(?:\.\d{2})?)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price_str = match.group(1).replace(',', '')
            try:
                return float(price_str)
            except ValueError:
                continue
    return None


def scrape_tgp_category_page(session: requests.Session, url: str, category: str) -> list[dict]:
    """Scrape a single category page for medicine listings."""
    medicines = []
    
    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  [ERROR] Failed to fetch {url}: {e}")
        return medicines
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Look for product listings
    # TGP uses various selectors for products
    product_selectors = [
        '.product-miniature',
        '.product-item',
        '.product-card',
        'article.product',
        '.product',
        'li[data-id-product]',
    ]
    
    products = []
    for selector in product_selectors:
        products = soup.select(selector)
        if products:
            break
    
    # If no products found via selectors, look for product links
    if not products:
        # Look for links that match TGP product URL pattern
        product_links = soup.find_all('a', href=re.compile(r'/(prescription-medicines|over-the-counter-medicine|vitamins-supplements)/'))
        
        seen_urls = set()
        for link in product_links:
            href = link.get('href', '')
            if href in seen_urls:
                continue
            seen_urls.add(href)
            
            name = clean_text(link.get_text())
            if not name or len(name) < 3:
                continue
            
            parsed = parse_medicine_name(name)
            
            # Try to find price near this link
            parent = link.find_parent(['div', 'li', 'article'])
            price = None
            if parent:
                price_elem = parent.find(class_=re.compile(r'price', re.I))
                if price_elem:
                    price = extract_price(price_elem.get_text())
            
            medicine = {
                "name": parsed["full_name"],
                "brand_name": parsed["brand_name"],
                "generic_name": parsed["generic_name"],
                "strength": parsed["strength"],
                "dosage_form": parsed["dosage_form"],
                "category": category,
                "price_php": price,
                "source_url": urljoin(url, href) if not href.startswith('http') else href
            }
            medicines.append(medicine)
    
    else:
        # Process found products
        for product in products:
            name_elem = product.find(class_=re.compile(r'product.*name|title', re.I)) or product.find(['h2', 'h3', 'h4', 'a'])
            if not name_elem:
                continue
            
            name = clean_text(name_elem.get_text())
            parsed = parse_medicine_name(name)
            
            # Find price
            price_elem = product.find(class_=re.compile(r'price', re.I))
            price = extract_price(price_elem.get_text()) if price_elem else None
            
            # Find link
            link = product.find('a', href=True)
            source_url = urljoin(url, link['href']) if link else url
            
            medicine = {
                "name": parsed["full_name"],
                "brand_name": parsed["brand_name"],
                "generic_name": parsed["generic_name"],
                "strength": parsed["strength"],
                "dosage_form": parsed["dosage_form"],
                "category": category,
                "price_php": price,
                "source_url": source_url
            }
            medicines.append(medicine)
    
    return medicines


def scrape_tgp_main_page(session: requests.Session) -> list[dict]:
    """
    Scrape medicine data from TGP main page which lists featured products.
    """
    medicines = []
    base_url = "https://tgp.com.ph"
    
    print("[TGP] Fetching main page...")
    
    try:
        response = session.get(base_url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[TGP] Error fetching main page: {e}")
        return medicines
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all product links
    product_patterns = [
        r'/prescription-medicines/',
        r'/over-the-counter-medicine/',
        r'/vitamins-supplements/',
    ]
    
    category_map = {
        'prescription-medicines': 'Prescription',
        'over-the-counter-medicine': 'OTC',
        'vitamins-supplements': 'Vitamins & Supplements'
    }
    
    seen_urls = set()
    all_links = soup.find_all('a', href=True)
    
    for link in all_links:
        href = link.get('href', '')
        
        # Skip if already processed
        if href in seen_urls:
            continue
        
        # Check if it's a product link
        category = None
        for pattern, cat_name in category_map.items():
            if pattern in href:
                category = cat_name
                break
        
        if not category:
            continue
        
        seen_urls.add(href)
        
        # Get product name from link text
        name = clean_text(link.get_text())
        if not name or len(name) < 3:
            continue
        
        # Skip navigation links
        if name.lower() in ['view all', 'see more', 'shop now', 'buy now']:
            continue
        
        parsed = parse_medicine_name(name)
        
        # Construct full URL
        full_url = urljoin(base_url, href) if not href.startswith('http') else href
        
        medicine = {
            "name": parsed["full_name"],
            "brand_name": parsed["brand_name"],
            "generic_name": parsed["generic_name"],
            "strength": parsed["strength"],
            "dosage_form": parsed["dosage_form"],
            "category": category,
            "price_php": None,  # Would need to visit individual pages for prices
            "source_url": full_url
        }
        medicines.append(medicine)
    
    print(f"[TGP] Found {len(medicines)} medicines from main page")
    return medicines


def scrape_tgp_store(session: requests.Session) -> list[dict]:
    """
    Scrape medicine data from TGP online store.
    """
    medicines = []
    store_url = "https://store.tgp.com.ph"
    
    print("[TGP] Fetching store page...")
    
    try:
        response = session.get(store_url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[TGP] Error fetching store: {e}")
        return medicines
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # The store page has product cards with prices
    product_cards = soup.find_all('div', class_=re.compile(r'product', re.I))
    
    for card in product_cards:
        name_elem = card.find(['h2', 'h3', 'h4', 'a', 'span'], class_=re.compile(r'name|title', re.I))
        if not name_elem:
            # Try finding any text content
            name_elem = card.find('a')
        
        if not name_elem:
            continue
        
        name = clean_text(name_elem.get_text())
        if not name or len(name) < 5:
            continue
        
        parsed = parse_medicine_name(name)
        
        # Find price
        price_elem = card.find(class_=re.compile(r'price', re.I))
        price = extract_price(price_elem.get_text()) if price_elem else None
        
        # Determine category from URL or class
        link = card.find('a', href=True)
        href = link.get('href', '') if link else ''
        
        category = 'General'
        if 'prescription' in href.lower():
            category = 'Prescription'
        elif 'over-the-counter' in href.lower() or 'otc' in href.lower():
            category = 'OTC'
        elif 'vitamin' in href.lower() or 'supplement' in href.lower():
            category = 'Vitamins & Supplements'
        
        medicine = {
            "name": parsed["full_name"],
            "brand_name": parsed["brand_name"],
            "generic_name": parsed["generic_name"],
            "strength": parsed["strength"],
            "dosage_form": parsed["dosage_form"],
            "category": category,
            "price_php": price,
            "source_url": urljoin(store_url, href) if href else store_url
        }
        medicines.append(medicine)
    
    print(f"[TGP] Found {len(medicines)} medicines from store")
    return medicines


def deduplicate_medicines(medicines: list[dict]) -> list[dict]:
    """Remove duplicate medicines based on name."""
    seen = set()
    unique = []
    
    for med in medicines:
        key = med["name"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(med)
    
    return unique


def save_json(data: list[dict], filename: str) -> None:
    """Save data to JSON file with pretty formatting."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filename}")


def main():
    """Main entry point for the TGP scraper."""
    print("=" * 60)
    print("TGP (The Generics Pharmacy) Medicine Scraper")
    print("=" * 60)
    
    # Create session with fake user agent
    session = get_session()
    print(f"[INIT] Using User-Agent: {session.headers['User-Agent'][:50]}...")
    
    all_medicines = []
    
    # Scrape main website
    print("\n" + "-" * 40)
    print("Scraping tgp.com.ph main site")
    print("-" * 40)
    main_medicines = scrape_tgp_main_page(session)
    all_medicines.extend(main_medicines)
    
    time.sleep(1)  # Rate limiting
    
    # Scrape online store
    print("\n" + "-" * 40)
    print("Scraping store.tgp.com.ph")
    print("-" * 40)
    store_medicines = scrape_tgp_store(session)
    all_medicines.extend(store_medicines)
    
    # Deduplicate
    unique_medicines = deduplicate_medicines(all_medicines)
    print(f"\n[TOTAL] {len(unique_medicines)} unique medicines (from {len(all_medicines)} total)")
    
    # Save output
    print("\n" + "-" * 40)
    print("SAVING OUTPUT")
    print("-" * 40)
    
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'output', 'medicines')
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, 'tgp_medicines.json')
    save_json(unique_medicines, output_file)
    
    # Also create a summary by category
    categories = {}
    for med in unique_medicines:
        cat = med["category"]
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    print("\n[SUMMARY BY CATEGORY]")
    for cat, count in sorted(categories.items()):
        print(f"  - {cat}: {count} medicines")
    
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    
    return unique_medicines


if __name__ == "__main__":
    main()
