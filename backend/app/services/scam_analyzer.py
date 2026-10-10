"""AI Scam Analyzer & Risk Scoring Engine.

Combines multi-layer heuristics, NLP token/phrase inspection,
typosquatting & domain reputation algorithms, and crowdsourced threat matching.
"""

import re
import os
import time
from urllib.parse import urlparse
from typing import List, Tuple, Optional, Dict
from ..models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    ThreatIndicator,
    ThreatLevel,
    SeverityLevel,
)
from .open_intelligence import threat_intel_service


# High-profile targets for typosquatting / impersonation
PROTECTED_BRANDS = [
    "paypal", "chase", "bankofamerica", "wellsfargo", "citibank",
    "sbi", "hdfc", "icici", "axis", "kotak", "pnb",
    "apple", "google", "microsoft", "amazon", "netflix",
    "meta", "whatsapp", "telegram", "irs", "usps", "fedex", "dhl"
]

SUSPICIOUS_TLDS = {
    "xyz", "top", "buzz", "club", "work", "rest", "icu",
    "monster", "online", "site", "space", "fit", "tk", "ml", "ga", "cf", "gq"
}

KNOWN_SHORTENERS = {"bit.ly", "tinyurl.com", "is.gd", "t.co", "ow.ly", "cutt.ly", "rb.gy"}

URGENCY_PATTERNS = [
    (r"\b(immediately|urgent|urgently|right now|without delay)\b", "Immediate action demanded", 15),
    (r"\b(within\s+\d+\s+(hours?|mins?|minutes?|days?))\b", "Strict artificial deadline enforced", 18),
    (r"\b((account|card|credit card|debit card|service)\s+(will be|has been|from being|is)\s+(suspended|blocked|locked|terminated|deactivated|frozen))\b", "Account/Card suspension scare tactic", 25),
    (r"\b(legal action|police complaint|arrest warrant|court summons|fbi|cbi)\b", "Authority/Legal intimidation threat", 30),
    (r"\b(disconnected (tonight|today|at \d+)|power cut)\b", "Utility disconnection pressure", 24),
    (r"\b(funds will be seized|fine of \$?\d+|penalty)\b", "Financial penalty intimidation", 22),
]

FINANCIAL_TRAP_PATTERNS = [
    (r"\b(share your otp|enter otp|provide otp|tell me the otp|send otp|share.*(pin|password|cvv))\b", "Explicit credential sharing demand (OTP/PIN/CVV)", 30),
    (r"\b(otp|one time password|verification code|pin|cvv)\b", "Requests or references security credentials (OTP/PIN/CVV)", 25),
    (r"\b(pan card|kyc verification|update kyc|link aadhaar|verify identity)\b", "Identity/KYC credential extraction attempt", 25),
    (r"\b(unclaimed (tax )?refund|lottery winner|lucky draw|won \$?\d+)\b", "Unsolicited windfall / lottery lure", 25),
    (r"\b(part[- ]time job|earn \$\d+[- ]\$\d+ daily|like (youtube|tiktok) videos)\b", "Fake freelance/task commission scam lure", 25),
    (r"\b(crypto giveaway|double your (btc|eth|crypto)|2x return)\b", "Crypto multiplier / Ponzi scheme lure", 28),
    (r"\b(delivery failed|unpaid customs|redelivery fee|package pending)\b", "Courier / postal fee smishing trap", 22),
]

IMPERSONATION_KEYWORDS = [
    "sbi", "hdfc", "icici", "axis bank", "chase bank", "wells fargo",
    "bank of america", "paypal", "irs department", "income tax department",
    "fedex security", "usps notice", "netflix billing", "apple id support"
]


class ScamAnalyzerService:
    def __init__(self):
        self.hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
        self.litellm_api_key = os.getenv("LITELLM_API_KEY")

    def extract_urls(self, text: str) -> List[str]:
        """Extracts any URLs embedded in the text."""
        url_regex = r"(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|buzz|club|com|net|org|in|online|site|gov)/[^\s]*)"
        matches = re.findall(url_regex, text, re.IGNORECASE)
        cleaned = []
        for m in matches:
            m_clean = m.rstrip(".,;!?)")
            if not m_clean.startswith("http://") and not m_clean.startswith("https://"):
                m_clean = "http://" + m_clean
            cleaned.append(m_clean)
        return cleaned

    def scan_url(self, url_str: str) -> List[ThreatIndicator]:
        """Deeply inspects URL for typosquatting, suspicious TLDs, IP hosts, and homographs."""
        indicators = []
        try:
            parsed = urlparse(url_str)
            domain = (parsed.hostname or "").lower()
            if not domain:
                return indicators

            # 1. Direct IP Address Check
            ip_pattern = r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"
            if re.match(ip_pattern, domain):
                indicators.append(ThreatIndicator(
                    category="ip_based_url",
                    severity=SeverityLevel.HIGH,
                    description=f"Destination '{domain}' is a raw IP address instead of a verified registered domain.",
                    score_impact=25,
                    evidence=domain
                ))

            # 2. Suspicious TLD Check
            tld = domain.split(".")[-1]
            if tld in SUSPICIOUS_TLDS:
                indicators.append(ThreatIndicator(
                    category="suspicious_tld",
                    severity=SeverityLevel.HIGH,
                    description=f"Domain uses high-risk top-level domain (.{tld}) commonly leveraged for throwaway phishing sites.",
                    score_impact=20,
                    evidence=f".{tld}"
                ))

            # 3. Typosquatting & Brand Impersonation
            for brand in PROTECTED_BRANDS:
                # Check for brand in domain but domain is not official brand domain
                if brand in domain:
                    official_domains = [f"{brand}.com", f"{brand}.org", f"{brand}.co.in", f"{brand}.gov"]
                    is_official = any(domain == off or domain.endswith("." + off) for off in official_domains)
                    if not is_official:
                        indicators.append(ThreatIndicator(
                            category="typosquatting_brand_impersonation",
                            severity=SeverityLevel.CRITICAL,
                            description=f"Domain '{domain}' impersonates brand '{brand.upper()}' without being the legitimate verified web property.",
                            score_impact=35,
                            evidence=domain
                        ))
                        break

            # 4. Homoglyphs & Leetspeak Substitutions (e.g. paypa1, amaz0n)
            leetspeak_rules = [
                ("0", "o"), ("1", "l"), ("1", "i"), ("vv", "w"), ("rn", "m")
            ]
            normalized_domain = domain
            for bad, good in leetspeak_rules:
                normalized_domain = normalized_domain.replace(bad, good)
            for brand in PROTECTED_BRANDS:
                if brand in normalized_domain and brand not in domain:
                    indicators.append(ThreatIndicator(
                        category="homoglyph_deception",
                        severity=SeverityLevel.CRITICAL,
                        description=f"Detected character substitution trickery mimicking '{brand.upper()}'.",
                        score_impact=30,
                        evidence=domain
                    ))
                    break

            # 5. Excessive Subdomain Trickery (e.g. sbi.security.verification.fake-site.com)
            parts = domain.split(".")
            if len(parts) >= 4:
                indicators.append(ThreatIndicator(
                    category="excessive_subdomains",
                    severity=SeverityLevel.MEDIUM,
                    description="Excessive subdomains detected, often used to camouflage true malicious hosting origin.",
                    score_impact=15,
                    evidence=domain
                ))

            # 6. URL Shortener Masking
            if domain in KNOWN_SHORTENERS:
                indicators.append(ThreatIndicator(
                    category="url_shortener",
                    severity=SeverityLevel.LOW,
                    description="Uses a link shortener to obfuscate final destination. Verify true endpoint before clicking.",
                    score_impact=10,
                    evidence=domain
                ))

            # 7. Insecure HTTP on Sensitive Action
            if parsed.scheme == "http":
                indicators.append(ThreatIndicator(
                    category="unencrypted_protocol",
                    severity=SeverityLevel.LOW,
                    description="Plain HTTP protocol used with no SSL encryption.",
                    score_impact=10,
                    evidence="http://"
                ))

        except Exception as e:
            indicators.append(ThreatIndicator(
                category="malformed_url",
                severity=SeverityLevel.LOW,
                description=f"Malformed URL structure: {str(e)}",
                score_impact=5,
                evidence=url_str
            ))

        return indicators

    def scan_text(self, text: str) -> List[ThreatIndicator]:
        """Analyzes text semantics for urgency, financial triggers, and impersonation."""
        indicators = []
        text_lower = text.lower()

        # 1. Urgency Tactics
        for pattern, desc, impact in URGENCY_PATTERNS:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                indicators.append(ThreatIndicator(
                    category="urgency_manipulation",
                    severity=SeverityLevel.HIGH if impact >= 20 else SeverityLevel.MEDIUM,
                    description=desc,
                    score_impact=impact,
                    evidence=match.group(0)
                ))

        # 2. Financial & Credential Traps
        for pattern, desc, impact in FINANCIAL_TRAP_PATTERNS:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                indicators.append(ThreatIndicator(
                    category="credential_financial_trap",
                    severity=SeverityLevel.CRITICAL if impact >= 25 else SeverityLevel.HIGH,
                    description=desc,
                    score_impact=impact,
                    evidence=match.group(0)
                ))

        # 3. Known Institution Impersonation
        for institution in IMPERSONATION_KEYWORDS:
            if institution in text_lower:
                indicators.append(ThreatIndicator(
                    category="brand_impersonation",
                    severity=SeverityLevel.MEDIUM,
                    description=f"Message references high-profile institution '{institution.title()}'. Verify via official channels.",
                    score_impact=15,
                    evidence=institution
                ))
                break

        # 4. Generic Phone/Contact harvesting
        phone_match = re.search(r"\b(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b|\b\d{10}\b", text)
        if phone_match and ("call" in text_lower or "contact" in text_lower):
            indicators.append(ThreatIndicator(
                category="suspicious_contact_prompt",
                severity=SeverityLevel.LOW,
                description="Prompts immediate voice call to an unverified telephone number.",
                score_impact=10,
                evidence=phone_match.group(0)
            ))

        return indicators

    def analyze(self, req: AnalyzeRequest) -> AnalyzeResponse:
        """
        Executes end-to-end analysis on text and URLs.
        Combines NLP heuristics, domain intelligence, and collective threat database.
        """
        start_time = time.time()
        indicators: List[ThreatIndicator] = []

        # 1. Text Analysis
        text_indicators = self.scan_text(req.text)
        indicators.extend(text_indicators)

        # 2. URL Analysis (from explicit url field or extracted from text)
        urls_to_scan = []
        if req.url and req.url.strip():
            urls_to_scan.append(req.url.strip())
        extracted = self.extract_urls(req.text)
        for u in extracted:
            if u not in urls_to_scan:
                urls_to_scan.append(u)

        for u in urls_to_scan:
            url_indicators = self.scan_url(u)
            indicators.extend(url_indicators)

        # 3. Match against crowdsourced threat signatures
        matched_signatures = threat_intel_service.match_signatures(
            text=req.text,
            url=req.url or (urls_to_scan[0] if urls_to_scan else None)
        )
        if matched_signatures:
            indicators.append(ThreatIndicator(
                category="collective_intelligence_match",
                severity=SeverityLevel.CRITICAL,
                description=f"Matched {len(matched_signatures)} crowdsourced threat signature(s) reported by the community.",
                score_impact=30,
                evidence=matched_signatures[0]
            ))

        # 4. Deduplicate indicators by category + evidence
        seen_keys = set()
        unique_indicators = []
        for ind in indicators:
            key = (ind.category, ind.evidence)
            if key not in seen_keys:
                seen_keys.add(key)
                unique_indicators.append(ind)
        indicators = unique_indicators

        # 5. Calculate Calibrated Risk Score
        raw_score = sum(ind.score_impact for ind in indicators)
        
        # Non-linear scaling: Multiple compound threats accelerate risk
        if len(indicators) >= 3:
            raw_score = int(raw_score * 1.15)

        # Cap between 0 and 100
        risk_score = min(max(raw_score, 0), 100)

        # Determine Classification
        if risk_score <= 30:
            classification = ThreatLevel.SAFE
            summary = "No prominent phishing or fraudulent indicators detected. Message appears safe, but practice basic caution."
        elif risk_score <= 70:
            classification = ThreatLevel.SUSPICIOUS
            summary = "Suspicious signals detected. Message exhibits high pressure tactics or unverified links. Do not provide sensitive info."
        else:
            classification = ThreatLevel.CRITICAL
            summary = "High probability malicious scam detected! Multi-signal analysis revealed urgent manipulation, credential harvesting, or deceptive links."

        # Generate Actionable Recommendations
        recommendations = self._generate_recommendations(classification, indicators)

        # Record scan metric in telemetry
        threat_intel_service.record_scan_metric(risk_score, classification.value)

        elapsed_ms = int((time.time() - start_time) * 1000)

        return AnalyzeResponse(
            risk_score=risk_score,
            classification=classification,
            summary=summary,
            indicators=indicators,
            recommendations=recommendations,
            matched_community_threats=matched_signatures,
            meta={
                "latency_ms": f"{elapsed_ms}ms",
                "engine": "AI ScamShield Hybrid Engine (v1.0)",
                "urls_scanned": str(len(urls_to_scan))
            }
        )

    def _generate_recommendations(
        self,
        level: ThreatLevel,
        indicators: List[ThreatIndicator]
    ) -> List[str]:
        recs = []
        categories = {ind.category for ind in indicators}

        if level == ThreatLevel.CRITICAL:
            recs.append("DO NOT click any embedded links or call phone numbers mentioned in the message.")
            recs.append("NEVER share One-Time Passwords (OTP), PINs, or bank account credentials.")
            recs.append("Report and block the sender immediately on SMS / WhatsApp.")
            recs.append("If you already shared banking details, freeze your card and contact your bank's official helpline immediately.")
        elif level == ThreatLevel.SUSPICIOUS:
            recs.append("Verify the sender's identity through official channels (e.g. official website or phone on back of your card).")
            recs.append("Inspect the full destination URL carefully before clicking.")
            recs.append("Do not rush—scammers rely on manufactured urgency to bypass critical thinking.")
        else:
            recs.append("Message appears benign. Always remember legitimate institutions never ask for your password or OTP via SMS.")

        if "typosquatting_brand_impersonation" in categories or "homoglyph_deception" in categories:
            recs.append("Typosquatted domain detected: Type the legitimate company URL directly into your browser address bar.")

        if "urgency_manipulation" in categories:
            recs.append("Disregard threats of imminent account suspension or disconnection—call the service provider directly.")

        return recs


# Global singleton instance
scam_analyzer = ScamAnalyzerService()
