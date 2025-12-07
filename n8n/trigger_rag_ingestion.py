#!/usr/bin/env python3
"""
Trigger N8N RAG Ingestion Workflow
Sends knowledge base data to the n8n webhook for embedding and storage.

Usage:
    python trigger_rag_ingestion.py [--category facilities|medicines|government|philhealth|emergency|all]
    
    # Or with environment variable
    N8N_WEBHOOK_URL=https://your-n8n.com/webhook/mynaga-gabay-ingest python trigger_rag_ingestion.py
"""

import argparse
import json
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

# Default n8n webhook URL (update this)
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/ingest-knowledge-base")


def load_knowledge_base() -> dict:
    """Load all knowledge base files."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    kb_base = os.path.join(script_dir, '..', 'data', 'knowledge-base')
    
    data = {
        "facilities": [],
        "medicines": [],
        "government": [],
        "philhealth": [],
        "emergency": []
    }
    
    # Load facilities
    facilities_path = os.path.join(kb_base, 'facilities', 'naga-health-centers.json')
    if os.path.exists(facilities_path):
        with open(facilities_path, 'r', encoding='utf-8') as f:
            facilities_data = json.load(f)
            data["facilities"] = facilities_data.get("facilities", [])
        print(f"[LOAD] Facilities: {len(data['facilities'])} entries")
    
    # Load medicines
    medicines_path = os.path.join(kb_base, 'medicines', 'medicines.json')
    if os.path.exists(medicines_path):
        with open(medicines_path, 'r', encoding='utf-8') as f:
            medicines_data = json.load(f)
            data["medicines"] = medicines_data.get("medicines", [])
        print(f"[LOAD] Medicines: {len(data['medicines'])} entries")
    
    # Load government services
    gov_path = os.path.join(kb_base, 'government-services', 'naga-government-offices.json')
    if os.path.exists(gov_path):
        with open(gov_path, 'r', encoding='utf-8') as f:
            gov_data = json.load(f)
            data["government"] = gov_data.get("offices", [])
        print(f"[LOAD] Government: {len(data['government'])} entries")
    
    # Load PhilHealth coverage
    philhealth_path = os.path.join(kb_base, 'philhealth', 'coverage.json')
    if os.path.exists(philhealth_path):
        with open(philhealth_path, 'r', encoding='utf-8') as f:
            ph_data = json.load(f)
            # Convert to list format for consistency
            data["philhealth"] = [ph_data.get("philhealth", {})]
        print(f"[LOAD] PhilHealth: {len(data['philhealth'])} entries")
    
    # Load Emergency hotlines
    emergency_path = os.path.join(script_dir, '..', 'data', 'output', 'emergency', 'naga_hotlines.json')
    if os.path.exists(emergency_path):
        with open(emergency_path, 'r', encoding='utf-8') as f:
            data["emergency"] = json.load(f)
        print(f"[LOAD] Emergency: {len(data['emergency'])} entries")
    
    return data


def trigger_ingestion(data: dict, category: str = "all", webhook_url: str = None) -> dict:
    """
    Trigger the n8n RAG ingestion workflow.
    
    Args:
        data: Knowledge base data with facilities, medicines, government keys
        category: Which category to ingest (all, facilities, medicines, government)
        webhook_url: n8n webhook URL
        
    Returns:
        Response from n8n
    """
    url = webhook_url or N8N_WEBHOOK_URL
    
    payload = {
        "category": category,
        **data
    }
    
    print(f"\n[SEND] Triggering n8n workflow...")
    print(f"[SEND] URL: {url}")
    print(f"[SEND] Category: {category}")
    
    total_entries = (
        len(data.get("facilities", [])) +
        len(data.get("medicines", [])) +
        len(data.get("government", [])) +
        len(data.get("philhealth", [])) +
        len(data.get("emergency", []))
    )
    print(f"[SEND] Total entries: {total_entries}")
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=120
        )
        response.raise_for_status()
        
        result = response.json()
        print(f"\n[SUCCESS] Ingestion complete!")
        print(f"[RESULT] {json.dumps(result, indent=2)}")
        return result
        
    except requests.exceptions.ConnectionError:
        print(f"\n[ERROR] Could not connect to n8n at {url}")
        print("[ERROR] Make sure n8n is running and the webhook is active")
        return {"error": "Connection failed"}
    except requests.exceptions.HTTPError as e:
        print(f"\n[ERROR] HTTP error: {e}")
        return {"error": str(e)}
    except Exception as e:
        print(f"\n[ERROR] {e}")
        return {"error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Trigger n8n RAG ingestion for MyNaga Gabay")
    parser.add_argument(
        "--category",
        choices=["all", "facilities", "medicines", "government", "philhealth", "emergency"],
        default="all",
        help="Which category to ingest (default: all)"
    )
    parser.add_argument(
        "--url",
        help="n8n webhook URL (or set N8N_WEBHOOK_URL env var)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be sent without actually sending"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MyNaga Gabay - RAG Ingestion Trigger")
    print("=" * 60)
    
    # Load knowledge base
    data = load_knowledge_base()
    
    if args.dry_run:
        print("\n[DRY RUN] Would send the following data:")
        print(f"  - Facilities: {len(data['facilities'])} entries")
        print(f"  - Medicines: {len(data['medicines'])} entries")
        print(f"  - Government: {len(data['government'])} entries")
        print(f"  - PhilHealth: {len(data['philhealth'])} entries")
        print(f"  - Emergency: {len(data['emergency'])} entries")
        print(f"  - Category filter: {args.category}")
        return
    
    # Trigger ingestion
    webhook_url = args.url or N8N_WEBHOOK_URL
    result = trigger_ingestion(data, args.category, webhook_url)
    
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    sys.exit(main() or 0)
