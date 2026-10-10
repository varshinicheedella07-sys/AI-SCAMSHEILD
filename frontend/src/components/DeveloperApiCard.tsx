'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Globe, ChevronDown, ChevronUp } from 'lucide-react';

export const DeveloperApiCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const snippets = {
    curl: `curl -X GET "http://localhost:8000/api/v1/community-threats?limit=10" \\
     -H "Accept: application/json"`,
    js: `// Fetch latest community threat signatures
const res = await fetch('http://localhost:8000/api/v1/community-threats?limit=10');
const data = await res.json();
console.log('Open Threat Signatures:', data.threats);`,
    python: `import requests

# Query Open Innovation collective threat trends
response = requests.get('http://localhost:8000/api/v1/community-threats', params={'limit': 10})
threats = response.json().get('threats', [])
for threat in threats:
    print(f"[{threat['classification']}] {threat['threat_type']}: {threat['content'][:60]}...")`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="developer-api-section" className="p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">
                Open Innovation Developer Mesh API
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                GET /api/v1/community-threats
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Empower external applications, telecom firewalls, and browser extensions with live community scam intelligence.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-shield-surface border border-shield-border transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1">
          {/* Tabs & Copy Button */}
          <div className="flex items-center justify-between border-b border-shield-border/80 pb-2">
            <div className="flex items-center space-x-2 text-xs">
              {(['curl', 'js', 'python'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md font-mono uppercase text-[11px] transition-colors ${
                    activeTab === tab
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab === 'curl' ? 'cURL' : tab === 'js' ? 'Node / Fetch' : 'Python'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded hover:bg-shield-surface"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Window */}
          <pre className="p-4 rounded-xl bg-shield-surface/90 border border-shield-border font-mono text-xs text-gray-200 overflow-x-auto leading-relaxed">
            <code>{snippets[activeTab]}</code>
          </pre>

          {/* Sample Response Preview */}
          <div className="p-3.5 rounded-xl bg-shield-surface/50 border border-shield-border/60 text-xs">
            <p className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sample JSON Response Format:</span>
            </p>
            <pre className="font-mono text-[11px] text-gray-400 overflow-x-auto bg-shield-bg/80 p-3 rounded-lg border border-shield-border/60 max-h-36">
{`{
  "total": 24,
  "page": 1,
  "limit": 10,
  "threats": [
    {
      "id": "c1f7b8...",
      "threat_type": "fake_bank_alert",
      "content": "Dear SBI Customer, your YONO NetBanking will be suspended today...",
      "url": "http://sbi-yono-kyc.top",
      "risk_score": 96,
      "classification": "Critical Scam",
      "reporter_alias": "OpenShield_Core",
      "verifications_count": 142,
      "tags": ["sbi", "bank", "kyc", "phishing"],
      "created_at": "2026-10-09T08:30:00Z"
    }
  ]
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
