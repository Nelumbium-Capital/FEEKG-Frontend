import { apiClient, buildQueryString } from './client';
import { GraphData, GraphStats, Entity, EvolutionLink } from './types';
import { USE_MOCK_DATA, MOCK_STATS, MOCK_ENTITIES } from './mock-data';

/**
 * Fetch complete graph data
 */
export async function fetchGraphData(): Promise<GraphData> {
  const response = await apiClient<{ data: GraphData }>('/api/graph');
  return response.data;
}

/**
 * Fetch graph statistics from AllegroGraph
 */
export async function fetchGraphStats(): Promise<GraphStats> {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_STATS), 500); // Simulate network delay
    });
  }

  // Fetch accurate stats from backend
  const response = await apiClient<{ status: string; data: GraphStats }>('/api/stats');

  return response.data;
}

/**
 * Fetch all entities
 */
export async function fetchEntities(): Promise<Entity[]> {
  const response = await apiClient<{ data: Entity[] }>('/api/entities');
  return response.data;
}

/**
 * Fetch node neighborhood (for expand)
 */
export async function fetchNodeNeighborhood(nodeId: string): Promise<GraphData> {
  const response = await apiClient<{ data: GraphData }>(`/api/graph/neighborhood/${nodeId}`);
  return response.data;
}

/**
 * Fetch evolution links
 */
export async function fetchEvolutionLinks(minScore: number = 0.3): Promise<EvolutionLink[]> {
  const query = buildQueryString({ min_score: minScore });
  const response = await apiClient<{ data: EvolutionLink[] }>(`/api/evolution/links${query}`);
  return response.data;
}
