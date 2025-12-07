#!/usr/bin/env python3
"""
Medicine Data Merger
Consolidates medicine data from multiple sources into a unified knowledge base.

Sources:
- TGP (The Generics Pharmacy) - Local Filipino pharmacy data with prices
- RxNorm (NIH) - Comprehensive US drug database with normalized names
- PNF PDF - Philippine National Formulary 
- PhilHealth Benefits - Coverage and payment information
"""

import json
import os
import re
from typing import Any


def load_json(filepath: str) -> list | dict:
    """Load JSON file."""
    if not os.path.exists(filepath):
        print(f"  [SKIP] File not found: {filepath}")
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def clean_text(text: str) -> str:
    """Clean text."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()


def normalize_medicine_name(name: str) -> str:
    """Normalize medicine name for matching."""
    name = name.lower()
    # Remove common suffixes/prefixes
    name = re.sub(r'\s*(hcl|hci|dicl|trihyd|dihydrate|sodium|potassium)\s*', ' ', name)
    name = re.sub(r'\s*(tablet|capsule|syrup|solution|injection|cream|ointment|gel|drops|suspension|powder)\s*', ' ', name)
    name = re.sub(r'\s*\d+\s*(mg|g|ml|mcg|iu|%)\s*', ' ', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


def merge_medicine_data(output_dir: str) -> list[dict]:
    """
    Merge medicine data from all sources.
    """
    print("[MERGE] Starting data consolidation...")
    
    # Load all data sources
    tgp_data = load_json(os.path.join(output_dir, 'tgp_medicines.json'))
    rxnorm_data = load_json(os.path.join(output_dir, 'rxnorm_medicines.json'))
    philhealth_data = load_json(os.path.join(output_dir, 'philhealth_benefits.json'))
    
    print(f"  - TGP: {len(tgp_data)} entries")
    print(f"  - RxNorm: {len(rxnorm_data)} entries")
    print(f"  - PhilHealth: {len(philhealth_data)} entries")
    
    # Build a unified medicine database
    medicines = {}
    
    # Process RxNorm data (most comprehensive)
    for med in rxnorm_data:
        generic = med.get("generic_name", "").lower()
        if not generic:
            continue
        
        key = normalize_medicine_name(generic)
        
        if key not in medicines:
            medicines[key] = {
                "id": med.get("id", f"med-{len(medicines)+1:04d}"),
                "generic_name": med.get("generic_name", "").title(),
                "normalized_name": med.get("normalized_name", ""),
                "brand_names": [],
                "drug_classes": [],
                "dosage_forms": [],
                "strengths": [],
                "common_uses": [],
                "warnings": [],
                "category": "General",
                "price_php": None,
                "philhealth_covered": False,
                "sources": []
            }
        
        # Merge data
        entry = medicines[key]
        entry["brand_names"].extend(med.get("brand_names", []))
        entry["drug_classes"].extend(med.get("drug_classes", []))
        entry["dosage_forms"].extend(med.get("dosage_forms", [])[:5])  # Limit
        entry["strengths"].extend(med.get("available_strengths", []))
        entry["sources"].append("RxNorm (NIH)")
    
    # Process TGP data (local prices)
    for med in tgp_data:
        generic = med.get("generic_name", "") or med.get("name", "")
        if not generic:
            continue
        
        key = normalize_medicine_name(generic)
        
        if key in medicines:
            # Update existing
            if med.get("price_php"):
                medicines[key]["price_php"] = med["price_php"]
            if med.get("brand_name"):
                medicines[key]["brand_names"].append(med["brand_name"])
            medicines[key]["sources"].append("TGP Philippines")
        else:
            # Create new entry
            medicines[key] = {
                "id": f"tgp-{len(medicines)+1:04d}",
                "generic_name": generic.title(),
                "normalized_name": med.get("name", ""),
                "brand_names": [med.get("brand_name")] if med.get("brand_name") else [],
                "drug_classes": [],
                "dosage_forms": [med.get("dosage_form")] if med.get("dosage_form") else [],
                "strengths": [med.get("strength")] if med.get("strength") else [],
                "common_uses": [],
                "warnings": [],
                "category": med.get("category", "General"),
                "price_php": med.get("price_php"),
                "philhealth_covered": False,
                "sources": ["TGP Philippines"]
            }
    
    # Deduplicate list fields
    for key, med in medicines.items():
        med["brand_names"] = list(set(filter(None, med["brand_names"])))[:10]
        med["drug_classes"] = list(set(filter(None, med["drug_classes"])))[:5]
        med["dosage_forms"] = list(set(filter(None, med["dosage_forms"])))[:10]
        med["strengths"] = list(set(filter(None, med["strengths"])))[:10]
        med["sources"] = list(set(filter(None, med["sources"])))
    
    # Convert to list and sort
    medicine_list = sorted(medicines.values(), key=lambda x: x["generic_name"])
    
    print(f"\n[RESULT] Consolidated {len(medicine_list)} unique medicines")
    
    return medicine_list


def create_knowledge_base_medicines(medicines: list[dict], output_path: str) -> None:
    """
    Create a simplified version for the knowledge base.
    """
    # Create a simpler structure for RAG
    kb_medicines = []
    
    for med in medicines:
        kb_entry = {
            "id": med["id"],
            "genericName": med["generic_name"],
            "brandNames": med["brand_names"][:5],
            "category": med["drug_classes"][0] if med["drug_classes"] else med["category"],
            "description": f"{med['generic_name']} - {', '.join(med['drug_classes'][:2])}" if med["drug_classes"] else med["generic_name"],
            "dosageForms": med["dosage_forms"][:3],
            "commonUses": med["common_uses"][:5] if med["common_uses"] else [],
            "warnings": med["warnings"][:3] if med["warnings"] else [],
        }
        
        if med["price_php"]:
            kb_entry["pricePhp"] = med["price_php"]
        
        kb_medicines.append(kb_entry)
    
    # Save in the expected format
    output_data = {"medicines": kb_medicines}
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"[SAVE] Knowledge base updated: {output_path}")


def save_json(data: list | dict, filepath: str) -> None:
    """Save to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filepath}")


def main():
    """Main entry point."""
    print("=" * 60)
    print("Medicine Data Merger")
    print("=" * 60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'output', 'medicines')
    kb_dir = os.path.join(script_dir, '..', 'knowledge-base', 'medicines')
    
    # Merge all data
    medicines = merge_medicine_data(output_dir)
    
    # Save consolidated data
    print("\n" + "-" * 40)
    print("SAVING OUTPUTS")
    print("-" * 40)
    
    # Full merged data
    save_json(medicines, os.path.join(output_dir, 'medicines_consolidated.json'))
    
    # Update knowledge base
    os.makedirs(kb_dir, exist_ok=True)
    create_knowledge_base_medicines(medicines, os.path.join(kb_dir, 'medicines.json'))
    
    # Summary by category
    categories = {}
    for med in medicines:
        if med["drug_classes"]:
            cat = med["drug_classes"][0]
        else:
            cat = "Uncategorized"
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    print("\n" + "=" * 60)
    print("MERGE COMPLETE")
    print("=" * 60)
    print(f"Total medicines: {len(medicines)}")
    
    print("\n[TOP CATEGORIES]")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1])[:15]:
        print(f"  - {cat}: {count}")


if __name__ == "__main__":
    main()
