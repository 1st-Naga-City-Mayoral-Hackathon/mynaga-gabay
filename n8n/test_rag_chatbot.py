#!/usr/bin/env python3
"""
Test the MyNaga Gabay RAG Chatbot Workflow

Usage:
    python test_rag_chatbot.py --message "Where is the nearest hospital?"
    python test_rag_chatbot.py --message "Haen an ospital?" --language bikol
"""

import argparse
import json
import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

# Default URLs
PRODUCTION_URL = "https://cob-n8n-primary-production.up.railway.app/webhook/mynaga-gabay-chat"
TEST_URL = "https://cob-n8n-primary-production.up.railway.app/webhook-test/mynaga-gabay-chat"

# API Key for header auth (set in .env as N8N_API_KEY)
API_KEY = os.getenv("N8N_API_KEY", "")


def chat(message: str, session_id: str = None, language: str = "auto", use_test: bool = True) -> dict:
    """
    Send a message to the MyNaga Gabay chatbot.
    
    Args:
        message: User message
        session_id: Optional session ID for conversation continuity
        language: Language hint (auto, bikol, tagalog, english)
        use_test: Use test webhook (True) or production (False)
    """
    url = TEST_URL if use_test else PRODUCTION_URL
    
    payload = {
        "message": message,
        "sessionId": session_id or f"test-{os.urandom(4).hex()}",
        "language": language
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Add API key if available
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    
    print(f"\n{'='*60}")
    print(f"MyNaga Gabay - RAG Chatbot Test")
    print(f"{'='*60}")
    print(f"[USER] {message}")
    print(f"[LANG] {language}")
    print(f"[URL]  {url}")
    print("-" * 60)
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        
        print(f"[BOT]  {result.get('response', 'No response')}")
        print(f"[MODEL] {result.get('model', 'unknown')}")
        print(f"[SESSION] {result.get('sessionId', 'N/A')}")
        print("=" * 60)
        
        return result
        
    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] HTTP {e.response.status_code}: {e.response.text}")
        return {"error": str(e)}
    except Exception as e:
        print(f"[ERROR] {e}")
        return {"error": str(e)}


def interactive_mode(use_test: bool = True):
    """Run interactive chat session."""
    session_id = f"interactive-{os.urandom(4).hex()}"
    
    print("\n" + "=" * 60)
    print("MyNaga Gabay - Interactive Chat")
    print("Type 'quit' or 'exit' to end the session")
    print("Type '/bikol' to switch to Bikol, '/tagalog' for Tagalog")
    print("=" * 60)
    
    language = "auto"
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Salamat! (Thank you!) Goodbye!")
                break
            
            if user_input.lower() == '/bikol':
                language = "bikol"
                print("[System] Switched to Bikol mode")
                continue
            elif user_input.lower() == '/tagalog':
                language = "tagalog"
                print("[System] Switched to Tagalog mode")
                continue
            elif user_input.lower() == '/english':
                language = "english"
                print("[System] Switched to English mode")
                continue
            elif user_input.lower() == '/auto':
                language = "auto"
                print("[System] Switched to auto-detect mode")
                continue
            
            result = chat(user_input, session_id, language, use_test)
            
            if "error" in result:
                print(f"Error: {result['error']}")
                
        except KeyboardInterrupt:
            print("\n\nSession ended. Salamat!")
            break


def main():
    parser = argparse.ArgumentParser(description="Test MyNaga Gabay RAG Chatbot")
    parser.add_argument("--message", "-m", help="Message to send")
    parser.add_argument("--language", "-l", choices=["auto", "bikol", "tagalog", "english"], 
                        default="auto", help="Language hint")
    parser.add_argument("--session", "-s", help="Session ID for conversation continuity")
    parser.add_argument("--production", "-p", action="store_true", 
                        help="Use production webhook instead of test")
    parser.add_argument("--interactive", "-i", action="store_true",
                        help="Run interactive chat session")
    
    args = parser.parse_args()
    
    if args.interactive:
        interactive_mode(use_test=not args.production)
    elif args.message:
        chat(args.message, args.session, args.language, use_test=not args.production)
    else:
        # Demo queries
        demo_queries = [
            ("Haen an pinakahrani na ospital?", "bikol"),
            ("What are the emergency hotlines in Naga?", "english"),
            ("Ano ang covered ng PhilHealth?", "tagalog"),
        ]
        
        print("Running demo queries...\n")
        for msg, lang in demo_queries:
            chat(msg, language=lang, use_test=not args.production)
            print()


if __name__ == "__main__":
    main()
