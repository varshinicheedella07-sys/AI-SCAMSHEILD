'use client';

import React from 'react';
import { ShieldCheck, Radio, PlusCircle, Code, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenReportModal: () => void;
  onScrollToDevApi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModal, onScrollToDevApi }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-shield-border bg-shield-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                AI ScamShield
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-400 border border-cyan-700/50">
                Open Innovation
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              Collective Threat Intelligence & AI Phishing Defense
            </p>
          </div>
        </div>

        {/* Live Network Indicators & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg bg-shield-surface/60 border border-shield-border text-xs text-gray-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">Live Threat Mesh</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Crowdsource Verified</span>
          </div>

          <button
            onClick={onScrollToDevApi}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-cyan-300 hover:bg-shield-surface border border-shield-border transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Developer API</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Report Scam</span>
          </button>
        </div>
      </div>
    </header>
  );
};
