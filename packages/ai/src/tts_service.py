"""
Bikol Text-to-Speech Service using Meta MMS
============================================

Uses facebook/mms-tts-bcl for Bikol (Central) text-to-speech synthesis.
This is one of the few AI models that supports Bikolano language!

Run with:
    cd packages/ai
    pip install -r requirements.txt
    python src/tts_service.py

API:
    POST /tts - Convert text to speech
    GET /health - Health check
"""

import io
import os
import logging
from typing import Optional, Literal
from contextlib import asynccontextmanager

import torch
import scipy.io.wavfile
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supported languages and their MMS model names
LANGUAGE_MODELS = {
    "bcl": "facebook/mms-tts-bcl",  # Bikol Central
    "fil": "facebook/mms-tts-fil",  # Filipino/Tagalog
    "eng": "facebook/mms-tts-eng",  # English
}

# Default language
DEFAULT_LANGUAGE = "bcl"

# Model cache to avoid reloading
models_cache: dict = {}
tokenizers_cache: dict = {}


def load_model(language: str):
    """
    Load TTS model and tokenizer for the specified language.
    Models are cached in memory after first load.
    """
    if language not in LANGUAGE_MODELS:
        raise ValueError(f"Unsupported language: {language}. Supported: {list(LANGUAGE_MODELS.keys())}")
    
    model_name = LANGUAGE_MODELS[language]
    
    if language not in models_cache:
        logger.info(f"Loading TTS model: {model_name} (this may take a moment on first run...)")
        
        from transformers import VitsModel, AutoTokenizer
        
        # Load model and tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = VitsModel.from_pretrained(model_name)
        
        # Move to GPU if available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        # Cache for reuse
        tokenizers_cache[language] = tokenizer
        models_cache[language] = model
        
        logger.info(f"Model loaded successfully on {device}")
    
    return models_cache[language], tokenizers_cache[language]


def text_to_speech(text: str, language: str = DEFAULT_LANGUAGE) -> bytes:
    """
    Convert text to speech audio.
    
    Args:
        text: Text to synthesize
        language: Language code (bcl, fil, eng)
    
    Returns:
        WAV audio bytes
    """
    model, tokenizer = load_model(language)
    device = next(model.parameters()).device
    
    # Tokenize input
    inputs = tokenizer(text, return_tensors="pt").to(device)
    
    # Generate speech
    with torch.no_grad():
        output = model(**inputs).waveform
    
    # Convert to numpy - handle the output shape properly
    waveform = output.squeeze().cpu().numpy()
    
    # Get sampling rate from model config
    sampling_rate = model.config.sampling_rate
    
    # Convert to WAV bytes
    buffer = io.BytesIO()
    scipy.io.wavfile.write(buffer, rate=sampling_rate, data=waveform)
    buffer.seek(0)
    
    return buffer.read()


# Request/Response models
class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to synthesize")
    language: Literal["bcl", "fil", "eng"] = Field(
        default=DEFAULT_LANGUAGE, 
        description="Language code: bcl (Bikol), fil (Filipino), eng (English)"
    )


class HealthResponse(BaseModel):
    status: str
    models_loaded: list[str]
    default_language: str
    supported_languages: list[str]


# App lifecycle - preload default model
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: preload Bikol model
    logger.info("Starting TTS service...")
    try:
        load_model(DEFAULT_LANGUAGE)
        logger.info("Bikol TTS model preloaded successfully!")
    except Exception as e:
        logger.warning(f"Could not preload model (will load on first request): {e}")
    
    yield
    
    # Shutdown: cleanup
    logger.info("Shutting down TTS service...")
    models_cache.clear()
    tokenizers_cache.clear()


# Create FastAPI app
app = FastAPI(
    title="MyNaga Gabay TTS Service",
    description="Text-to-Speech for Bikol, Filipino, and English using Meta MMS",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/tts", response_class=Response)
async def synthesize_speech(request: TTSRequest):
    """
    Convert text to speech audio.
    
    Returns WAV audio file.
    """
    try:
        logger.info(f"TTS request: lang={request.language}, text='{request.text[:50]}...'")
        
        audio_bytes = text_to_speech(request.text, request.language)
        
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav"
            }
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check service health and loaded models."""
    return HealthResponse(
        status="ok",
        models_loaded=list(models_cache.keys()),
        default_language=DEFAULT_LANGUAGE,
        supported_languages=list(LANGUAGE_MODELS.keys()),
    )


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "MyNaga Gabay TTS",
        "description": "Bikol Text-to-Speech powered by Meta MMS",
        "endpoints": {
            "POST /tts": "Convert text to speech",
            "GET /health": "Health check",
        },
        "languages": LANGUAGE_MODELS,
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("TTS_PORT", 8001))
    host = os.environ.get("TTS_HOST", "0.0.0.0")
    
    logger.info(f"Starting TTS service on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
