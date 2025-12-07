#!/usr/bin/env python3
"""
Groq Models Bikol Language Test
Tests various Groq models for Bikol/Bicolano language understanding and generation.

Tests:
1. Understanding Bikol input
2. Generating Bikol responses
3. Translation between Bikol and English
"""

import json
import os
import time
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Models to test
MODELS = [
    "qwen/qwen3-32b",           # 100+ languages
    "openai/gpt-oss-120b",      # OpenAI's open model
    "llama-3.3-70b-versatile",  # Current default
]

# Test prompts with Bikol
TEST_CASES = [
    {
        "name": "Bikol Understanding - Health Question",
        "prompt": "Saen an pinakahararaning ospital? (This is Bikol language from Naga City, Philippines)",
        "expected_behavior": "Should understand this means 'Where is the nearest hospital?'",
        "category": "understanding"
    },
    {
        "name": "Bikol Understanding - Symptoms",
        "prompt": "May kalintura ako asin kulog nin payo. Ano dapat kong gibuhon? (This is Bikol language)",
        "expected_behavior": "Should understand: 'I have fever and headache. What should I do?'",
        "category": "understanding"
    },
    {
        "name": "Bikol Generation - Greeting",
        "prompt": "Respond to me in Bikol (Central Bikol/Naga dialect): How do you say 'Good morning, how are you?' in Bikol?",
        "expected": "Maray na aga! Kumusta ka?",
        "category": "generation"
    },
    {
        "name": "Bikol Translation - English to Bikol",
        "prompt": "Translate to Bikol (Naga City dialect): 'Where is the pharmacy? I need medicine for fever.'",
        "expected_keywords": ["botica", "bulong", "kalintura"],
        "category": "translation"
    },
    {
        "name": "Bikol Translation - Bikol to English",
        "prompt": "Translate this Bikol sentence to English: 'Magkano an konsulta sa doktor?'",
        "expected": "How much is the doctor's consultation?",
        "category": "translation"
    },
    {
        "name": "Health Advice in Bikol",
        "prompt": "You are a health assistant for Naga City. A user asks in Bikol: 'Ano an dapat kong gibuhon para sa kurso?' (What should I do for diarrhea?). Respond in Bikol with simple health advice.",
        "category": "generation"
    },
]


def test_model(model: str, prompt: str, system_prompt: str = None) -> dict:
    """Send a test prompt to a Groq model."""
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500,
    }
    
    try:
        start = time.time()
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=60)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {
                "success": True,
                "response": content,
                "time_seconds": round(elapsed, 2),
                "tokens": data.get("usage", {})
            }
        else:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text[:200]}",
                "time_seconds": round(elapsed, 2)
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "time_seconds": 0
        }


def evaluate_response(test_case: dict, response: str) -> dict:
    """Evaluate how well the model handled the Bikol test."""
    
    score = 0
    notes = []
    
    # Check for Bikol keywords in response
    bikol_words = ["maray", "kumusta", "salamat", "tabi", "dai", "iyo", "ospital", 
                   "botica", "bulong", "doktor", "kalintura", "kulog", "aldaw"]
    
    response_lower = response.lower()
    found_bikol = [w for w in bikol_words if w in response_lower]
    
    if test_case["category"] == "understanding":
        # Check if model understood the meaning
        if any(w in response_lower for w in ["hospital", "nearest", "where", "fever", "headache"]):
            score += 50
            notes.append("✓ Understood the meaning")
        else:
            notes.append("✗ Did not demonstrate understanding")
    
    elif test_case["category"] == "generation":
        if found_bikol:
            score += 30-40
            notes.append(f"✓ Used Bikol words: {', '.join(found_bikol)}")
        else:
            notes.append("✗ No Bikol words in response")
    
    elif test_case["category"] == "translation":
        if "expected_keywords" in test_case:
            matched = [k for k in test_case["expected_keywords"] if k in response_lower]
            if matched:
                score += len(matched) * 15
                notes.append(f"✓ Contains expected: {', '.join(matched)}")
        if "expected" in test_case:
            if test_case["expected"].lower() in response_lower:
                score += 50
                notes.append("✓ Correct translation")
    
    # Bonus for response quality
    if len(response) > 50:
        score += 10
        notes.append("✓ Detailed response")
    
    return {
        "score": min(score, 100),
        "found_bikol_words": found_bikol,
        "notes": notes
    }


def run_tests():
    """Run all Bikol language tests across models."""
    
    print("=" * 70)
    print("GROQ MODELS - BIKOL LANGUAGE CAPABILITY TEST")
    print("=" * 70)
    
    if not GROQ_API_KEY:
        print("[ERROR] GROQ_API_KEY not found in environment!")
        return
    
    print(f"[INFO] API Key: {GROQ_API_KEY[:10]}...{GROQ_API_KEY[-4:]}")
    print(f"[INFO] Testing {len(MODELS)} models with {len(TEST_CASES)} test cases")
    
    results = {}
    
    for model in MODELS:
        print(f"\n{'='*70}")
        print(f"MODEL: {model}")
        print("=" * 70)
        
        model_results = []
        total_score = 0
        
        for i, test in enumerate(TEST_CASES):
            print(f"\n[Test {i+1}] {test['name']}")
            print(f"  Prompt: {test['prompt'][:80]}...")
            
            result = test_model(model, test["prompt"])
            
            if result["success"]:
                print(f"  Time: {result['time_seconds']}s")
                print(f"  Response: {result['response'][:150]}...")
                
                evaluation = evaluate_response(test, result["response"])
                print(f"  Score: {evaluation['score']}/100")
                for note in evaluation["notes"]:
                    print(f"    {note}")
                
                total_score += evaluation["score"]
                
                model_results.append({
                    "test": test["name"],
                    "success": True,
                    "response": result["response"],
                    "score": evaluation["score"],
                    "notes": evaluation["notes"]
                })
            else:
                print(f"  ERROR: {result['error']}")
                model_results.append({
                    "test": test["name"],
                    "success": False,
                    "error": result["error"]
                })
            
            time.sleep(1)  # Rate limiting
        
        avg_score = total_score / len(TEST_CASES) if TEST_CASES else 0
        results[model] = {
            "tests": model_results,
            "average_score": round(avg_score, 1),
            "passed": sum(1 for r in model_results if r.get("success", False))
        }
        
        print(f"\n[SUMMARY] {model}")
        print(f"  Average Score: {avg_score:.1f}/100")
        print(f"  Tests Passed: {results[model]['passed']}/{len(TEST_CASES)}")
    
    # Final comparison
    print("\n" + "=" * 70)
    print("FINAL COMPARISON - BIKOL LANGUAGE SUPPORT")
    print("=" * 70)
    
    ranking = sorted(results.items(), key=lambda x: x[1]["average_score"], reverse=True)
    
    print(f"\n{'Model':<35} {'Avg Score':<12} {'Passed'}")
    print("-" * 60)
    for model, data in ranking:
        print(f"{model:<35} {data['average_score']:<12} {data['passed']}/{len(TEST_CASES)}")
    
    # Recommendation
    best_model = ranking[0][0] if ranking else None
    print(f"\n[RECOMMENDATION] Best model for Bikol: {best_model}")
    
    # Save results
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, "groq_bikol_test_results.json")
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n[SAVE] Results saved to: {output_file}")
    
    return results


if __name__ == "__main__":
    run_tests()
