"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchPaginatedEvents, fetchGraphData } from '@/lib/api/events';
import { GraphView } from '@/components/GraphView';
import { FilterPanel, FilterState } from '@/components/FilterPanel';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/lib/api/types';

export default function GraphPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    selectedTypes: [],
    searchQuery: '',
  });
  const [layout, setLayout] = useState<'cose' | 'circle' | 'grid' | 'breadthfirst'>('cose');
  const [nodeLimit, setNodeLimit] = useState<number>(100);
  const [minScore, setMinScore] = useState<number>(0.5);
  const [groupByEventType, setGroupByEventType] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch graph data (entities + events + edges) from AllegroGraph
  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ['graph-data', nodeLimit, minScore],
    queryFn: () => fetchGraphData(nodeLimit, minScore),
  });

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Extract events for filtering
  const events: Event[] = nodes.filter(n => n.group === 'event').map(n => ({
    eventId: n.id,
    label: n.label,
    type: n.type,
    date: '', // Default empty date
    ...(n.data || {})
  } as Event));

  // Get unique event types for filter
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type));
    return Array.from(types).sort();
  }, [events]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Date range filter from FilterPanel
    if (filters.startDate) {
      filtered = filtered.filter(e => e.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(e => e.date <= filters.endDate);
    }

    // Additional date range filter from header controls
    if (dateRange.startDate) {
      filtered = filtered.filter(e => e.date >= dateRange.startDate);
    }
    if (dateRange.endDate) {
      filtered = filtered.filter(e => e.date <= dateRange.endDate);
    }

    // Event type filter
    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(e => filters.selectedTypes.includes(e.type));
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.label.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, filters, dateRange]);

  // Stats
  const stats = {
    total: events.length,
    filtered: filteredEvents.length,
    selected: filters.selectedTypes.length,
  };

  return (
    <main className="min-h-screen pt-16" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-apple">
        <div className="max-w-full px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Graph Visualization</h1>
              <p className="text-sm text-gray-600">
                Showing {stats.filtered} of {stats.total} events
              </p>
            </div>

            {/* Graph Controls */}
            <div className="flex items-center gap-6">
              {/* Node Limit Slider */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  Nodes: <span className="text-blue-600 font-bold">{nodeLimit}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={nodeLimit}
                  onChange={(e) => setNodeLimit(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Min Score Slider */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  Min Score: <span className="text-blue-600 font-bold">{minScore.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Layout Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 font-medium">Layout:</label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-300/50 rounded-xl text-sm bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-apple"
                >
                  <option value="cose">Force-Directed</option>
                  <option value="circle">Circle</option>
                  <option value="grid">Grid</option>
                  <option value="breadthfirst">Hierarchical</option>
                </select>
              </div>

              {/* Group by Event Type */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="groupByType"
                  checked={groupByEventType}
                  onChange={(e) => setGroupByEventType(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="groupByType" className="text-sm text-gray-600 font-medium cursor-pointer">
                  Group by Type
                </label>
              </div>
            </div>

            {/* Date Range Filter Row */}
            <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-gray-200/50">
              <span className="text-sm text-gray-600 font-medium">Date Range:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-gray-300/50 rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all shadow-apple"
                  placeholder="Start Date"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-gray-300/50 rounded-lg bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all shadow-apple"
                  placeholder="End Date"
                />
                {(dateRange.startDate || dateRange.endDate) && (
                  <button
                    onClick={() => setDateRange({ startDate: '', endDate: '' })}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative h-16 w-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading events from AllegroGraph...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Events</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
            <p className="text-sm text-gray-500">
              Make sure the Flask backend is running on port 5001
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 p-8 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Filters */}
          <div className="col-span-3 overflow-y-auto">
            <FilterPanel
              onFilterChange={setFilters}
              eventTypes={eventTypes}
            />

            {/* Stats Card */}
            <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-8 border border-gray-100/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Graph Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Nodes</span>
                  <span className="text-lg font-bold text-gray-900">{nodes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Edges</span>
                  <span className="text-lg font-bold text-blue-600">{edges.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events</span>
                  <span className="text-lg font-bold text-green-600">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entities</span>
                  <span className="text-lg font-bold text-purple-600">{nodes.filter(n => n.group === 'entity').length}</span>
                </div>
                <div className="h-px bg-gray-200 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Node Limit</span>
                  <span className="text-sm font-semibold text-gray-700">{nodeLimit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Min Score</span>
                  <span className="text-sm font-semibold text-gray-700">{minScore.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-8 border border-gray-100/50">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Legend</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-sm text-gray-700">High Severity</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="text-sm text-gray-700">Medium Severity</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: '#22c55e' }}></div>
                  <span className="text-sm text-gray-700">Low Severity</span>
                </div>
                <div className="pt-4 border-t border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-1 rounded-full shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
                    <span className="text-sm text-gray-700">Evolution Link</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded shadow-sm border-2 border-white" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-sm text-gray-700">Entity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Graph View */}
          <div className="col-span-6">
            <div className="rounded-2xl shadow-apple-xl h-full overflow-hidden">
              <GraphView
                nodes={nodes}
                edges={edges}
                filteredEventIds={filteredEvents.map(e => e.eventId)}
                onNodeClick={(node) => {
                  if (node.group === 'event') {
                    const event = events.find(e => e.eventId === node.id);
                    if (event) setSelectedEvent(event);
                  }
                }}
                onNodeHover={(node) => {
                  if (node && node.group === 'event') {
                    const event = events.find(e => e.eventId === node.id);
                    setHoveredEvent(event || null);
                  } else {
                    setHoveredEvent(null);
                  }
                }}
                layout={layout}
                groupByEventType={groupByEventType}
              />
            </div>
          </div>

          {/* Right Sidebar - Event Details */}
          <div className="col-span-3 overflow-y-auto">
            <EventCard
              event={selectedEvent || hoveredEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
