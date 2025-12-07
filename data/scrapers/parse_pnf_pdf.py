#!/usr/bin/env python3
"""
Philippine National Formulary (PNF) PDF Parser
Extracts medicine data from the PhilHealth Essential Medicines List PDF.

This parser handles:
- PhilHealth PNF Essential Medicines List PDF
- Annex documents with benefit/payment schedules
- Any DOH medicine-related PDFs

Dependencies: pip install pypdf2 pdfplumber tabula-py
"""

import json
import os
import re
from typing import Any

# Try multiple PDF libraries
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("[WARN] pdfplumber not installed. Run: pip install pdfplumber")

try:
    from PyPDF2 import PdfReader
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False
    print("[WARN] PyPDF2 not installed. Run: pip install pypdf2")


def clean_text(text: str) -> str:
    """Clean extracted text."""
    if not text:
        return ""
    text = re.sub(r'[\r\n]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_with_pdfplumber(pdf_path: str) -> list[dict]:
    """
    Extract text and tables using pdfplumber (more accurate for tables).
    """
    if not HAS_PDFPLUMBER:
        return []
    
    medicines = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"[PDF] Processing {len(pdf.pages)} pages...")
        
        for page_num, page in enumerate(pdf.pages):
            # Extract tables if present
            tables = page.extract_tables()
            
            for table in tables:
                if not table or len(table) < 2:
                    continue
                
                # Try to identify medicine table by headers
                headers = [str(cell).lower() if cell else '' for cell in table[0]]
                
                # Look for common medicine table headers
                has_medicine_headers = any(
                    h in headers for h in 
                    ['drug', 'medicine', 'generic', 'name', 'dosage', 'strength', 'form']
                )
                
                if has_medicine_headers or len(table) > 5:
                    for row in table[1:]:
                        if not row or all(not cell for cell in row):
                            continue
                        
                        # Extract first non-empty cell as medicine name
                        name = None
                        strength = None
                        form = None
                        
                        for i, cell in enumerate(row):
                            cell_text = clean_text(str(cell)) if cell else ""
                            if not name and cell_text and len(cell_text) > 2:
                                # Check if it looks like a medicine name
                                if not re.match(r'^[\d\.]+$', cell_text):
                                    name = cell_text
                            elif name:
                                # Look for strength/dosage patterns
                                if re.search(r'\d+\s*(?:mg|g|ml|mcg|iu)', cell_text, re.I):
                                    strength = cell_text
                                elif cell_text.lower() in ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment']:
                                    form = cell_text
                        
                        if name:
                            medicines.append({
                                "name": name,
                                "strength": strength or "",
                                "dosage_form": form or "",
                                "source_page": page_num + 1
                            })
            
            # Also extract text for medicines that might not be in tables
            text = page.extract_text() or ""
            
            # Pattern for medicine entries (common in PNF)
            # Example: "Acetaminophen 500 mg Tablet"
            medicine_pattern = r'([A-Z][a-zA-Z\s\-]+)\s+(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|iu|%)(?:/\d+\s*(?:mg|ml))?)\s+([A-Za-z\s]+(?:Tablet|Capsule|Syrup|Solution|Suspension|Injection|Cream|Ointment|Gel))'
            
            matches = re.findall(medicine_pattern, text)
            for match in matches:
                name, strength, form = match
                medicines.append({
                    "name": clean_text(name),
                    "strength": clean_text(strength),
                    "dosage_form": clean_text(form),
                    "source_page": page_num + 1
                })
    
    return medicines


def extract_with_pypdf2(pdf_path: str) -> list[dict]:
    """
    Extract text using PyPDF2 (basic text extraction).
    """
    if not HAS_PYPDF2:
        return []
    
    medicines = []
    
    reader = PdfReader(pdf_path)
    print(f"[PDF] Processing {len(reader.pages)} pages...")
    
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        
        if not text:
            continue
        
        # Look for medicine entries
        lines = text.split('\n')
        
        for line in lines:
            line = clean_text(line)
            
            if not line or len(line) < 5:
                continue
            
            # Skip headers and non-medicine lines
            if any(skip in line.lower() for skip in ['page', 'table', 'contents', 'index', 'annex', 'chapter']):
                continue
            
            # Pattern for medicine entries
            # Matches lines that start with a drug name and contain dosage
            if re.search(r'\d+\s*(?:mg|g|ml|mcg|iu)', line, re.I):
                # Extract components
                name_match = re.match(r'^([A-Za-z][A-Za-z\s\-\(\)]+?)(?=\s+\d)', line)
                strength_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|iu|%)(?:/\d+\s*(?:mg|ml)?)?)', line, re.I)
                form_match = re.search(r'(Tablet|Capsule|Syrup|Solution|Suspension|Injection|Cream|Ointment|Gel|Drops|Inhaler|Powder)', line, re.I)
                
                if name_match:
                    medicines.append({
                        "name": clean_text(name_match.group(1)),
                        "strength": clean_text(strength_match.group(1)) if strength_match else "",
                        "dosage_form": form_match.group(1) if form_match else "",
                        "source_page": page_num + 1
                    })
    
    return medicines


def parse_philhealth_annex(pdf_path: str) -> list[dict]:
    """
    Parse PhilHealth Annex documents (benefit payment schedules).
    These have a different structure - more about coverage than medicine lists.
    """
    data = []
    
    if HAS_PDFPLUMBER:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"[PDF] Processing PhilHealth Annex ({len(pdf.pages)} pages)...")
            
            current_section = "General"
            
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                
                # Extract section headers
                section_match = re.search(r'(?:^|\n)(\d+\.\s+[A-Z][A-Za-z\s]+)', text)
                if section_match:
                    current_section = clean_text(section_match.group(1))
                
                # Extract key information
                lines = text.split('\n')
                for line in lines:
                    line = clean_text(line)
                    
                    # Look for PHP amounts
                    if 'PHP' in line or '₱' in line:
                        data.append({
                            "category": current_section,
                            "content": line,
                            "source_page": page_num + 1,
                            "type": "benefit_info"
                        })
                    
                    # Look for percentage or rate info
                    elif re.search(r'\d+%', line):
                        data.append({
                            "category": current_section,
                            "content": line,
                            "source_page": page_num + 1,
                            "type": "rate_info"
                        })
    
    return data


def deduplicate_medicines(medicines: list[dict]) -> list[dict]:
    """Remove duplicate medicine entries."""
    seen = set()
    unique = []
    
    for med in medicines:
        key = (med["name"].lower(), med.get("strength", "").lower())
        if key not in seen:
            seen.add(key)
            unique.append(med)
    
    return unique


def save_json(data: list[dict], filename: str) -> None:
    """Save data to JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filename}")


def process_pdf(pdf_path: str, output_dir: str) -> dict:
    """
    Process a PDF file and extract medicine/healthcare data.
    """
    if not os.path.exists(pdf_path):
        print(f"[ERROR] File not found: {pdf_path}")
        return {"error": "File not found"}
    
    filename = os.path.basename(pdf_path)
    print(f"\n{'=' * 60}")
    print(f"Processing: {filename}")
    print("=" * 60)
    
    # Determine document type
    filename_lower = filename.lower()
    
    if 'annex' in filename_lower or 'benefit' in filename_lower or 'payment' in filename_lower:
        # PhilHealth Annex document
        data = parse_philhealth_annex(pdf_path)
        output_file = os.path.join(output_dir, 'philhealth_benefits.json')
        doc_type = "PhilHealth Benefits"
    else:
        # Try as medicine list
        medicines = []
        
        if HAS_PDFPLUMBER:
            medicines = extract_with_pdfplumber(pdf_path)
        elif HAS_PYPDF2:
            medicines = extract_with_pypdf2(pdf_path)
        else:
            print("[ERROR] No PDF library available. Install pdfplumber or pypdf2")
            return {"error": "No PDF library"}
        
        # Deduplicate
        medicines = deduplicate_medicines(medicines)
        data = medicines
        output_file = os.path.join(output_dir, 'pnf_medicines.json')
        doc_type = "Medicine List"
    
    # Save output
    os.makedirs(output_dir, exist_ok=True)
    save_json(data, output_file)
    
    result = {
        "source_file": filename,
        "document_type": doc_type,
        "entries_extracted": len(data),
        "output_file": output_file
    }
    
    print(f"\n[RESULT] Extracted {len(data)} entries as {doc_type}")
    
    return result


def main():
    """Main entry point for the PDF parser."""
    print("=" * 60)
    print("Philippine National Formulary PDF Parser")
    print("=" * 60)
    
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    knowledge_base = os.path.join(script_dir, '..', 'knowledge-base')
    output_dir = os.path.join(script_dir, '..', 'output', 'medicines')
    
    # Find PDF files to process
    pdf_files = []
    
    # Check PhilHealth folder
    philhealth_dir = os.path.join(knowledge_base, 'philhealth')
    if os.path.exists(philhealth_dir):
        for f in os.listdir(philhealth_dir):
            if f.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(philhealth_dir, f))
    
    # Check government-services folder
    gov_dir = os.path.join(knowledge_base, 'government-services')
    if os.path.exists(gov_dir):
        for f in os.listdir(gov_dir):
            if f.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(gov_dir, f))
    
    if not pdf_files:
        print("[WARN] No PDF files found in knowledge-base directories")
        print("       Looking in: philhealth/, government-services/")
        return
    
    print(f"\n[INFO] Found {len(pdf_files)} PDF files to process")
    
    # Process each PDF
    results = []
    for pdf_path in pdf_files:
        result = process_pdf(pdf_path, output_dir)
        results.append(result)
    
    # Summary
    print("\n" + "=" * 60)
    print("PARSING COMPLETE")
    print("=" * 60)
    
    for result in results:
        if "error" not in result:
            print(f"  - {result['source_file']}: {result['entries_extracted']} entries")


if __name__ == "__main__":
    main()
