// API Response Types

export interface APIResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  status: 'success';
}

// Graph Data Types

export interface Node {
  id: string;
  label: string;
  type: string;
  group: 'entity' | 'event' | 'risk';
  data?: Record<string, any>;  // Optional data field for additional properties
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  strength?: number;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  stats?: GraphStats;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  totalEvents?: number;
  totalEntities?: number;
  totalRelationships?: number;
  evolutionLinks?: number;
  topEntities?: EntityDegree[];
}

export interface EntityDegree {
  label: string;
  degree: number;
}

// Event Types

export interface Event {
  eventId: string;
  label: string;
  type: string;
  date: string;
  severity?: 'high' | 'medium' | 'low';
  description?: string;
  actors?: string[];
  targets?: string[];
  source?: string;
}

export interface EventDetails extends Event {
  relatedEvents?: string[];
  entities?: string[];
  risks?: string[];
  provenance?: ProvenanceData;
}

export interface ProvenanceData {
  originalCsv: string;
  eventId: string;
  timestamp: string;
}

// Entity Types

export interface Entity {
  entityId: string;
  label: string;
  type: string;
}

// Evolution Types

export interface EvolutionLink {
  from: string;
  to: string;
  score: number;
  type: string;
  temporal?: number;
  entity_overlap?: number;
  semantic?: number;
  topic?: number;
  causality?: number;
  emotional?: number;
}

// Filter Types

export interface TimeWindowFilter {
  startDate: string;
  endDate: string;
}

export interface PaginationFilter {
  offset: number;
  limit: number;
}

export interface EventTypeFilter {
  types: string[];
}
