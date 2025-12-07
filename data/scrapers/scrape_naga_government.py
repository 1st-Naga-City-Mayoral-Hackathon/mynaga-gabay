#!/usr/bin/env python3
"""
Naga City Government Services Scraper
Parses the Citizens Charter PDF and scrapes naga.gov.ph for government offices and services.

Sources:
- Naga Citizens Charter 2022 (5th Edition) PDF
- naga.gov.ph website
"""

import json
import os
import re
import time
from typing import Any

import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

# Try PDF library
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("[WARN] pdfplumber not installed. Run: pip install pdfplumber")


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


def parse_citizens_charter(pdf_path: str) -> list[dict]:
    """
    Parse the Naga Citizens Charter PDF to extract government services.
    """
    if not HAS_PDFPLUMBER or not os.path.exists(pdf_path):
        print(f"[ERROR] Cannot parse PDF: {pdf_path}")
        return []
    
    services = []
    current_office = None
    current_service = None
    
    # Known office patterns from the PDF
    office_patterns = [
        r'^CITY\s+[A-Z]+\s+OFFICE',
        r'^OFFICE\s+OF\s+THE',
        r'^BICOL\s+[A-Z]+',
        r'^CITY\s+[A-Z]+(?:\s+[A-Z]+){0,3}\s+OFFICE',
        r'^[A-Z]+\s+CITY\s+[A-Z]+',
        r'^NAGA\s+CITY\s+[A-Z]+',
        r'^METRO\s+NAGA',
    ]
    
    # Service patterns
    service_patterns = [
        r'(?:Availing|Accessing|Processing|Issuance|Application|Request|Payment|Filing)',
        r'(?:Registration|Certification|Renewal|Transfer|Cancellation)',
    ]
    
    print(f"[PDF] Parsing Citizens Charter: {pdf_path}")
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"[PDF] Total pages: {len(pdf.pages)}")
        
        # Process Table of Contents first (pages 2-8 typically)
        toc_services = []
        
        for page_num in range(1, min(10, len(pdf.pages))):
            page = pdf.pages[page_num]
            text = page.extract_text() or ""
            lines = text.split('\n')
            
            for line in lines:
                line = clean_text(line)
                
                # Check for office headers (ALL CAPS)
                if line.isupper() and len(line) > 10 and 'OFFICE' in line or 'CITY' in line:
                    for pattern in office_patterns:
                        if re.match(pattern, line):
                            current_office = line.title()
                            break
                
                # Check for service entries (mixed case with page numbers)
                if current_office and re.search(r'\d+$', line):
                    # Remove page number
                    service_name = re.sub(r'\s*\d+$', '', line)
                    if len(service_name) > 10:
                        toc_services.append({
                            "office": current_office,
                            "service": service_name,
                            "page": page_num + 1
                        })
        
        print(f"[PDF] Found {len(toc_services)} services in TOC")
        
        # Group services by office
        offices = {}
        for svc in toc_services:
            office = svc["office"]
            if office not in offices:
                offices[office] = {
                    "name": office,
                    "services": [],
                    "type": "government_office"
                }
            offices[office]["services"].append(svc["service"])
        
        # Convert to list
        services = list(offices.values())
    
    return services


def scrape_naga_gov_offices(session: requests.Session) -> list[dict]:
    """
    Scrape government office information from naga.gov.ph
    """
    offices = []
    
    # Known pages with office info
    urls = [
        "https://www2.naga.gov.ph/the-city-hall/executive-offices/",
        "https://www2.naga.gov.ph/the-city-hall/city-administrator/",
        "https://www2.naga.gov.ph/contact-us/",
    ]
    
    print("[WEB] Scraping naga.gov.ph for office information...")
    
    for url in urls:
        try:
            print(f"  - Fetching: {url}")
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for office listings
            content = soup.find('div', class_='entry-content') or soup.find('article') or soup.body
            
            if content:
                # Find headers that might be office names
                headers = content.find_all(['h2', 'h3', 'h4', 'strong'])
                
                for header in headers:
                    text = clean_text(header.get_text())
                    
                    # Check if it looks like an office name
                    if 'office' in text.lower() or 'city' in text.lower():
                        # Try to find associated phone/contact info
                        parent = header.find_parent(['div', 'section', 'article'])
                        phone = None
                        email = None
                        
                        if parent:
                            # Look for phone patterns
                            parent_text = parent.get_text()
                            phone_match = re.search(r'(?:Local|Tel|Phone)?[:\s]*(\d{3,4})', parent_text)
                            if phone_match:
                                phone = f"Local: {phone_match.group(1)}"
                            
                            # Look for email
                            email_match = re.search(r'[\w\.-]+@[\w\.-]+', parent_text)
                            if email_match:
                                email = email_match.group(0)
                        
                        offices.append({
                            "name": text,
                            "type": "government_office",
                            "phone": phone or "",
                            "email": email or "",
                            "source_url": url
                        })
            
            time.sleep(0.5)
            
        except requests.RequestException as e:
            print(f"  [ERROR] Failed to fetch {url}: {e}")
    
    return offices


def get_known_offices() -> list[dict]:
    """
    Return list of known Naga City government offices with contact info.
    Based on research and Citizens Charter.
    """
    return [
        {
            "id": "gov-001",
            "name": "City Mayor's Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 1010",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": ["Executive functions", "Public complaints", "Policy making"],
            "source": "Official"
        },
        {
            "id": "gov-002",
            "name": "City Civil Registry Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 1090",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Birth Certificate",
                "Marriage Certificate",
                "Death Certificate",
                "CENOMAR",
                "Late Registration"
            ],
            "source": "Official"
        },
        {
            "id": "gov-003",
            "name": "City Treasurer's Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 1030",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Business Permit Payment",
                "Real Property Tax Payment",
                "Community Tax Certificate (Cedula)",
                "Tax Clearance"
            ],
            "source": "Official"
        },
        {
            "id": "gov-004",
            "name": "City Assessor's Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 1070",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Tax Declaration",
                "Property Assessment",
                "Ownership Transfer",
                "Property Records Certification"
            ],
            "source": "Official"
        },
        {
            "id": "gov-005",
            "name": "City Health Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 3270",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Health Certificate",
                "Sanitary Permit",
                "Immunization",
                "Prenatal Checkup",
                "TB DOTS"
            ],
            "source": "Official"
        },
        {
            "id": "gov-006",
            "name": "City Social Welfare and Development Office (CSWDO)",
            "type": "government_office",
            "address": "Social Development Center, City Hall Complex, Naga City",
            "phone": "(054) 205-2980 local 3040",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Social Case Study Report",
                "Senior Citizen ID",
                "PWD ID",
                "Solo Parent ID",
                "Financial Assistance",
                "Burial Assistance"
            ],
            "source": "Official"
        },
        {
            "id": "gov-007",
            "name": "City Disaster Risk Reduction Management Office (CDRRMO)",
            "type": "government_office",
            "address": "Social Development Center, City Hall Complex, Naga City",
            "phone": "(054) 205-2980 local 3060",
            "email": "cdrrmo@naga.gov.ph",
            "hours": "24/7",
            "services": [
                "Disaster Response",
                "Emergency Hotline",
                "Evacuation Assistance",
                "Relief Operations"
            ],
            "source": "Official"
        },
        {
            "id": "gov-008",
            "name": "City Environment and Natural Resources Office (CENRO)",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 1140",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Environmental Clearance",
                "Tree Cutting Permit",
                "Waste Management"
            ],
            "source": "Official"
        },
        {
            "id": "gov-009",
            "name": "City Engineer's Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 1060",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Building Permit",
                "Occupancy Permit",
                "Fencing Permit",
                "Demolition Permit"
            ],
            "source": "Official"
        },
        {
            "id": "gov-010",
            "name": "City Planning and Development Office",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980 local 2080",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Zoning Clearance",
                "Locational Clearance",
                "Development Permits"
            ],
            "source": "Official"
        },
        {
            "id": "gov-011",
            "name": "Business Permits and Licensing Office (BPLO)",
            "type": "government_office",
            "address": "City Hall Complex, J. Miranda Ave, Naga City",
            "phone": "(054) 205-2980",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "New Business Permit",
                "Business Permit Renewal",
                "Business Closure",
                "Mayor's Permit"
            ],
            "source": "Official"
        },
        {
            "id": "gov-012",
            "name": "PhilHealth Naga City",
            "type": "government_office",
            "address": "2nd Floor, City Hall Annex, Naga City",
            "phone": "(054) 472-8888",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "PhilHealth Registration",
                "Contribution Payment",
                "Claims Processing",
                "Member Data Update"
            ],
            "source": "Official"
        },
        {
            "id": "gov-013",
            "name": "SSS Naga Branch",
            "type": "government_office",
            "address": "Panganiban Drive, Naga City",
            "phone": "(054) 472-3000",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "SSS Registration",
                "Contribution Payment",
                "Loan Application",
                "Benefits Claims"
            ],
            "source": "Official"
        },
        {
            "id": "gov-014",
            "name": "Pag-IBIG Fund Naga",
            "type": "government_office",
            "address": "Naga City",
            "phone": "",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "Pag-IBIG Registration",
                "Housing Loan",
                "Provident Benefits",
                "MP2 Savings"
            ],
            "source": "Official"
        },
        {
            "id": "gov-015",
            "name": "PSA Naga City (Philippine Statistics Authority)",
            "type": "government_office",
            "address": "Naga City",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": [
                "PSA Birth Certificate",
                "PSA Marriage Certificate",
                "PSA Death Certificate",
                "CENOMAR",
                "PSA Correction of Entry"
            ],
            "source": "Official"
        },
    ]


def merge_government_data(pdf_services: list, scraped_offices: list, known_offices: list) -> list[dict]:
    """Merge all government data sources."""
    
    merged = []
    seen_names = set()
    
    # Add known offices first (most complete)
    for office in known_offices:
        merged.append(office)
        seen_names.add(office["name"].lower())
    
    # Add PDF-extracted services to existing offices or create new entries
    for svc in pdf_services:
        name = svc.get("name", "").lower()
        if name not in seen_names:
            office_id = f"gov-{len(merged)+1:03d}"
            merged.append({
                "id": office_id,
                "name": svc.get("name", ""),
                "type": "government_office",
                "services": svc.get("services", []),
                "source": "Citizens Charter PDF"
            })
            seen_names.add(name)
    
    # Add scraped offices
    for office in scraped_offices:
        name = office.get("name", "").lower()
        if name not in seen_names and len(name) > 5:
            office_id = f"web-{len(merged)+1:03d}"
            merged.append({
                "id": office_id,
                "name": office.get("name", ""),
                "type": "government_office",
                "phone": office.get("phone", ""),
                "email": office.get("email", ""),
                "source": "naga.gov.ph"
            })
            seen_names.add(name)
    
    return merged


def save_json(data: Any, filepath: str) -> None:
    """Save to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filepath}")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Naga City Government Services Scraper")
    print("=" * 60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Parse Citizens Charter PDF
    print("\n" + "-" * 40)
    print("PARSING CITIZENS CHARTER PDF")
    print("-" * 40)
    
    pdf_path = os.path.join(script_dir, '..', 'knowledge-base', 'government-services', 
                            'Naga-Citizens-Charter-2022-5th-Edition.pdf')
    pdf_services = parse_citizens_charter(pdf_path)
    print(f"[RESULT] Extracted {len(pdf_services)} offices from PDF")
    
    # Scrape naga.gov.ph
    print("\n" + "-" * 40)
    print("SCRAPING NAGA.GOV.PH")
    print("-" * 40)
    
    session = get_session()
    scraped_offices = scrape_naga_gov_offices(session)
    print(f"[RESULT] Scraped {len(scraped_offices)} offices from website")
    
    # Get known offices (curated data)
    known_offices = get_known_offices()
    print(f"[INFO] Known offices: {len(known_offices)}")
    
    # Merge all data
    print("\n" + "-" * 40)
    print("MERGING DATA")
    print("-" * 40)
    
    merged = merge_government_data(pdf_services, scraped_offices, known_offices)
    print(f"[RESULT] Total government offices: {len(merged)}")
    
    # Save outputs
    print("\n" + "-" * 40)
    print("SAVING OUTPUTS")
    print("-" * 40)
    
    output_dir = os.path.join(script_dir, '..', 'output', 'government')
    os.makedirs(output_dir, exist_ok=True)
    
    # Save full data
    save_json({"offices": merged}, os.path.join(output_dir, 'naga_government_services.json'))
    
    # Also save to knowledge base
    kb_dir = os.path.join(script_dir, '..', 'knowledge-base', 'government-services')
    save_json({"offices": merged}, os.path.join(kb_dir, 'naga-government-offices.json'))
    
    # Summary
    print("\n" + "=" * 60)
    print("SCRAPING COMPLETE")
    print("=" * 60)
    print(f"Total offices: {len(merged)}")
    
    # Count services
    total_services = sum(len(o.get("services", [])) for o in merged)
    print(f"Total services documented: {total_services}")


if __name__ == "__main__":
    main()
