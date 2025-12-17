"""
Image Preprocessor Service
==========================

Optimizes prescription images for OCR:
- Converts to greyscale (removes colored paper noise)
- Enhances contrast (helps faint ink pop)
- Resizes to stay under Groq's 4MB limit

This service is called by n8n before sending to Groq Vision.
"""

import io
import base64
import logging
import os
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageEnhance

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# FastAPI App
# ============================================

app = FastAPI(
    title="MyNaga Gabay Image Preprocessor",
    description="Prescription image optimization for OCR",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Response Models
# ============================================

class PreprocessResponse(BaseModel):
    success: bool
    image_base64: str
    image_data_url: str  # Ready-to-use data URL for n8n
    original_size_kb: int
    processed_size_kb: int
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


# ============================================
# Image Processing Functions
# ============================================

def preprocess_image(
    file_bytes: bytes,
    enhance_contrast: float = 1.5,
    max_dimension: int = 1568,
    jpeg_quality: int = 85
) -> tuple[str, int, int]:
    """
    Optimizes image for OCR.
    
    Args:
        file_bytes: Raw image bytes
        enhance_contrast: Contrast enhancement factor (1.0 = no change)
        max_dimension: Maximum width/height in pixels
        jpeg_quality: JPEG compression quality (1-95)
    
    Returns:
        tuple: (base64_string, original_size_kb, processed_size_kb)
    """
    original_size = len(file_bytes) // 1024
    
    # Open image
    image = Image.open(io.BytesIO(file_bytes))
    original_format = image.format
    logger.info(f"Original image: {image.size}, format={original_format}")
    
    # 1. Convert to Greyscale (removes colored paper noise)
    # This helps with handwritten prescriptions on colored paper
    image = image.convert('L')
    
    # 2. Increase Contrast (helps faint ink pop)
    # Handwritten prescriptions often have light ink
    if enhance_contrast != 1.0:
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(enhance_contrast)
    
    # 3. Resize to stay under Groq's 4MB limit
    # Using thumbnail preserves aspect ratio
    image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
    logger.info(f"Resized image: {image.size}")
    
    # 4. Convert to JPEG base64
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=jpeg_quality)
    processed_bytes = buffered.getvalue()
    processed_size = len(processed_bytes) // 1024
    
    base64_string = base64.b64encode(processed_bytes).decode('utf-8')
    
    logger.info(f"Preprocessing complete: {original_size}KB -> {processed_size}KB")
    
    return base64_string, original_size, processed_size


# ============================================
# API Endpoints
# ============================================

@app.post("/preprocess", response_model=PreprocessResponse)
async def preprocess_prescription(
    file: UploadFile = File(...),
    contrast: Optional[float] = Form(1.5),
    max_size: Optional[int] = Form(1568)
):
    """
    Preprocess a prescription image for OCR.
    
    - **file**: Image file (JPEG, PNG, etc.)
    - **contrast**: Contrast enhancement factor (default: 1.5)
    - **max_size**: Maximum dimension in pixels (default: 1568)
    
    Returns base64 encoded optimized image ready for Groq Vision.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, etc.)"
        )
    
    try:
        # Read file
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")
        
        # Preprocess
        base64_img, orig_size, proc_size = preprocess_image(
            file_bytes,
            enhance_contrast=contrast,
            max_dimension=max_size
        )
        
        # Create data URL for easy use in n8n
        data_url = f"data:image/jpeg;base64,{base64_img}"
        
        return PreprocessResponse(
            success=True,
            image_base64=base64_img,
            image_data_url=data_url,
            original_size_kb=orig_size,
            processed_size_kb=proc_size,
            message=f"Image optimized: {orig_size}KB -> {proc_size}KB"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to preprocess image: {str(e)}"
        )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        service="image-preprocessor",
        version="1.0.0"
    )


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "MyNaga Gabay Image Preprocessor",
        "version": "1.0.0",
        "description": "Prescription image optimization for OCR",
        "endpoints": {
            "POST /preprocess": "Preprocess prescription image",
            "GET /health": "Health check",
        }
    }


# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PREPROCESSOR_PORT", 8002))
    host = os.environ.get("PREPROCESSOR_HOST", "0.0.0.0")
    
    logger.info(f"Starting Image Preprocessor on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
