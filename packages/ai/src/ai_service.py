"""
MyNaga Gabay AI Service
=======================

Provides Text-to-Speech (TTS) and Speech-to-Text (STT) for Bikol, Filipino, and English.

Uses Meta's MMS models:
- TTS: facebook/mms-tts-bcl (Bikol), mms-tts-fil (Filipino), mms-tts-eng (English)
- STT: facebook/mms-1b-all with language adapters

Run with:
    cd packages/ai
    pip install -r requirements.txt
    python src/ai_service.py

API:
    POST /tts - Convert text to speech
    POST /stt - Convert speech to text
    GET /health - Health check
"""

import io
import os
import logging
import tempfile
from typing import Optional, Literal
from contextlib import asynccontextmanager

import torch
import scipy.io.wavfile
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# Simple shared-secret auth (optional)
# ============================================

# If set, requests must send header: X-AI-KEY: <AI_SERVICE_API_KEY>
AI_SERVICE_API_KEY = os.environ.get("AI_SERVICE_API_KEY", "")


def require_ai_key(x_ai_key: Optional[str] = Header(default=None, alias="X-AI-KEY")):
    """Optional API key guard. If AI_SERVICE_API_KEY is empty, auth is disabled."""
    if not AI_SERVICE_API_KEY:
        return
    if not x_ai_key or x_ai_key != AI_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

# ============================================
# TTS Configuration
# ============================================

TTS_MODELS = {
    "bcl": "facebook/mms-tts-bcl",  # Bikol Central
    "fil": "facebook/mms-tts-tgl",  # Filipino/Tagalog (uses 'tgl' ISO 639-3 code)
    "eng": "facebook/mms-tts-eng",  # English
}

# ============================================
# STT Configuration
# ============================================

STT_MODEL = "facebook/mms-1b-all"  # Multilingual ASR model

STT_LANGUAGE_CODES = {
    "bcl": "bcl",  # Bikol Central
    "fil": "tgl",  # Filipino/Tagalog (uses Tagalog code in MMS)
    "eng": "eng",  # English
}

# ============================================
# Translation Configuration (NLLB-200)
# ============================================

NLLB_MODEL = "facebook/nllb-200-distilled-600M"  # Smaller, faster model

# NLLB language codes (different from MMS codes!)
NLLB_LANGUAGE_CODES = {
    "english": "eng_Latn",
    "tagalog": "tgl_Latn",
    "bikol": "bcl_Latn",
    "eng": "eng_Latn",
    "fil": "tgl_Latn",
    "bcl": "bcl_Latn",
}

# ============================================
# Google Translate Configuration (for Tagalog)
# ============================================

# Use dedicated key or fall back to Places API key (same Google Cloud key)
GOOGLE_TRANSLATE_API_KEY = os.environ.get("GOOGLE_TRANSLATE_API_KEY") or os.environ.get("GOOGLE_PLACES_API_KEY", "")

# Google Translate language codes
GOOGLE_LANGUAGE_CODES = {
    "english": "en",
    "tagalog": "tl",
    "eng": "en",
    "fil": "tl",
}

# Languages that use Google Translate (better quality)
USE_GOOGLE_TRANSLATE = {"tagalog", "fil"}

# ============================================
# Global caches
# ============================================

DEFAULT_LANGUAGE = "bcl"

# TTS caches
tts_models_cache: dict = {}
tts_tokenizers_cache: dict = {}

# STT cache (single model with adapters)
stt_model = None
stt_processor = None
stt_current_lang = None

# Translation cache (NLLB)
translation_model = None
translation_tokenizer = None


# ============================================
# TTS Functions
# ============================================

def load_tts_model(language: str):
    """Load TTS model and tokenizer for the specified language."""
    if language not in TTS_MODELS:
        raise ValueError(f"Unsupported TTS language: {language}")
    
    model_name = TTS_MODELS[language]
    
    if language not in tts_models_cache:
        logger.info(f"Loading TTS model: {model_name}")
        
        from transformers import VitsModel, AutoTokenizer
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = VitsModel.from_pretrained(model_name)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        tts_tokenizers_cache[language] = tokenizer
        tts_models_cache[language] = model
        
        logger.info(f"TTS model loaded on {device}")
    
    return tts_models_cache[language], tts_tokenizers_cache[language]


# ============================================
# Number to Words (for TTS)
# ============================================

# Number words in different languages
NUMBER_WORDS = {
    "eng": {
        0: "zero", 1: "one", 2: "two", 3: "three", 4: "four",
        5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine",
        10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
        15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
        20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty",
        70: "seventy", 80: "eighty", 90: "ninety",
        100: "hundred", 1000: "thousand", 1000000: "million",
    },
    "fil": {
        0: "zero", 1: "isa", 2: "dalawa", 3: "tatlo", 4: "apat",
        5: "lima", 6: "anim", 7: "pito", 8: "walo", 9: "siyam",
        10: "sampu", 11: "labing-isa", 12: "labindalawa", 13: "labintatlo", 14: "labing-apat",
        15: "labinlima", 16: "labing-anim", 17: "labimpito", 18: "labing-walo", 19: "labinsiyam",
        20: "dalawampu", 30: "tatlumpu", 40: "apatnapu", 50: "limampu", 60: "animnapu",
        70: "pitumpu", 80: "walumpu", 90: "siyamnapu",
        100: "daan", 1000: "libo", 1000000: "milyon",
    },
    "bcl": {
        0: "zero", 1: "saro", 2: "duwa", 3: "tulo", 4: "apat",
        5: "lima", 6: "anom", 7: "pito", 8: "walo", 9: "siyam",
        10: "sampulo", 11: "kagsaro", 12: "kagduwa", 13: "kagtulo", 14: "kag-apat",
        15: "kaglima", 16: "kag-anom", 17: "kagpito", 18: "kagwalo", 19: "kagsiyam",
        20: "duwampulo", 30: "tulompulo", 40: "apatnapulo", 50: "limampulo", 60: "anompulo",
        70: "pitompulo", 80: "walompulo", 90: "siyamnapulo",
        100: "gatos", 1000: "ribo", 1000000: "milyon",
    },
}


def number_to_words(num: int, lang: str = "eng") -> str:
    """Convert a number to words in the specified language."""
    words = NUMBER_WORDS.get(lang, NUMBER_WORDS["eng"])
    
    if num < 0:
        return f"negative {number_to_words(-num, lang)}"
    
    if num in words:
        return words[num]
    
    if num < 100:
        tens = (num // 10) * 10
        ones = num % 10
        if ones == 0:
            return words[tens]
        return f"{words[tens]} {words[ones]}"
    
    if num < 1000:
        hundreds = num // 100
        remainder = num % 100
        result = f"{words[hundreds]} {words[100]}"
        if remainder > 0:
            result += f" {number_to_words(remainder, lang)}"
        return result
    
    if num < 1000000:
        thousands = num // 1000
        remainder = num % 1000
        result = f"{number_to_words(thousands, lang)} {words[1000]}"
        if remainder > 0:
            result += f" {number_to_words(remainder, lang)}"
        return result
    
    if num < 1000000000:
        millions = num // 1000000
        remainder = num % 1000000
        result = f"{number_to_words(millions, lang)} {words[1000000]}"
        if remainder > 0:
            result += f" {number_to_words(remainder, lang)}"
        return result
    
    # For very large numbers, just return digits
    return str(num)


def digits_to_words(num_str: str) -> str:
    """Convert each digit in a string to English words (for phone numbers)."""
    digit_words = {
        '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
        '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    }
    return ' '.join(digit_words.get(d, d) for d in num_str if d.isdigit())


def convert_numbers_to_words(text: str, lang: str = "eng") -> str:
    """Convert all numbers in text to English words for TTS."""
    import re
    
    def is_phone_number(s: str) -> bool:
        """Check if string looks like a phone number."""
        # Phone numbers have dashes, parentheses, or are 7+ digits
        return bool(re.search(r'[-()]', s)) or (s.isdigit() and len(s) >= 7)
    
    def replace_number(match):
        num_str = match.group(0)
        
        # For phone numbers, read each digit individually
        if is_phone_number(num_str):
            # Remove non-digits and read digit by digit
            digits_only = ''.join(c for c in num_str if c.isdigit())
            return digits_to_words(digits_only)
        
        # For regular numbers, convert to English words
        try:
            num = int(num_str)
            return number_to_words(num, "eng")  # Always use English
        except:
            return num_str
    
    # Match phone number formats first: (054) 472-3000, 054-472-3000, etc.
    result = re.sub(r'\(?\d{2,4}\)?[\s-]?\d{2,4}[\s-]?\d{2,4}', replace_number, text)
    # Also match standalone numbers
    result = re.sub(r'\b\d+\b', replace_number, result)
    
    return result


def text_to_speech(text: str, language: str = DEFAULT_LANGUAGE) -> bytes:
    """Convert text to speech audio (WAV)."""
    # Convert numbers to words for better TTS pronunciation (always English)
    text_with_words = convert_numbers_to_words(text, "eng")
    logger.info(f"TTS text (numbers converted): '{text_with_words[:80]}...'")
    
    model, tokenizer = load_tts_model(language)
    device = next(model.parameters()).device
    
    inputs = tokenizer(text_with_words, return_tensors="pt").to(device)
    
    with torch.no_grad():
        output = model(**inputs).waveform
    
    waveform = output.squeeze().cpu().numpy()
    sampling_rate = model.config.sampling_rate
    
    buffer = io.BytesIO()
    scipy.io.wavfile.write(buffer, rate=sampling_rate, data=waveform)
    buffer.seek(0)
    
    return buffer.read()


# ============================================
# STT Functions
# ============================================

def load_stt_model(language: str):
    """Load STT model with the appropriate language adapter."""
    global stt_model, stt_processor, stt_current_lang
    
    if language not in STT_LANGUAGE_CODES:
        raise ValueError(f"Unsupported STT language: {language}")
    
    lang_code = STT_LANGUAGE_CODES[language]
    
    # Load model if not loaded
    if stt_model is None:
        logger.info(f"Loading STT model: {STT_MODEL} (this may take a while on first run...)")
        
        from transformers import Wav2Vec2ForCTC, AutoProcessor
        
        stt_processor = AutoProcessor.from_pretrained(STT_MODEL)
        stt_model = Wav2Vec2ForCTC.from_pretrained(STT_MODEL)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        stt_model = stt_model.to(device)
        
        logger.info(f"STT model loaded on {device}")
    
    # Switch language adapter if needed
    if stt_current_lang != lang_code:
        logger.info(f"Switching STT language adapter to: {lang_code}")
        stt_processor.tokenizer.set_target_lang(lang_code)
        stt_model.load_adapter(lang_code)
        stt_current_lang = lang_code
    
    return stt_model, stt_processor


def speech_to_text(audio_bytes: bytes, language: str = DEFAULT_LANGUAGE) -> str:
    """Convert speech audio to text."""
    import librosa
    
    model, processor = load_stt_model(language)
    device = next(model.parameters()).device
    
    # Load audio from bytes
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        
        # Load and resample to 16kHz (required by MMS)
        audio, sr = librosa.load(tmp.name, sr=16000)
    
    # Process audio
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Transcribe
    with torch.no_grad():
        outputs = model(**inputs).logits
    
    # Decode
    ids = torch.argmax(outputs, dim=-1)[0]
    transcription = processor.decode(ids)
    
    return transcription


# ============================================
# Translation Functions (NLLB-200)
# ============================================

def load_translation_model():
    """Load NLLB translation model and tokenizer."""
    global translation_model, translation_tokenizer
    
    if translation_model is None:
        logger.info(f"Loading translation model: {NLLB_MODEL}")
        
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        
        translation_tokenizer = AutoTokenizer.from_pretrained(NLLB_MODEL)
        translation_model = AutoModelForSeq2SeqLM.from_pretrained(NLLB_MODEL)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        translation_model = translation_model.to(device)
        
        logger.info(f"Translation model loaded on {device}")
    
    return translation_model, translation_tokenizer


def translate_with_google(text: str, source_lang: str, target_lang: str) -> str:
    """Translate using Google Translate API (for Tagalog)."""
    import requests
    
    if not GOOGLE_TRANSLATE_API_KEY:
        raise ValueError("GOOGLE_TRANSLATE_API_KEY not set")
    
    src_code = GOOGLE_LANGUAGE_CODES.get(source_lang.lower())
    tgt_code = GOOGLE_LANGUAGE_CODES.get(target_lang.lower())
    
    if not src_code or not tgt_code:
        raise ValueError(f"Unsupported language for Google: {source_lang} or {target_lang}")
    
    url = "https://translation.googleapis.com/language/translate/v2"
    params = {
        "key": GOOGLE_TRANSLATE_API_KEY,
        "q": text,
        "source": src_code,
        "target": tgt_code,
        "format": "text",
    }
    
    response = requests.post(url, data=params)
    response.raise_for_status()
    
    result = response.json()
    translated = result["data"]["translations"][0]["translatedText"]
    
    return translated


def translate_with_nllb(text: str, source_lang: str, target_lang: str) -> str:
    """Translate using NLLB-200 (for Bikol and fallback)."""
    
    # Get NLLB language codes
    src_code = NLLB_LANGUAGE_CODES.get(source_lang.lower())
    tgt_code = NLLB_LANGUAGE_CODES.get(target_lang.lower())
    
    if not src_code:
        raise ValueError(f"Unsupported source language: {source_lang}")
    if not tgt_code:
        raise ValueError(f"Unsupported target language: {target_lang}")
    
    model, tokenizer = load_translation_model()
    device = next(model.parameters()).device
    
    # Set source language
    tokenizer.src_lang = src_code
    
    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Generate translation
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_code),
            max_length=512,
        )
    
    # Decode
    translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    
    return translation


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Hybrid translation:
    - Google Translate for Tagalog (better quality)
    - NLLB for Bikol (Google doesn't support it)
    """
    source_lower = source_lang.lower()
    target_lower = target_lang.lower()
    
    # Skip if same language
    if source_lower == target_lower:
        return text
    if source_lower in ("eng", "english") and target_lower in ("eng", "english"):
        return text
    if source_lower in ("tagalog", "fil") and target_lower in ("tagalog", "fil"):
        return text
    if source_lower in ("bikol", "bcl") and target_lower in ("bikol", "bcl"):
        return text
    
    # Check if we should use Google Translate (for Tagalog <-> English)
    use_google = (
        GOOGLE_TRANSLATE_API_KEY and
        source_lower in GOOGLE_LANGUAGE_CODES and
        target_lower in GOOGLE_LANGUAGE_CODES and
        (source_lower in USE_GOOGLE_TRANSLATE or target_lower in USE_GOOGLE_TRANSLATE)
    )
    
    if use_google:
        try:
            logger.info(f"Using Google Translate: {source_lang} → {target_lang}")
            return translate_with_google(text, source_lang, target_lang)
        except Exception as e:
            logger.error(f"Google Translate failed: {e}, falling back to NLLB")
    
    # Use NLLB for Bikol or as fallback
    logger.info(f"Using NLLB: {source_lang} → {target_lang}")
    return translate_with_nllb(text, source_lang, target_lang)


# ============================================
# Request/Response Models
# ============================================

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: Literal["bcl", "fil", "eng"] = Field(default=DEFAULT_LANGUAGE)


class STTResponse(BaseModel):
    text: str
    language: str


class HealthResponse(BaseModel):
    status: str
    tts_models_loaded: list[str]
    stt_model_loaded: bool
    stt_current_language: Optional[str]
    default_language: str
    supported_languages: list[str]


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    source_lang: str = Field(..., description="Source language: english, tagalog, bikol, eng, fil, bcl")
    target_lang: str = Field(..., description="Target language: english, tagalog, bikol, eng, fil, bcl")


class TranslateResponse(BaseModel):
    text: str
    source_lang: str
    target_lang: str


# ============================================
# FastAPI App
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MyNaga AI Service...")
    
    # Preload TTS models (optional)
    # Railway/Vercel requests can time out if the first request triggers a large model download/load.
    # Set PRELOAD_TTS_LANGUAGES="bcl,fil,eng" (or e.g. "bcl,fil") to warm models at startup.
    preload_env = os.environ.get("PRELOAD_TTS_LANGUAGES", "").strip()
    preload_langs = [DEFAULT_LANGUAGE]
    if preload_env:
        preload_langs = [x.strip() for x in preload_env.split(",") if x.strip()]

    for lang in preload_langs:
        try:
            load_tts_model(lang)
            logger.info(f"TTS model preloaded: {lang}")
        except Exception as e:
            logger.warning(f"Could not preload TTS model ({lang}): {e}")
    
    # STT model is loaded on-demand (it's 4GB)
    logger.info("STT model will be loaded on first request")
    
    yield
    
    logger.info("Shutting down AI service...")
    tts_models_cache.clear()
    tts_tokenizers_cache.clear()


app = FastAPI(
    title="MyNaga Gabay AI Service",
    description="TTS and STT for Bikol, Filipino, and English using Meta MMS",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# TTS Endpoint
# ============================================

@app.post("/tts", response_class=Response)
async def synthesize_speech(request: TTSRequest, _: None = Depends(require_ai_key)):
    """Convert text to speech audio (WAV)."""
    try:
        logger.info(f"TTS request: lang={request.language}, text='{request.text[:50]}...'")
        
        audio_bytes = text_to_speech(request.text, request.language)
        
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


# ============================================
# STT Endpoint
# ============================================

@app.post("/stt", response_model=STTResponse)
async def transcribe_speech(
    audio: UploadFile = File(..., description="Audio file (WAV, WebM, MP3)"),
    language: Literal["bcl", "fil", "eng"] = Form(default=DEFAULT_LANGUAGE),
    _: None = Depends(require_ai_key),
):
    """Convert speech audio to text."""
    try:
        logger.info(f"STT request: lang={language}, file={audio.filename}")
        
        # Read audio file
        audio_bytes = await audio.read()
        
        if len(audio_bytes) == 0:
            raise ValueError("Empty audio file")
        
        if len(audio_bytes) > 10 * 1024 * 1024:  # 10MB limit
            raise ValueError("Audio file too large (max 10MB)")
        
        # Transcribe
        transcription = speech_to_text(audio_bytes, language)
        
        logger.info(f"STT result: '{transcription[:50]}...'")
        
        return STTResponse(text=transcription, language=language)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise HTTPException(status_code=500, detail=f"STT failed: {str(e)}")


# ============================================
# Translation Endpoint
# ============================================

@app.post("/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest, _: None = Depends(require_ai_key)):
    """Translate text between Bikol, Tagalog, and English."""
    try:
        logger.info(f"Translate request: {request.source_lang} → {request.target_lang}, text='{request.text[:50]}...'")
        
        translated = translate_text(request.text, request.source_lang, request.target_lang)
        
        logger.info(f"Translation result: '{translated[:50]}...'")
        
        return TranslateResponse(
            text=translated,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


# ============================================
# Health & Info Endpoints
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check service health."""
    return HealthResponse(
        status="ok",
        tts_models_loaded=list(tts_models_cache.keys()),
        stt_model_loaded=stt_model is not None,
        stt_current_language=stt_current_lang,
        default_language=DEFAULT_LANGUAGE,
        supported_languages=list(TTS_MODELS.keys()),
    )


@app.get("/")
async def root():
    """Service info."""
    return {
        "service": "MyNaga Gabay AI Service",
        "version": "2.0.0",
        "endpoints": {
            "POST /tts": "Text-to-Speech",
            "POST /stt": "Speech-to-Text",
            "POST /translate": "Translation (Bikol/Tagalog/English)",
            "GET /health": "Health check",
        },
        "tts_languages": TTS_MODELS,
        "stt_languages": STT_LANGUAGE_CODES,
        "translation_languages": list(NLLB_LANGUAGE_CODES.keys()),
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("AI_SERVICE_PORT", os.environ.get("TTS_PORT", 8001)))
    host = os.environ.get("AI_SERVICE_HOST", os.environ.get("TTS_HOST", "0.0.0.0"))
    
    logger.info(f"Starting AI service on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
