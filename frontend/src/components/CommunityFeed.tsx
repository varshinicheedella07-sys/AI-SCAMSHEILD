'use client';

import React, { useState } from 'react';
import {
  Users,
  ThumbsUp,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  Filter,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { CommunityThreat } from '../types';
import { upvoteThreat } from '../services/api';

interface CommunityFeedProps {
  threats: CommunityThreat[];
  onRefresh: () => void;
  onOpenReportModal: () => void;
  onSelectThreatToInspect: (threat: CommunityThreat) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  threats,
  onRefresh,
  onOpenReportModal,
  onSelectThreatToInspect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUpvote = async (id: string, currentCount: number) => {
    if (upvotedIds[id]) return;
    try {
      const res = await upvoteThreat(id);
      setUpvotedIds((prev) => ({
        ...prev,
        [id]: res.verifications_count,
      }));
    } catch {
      setUpvotedIds((prev) => ({
        ...prev,
        [id]: currentCount + 1,
      }));
    }
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Collect all unique tags
  const allTags = Array.from(
    new Set(threats.flatMap((t) => t.tags || []).filter(Boolean))
  ).slice(0, 6);

  const filteredThreats = threats.filter((t) => {
    const matchesSearch =
      t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.threat_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.url && t.url.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = !selectedTag || (t.tags && t.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Open Collective Threat Feed</span>
            </h3>
            <p className="text-xs text-gray-400">
              Crowdsourced fraud signatures verified by community citizens
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-shield-surface border border-shield-border text-gray-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onOpenReportModal}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 flex items-center space-x-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contribute</span>
          </button>
        </div>
      </div>

      {/* Search & Tag Filter */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search verified community threats..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-shield-surface border border-shield-border focus:border-cyan-400 text-xs text-gray-200 placeholder-gray-500 outline-none transition-all"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center space-x-1 mr-1">
              <Filter className="w-2.5 h-2.5" />
              <span>Tags:</span>
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                  selectedTag === tag
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-shield-surface/80 text-gray-400 border border-shield-border hover:text-cyan-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Threat Cards List */}
      <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
        {filteredThreats.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl bg-shield-surface/40 border border-shield-border/50 text-xs text-gray-400">
            No crowdsourced threats match your query.
          </div>
        ) : (
          filteredThreats.map((threat) => {
            const votes = upvotedIds[threat.id] ?? threat.verifications_count;
            const hasUpvoted = Boolean(upvotedIds[threat.id]);

            return (
              <div
                key={threat.id}
                className="p-3.5 rounded-xl bg-shield-surface/80 border border-shield-border hover:border-cyan-500/50 transition-all space-y-2 group"
              >
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400">
                    {threat.threat_type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(threat.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-gray-200 line-clamp-3 leading-relaxed">
                  {threat.content}
                </p>

                {/* Malicious URL indicator if present */}
                {threat.url && (
                  <div className="text-[11px] font-mono text-cyan-300 bg-shield-bg/90 px-2 py-1 rounded border border-shield-border truncate flex items-center space-x-1.5">
                    <ExternalLink className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{threat.url}</span>
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-1 border-t border-shield-border/60">
                  <div className="text-[10px] text-gray-400">
                    By <span className="text-cyan-400 font-semibold">{threat.reporter_alias}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectThreatToInspect(threat)}
                      className="text-[11px] text-gray-400 hover:text-cyan-300 transition-colors"
                      title="Load into inspector"
                    >
                      Test in Triage
                    </button>

                    <button
                      onClick={() => handleUpvote(threat.id, threat.verifications_count)}
                      disabled={hasUpvoted}
                      className={`text-[11px] px-2 py-0.5 rounded-md flex items-center space-x-1 font-semibold transition-all ${
                        hasUpvoted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-shield-card hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-shield-border'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{votes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
