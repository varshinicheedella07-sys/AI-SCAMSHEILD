from enum import Enum
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class ThreatLevel(str, Enum):
    SAFE = "Safe"
    SUSPICIOUS = "Suspicious"
    CRITICAL = "Critical Scam"


class SeverityLevel(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ThreatIndicator(BaseModel):
    category: str = Field(..., description="Category of threat: urgency, fake_bank, otp_theft, typosquatting, etc.")
    severity: SeverityLevel = Field(..., description="Severity level")
    description: str = Field(..., description="Plain-language explanation of why this was flagged")
    score_impact: int = Field(..., description="Points added to overall risk score (0-100)")
    evidence: Optional[str] = Field(None, description="Exact phrase or token flagged in input")


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Message content, SMS, WhatsApp text, or email body")
    url: Optional[str] = Field(None, description="Optional suspicious link/URL to scan")
    source: str = Field("sms", description="Source channel: sms, whatsapp, email, telegram, web")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "URGENT: Your SBI account has been locked. Verify KYC immediately at http://sbi-secure-kyc.xyz or funds will be seized within 2 hours.",
                "url": "http://sbi-secure-kyc.xyz",
                "source": "sms"
            }
        }


class AnalyzeResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Calibrated risk score between 0 and 100")
    classification: ThreatLevel = Field(..., description="Final assessment: Safe, Suspicious, or Critical Scam")
    summary: str = Field(..., description="Executive plain-text summary reasoning")
    indicators: List[ThreatIndicator] = Field(default_factory=list, description="List of granular explainable flags")
    recommendations: List[str] = Field(default_factory=list, description="Immediate protective actions for the user")
    matched_community_threats: List[str] = Field(default_factory=list, description="Signatures matched from collective intelligence DB")
    analyzed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    meta: Dict[str, str] = Field(default_factory=dict, description="Metadata including analysis latency and engine source")


class ReportRequest(BaseModel):
    threat_type: str = Field(..., description="Type of threat (e.g. phishing_sms, fake_bank, malicious_url)")
    content: str = Field(..., description="Full text or message received")
    url: Optional[str] = Field(None, description="Associated malicious URL if any")
    reporter_alias: Optional[str] = Field("Anonymous Contributor", description="Handle or alias of contributor")
    tags: List[str] = Field(default_factory=list, description="Descriptive tags (e.g. ['bank', 'kyc', 'india'])")
    notes: Optional[str] = Field(None, description="Context or additional notes")

    class Config:
        json_schema_extra = {
            "example": {
                "threat_type": "phishing_sms",
                "content": "Dear Customer, Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Call 9876543210 immediately.",
                "url": "https://elec-bill-pay.club",
                "reporter_alias": "CitizenGuard42",
                "tags": ["electricity", "disconnection", "urgent"],
                "notes": "Circulating on WhatsApp and SMS in Mumbai"
            }
        }


class CommunityThreat(BaseModel):
    id: str
    threat_type: str
    content: str
    url: Optional[str] = None
    risk_score: int
    classification: ThreatLevel
    reporter_alias: str
    verifications_count: int = 1
    tags: List[str] = Field(default_factory=list)
    created_at: str


class CommunityThreatsResponse(BaseModel):
    threats: List[CommunityThreat]
    total: int
    page: int = 1
    limit: int = 20


class UpvoteThreatResponse(BaseModel):
    id: str
    verifications_count: int
    message: str


class StatsResponse(BaseModel):
    total_scans: int
    scams_blocked: int
    community_signatures: int
    top_threat_categories: Dict[str, int]
    average_risk_score: float
    open_threat_intel_active: bool = True
