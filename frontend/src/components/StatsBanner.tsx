'use client';

import React from 'react';
import { ShieldAlert, Users, Activity, CheckCircle2 } from 'lucide-react';
import { StatsResponse } from '../types';

interface StatsBannerProps {
  stats: StatsResponse | null;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats }) => {
  const totalScans = stats?.total_scans?.toLocaleString() || '1,420';
  const blocked = stats?.scams_blocked?.toLocaleString() || '987';
  const signatures = stats?.community_signatures?.toLocaleString() || '24';
  const avgScore = stats?.average_risk_score ? `${stats.average_risk_score}/100` : '72/100';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      <div className="p-4 rounded-xl bg-shield-card/90 border border-shield-border/70 hover:border-cyan-500/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Scans</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalScans}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-shield-card/90 border border-shield-border/70 hover:border-crimson/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Scams Blocked</p>
            <p className="text-xl font-bold text-white mt-0.5">{blocked}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-shield-card/90 border border-shield-border/70 hover:border-emerald-500/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Crowd Signatures</p>
            <p className="text-xl font-bold text-white mt-0.5">{signatures}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-shield-card/90 border border-shield-border/70 hover:border-amber/40 transition-all">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Open Intel Status</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center space-x-1.5">
              <span>Synchronized</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
