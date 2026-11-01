'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Category } from '@/types';
import { IntentionCard } from './IntentionCard';
import { CollectiveScheduleCalendar } from './CollectiveScheduleCalendar';
import { Calendar, Compass, LayoutGrid, Plus, Search, Sparkles, X } from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Physical Wellbeing',
  'Mental & Emotional Wellbeing',
  'Love & Relationships',
  'Financial Wellbeing',
  'Global Peace',
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
  } = useApp();

  const [displayMode, setDisplayMode] = useState<'feed' | 'schedule'>('feed');

  const scheduledCount = useMemo(() => {
    return intentions.filter((i) => i.sessionType === 'scheduled').length;
  }, [intentions]);

  const filteredIntentions = useMemo(() => {
    return intentions.filter((item) => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.recipient.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [intentions, activeCategory, searchQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Welcome Meditation Space Header */}
      <section className="text-center py-6 sm:py-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#242c40] text-xs text-[#C7B9FF] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C7B9FF]" />
          <span>Meditation Space of Collective Intention</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#F3F3FA] font-sans">
          Make space for someone.
        </h1>

        <p className="mt-2.5 text-sm sm:text-base text-[#A8B1C8] max-w-lg mx-auto font-light leading-relaxed">
          Choose an intention. Take a breath. Be here for someone.
        </p>

        {/* View Mode Switcher: All Intentions vs Collective Schedule Calendar */}
        <div className="mt-6 inline-flex p-1 rounded-full bg-[#111827] border border-[#242c40] shadow-sm">
          <button
            onClick={() => setDisplayMode('feed')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              displayMode === 'feed'
                ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A] shadow-sm'
                : 'text-[#A8B1C8] hover:text-[#F3F3FA]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Intentions</span>
          </button>

          <button
            onClick={() => setDisplayMode('schedule')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              displayMode === 'schedule'
                ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A] shadow-sm'
                : 'text-[#A8B1C8] hover:text-[#F3F3FA]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Encounters Calendar</span>
            {scheduledCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#1b233a] text-[10px] text-[#B9D1FF] border border-[#B9D1FF]/30">
                {scheduledCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Render Schedule Calendar if selected */}
      {displayMode === 'schedule' ? (
        <CollectiveScheduleCalendar />
      ) : (
        /* Render Standard Intentions Feed with Search & Categories */
        <>
          {/* Search and Category Filter Toolbar */}
          <div className="space-y-4">
            {/* Search input */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64708D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, intention, or keywords..."
                className="w-full pl-10 pr-9 py-2 rounded-full bg-[#111827] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64708D] hover:text-[#F3F3FA] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Compact horizontally scrollable category chips */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar w-full scroll-smooth">
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
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#C7B9FF]/30 border-t-[#C7B9FF] animate-spin mx-auto" />
              <p className="text-xs text-[#A8B1C8]">Listening to the stillness...</p>
            </div>
          ) : filteredIntentions.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl bg-[#111827]/60 border border-[#242c40] p-10 sm:p-14 text-center max-w-lg mx-auto backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#151B29] border border-[#242c40] flex items-center justify-center mx-auto mb-4 text-[#A8B1C8]">
                <Compass className="w-5 h-5 text-[#C7B9FF]" />
              </div>
              <h3 className="text-base font-medium text-[#F3F3FA]">
                {searchQuery
                  ? 'No intentions match your search'
                  : `No intentions in ${activeCategory}`}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A8B1C8] max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? 'Try different keywords or explore all categories to find shared moments.'
                  : 'Be the first to open a quiet space for someone in this category.'}
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
                    Clear filters
                  </button>
                )}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30 hover:border-[#C7B9FF]/60 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create an Intention</span>
                </button>
              </div>
            </div>
          ) : (
            /* Intention Feed */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#64708D] px-1">
                <span>
                  Showing {filteredIntentions.length}{' '}
                  {filteredIntentions.length === 1 ? 'intention' : 'intentions'}
                </span>
                <span className="italic">Presence over productivity</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredIntentions.map((item) => (
                  <IntentionCard key={item.id} intention={item} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
