"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGraphStats } from "@/lib/api/graph";
import { fetchPaginatedEvents } from "@/lib/api/events";
import Link from "next/link";

export default function Home() {
  // Fetch graph stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchGraphStats,
  });

  // Fetch sample events
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ["events", 0, 10],
    queryFn: () => fetchPaginatedEvents(0, 10),
  });

  const isLoading = statsLoading || eventsLoading;
  const hasError = statsError || eventsError;

  return (
    <main className="min-h-screen pt-16" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              FE-EKG
            </h1>
            <p className="text-xl text-gray-300 mb-3">
              Financial Event Evolution Knowledge Graph
            </p>
            <p className="text-base text-gray-400 max-w-2xl mx-auto mb-8">
              Visualize and analyze complex financial events, their evolution patterns, and entity relationships using advanced graph technology and AllegroGraph RDF database.
            </p>

            {/* Quick Stats */}
            {stats && !isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalEvents?.toLocaleString() || 0}</div>
                  <div className="text-xs text-gray-300">Events</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalEntities?.toLocaleString() || 0}</div>
                  <div className="text-xs text-gray-300">Entities</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">{stats.evolutionLinks?.toLocaleString() || 0}</div>
                  <div className="text-xs text-gray-300">Evolution Links</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalRelationships?.toLocaleString() || 0}</div>
                  <div className="text-xs text-gray-300">Relationships</div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/graph"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                Explore Graph →
              </Link>
              <Link
                href="/timeline"
                className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20 text-sm"
              >
                View Timeline
              </Link>
              <a
                href="/docs_hub.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20 text-sm"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* API Status */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-6 mb-6 border border-gray-100/50">
          <h2 className="text-xl font-bold text-gray-900 mb-3">System Status</h2>

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
              <p className="text-gray-600">Connecting to AllegroGraph backend...</p>
            </div>
          )}

          {hasError && (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-red-600 font-medium">Failed to connect to API</p>
                <p className="text-sm text-gray-600 mt-1">
                  Make sure the Flask backend is running on {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}
                </p>
                <p className="text-sm text-red-500 mt-1">
                  Error: {statsError?.message || eventsError?.message || "Unknown error"}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !hasError && (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-emerald-600 font-medium">AllegroGraph connected • System operational</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-6 border border-gray-100/50">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Visualization</h3>
            <p className="text-sm text-gray-600">
              Explore financial events and entities with force-directed graph layouts, multiple view modes, and interactive filtering.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-6 border border-gray-100/50">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Evolution Analysis</h3>
            <p className="text-sm text-gray-600">
              Track how financial events evolve over time using temporal, semantic, and causal relationship scoring algorithms.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-6 border border-gray-100/50">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AllegroGraph RDF</h3>
            <p className="text-sm text-gray-600">
              Powered by AllegroGraph triple store with SPARQL queries for semantic web compatibility and advanced reasoning.
            </p>
          </div>
        </div>

        {/* Top Entities */}
        {stats?.topEntities && stats.topEntities.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-6 mb-6 border border-gray-100/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Entities by Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.topEntities.slice(0, 6).map((entity, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{entity.label}</span>
                  </div>
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-lg">{entity.degree} connections</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {eventsData && eventsData.data.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-apple-lg p-6 border border-gray-100/50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>

            <div className="space-y-2">
              {eventsData.data.slice(0, 5).map((event) => (
                <div key={event.eventId} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{event.label}</h4>
                      <p className="text-xs text-gray-600">{event.type}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">{event.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Showing {eventsData.data.length} of {eventsData.total.toLocaleString()} total events
              </p>
              <Link
                href="/graph"
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  }[color] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className={`p-6 rounded-lg border ${colorClasses}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
    </div>
  );
}
