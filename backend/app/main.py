"""Main FastAPI Application for AI ScamShield."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router as api_router
from .services.open_intelligence import threat_intel_service

# Load CORS origins
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app = FastAPI(
    title="AI ScamShield API",
    description="""
# AI ScamShield 🛡️
### Open Innovation Threat Intelligence & AI Phishing Detector

An end-to-end protective shield leveraging AI-driven NLP classification,
domain heuristics, and collective threat intelligence to detect and explain
phishing attempts, fake bank alerts, and scam URLs in real-time.

---
### Key Features:
- **Real-time Threat Scoring**: 0–100 calibrated risk scoring.
- **Explainable AI (XAI)**: Granular reasoning breakdowns with evidence quotes.
- **Typosquatting & Malicious URL Scanner**: Detects fake domains, raw IPs, and deceptive TLDs.
- **Crowdsourced Intelligence**: Open repository where citizens contribute and verify scam signatures.
- **Developer API**: Public feed for external security researchers (`/api/v1/community-threats`).
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend and external integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": "AI ScamShield",
        "domain": "Open Innovation",
        "status": "online",
        "documentation": "/docs",
        "endpoints": {
            "analyze": "POST /api/v1/analyze",
            "report": "POST /api/v1/report",
            "community_threats": "GET /api/v1/community-threats",
            "telemetry_stats": "GET /api/v1/stats",
            "health": "GET /api/v1/health"
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
