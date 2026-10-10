'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Zap, Globe } from 'lucide-react';
import { ThreatLevel } from '../types';

interface ThreatMeterProps {
  score: number;
  classification: ThreatLevel;
  summary: string;
  matchedCommunityCount: number;
  latencyMs?: string;
}

export const ThreatMeter: React.FC<ThreatMeterProps> = ({
  score,
  classification,
  summary,
  matchedCommunityCount,
  latencyMs,
}) => {
  // Color setup based on score
  const isCritical = score > 70;
  const isSuspicious = score > 30 && score <= 70;
  const isSafe = score <= 30;

  const colorConfig = isCritical
    ? {
        stroke: '#ef4444',
        text: 'text-rose-400',
        bgPill: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        glow: 'shadow-rose-500/20',
        icon: ShieldAlert,
        label: 'CRITICAL SCAM DETECTED',
      }
    : isSuspicious
    ? {
        stroke: '#f59e0b',
        text: 'text-amber-400',
        bgPill: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        glow: 'shadow-amber-500/20',
        icon: AlertTriangle,
        label: 'SUSPICIOUS ACTIVITY',
      }
    : {
        stroke: '#10b981',
        text: 'text-emerald-400',
        bgPill: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        glow: 'shadow-emerald-500/20',
        icon: ShieldCheck,
        label: 'VERIFIED LOW RISK / SAFE',
      };

  const Icon = colorConfig.icon;

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: colorConfig.stroke }}
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left: Animated Circular Gauge */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
              {/* Background Ring */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="#1f2d4a"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={colorConfig.stroke}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-extrabold tracking-tight ${colorConfig.text}`}>
                {score}
              </span>
              <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className={`mt-3 px-3 py-1 rounded-full border text-xs font-bold tracking-wide flex items-center space-x-1.5 ${colorConfig.bgPill}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{classification.toUpperCase()}</span>
          </div>
        </div>

        {/* Right: Plain-text Reasoning & Telemetry */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${colorConfig.bgPill}`}>
              {colorConfig.label}
            </span>
            {latencyMs && (
              <span className="text-xs text-gray-400 flex items-center space-x-1 bg-shield-surface/60 px-2 py-0.5 rounded-md border border-shield-border/50">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{latencyMs}</span>
              </span>
            )}
            {matchedCommunityCount > 0 && (
              <span className="text-xs text-rose-300 flex items-center space-x-1 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/50">
                <Globe className="w-3 h-3 text-rose-400" />
                <span>Crowdsource Signature Match</span>
              </span>
            )}
          </div>

          <p className="text-base font-medium text-gray-200 leading-relaxed">
            {summary}
          </p>

          {/* Quick Risk Gradient Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1 font-medium">
              <span className="text-emerald-400">0 Safe</span>
              <span className="text-amber-400">30 Suspicious</span>
              <span className="text-rose-400">70+ Critical Scam</span>
            </div>
            <div className="w-full h-2 rounded-full bg-shield-surface overflow-hidden p-0.5 border border-shield-border/50">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.max(score, 4)}%`,
                  backgroundColor: colorConfig.stroke,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
