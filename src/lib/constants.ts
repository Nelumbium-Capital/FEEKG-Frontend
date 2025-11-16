// FE-EKG Color Palette (from backend docs)
export const COLORS = {
  // Relationship types
  hasActor: '#10b981',      // Emerald - entity performs action
  hasTarget: '#ef4444',     // Red - entity affected
  involves: '#3b82f6',      // Blue - general involvement
  relatedTo: '#a855f7',     // Purple - entity connections
  evolvesTo: '#f59e0b',     // Orange - event evolution

  // Entity types
  bank: '#3b82f6',          // Blue
  regulator: '#8b5cf6',     // Purple
  investment_bank: '#ec4899', // Pink
  government: '#14b8a6',    // Teal
  company: '#64748b',       // Slate

  // Event severity
  high: '#ef4444',          // Red
  medium: '#f59e0b',        // Amber
  low: '#10b981',           // Emerald

  // UI elements
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    tertiary: '#94a3b8',
  },
} as const;

// Cytoscape.js Layouts
export const LAYOUTS = {
  cose: {
    name: 'cose',
    animate: true,
    animationDuration: 500,
    padding: 50,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  },
  circle: {
    name: 'circle',
    animate: true,
    animationDuration: 600,
    padding: 80,
    // Nodes arranged in concentric circles
    spacingFactor: 1.8,
    clockwise: true,
    startAngle: Math.PI / 2, // Start from top
  },
  grid: {
    name: 'grid',
    animate: true,
    animationDuration: 500,
    padding: 60,
    // Auto-calculate rows/cols for square-ish grid
    rows: undefined,
    cols: undefined,
    // Sort nodes by type then label for organized grid
    sort: (a: any, b: any) => {
      const groupA = a.data('group');
      const groupB = b.data('group');
      if (groupA !== groupB) {
        // Events first, then entities
        return groupA === 'event' ? -1 : 1;
      }
      return a.data('label').localeCompare(b.data('label'));
    },
  },
  breadthfirst: {
    name: 'breadthfirst',
    animate: true,
    animationDuration: 600,
    padding: 80,
    directed: true,
    // Temporal flow: top to bottom
    spacingFactor: 2.0,
    // Align nodes horizontally by level
    grid: false,
    // Maximize spacing between levels
    nodeDimensionsIncludeLabels: true,
    // Auto-select root nodes (earliest events with no incoming edges)
    roots: undefined,
  },
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '100', 10),
  maxNodes: parseInt(process.env.NEXT_PUBLIC_MAX_NODES || '1000', 10),
  timeout: 30000, // 30 seconds
} as const;

// Performance Thresholds
export const PERFORMANCE = {
  staleTime: 5 * 60 * 1000,     // 5 minutes
  cacheTime: 10 * 60 * 1000,    // 10 minutes
  debounceDelay: 300,           // 300ms for search
  resizeDebounce: 200,          // 200ms for window resize
} as const;
