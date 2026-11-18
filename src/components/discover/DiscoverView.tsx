'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category } from '@/types';
import { IntentionCard } from './IntentionCard';
import { CollectiveScheduleCalendar } from './CollectiveScheduleCalendar';
import { Archive, ChevronDown, Plus, Search, X } from 'lucide-react';
import { LotusFlowerIcon } from '@/components/common/LotusFlowerIcon';
import { useCurrentTimestamp } from '@/lib/useCurrentTimestamp';

const CATEGORIES: Category[] = [
  'All',
  'Physical',
  'Mental & Emotional',
  'Love & Relationships',
  'Financial',
  'World',
  'Other',
];

export function DiscoverView() {
  const {
    intentions,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen,
    isLoading,
    activeTab,
    t,
    tCategory,
  } = useApp();

  const isScheduleView = activeTab === 'calendar';
  const [sessionFilter, setSessionFilter] = useState<'active' | 'archived'>('active');
  const nowTimestamp = useCurrentTimestamp();

  const BATCH_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  // Reset pagination count when category, search query, or session filter changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeCategory, searchQuery, sessionFilter]);

  const { activeCount, archivedCount, filteredIntentions } = useMemo(() => {
    const now = nowTimestamp || (typeof window !== 'undefined' ? Date.now() : 0);
    let act = 0;
    let arch = 0;

    const filtered = intentions.filter((item) => {
      const isPast = now > 0 && item.scheduledAt ? new Date(item.scheduledAt).getTime() < now : false;
      if (isPast) {
        arch++;
      } else {
        act++;
      }

      // Check session status filter (Active vs Archived)
      if (sessionFilter === 'archived' && !isPast) return false;
      if (sessionFilter === 'active' && isPast) return false;

      // Category filter
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;

      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.recipient.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesCat && matchesQuery;
    });

    return {
      activeCount: act,
      archivedCount: arch,
      filteredIntentions: filtered,
    };
  }, [intentions, sessionFilter, activeCategory, searchQuery]);

  const displayedIntentions = useMemo(() => {
    return filteredIntentions.slice(0, visibleCount);
  }, [filteredIntentions, visibleCount]);

  const hasMore = visibleCount < filteredIntentions.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-4 sm:py-4 space-y-6 animate-in fade-in duration-300">
      {/* Render selected view */}
      {isScheduleView ? (
        <CollectiveScheduleCalendar />
      ) : (
        /* Render Standard Intentions Feed with Search & Categories */
        <>
          {/* Search and Category Filter Toolbar (suelto / libre de recuadro) */}
          <div className="space-y-4">
            {/* Left-aligned Search input */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64708D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('discover.searchPlaceholder')}
                className="w-full pl-10 pr-9 py-2.5 sm:py-2.5 rounded-full bg-[#111827] border border-[#242c40] text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64708D] hover:text-[#F3F3FA] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Compact horizontally scrollable category chips */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar w-full scroll-smooth">
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 shadow-[0_0_10px_rgba(199,185,255,0.12)]'
                          : 'bg-[#111827] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] hover:border-[#3e4a6b]'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {tCategory(cat)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active / Archived Tabs encima de las cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-6 border-b border-[#242c40]/80">
              <button
                type="button"
                onClick={() => setSessionFilter('active')}
                className={`pb-2.5 text-xs sm:text-sm font-medium transition-all relative cursor-pointer ${
                  sessionFilter === 'active'
                    ? 'text-[#F3F3FA]'
                    : 'text-[#64708D] hover:text-[#A8B1C8]'
                }`}
              >
                <span>{t('discover.activeCount', { count: activeCount })}</span>
                {sessionFilter === 'active' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C7B9FF] rounded-full shadow-[0_0_8px_#C7B9FF]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSessionFilter('archived')}
                className={`pb-2.5 text-xs sm:text-sm font-medium transition-all relative cursor-pointer ${
                  sessionFilter === 'archived'
                    ? 'text-[#F3F3FA]'
                    : 'text-[#64708D] hover:text-[#A8B1C8]'
                }`}
              >
                <span>{t('discover.archivedCount', { count: archivedCount })}</span>
                {sessionFilter === 'archived' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C7B9FF] rounded-full shadow-[0_0_8px_#C7B9FF]" />
                )}
              </button>
            </div>

            {/* Archived Info Banner (Only shown when Archived tab is selected) */}
            {sessionFilter === 'archived' && (
              <div className="p-4 rounded-2xl bg-[#111827]/80 border border-[#242c40] flex items-start sm:items-center gap-3 animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-[#151B29] border border-[#242c40] flex items-center justify-center text-[#C7B9FF] shrink-0 mt-0.5 sm:mt-0">
                  <Archive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-[#F3F3FA]">
                    {t('discover.archivedSessions')}
                  </h4>
                  <p className="text-[11px] text-[#A8B1C8] mt-0.5 leading-relaxed">
                    {t('discover.noIntentionsDesc')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#C7B9FF]/30 border-t-[#C7B9FF] animate-spin mx-auto" />
              <p className="text-xs text-[#A8B1C8]">{t('common.loading')}</p>
            </div>
          ) : filteredIntentions.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl bg-[#111827]/60 border border-[#242c40] p-10 sm:p-14 text-center max-w-lg mx-auto backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#151B29] border border-[#242c40] flex items-center justify-center mx-auto mb-4 text-[#C7B9FF] shadow-[0_0_15px_rgba(199,185,255,0.08)]">
                <LotusFlowerIcon size={24} />
              </div>
              <h3 className="text-base font-medium text-[#F3F3FA]">
                {t('discover.noIntentionsTitle')}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A8B1C8] max-w-xs mx-auto leading-relaxed">
                {t('discover.noIntentionsDesc')}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {(activeCategory !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-full text-xs font-medium bg-[#151B29] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] transition-colors cursor-pointer"
                  >
                    {t('discover.clearFilters')}
                  </button>
                )}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30 hover:border-[#C7B9FF]/60 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('common.createIntention')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Intention Feed */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#64708D] px-1">
                <span>
                  {t('discover.showingCount', {
                    current: displayedIntentions.length,
                    total: filteredIntentions.length,
                  })}
                </span>
                <span className="italic"></span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {displayedIntentions.map((item) => (
                  <IntentionCard key={item.id} intention={item} />
                ))}
              </div>

              {/* Show More Button */}
              {hasMore && (
                <div className="pt-6 pb-2 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#151B29] text-[#E2E8F0] hover:text-[#FFFFFF] border border-[#242c40] hover:border-[#C7B9FF]/50 hover:bg-[#1b233a] transition-all cursor-pointer shadow-sm group"
                  >
                    <span>{t('discover.loadMore')}</span>
                    <ChevronDown className="w-4 h-4 text-[#C7B9FF] group-hover:translate-y-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
