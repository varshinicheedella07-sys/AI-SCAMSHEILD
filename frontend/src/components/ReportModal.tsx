'use client';

import React, { useState } from 'react';
import { X, Send, ShieldPlus, AlertTriangle } from 'lucide-react';
import { ReportRequest } from '../types';
import { reportThreat } from '../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess: () => void;
}

const THREAT_TYPES = [
  { value: 'phishing_sms', label: 'Phishing SMS' },
  { value: 'fake_bank_alert', label: 'Fake Bank / KYC Notice' },
  { value: 'urgent_utility_scam', label: 'Electricity / Utility Cutoff' },
  { value: 'courier_delivery_trap', label: 'Delivery / Customs Phish' },
  { value: 'job_crypto_scam', label: 'Task / YouTube Job Fraud' },
  { value: 'otp_card_theft', label: 'OTP / Credential Harvesting' },
  { value: 'malicious_url', label: 'Typosquatted / Malicious URL' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onReportSuccess,
}) => {
  const [threatType, setThreatType] = useState('phishing_sms');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [tags, setTags] = useState('bank,kyc,urgent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Please provide the scam message content.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload: ReportRequest = {
        threat_type: threatType,
        content: content.trim(),
        url: url.trim() || undefined,
        reporter_alias: alias.trim() || 'Anonymous Contributor',
        tags: tagList,
      };

      await reportThreat(payload);
      onReportSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit threat report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-shield-card border border-shield-border shadow-2xl p-6 text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-shield-border">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Contribute Threat Signature
              </h3>
              <p className="text-xs text-gray-400">
                Open Innovation Crowdsource Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-shield-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Threat Category
            </label>
            <select
              value={threatType}
              onChange={(e) => setThreatType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-shield-surface border border-shield-border text-xs text-gray-100 outline-none focus:border-cyan-400"
            >
              {THREAT_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-shield-card text-gray-100">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Scam Message Content / Pattern
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the exact scam message text received..."
              className="w-full px-3 py-2 rounded-xl bg-shield-surface border border-shield-border text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Suspicious Link / URL (Optional)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://sbi-fake-kyc.top"
                className="w-full px-3 py-2 rounded-xl bg-shield-surface border border-shield-border text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Your Contributor Alias
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="CitizenGuard42"
                className="w-full px-3 py-2 rounded-xl bg-shield-surface border border-shield-border text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="sbi, kyc, urgent, sms"
              className="w-full px-3 py-2 rounded-xl bg-shield-surface border border-shield-border text-xs text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-shield-surface/60 border border-shield-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Collective Pool'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
