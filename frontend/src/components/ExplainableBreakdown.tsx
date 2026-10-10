'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Info,
  CheckCircle,
  HelpCircle,
  FileSearch,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { ThreatIndicator, SeverityLevel } from '../types';

interface ExplainableBreakdownProps {
  indicators: ThreatIndicator[];
  recommendations: string[];
  matchedCommunityThreats: string[];
}

export const ExplainableBreakdown: React.FC<ExplainableBreakdownProps> = ({
  indicators,
  recommendations,
  matchedCommunityThreats,
}) => {
  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          icon: AlertOctagon,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
          icon: ShieldAlert,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          icon: Info,
        };
      default:
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Crowdsourced Intelligence Matches (if any) */}
      {matchedCommunityThreats && matchedCommunityThreats.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 to-shield-card border border-rose-800/60 shadow-lg">
          <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Open Innovation Collective Signature Alert</span>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            This message matches verified fraud signatures contributed by cybersecurity researchers and citizens in the public shield pool:
          </p>
          <ul className="space-y-1.5">
            {matchedCommunityThreats.map((match, idx) => (
              <li
                key={idx}
                className="text-xs bg-rose-950/70 border border-rose-900/60 text-rose-200 px-3 py-1.5 rounded-lg font-mono flex items-center space-x-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                <span>{match}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Explainable AI Factor Breakdown */}
      <div className="p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileSearch className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Explainable AI (XAI) Threat Attribution
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-shield-surface border border-shield-border text-gray-300">
            {indicators.length} {indicators.length === 1 ? 'Indicator' : 'Indicators'} Detected
          </span>
        </div>

        {indicators.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl bg-shield-surface/40 border border-shield-border/50">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-200">No malicious indicators triggered</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Heuristic patterns, domain reputation checks, and credential theft scanners found no evidence of malicious intent.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {indicators.map((ind, index) => {
              const badge = getSeverityBadge(ind.severity);
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-shield-surface/70 border border-shield-border hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-200 capitalize">
                          {ind.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badge.bg}`}>
                          {ind.severity}
                        </span>
                        <span className="text-[10px] font-semibold text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                          +{ind.score_impact} pts
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {ind.description}
                    </p>
                  </div>

                  {ind.evidence && (
                    <div className="mt-2.5 pt-2 border-t border-shield-border/60 flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-semibold text-gray-400">Flagged Token:</span>
                      <code className="text-[11px] text-cyan-300 bg-shield-bg px-2 py-0.5 rounded border border-shield-border/70 truncate font-mono">
                        {ind.evidence}
                      </code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Actionable Defense Protocol / Recommendations */}
      <div className="p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <LifeBuoy className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            Recommended Protective Actions
          </h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Immediate countermeasures generated based on the specific threat vectors detected:
        </p>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="p-3 rounded-xl bg-shield-surface/60 border border-shield-border/80 text-xs text-gray-200 flex items-start space-x-2.5"
            >
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
