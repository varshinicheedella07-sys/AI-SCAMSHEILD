"""API Routes for AI ScamShield."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from ..models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ReportRequest,
    CommunityThreat,
    CommunityThreatsResponse,
    UpvoteThreatResponse,
    StatsResponse,
)
from ..services.scam_analyzer import scam_analyzer
from ..services.open_intelligence import threat_intel_service

router = APIRouter(prefix="/api/v1", tags=["ScamShield"])


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze suspicious message or URL",
    description="Analyzes input text and/or URL for urgency manipulation, fake bank alerts, credential harvesting, typosquatting, and crowdsourced threat signatures."
)
async def analyze_threat(request: AnalyzeRequest):
    if not request.text.strip() and not (request.url and request.url.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either message text or URL must be provided."
        )
    return scam_analyzer.analyze(request)


@router.post(
    "/report",
    response_model=CommunityThreat,
    status_code=status.HTTP_201_CREATED,
    summary="Crowdsource report a new scam signature",
    description="Submits a verified scam message or link to the Open Innovation collective threat database."
)
async def report_threat(report: ReportRequest):
    if not report.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report content cannot be empty."
        )

    # Automatically analyze the reported content to calibrate initial risk score
    analysis = scam_analyzer.analyze(AnalyzeRequest(
        text=report.content,
        url=report.url,
        source="community_report"
    ))

    new_threat = threat_intel_service.add_report(
        report=report,
        calculated_score=analysis.risk_score,
        classification=analysis.classification
    )
    return new_threat


@router.get(
    "/community-threats",
    response_model=CommunityThreatsResponse,
    summary="Fetch live crowdsourced threat intelligence",
    description="Public Open Innovation API endpoint for developers and applications to consume collective threat intelligence."
)
async def get_community_threats(
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    page: int = Query(1, ge=1, description="Page number"),
    tag: Optional[str] = Query(None, description="Filter by tag (e.g. 'bank', 'kyc', 'utility')"),
    search: Optional[str] = Query(None, description="Full-text search keyword")
):
    threats, total = threat_intel_service.get_community_threats(
        limit=limit,
        page=page,
        tag=tag,
        search=search
    )
    return CommunityThreatsResponse(
        threats=threats,
        total=total,
        page=page,
        limit=limit
    )


@router.post(
    "/community-threats/{threat_id}/upvote",
    response_model=UpvoteThreatResponse,
    summary="Upvote / confirm a community threat signature"
)
async def upvote_threat(threat_id: str):
    new_count = threat_intel_service.upvote_threat(threat_id)
    if new_count is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Threat signature with ID '{threat_id}' not found."
        )
    return UpvoteThreatResponse(
        id=threat_id,
        verifications_count=new_count,
        message="Community verification recorded successfully."
    )


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Get threat intelligence telemetry",
    description="Returns aggregate scan counts, blocked scams, and distribution of threat types."
)
async def get_stats():
    return threat_intel_service.get_stats()


@router.get(
    "/health",
    summary="System Health & Diagnostic Check"
)
async def health_check():
    return {
        "status": "healthy",
        "service": "AI ScamShield API",
        "version": "1.0.0",
        "domain": "Open Innovation",
        "features": [
            "NLP Urgency Detection",
            "Bank Impersonation Detection",
            "Typosquatting & Suspicious TLD Scanner",
            "Collective Crowdsourced Threat Feed",
            "Explainable AI Risk Scoring"
        ]
    }
