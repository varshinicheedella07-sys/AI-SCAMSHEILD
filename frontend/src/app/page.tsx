'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { StatsBanner } from '../components/StatsBanner';
import { ThreatMeter } from '../components/ThreatMeter';
import { AnalyzerForm } from '../components/AnalyzerForm';
import { ExplainableBreakdown } from '../components/ExplainableBreakdown';
import { CommunityFeed } from '../components/CommunityFeed';
import { ReportModal } from '../components/ReportModal';
import { DeveloperApiCard } from '../components/DeveloperApiCard';
import {
  AnalyzeRequest,
  AnalyzeResponse,
  CommunityThreat,
  StatsResponse,
} from '../types';
import {
  analyzeThreat,
  getCommunityThreats,
  getStats,
} from '../services/api';

// Initial pre-loaded analysis state for instant visual impact
const INITIAL_ANALYSIS: AnalyzeResponse = {
  risk_score: 96,
  classification: 'Critical Scam',
  summary:
    'High probability malicious scam detected! Multi-signal analysis revealed urgent account suspension scare tactics combined with an unverified typosquatted phishing domain.',
  indicators: [
    {
      category: 'urgency_manipulation',
      severity: 'HIGH',
      description: 'Account suspension scare tactic: Threatens immediate account lock to induce panic.',
      score_impact: 25,
      evidence: 'account has been locked',
    },
    {
      category: 'urgency_manipulation',
      severity: 'HIGH',
      description: 'Strict artificial deadline enforced to prevent critical verification.',
      score_impact: 18,
      evidence: 'within 2 hours',
    },
    {
      category: 'credential_financial_trap',
      severity: 'CRITICAL',
      description: 'Identity/KYC credential extraction attempt: Tricks victim into divulging banking credentials.',
      score_impact: 25,
      evidence: 'verify kyc',
    },
    {
      category: 'typosquatting_brand_impersonation',
      severity: 'CRITICAL',
      description: "Domain 'sbi-secure-kyc.xyz' impersonates brand 'SBI' without being legitimate banking infrastructure.",
      score_impact: 35,
      evidence: 'sbi-secure-kyc.xyz',
    },
    {
      category: 'suspicious_tld',
      severity: 'HIGH',
      description: 'Domain uses high-risk top-level domain (.xyz) frequently leveraged for throwaway smishing sites.',
      score_impact: 20,
      evidence: '.xyz',
    },
  ],
  recommendations: [
    'DO NOT click any embedded links or call phone numbers mentioned in the message.',
    'NEVER share One-Time Passwords (OTP), PINs, or bank account credentials.',
    'Report and block the sender immediately on SMS / WhatsApp.',
    'Typosquatted domain detected: Type the legitimate company URL directly into your browser address bar.',
  ],
  matched_community_threats: [
    'Known malicious domain match: http://sbi-yono-kyc.top (Reported by OpenShield_Core)',
  ],
  analyzed_at: new Date().toISOString(),
  meta: {
    latency_ms: '14ms',
    engine: 'AI ScamShield Hybrid Engine (v1.0)',
    urls_scanned: '1',
  },
};

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse>(INITIAL_ANALYSIS);
  const [isLoading, setIsLoading] = useState(false);
  const [threats, setThreats] = useState<CommunityThreat[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Load telemetry stats and community feed on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [threatsRes, statsRes] = await Promise.all([
        getCommunityThreats({ limit: 15 }),
        getStats(),
      ]);
      setThreats(threatsRes.threats);
      setStats(statsRes);
    } catch (e) {
      console.warn('Initial data load warning:', e);
    }
  };

  const handleAnalyze = async (req: AnalyzeRequest) => {
    setIsLoading(true);
    try {
      const res = await analyzeThreat(req);
      setAnalysisResult(res);
      // Reload stats after scan to reflect scan telemetry
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectThreatToInspect = (threat: CommunityThreat) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleAnalyze({
      text: threat.content,
      url: threat.url || undefined,
      source: 'community_feed',
    });
  };

  const handleScrollToDevApi = () => {
    const el = document.getElementById('developer-api-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-shield-bg text-gray-100">
      {/* Navbar */}
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onScrollToDevApi={handleScrollToDevApi}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Tagline */}
        <div className="text-center max-w-3xl mx-auto pt-2 pb-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Open Innovation Collective Defense</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop Phishing & Financial Frauds in Real Time
          </h1>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            Harness collective threat intelligence, NLP urgency detection, and typosquatting domain heuristics to detect, explain, and neutralize digital deception.
          </p>
        </div>

        {/* Telemetry Stats Bar */}
        <StatsBanner stats={stats} />

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Panel & Results (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Input Form with Presets */}
            <AnalyzerForm onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Real-time Threat Meter */}
            <ThreatMeter
              score={analysisResult.risk_score}
              classification={analysisResult.classification}
              summary={analysisResult.summary}
              matchedCommunityCount={analysisResult.matched_community_threats.length}
              latencyMs={analysisResult.meta?.latency_ms}
            />

            {/* Explainable AI Attribution Breakdown */}
            <ExplainableBreakdown
              indicators={analysisResult.indicators}
              recommendations={analysisResult.recommendations}
              matchedCommunityThreats={analysisResult.matched_community_threats}
            />
          </div>

          {/* Right Column: Open Innovation Community Threat Feed (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <CommunityFeed
              threats={threats}
              onRefresh={loadData}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onSelectThreatToInspect={handleSelectThreatToInspect}
            />
          </div>
        </div>

        {/* Developer API Section */}
        <div className="pt-4">
          <DeveloperApiCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-shield-border/70 bg-shield-card/60 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI ScamShield &copy; 2026 &bull; Open Innovation Threat Mesh</span>
          <span className="text-gray-400">Powered by FastAPI, NLP Heuristics & Next.js</span>
        </div>
      </footer>

      {/* Crowdsourced Report Submission Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSuccess={loadData}
      />
    </div>
  );
}
