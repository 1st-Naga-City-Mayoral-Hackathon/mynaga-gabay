# Prescription Photo Explainer - Implementation Plan

> **Status**: Planned  
> **Target**: Extend Python AI Service (`packages/ai/src/tts_service.py`)

---

## Overview

Add prescription photo scanning capability to the existing Python AI service. Users can upload a photo of their prescription and get an explanation in Bikol/Filipino/English.

## Architecture Decision

**Chosen: Option 1 - Extend Python AI Service**

Consolidate all AI/ML features into a single Python service:

```
packages/ai/
├── src/
│   ├── tts_service.py      → ai_service.py (rename)
│   ├── ocr/
│   │   └── prescription.py  # OCR extraction
│   └── bikol_translator.py  # Existing
└── requirements.txt         # + OCR dependencies
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/tts` | POST | Text-to-Speech (existing) |
| `/prescription` | POST | Scan & explain prescription |
| `/health` | GET | Health check |

---

## Implementation Details

### Phase 1: OCR Integration

```python
# New dependencies
pytesseract  # Tesseract OCR wrapper
Pillow       # Image processing
easyocr      # Alternative OCR (better for handwriting)
```

### Phase 2: Prescription Endpoint

```python
@app.post("/prescription")
async def analyze_prescription(file: UploadFile):
    # 1. Extract text from image using OCR
    # 2. Call Claude API to explain medications
    # 3. Return explanation in selected language
    pass
```

### Phase 3: Frontend Integration

- Add upload button in chat UI
- Display extracted medication info
- TTS for spoken explanation

---

## Benefits of This Approach

1. **Single Python service** - easier to manage/deploy
2. **Shared dependencies** - PyTorch, transformers already installed
3. **Consistent API** - same host/port for all AI features
4. **Model caching** - efficient memory usage

---

## Future Extensibility

This pattern allows adding more AI features:
- Speech-to-Text (Whisper model)
- Medication image recognition
- Health document summarization

---

## Dependencies to Add

```txt
# requirements.txt additions
pytesseract>=0.3.10
Pillow>=10.0.0
easyocr>=1.7.0
anthropic>=0.18.0  # For Claude API
```

Also requires system package: `apt-get install tesseract-ocr tesseract-ocr-fil`
