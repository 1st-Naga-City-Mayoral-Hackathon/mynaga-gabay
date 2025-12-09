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
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# TTS Configuration
# ============================================

TTS_MODELS = {
    "bcl": "facebook/mms-tts-bcl",  # Bikol Central
    "fil": "facebook/mms-tts-fil",  # Filipino/Tagalog
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


def text_to_speech(text: str, language: str = DEFAULT_LANGUAGE) -> bytes:
    """Convert text to speech audio (WAV)."""
    model, tokenizer = load_tts_model(language)
    device = next(model.parameters()).device
    
    inputs = tokenizer(text, return_tensors="pt").to(device)
    
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


# ============================================
# FastAPI App
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MyNaga AI Service...")
    
    # Preload TTS model for Bikol
    try:
        load_tts_model(DEFAULT_LANGUAGE)
        logger.info("Bikol TTS model preloaded!")
    except Exception as e:
        logger.warning(f"Could not preload TTS model: {e}")
    
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
async def synthesize_speech(request: TTSRequest):
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
            "GET /health": "Health check",
        },
        "tts_languages": TTS_MODELS,
        "stt_languages": STT_LANGUAGE_CODES,
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("AI_SERVICE_PORT", os.environ.get("TTS_PORT", 8001)))
    host = os.environ.get("AI_SERVICE_HOST", os.environ.get("TTS_HOST", "0.0.0.0"))
    
    logger.info(f"Starting AI service on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
