"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchPaginatedEvents } from '@/lib/api/events';
import { Event } from '@/lib/api/types';
import { EventCard } from '@/components/EventCard';

function TimelineContent() {
  const searchParams = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  // Get event and date from query params
  const eventIdFromQuery = searchParams.get('event');
  const dateFromQuery = searchParams.get('date');

  // Fetch all events (backend has ~5100 events total)
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', 0, 6000],
    queryFn: () => fetchPaginatedEvents(0, 6000),
  });

  const events = eventsData?.data || [];

  // Apply date filter
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (dateFilter.startDate) {
      filtered = filtered.filter(e => e.date >= dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(e => e.date <= dateFilter.endDate);
    }

    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, dateFilter]);

  // Group events by year
  const eventsByYear = useMemo(() => {
    const groups: Record<string, Event[]> = {};
    filteredEvents.forEach(event => {
      const year = event.date.split('-')[0];
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // Auto-select event from query params
  useEffect(() => {
    if (eventIdFromQuery && events.length > 0) {
      const event = events.find(e => e.eventId === eventIdFromQuery);
      if (event) {
        setSelectedEvent(event);
        setTimeout(() => {
          const element = document.getElementById(`event-${eventIdFromQuery}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [eventIdFromQuery, events]);

  // Set initial date filter from query
  useEffect(() => {
    if (dateFromQuery) {
      const date = new Date(dateFromQuery);
      const year = date.getFullYear();
      setDateFilter({
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      });
    }
  }, [dateFromQuery]);

  return (
    <main className="min-h-screen pt-16" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-apple">
        <div className="max-w-full px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Timeline</h1>
              <p className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {events.length} events
              </p>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">From</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300/50 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all shadow-apple"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">To</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  className="px-3 py-2 text-sm border border-gray-300/50 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-all shadow-apple"
                />
              </div>
              {(dateFilter.startDate || dateFilter.endDate) && (
                <button
                  onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                  className="mt-5 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-all"
                >
                  Clear
                </button>
              )}
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
            <p className="text-white text-lg font-medium">Loading timeline...</p>
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
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load Timeline</h2>
            <p className="text-gray-300">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 p-8">
          {/* Timeline */}
          <div className="col-span-8 space-y-12">
            {Object.keys(eventsByYear).sort().map(year => (
              <div key={year} className="space-y-6">
                {/* Year Header */}
                <div className="sticky top-20 z-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-apple-lg">
                  <h2 className="text-2xl font-bold">{year}</h2>
                  <p className="text-sm text-blue-100">{eventsByYear[year].length} events</p>
                </div>

                {/* Events for this year */}
                <div className="space-y-4 relative pl-8 border-l-2 border-blue-300/30">
                  {eventsByYear[year].map((event) => (
                    <div
                      key={event.eventId}
                      id={`event-${event.eventId}`}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[33px] top-4 w-3 h-3 rounded-full border-4 ${
                        event.eventId === selectedEvent?.eventId
                          ? 'bg-blue-500 border-blue-200'
                          : 'bg-white border-blue-300/50'
                      }`}></div>

                      {/* Event card */}
                      <div
                        onClick={() => setSelectedEvent(event)}
                        className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-apple hover:shadow-apple-lg transition-all duration-200 cursor-pointer border ${
                          event.eventId === selectedEvent?.eventId
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-gray-100/50 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                event.severity === 'high' ? 'bg-red-100 text-red-700' :
                                event.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {event.severity?.toUpperCase() || 'LOW'}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">{event.date}</span>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 leading-snug">
                              {event.label}
                            </h3>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{event.type.replace(/_/g, ' ')}</span>
                          {event.actors && event.actors.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{event.actors.length} actor{event.actors.length !== 1 ? 's' : ''}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-24">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-apple-lg border border-gray-100/50 inline-block">
                  <svg className="w-20 h-20 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-700 text-lg font-semibold mb-2">No events in this date range</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Details Sidebar */}
          <div className="col-span-4">
            <div className="sticky top-20">
              <EventCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <TimelineContent />
    </Suspense>
  );
}
