export type ThreatLevel = 'Safe' | 'Suspicious' | 'Critical Scam';

export type SeverityLevel = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatIndicator {
  category: string;
  severity: SeverityLevel;
  description: string;
  score_impact: number;
  evidence?: string;
}

export interface AnalyzeRequest {
  text: string;
  url?: string;
  source: string;
}

export interface AnalyzeResponse {
  risk_score: number;
  classification: ThreatLevel;
  summary: string;
  indicators: ThreatIndicator[];
  recommendations: string[];
  matched_community_threats: string[];
  analyzed_at: string;
  meta?: Record<string, string>;
}

export interface ReportRequest {
  threat_type: string;
  content: string;
  url?: string;
  reporter_alias?: string;
  tags: string[];
  notes?: string;
}

export interface CommunityThreat {
  id: string;
  threat_type: string;
  content: string;
  url?: string;
  risk_score: number;
  classification: ThreatLevel;
  reporter_alias: string;
  verifications_count: number;
  tags: string[];
  created_at: string;
}

export interface CommunityThreatsResponse {
  threats: CommunityThreat[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsResponse {
  total_scans: number;
  scams_blocked: number;
  community_signatures: number;
  top_threat_categories: Record<string, number>;
  average_risk_score: number;
  open_threat_intel_active: boolean;
}
