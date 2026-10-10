'use client';

import React, { useState } from 'react';
import { Search, ShieldAlert, Sparkles, Link as LinkIcon, MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import { AnalyzeRequest } from '../types';

interface PresetItem {
  name: string;
  category: string;
  source: string;
  text: string;
  url?: string;
  badge: string;
}

const PRESETS: PresetItem[] = [
  {
    name: 'Bank KYC Trap',
    category: 'Banking',
    source: 'sms',
    text: 'URGENT: Your SBI account has been locked. Verify KYC immediately at http://sbi-secure-kyc.xyz or funds will be seized within 2 hours.',
    url: 'http://sbi-secure-kyc.xyz',
    badge: 'Phishing SMS',
  },
  {
    name: 'Electricity Cutoff',
    category: 'Utility',
    source: 'sms',
    text: 'Dear consumer, your electricity power will be disconnected at 9:30 PM tonight from electricity office because your previous month bill was not updated. Please immediately contact our power officer at 9876543210.',
    url: '',
    badge: 'Urgent Threat',
  },
  {
    name: 'FedEx Customs Phish',
    category: 'Courier',
    source: 'sms',
    text: 'USPS/FedEx notice: Your shipment package [US928301] cannot be delivered due to an incorrect postal address. Confirm your address and pay $1.99 redelivery fee: http://track-fedex-post.xyz',
    url: 'http://track-fedex-post.xyz',
    badge: 'Smishing Link',
  },
  {
    name: 'Telegram Job Scam',
    category: 'Employment',
    source: 'whatsapp',
    text: 'Congratulations! You are selected for flexible remote part-time job. Earn $300-$800 daily just by liking YouTube videos and hotel reviews. Message Telegram recruiter: @HR_Global_Hiring',
    url: '',
    badge: 'Ponzi / Task Trap',
  },
  {
    name: 'Safe Family Text',
    category: 'Personal',
    source: 'sms',
    text: 'Hey Mum! Are you free for dinner tonight around 7:30 PM? Let me know and I will book a table at that Italian place.',
    url: '',
    badge: 'Safe Benchmark',
  },
];

interface AnalyzerFormProps {
  onAnalyze: (req: AnalyzeRequest) => void;
  isLoading: boolean;
}

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState(PRESETS[0].text);
  const [url, setUrl] = useState(PRESETS[0].url || '');
  const [source, setSource] = useState('sms');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !url.trim()) return;
    onAnalyze({
      text: text.trim(),
      url: url.trim() || undefined,
      source,
    });
  };

  const handleApplyPreset = (preset: PresetItem) => {
    setText(preset.text);
    setUrl(preset.url || '');
    setSource(preset.source);
    onAnalyze({
      text: preset.text,
      url: preset.url || undefined,
      source: preset.source,
    });
  };

  const handleClear = () => {
    setText('');
    setUrl('');
  };

  return (
    <div className="p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
      {/* Header & Preset Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>Interactive Threat Inspection Console</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Paste suspicious SMS, WhatsApp message, email, or unverified link for real-time AI triage.
          </p>
        </div>

        {text && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-gray-200 flex items-center space-x-1 px-2.5 py-1 rounded bg-shield-surface/60 border border-shield-border transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Quick Test Presets Carousel / Pills */}
      <div className="mb-5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Scam Presets (Click to Test Instantly):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-shield-surface hover:bg-shield-surface/80 border border-shield-border hover:border-cyan-500/50 text-gray-200 hover:text-cyan-300 transition-all flex items-center space-x-2 shadow-sm"
            >
              <span>{preset.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Channel Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400 font-medium">Channel:</span>
          {['sms', 'whatsapp', 'email', 'telegram', 'web'].map((chan) => (
            <button
              key={chan}
              type="button"
              onClick={() => setSource(chan)}
              className={`px-2.5 py-1 rounded-md uppercase font-semibold text-[11px] transition-colors ${
                source === chan
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-shield-surface/60 text-gray-400 border border-shield-border hover:text-gray-300'
              }`}
            >
              {chan}
            </button>
          ))}
        </div>

        {/* Message Content Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Suspicious Message Content / Body
          </label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text message here (e.g., 'URGENT: Your bank account will be blocked...')"
            className="w-full px-4 py-3 rounded-xl bg-shield-surface border border-shield-border focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-gray-100 placeholder-gray-500 resize-none transition-all outline-none"
          />
        </div>

        {/* Optional URL Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center space-x-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target URL or Domain (Optional / Embedded URLs scanned automatically)</span>
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. http://sbi-secure-kyc.xyz or http://192.168.1.10/login"
            className="w-full px-4 py-2.5 rounded-xl bg-shield-surface border border-shield-border focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-gray-100 placeholder-gray-500 transition-all outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !url.trim())}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Scanning Threat Vector...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-black" />
                <span>Run Real-Time AI Analysis</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
