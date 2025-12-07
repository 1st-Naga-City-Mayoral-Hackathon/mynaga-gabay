#!/usr/bin/env python3
"""
RxNorm API Medicine Fetcher
Fetches comprehensive drug information from the NIH RxNorm API.

RxNorm provides:
- Normalized drug names (generic + brand)
- Drug strengths and dosage forms
- Drug interactions
- Related drugs
- NDC codes

API Documentation: https://rxnav.nlm.nih.gov/RxNormAPIs.html
"""

import json
import time
from typing import Any

import requests


# Common drug classes to fetch for a health assistant
DRUG_CLASSES = [
    # Pain & Fever
    "paracetamol", "acetaminophen", "ibuprofen", "aspirin", "naproxen", "mefenamic acid",
    "diclofenac", "celecoxib", "tramadol", "morphine",
    
    # Antibiotics
    "amoxicillin", "ampicillin", "azithromycin", "ciprofloxacin", "metronidazole",
    "cephalexin", "cefuroxime", "clindamycin", "doxycycline", "erythromycin",
    "co-amoxiclav", "sulfamethoxazole", "penicillin", "clarithromycin",
    
    # Antihistamines & Allergy
    "cetirizine", "loratadine", "diphenhydramine", "chlorphenamine", "fexofenadine",
    "levocetirizine", "hydroxyzine",
    
    # Respiratory
    "salbutamol", "albuterol", "montelukast", "budesonide", "fluticasone",
    "ipratropium", "theophylline", "prednisone", "dextromethorphan",
    
    # Cardiovascular
    "amlodipine", "losartan", "metoprolol", "atenolol", "lisinopril",
    "enalapril", "valsartan", "carvedilol", "furosemide", "hydrochlorothiazide",
    "simvastatin", "atorvastatin", "rosuvastatin", "clopidogrel", "warfarin",
    
    # Diabetes
    "metformin", "glimepiride", "gliclazide", "sitagliptin", "insulin",
    "pioglitazone", "empagliflozin", "dapagliflozin",
    
    # Gastrointestinal
    "omeprazole", "pantoprazole", "lansoprazole", "ranitidine", "famotidine",
    "loperamide", "metoclopramide", "domperidone", "hyoscine", "dicyclomine",
    "lactulose", "bisacodyl",
    
    # Mental Health
    "sertraline", "fluoxetine", "escitalopram", "amitriptyline", "diazepam",
    "lorazepam", "alprazolam", "risperidone", "olanzapine", "quetiapine",
    
    # Vitamins & Supplements
    "ascorbic acid", "vitamin c", "vitamin d", "vitamin b12", "folic acid",
    "iron", "calcium", "zinc", "multivitamin",
    
    # Skin & Topical
    "hydrocortisone", "clotrimazole", "ketoconazole", "mupirocin", "betamethasone",
    "calamine", "permethrin",
    
    # Common OTC
    "guaifenesin", "phenylephrine", "pseudoephedrine", "zinc sulfate",
]


class RxNormAPI:
    """Client for the RxNorm REST API."""
    
    BASE_URL = "https://rxnav.nlm.nih.gov/REST"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'MyNaga-Gabay-Health-RAG/1.0'
        })
    
    def _get(self, endpoint: str, params: dict = None) -> dict | None:
        """Make a GET request to the API."""
        url = f"{self.BASE_URL}/{endpoint}"
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"  [ERROR] API request failed: {e}")
            return None
    
    def search_drugs(self, name: str) -> list[dict]:
        """
        Search for drugs by name.
        Returns list of drug concepts with RxCUI (RxNorm Concept Unique Identifier).
        """
        data = self._get("drugs.json", {"name": name})
        
        if not data or "drugGroup" not in data:
            return []
        
        drugs = []
        drug_group = data.get("drugGroup", {})
        concept_groups = drug_group.get("conceptGroup", [])
        
        for group in concept_groups:
            tty = group.get("tty", "")  # Term Type
            concepts = group.get("conceptProperties", [])
            
            for concept in concepts:
                drugs.append({
                    "rxcui": concept.get("rxcui"),
                    "name": concept.get("name"),
                    "synonym": concept.get("synonym", ""),
                    "term_type": tty,
                })
        
        return drugs
    
    def get_drug_info(self, rxcui: str) -> dict | None:
        """Get detailed information about a drug by RxCUI."""
        data = self._get(f"rxcui/{rxcui}/allProperties.json", {"prop": "all"})
        
        if not data or "propConceptGroup" not in data:
            return None
        
        properties = {}
        for group in data.get("propConceptGroup", {}).get("propConcept", []):
            prop_name = group.get("propName", "")
            prop_value = group.get("propValue", "")
            if prop_name and prop_value:
                if prop_name not in properties:
                    properties[prop_name] = []
                properties[prop_name].append(prop_value)
        
        return properties
    
    def get_related_drugs(self, rxcui: str) -> list[dict]:
        """Get related drugs (brand names, generics, etc.)."""
        data = self._get(f"rxcui/{rxcui}/related.json", {"tty": "BN+IN+SBD+SCD"})
        
        if not data:
            return []
        
        related = []
        concept_groups = data.get("relatedGroup", {}).get("conceptGroup", [])
        
        for group in concept_groups:
            tty = group.get("tty", "")
            concepts = group.get("conceptProperties", [])
            
            for concept in concepts:
                related.append({
                    "rxcui": concept.get("rxcui"),
                    "name": concept.get("name"),
                    "type": tty,
                })
        
        return related
    
    def get_drug_class(self, rxcui: str) -> list[str]:
        """Get drug classifications."""
        data = self._get(f"rxcui/{rxcui}/class.json")
        
        if not data:
            return []
        
        classes = []
        for entry in data.get("rxclassDrugInfoList", {}).get("rxclassDrugInfo", []):
            class_info = entry.get("rxclassMinConceptItem", {})
            class_name = class_info.get("className", "")
            if class_name:
                classes.append(class_name)
        
        return list(set(classes))  # Remove duplicates


def fetch_medicine_data(api: RxNormAPI, drug_name: str) -> dict | None:
    """
    Fetch comprehensive data for a single drug.
    """
    print(f"  Fetching: {drug_name}...")
    
    # Search for the drug
    drugs = api.search_drugs(drug_name)
    if not drugs:
        print(f"    [SKIP] No results for {drug_name}")
        return None
    
    # Get the first/best match
    primary = drugs[0]
    rxcui = primary.get("rxcui")
    
    if not rxcui:
        return None
    
    # Get additional info
    properties = api.get_drug_info(rxcui) or {}
    related = api.get_related_drugs(rxcui)
    drug_classes = api.get_drug_class(rxcui)
    
    # Extract brand names and dosage forms
    brand_names = []
    dosage_forms = []
    
    for rel in related:
        if rel["type"] == "BN":  # Brand Name
            brand_names.append(rel["name"])
        elif rel["type"] in ["SBD", "SCD"]:  # Semantic Branded/Clinical Drug
            # These contain dosage info
            dosage_forms.append(rel["name"])
    
    # Build the medicine entry
    medicine = {
        "id": f"rxnorm-{rxcui}",
        "rxcui": rxcui,
        "generic_name": drug_name.title(),
        "normalized_name": primary.get("name", ""),
        "synonyms": [d.get("synonym", "") for d in drugs if d.get("synonym")],
        "brand_names": list(set(brand_names))[:10],  # Limit to 10
        "drug_classes": drug_classes[:5],  # Limit to 5
        "dosage_forms": dosage_forms[:10],  # Limit to 10
        "term_type": primary.get("term_type", ""),
        "source": "RxNorm (NIH NLM)",
        "source_url": f"https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm={rxcui}"
    }
    
    # Add any useful properties
    if "AVAILABLE_STRENGTH" in properties:
        medicine["available_strengths"] = properties["AVAILABLE_STRENGTH"]
    
    return medicine


def save_json(data: list[dict], filename: str) -> None:
    """Save data to JSON file with pretty formatting."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVE] Written to: {filename}")


def main():
    """Main entry point for the RxNorm fetcher."""
    print("=" * 60)
    print("RxNorm API Medicine Fetcher")
    print("=" * 60)
    
    api = RxNormAPI()
    medicines = []
    failed = []
    
    print(f"\n[INFO] Fetching data for {len(DRUG_CLASSES)} common drugs...")
    print("-" * 40)
    
    for i, drug in enumerate(DRUG_CLASSES):
        medicine = fetch_medicine_data(api, drug)
        
        if medicine:
            medicines.append(medicine)
        else:
            failed.append(drug)
        
        # Rate limiting - be nice to the free API
        if (i + 1) % 10 == 0:
            print(f"  [PROGRESS] {i + 1}/{len(DRUG_CLASSES)} drugs processed...")
            time.sleep(0.5)
        else:
            time.sleep(0.1)
    
    print("\n" + "-" * 40)
    print("SAVING OUTPUT")
    print("-" * 40)
    
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, '..', 'output', 'medicines')
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, 'rxnorm_medicines.json')
    save_json(medicines, output_file)
    
    # Summary
    print("\n" + "=" * 60)
    print("FETCH COMPLETE")
    print("=" * 60)
    print(f"  - Success: {len(medicines)} drugs")
    print(f"  - Failed:  {len(failed)} drugs")
    
    if failed:
        print(f"\n  Failed drugs: {', '.join(failed[:10])}")
        if len(failed) > 10:
            print(f"    ... and {len(failed) - 10} more")
    
    # Category summary
    categories = {}
    for med in medicines:
        for cls in med.get("drug_classes", ["Uncategorized"])[:1]:
            if cls not in categories:
                categories[cls] = 0
            categories[cls] += 1
    
    if categories:
        print("\n[TOP DRUG CLASSES]")
        for cls, count in sorted(categories.items(), key=lambda x: -x[1])[:10]:
            print(f"  - {cls}: {count}")
    
    return medicines


if __name__ == "__main__":
    main()
