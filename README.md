# AI ScamShield 🛡️
### Open Innovation Collective Threat Intelligence & AI Phishing Detector

[![Domain](https://img.shields.io/badge/Domain-Open%20Innovation-blue.svg)](https://github.com)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20Tailwind-000000.svg)](https://nextjs.org)
[![Risk Engine](https://img.shields.io/badge/AI%20Engine-Explainable%20NLP%20%2B%20Heuristics-cyan.svg)](#)

**AI ScamShield** is an end-to-end open innovation cybersecurity prototype designed to detect, explain, and neutralize fraudulent communications in real time. It analyzes suspicious SMS, WhatsApp messages, emails, and scam URLs by combining **Explainable AI (XAI)**, multi-signal NLP heuristic classifiers, domain typosquatting detection, and a **crowdsourced threat intelligence mesh**.

---

## 🌟 Key Features

1. **Multi-Signal Text & SMS Scam Analyzer**:
   - **Urgency Manipulation Detection**: Detects psychological pressure ("immediately", "within 2 hours", "power disconnected tonight").
   - **Bank & Brand Impersonation**: Identifies fake notices masquerading as SBI, HDFC, Chase, PayPal, IRS, FedEx, and Netflix.
   - **Credential Theft Traps**: Flags attempts to harvest OTPs, PINs, passwords, PAN/KYC details, and bank account logins.
   - **Ponzi & Task Frauds**: Flags YouTube video liking scams, Telegram crypto doubling giveaways, and fake remote job lures.

2. **Domain & URL Scanner**:
   - **Typosquatting & Homoglyphs**: Detects character substitution trickery mimicking high-profile institutions (e.g. `sbi-secure-kyc.xyz`, `paypa1.com`).
   - **Suspicious TLDs**: Flags high-risk throwaway extensions (`.xyz`, `.top`, `.buzz`, `.club`, `.work`).
   - **Direct IP URLs**: Flags unmapped IP-based hosts (e.g., `http://192.168.1.10/login`).
   - **Link Shortener Detection**: Warns when URLs obscure their final destination via bit.ly, tinyurl, etc.

3. **Calibrated Risk Scoring Engine (0–100)**:
   - Outputs a transparent, calibrated score from 0 to 100.
   - Distinct classifications: **`Safe`** (0–30), **`Suspicious`** (31–70), and **`Critical Scam`** (71–100).
   - Generates actionable, tailored safety countermeasures.

4. **Explainable AI (XAI) Attribution**:
   - Every flagged issue comes with a category, severity level (`CRITICAL`, `HIGH`, `MEDIUM`), score impact (`+25 pts`), plain-language rationale, and exact quoted evidence tokens.

5. **Open Innovation Collective Threat Database**:
   - Backed by SQLite with automatic seeding of real-world scam signatures.
   - Community citizens can submit new scam sightings via `POST /api/v1/report`.
   - Community members can upvote and verify known signatures.
   - Public Developer Mesh API (`GET /api/v1/community-threats`) allowing telecom firewalls, SMS apps, and extensions to pull live scam signatures.

---

## 📁 Modular Monorepo Architecture

```
ai-scamsheild/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application with CORS & OpenAPI docs
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # /analyze, /report, /community-threats, /stats
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py           # Typed Pydantic v2 schemas
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── scam_analyzer.py     # NLP urgency, OTP harvester & URL scanner
│   │       └── open_intelligence.py # Crowdsourced SQLite threat DB & seed data
│   ├── tests/
│   │   └── test_analyzer.py         # Automated test suite (5/5 tests passing)
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          # Dark cyber styling & glowing scrollbars
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx             # Interactive dashboard view
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Branding & Open Innovation status
│   │   │   ├── StatsBanner.tsx      # Real-time scan & blocked scam counters
│   │   │   ├── AnalyzerForm.tsx     # Message/URL console with 5 quick presets
│   │   │   ├── ThreatMeter.tsx      # Radial SVG gauge & risk meter (0-100)
│   │   │   ├── ExplainableBreakdown.tsx # XAI reasoning cards & recommendations
│   │   │   ├── CommunityFeed.tsx    # Live crowdsourced signatures feed
│   │   │   ├── ReportModal.tsx      # Public scam report submission modal
│   │   │   └── DeveloperApiCard.tsx # External Developer API documentation
│   │   ├── services/
│   │   │   └── api.ts               # Typed client with offline simulation fallback
│   │   └── types/
│   │       └── index.ts             # TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.mjs
│   ├── .env.example
│   └── .env.local
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup & Run (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create & activate a virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
python tests/test_analyzer.py

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be running at `http://localhost:8000`.
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

---

### 2. Frontend Setup & Run (Next.js 14)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser to access the dashboard.

---

## 📡 Core API Reference

### 1. `POST /api/v1/analyze`
Analyzes input text and/or URL for fraud indicators.

**Request:**
```json
{
  "text": "URGENT: Your SBI account has been locked. Verify KYC immediately at http://sbi-secure-kyc.xyz or funds will be seized within 2 hours.",
  "url": "http://sbi-secure-kyc.xyz",
  "source": "sms"
}
```

**Response:**
```json
{
  "risk_score": 100,
  "classification": "Critical Scam",
  "summary": "High probability malicious scam detected! Multi-signal analysis revealed urgent manipulation, credential harvesting, or deceptive links.",
  "indicators": [
    {
      "category": "urgency_manipulation",
      "severity": "HIGH",
      "description": "Immediate action demanded",
      "score_impact": 15,
      "evidence": "immediately"
    },
    {
      "category": "typosquatting_brand_impersonation",
      "severity": "CRITICAL",
      "description": "Domain 'sbi-secure-kyc.xyz' impersonates brand 'SBI' without being the legitimate verified web property.",
      "score_impact": 35,
      "evidence": "sbi-secure-kyc.xyz"
    }
  ],
  "recommendations": [
    "DO NOT click any embedded links or call phone numbers mentioned in the message.",
    "NEVER share One-Time Passwords (OTP), PINs, or bank account credentials.",
    "Report and block the sender immediately on SMS / WhatsApp."
  ],
  "matched_community_threats": [
    "Known malicious domain match: http://sbi-yono-kyc.top (Reported by OpenShield_Core)"
  ]
}
```

---

### 2. `POST /api/v1/report`
Crowdsources a new scam signature to the collective pool.

**Request:**
```json
{
  "threat_type": "urgent_utility_scam",
  "content": "Dear consumer, your electricity will be disconnected tonight at 9:30 PM. Call power officer: 9876543210",
  "url": null,
  "reporter_alias": "CitizenGuard42",
  "tags": ["electricity", "utility", "urgent"]
}
```

---

### 3. `GET /api/v1/community-threats`
Open Innovation API for external developers to pull community scam trends.

**Query Parameters:**
- `limit` (default: 20)
- `page` (default: 1)
- `tag` (optional tag filter)
- `search` (optional search keyword)

---

### 4. `POST /api/v1/community-threats/{threat_id}/upvote`
Upvotes / confirms a verified community threat signature.

---

### 5. `GET /api/v1/stats`
Telemetry statistics (total scans, scams blocked, community signatures, risk distribution).

---

## 🧪 Verification & Automated Testing

Run the included automated test suite:
```bash
python backend/tests/test_analyzer.py
```
Output:
```
============================================================
Starting AI ScamShield Automated Test Suite
============================================================
[*] Testing safe personal message...
    PASS: Safe message scored 0 (Safe)
[*] Testing urgent bank KYC phishing message...
    PASS: Bank phish scored 100 (Critical Scam) with 7 indicators
[*] Testing IP-based suspicious link...
    PASS: IP-based URL scored 57 (Suspicious)
[*] Testing OTP credential harvest detection...
    PASS: OTP harvest scored 100 (Critical Scam)
[*] Testing Open Innovation collective threat reporting & retrieval...
    PASS: Community threat reporting verified. Total signatures: 7
============================================================
ALL TESTS PASSED SUCCESSFULLY! (5/5)
============================================================
```

---

## 🛡️ License & Open Innovation Notice
Developed under the **Open Innovation** framework. Community threat signatures and datasets are openly accessible to empower researchers, developers, and telecom providers against global digital fraud.
