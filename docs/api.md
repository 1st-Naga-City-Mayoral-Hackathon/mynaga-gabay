# MyNaga Gabay API Documentation

## Base URL
- Development: `http://localhost:4000`
- Production: `https://api.mynaga-gabay.com` (TBD)

---

## Authentication
Currently no authentication required (MVP). Production will use Supabase Auth.

---

## Endpoints

### Chat

#### `POST /api/chat`
Main chat endpoint for the Gabay health assistant.

**Request Body:**
```json
{
  "message": "Ano ang gamot sa sakit ng ulo?",
  "language": "fil",
  "sessionId": "optional-session-id"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's message or question |
| language | string | No | `en`, `fil`, or `bcl`. Default: `fil` |
| sessionId | string | No | Session ID for conversation context |

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Para sa sakit ng ulo, pwede mong inumin ang Paracetamol...",
    "language": "fil",
    "sources": [
      {
        "type": "medication",
        "title": "Paracetamol",
        "relevance": 0.92
      }
    ]
  }
}
```

---

### Health Check

#### `GET /api/health`
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-05T12:00:00Z",
  "uptime": 3600
}
```

#### `GET /api/health/readiness`
Readiness check for deployments.

**Response:**
```json
{
  "ready": true,
  "checks": {
    "claude": true,
    "supabase": true
  }
}
```

---

### Facilities

#### `GET /api/facilities`
List health facilities in Naga City.

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| type | string | Filter by type: `hospital`, `health_center`, `clinic`, `pharmacy` |
| barangay | string | Filter by barangay name |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "fac-001",
      "name": "Bicol Medical Center",
      "type": "hospital",
      "address": "Concepcion Grande, Naga City",
      "phone": "(054) 472-3456",
      "hours": "24/7",
      "services": ["Emergency", "Surgery", "OB-Gyne"],
      "philhealthAccredited": true
    }
  ]
}
```

#### `GET /api/facilities/:id`
Get specific facility details.

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**Error Codes:**
| Code | Status | Description |
|------|--------|-------------|
| MISSING_MESSAGE | 400 | Message field is required |
| NOT_FOUND | 404 | Resource not found |
| CHAT_ERROR | 500 | Failed to process chat request |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Rate Limiting
MVP has no rate limiting. Production should implement:
- 100 requests/minute per IP
- 1000 requests/day per user
