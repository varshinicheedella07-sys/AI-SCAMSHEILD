"""Unit and Integration Tests for AI ScamShield Backend."""

import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.models.schemas import AnalyzeRequest, ThreatLevel, ReportRequest
from app.services.scam_analyzer import scam_analyzer
from app.services.open_intelligence import threat_intel_service


def test_safe_message():
    print("[*] Testing safe personal message...")
    req = AnalyzeRequest(
        text="Hi Dad, can you pick up some groceries on your way home? Let me know what time you arrive.",
        source="sms"
    )
    res = scam_analyzer.analyze(req)
    assert res.classification == ThreatLevel.SAFE, f"Expected Safe, got {res.classification}"
    assert res.risk_score <= 30, f"Expected score <= 30, got {res.risk_score}"
    assert len(res.indicators) == 0, f"Expected 0 indicators, got {len(res.indicators)}"
    print(f"    PASS: Safe message scored {res.risk_score} ({res.classification.value})")


def test_urgent_bank_phishing():
    print("[*] Testing urgent bank KYC phishing message...")
    req = AnalyzeRequest(
        text="URGENT: Your SBI netbanking access has been locked. Verify KYC immediately at http://sbi-secure-kyc.xyz or funds will be seized within 24 hours.",
        url="http://sbi-secure-kyc.xyz",
        source="sms"
    )
    res = scam_analyzer.analyze(req)
    assert res.classification == ThreatLevel.CRITICAL, f"Expected Critical Scam, got {res.classification}"
    assert res.risk_score >= 70, f"Expected score >= 70, got {res.risk_score}"
    categories = [i.category for i in res.indicators]
    assert "urgency_manipulation" in categories, "Expected urgency indicator"
    assert any("typosquatting" in c for c in categories), "Expected typosquatting indicator"
    print(f"    PASS: Bank phish scored {res.risk_score} ({res.classification.value}) with {len(res.indicators)} indicators")


def test_ip_address_scam_url():
    print("[*] Testing IP-based suspicious link...")
    req = AnalyzeRequest(
        text="Your package delivery is on hold. Please update address at: http://192.168.1.100/track",
        url="http://192.168.1.100/track",
        source="sms"
    )
    res = scam_analyzer.analyze(req)
    categories = [i.category for i in res.indicators]
    assert "ip_based_url" in categories, "Expected IP-based URL indicator"
    assert res.risk_score >= 30, f"Expected score >= 30, got {res.risk_score}"
    print(f"    PASS: IP-based URL scored {res.risk_score} ({res.classification.value})")


def test_otp_theft():
    print("[*] Testing OTP credential harvest detection...")
    req = AnalyzeRequest(
        text="Bank alert: Please share your OTP verification code with our agent to prevent your credit card from being blocked right now.",
        source="whatsapp"
    )
    res = scam_analyzer.analyze(req)
    assert res.risk_score >= 50, f"Expected score >= 50, got {res.risk_score}"
    categories = [i.category for i in res.indicators]
    assert "credential_financial_trap" in categories, "Expected credential trap indicator"
    print(f"    PASS: OTP harvest scored {res.risk_score} ({res.classification.value})")


def test_crowdsourced_open_intelligence():
    print("[*] Testing Open Innovation collective threat reporting & retrieval...")
    initial_threats, initial_count = threat_intel_service.get_community_threats(limit=5)
    assert initial_count >= 1, "Expected seed threats in community database"

    # Add a crowdsourced report
    report = ReportRequest(
        threat_type="job_task_scam",
        content="Earn $500 daily by rating hotels on Google Maps. Send message to Telegram manager @QuickCash99.",
        reporter_alias="EthicalHacker007",
        tags=["job", "telegram", "google"]
    )
    new_threat = threat_intel_service.add_report(report, calculated_score=85, classification=ThreatLevel.CRITICAL)
    assert new_threat.id is not None
    assert new_threat.reporter_alias == "EthicalHacker007"

    # Upvote verification
    new_votes = threat_intel_service.upvote_threat(new_threat.id)
    assert new_votes == 2, f"Expected 2 votes, got {new_votes}"

    # Verify telemetry stats
    stats = threat_intel_service.get_stats()
    assert stats.community_signatures >= 1
    assert stats.open_threat_intel_active is True
    print(f"    PASS: Community threat reporting verified. Total signatures: {stats.community_signatures}")


if __name__ == "__main__":
    print("=" * 60)
    print("Starting AI ScamShield Automated Test Suite")
    print("=" * 60)
    test_safe_message()
    test_urgent_bank_phishing()
    test_ip_address_scam_url()
    test_otp_theft()
    test_crowdsourced_open_intelligence()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! (5/5)")
    print("=" * 60)
