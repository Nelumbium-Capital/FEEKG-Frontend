"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape, { Core, NodeSingular, EventObject } from 'cytoscape';
import { Node, Edge } from '@/lib/api/types';
import { COLORS, LAYOUTS } from '@/lib/constants';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  filteredEventIds?: string[];
  onNodeClick?: (node: Node) => void;
  onNodeHover?: (node: Node | null) => void;
  layout?: 'cose' | 'circle' | 'grid' | 'breadthfirst';
  className?: string;
}

export function GraphView({
  nodes,
  edges,
  filteredEventIds,
  onNodeClick,
  onNodeHover,
  layout = 'cose',
  className = '',
}: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);
  const layoutRunningRef = useRef(false);

  // Memoize graph data to prevent unnecessary re-initialization
  const graphData = useMemo(() => {
    // Filter nodes based on filteredEventIds if provided
    const visibleNodes = filteredEventIds
      ? nodes.filter(n => n.group !== 'event' || filteredEventIds.includes(n.id))
      : nodes;

    // Convert nodes to Cytoscape format
    const cyNodes = visibleNodes.map(node => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        group: node.group,
        nodeData: node,
      },
    }));

    // Filter edges to only include visible nodes
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = edges.filter(
      e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    // Convert edges to Cytoscape format
    const cyEdges = visibleEdges.map(edge => ({
      data: {
        id: edge.id || `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        weight: (edge as any).weight || 1,
        edgeData: edge,
      },
    }));

    return { nodes: cyNodes, edges: cyEdges };
  }, [nodes, edges, filteredEventIds]);

  // Initialize Cytoscape (only when graphData or layout changes, NOT on click handlers)
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0 || !isMountedRef.current) return;

    // Prevent multiple initializations
    if (initializingRef.current) return;
    initializingRef.current = true;

    // Cleanup previous instance
    const cleanupCytoscape = () => {
      if (cyRef.current) {
        try {
          const cy = cyRef.current;

          // Stop any running layout
          if (layoutRunningRef.current) {
            try {
              const runningLayout = cy.layout({ name: 'preset' });
              runningLayout.stop();
            } catch (e) {
              // Ignore
            }
            layoutRunningRef.current = false;
          }

          // Stop all animations
          try {
            cy.stop();
          } catch (e) {
            // Ignore
          }

          // Remove all listeners
          try {
            cy.removeAllListeners();
          } catch (e) {
            // Ignore
          }

          // Destroy instance
          try {
            cy.destroy();
          } catch (e) {
            // Ignore
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        cyRef.current = null;
        setIsInitialized(false);
      }
    };

    cleanupCytoscape();

    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      if (!isMountedRef.current) {
        initializingRef.current = false;
        return;
      }

      const { nodes: cyNodes, edges: cyEdges } = graphData;

      initializeCytoscape(cyNodes, cyEdges);
    }, 10);
  }, [graphData, layout]); // Removed onNodeClick, onNodeHover to prevent re-init on click

  const initializeCytoscape = (cyNodes: any[], cyEdges: any[]) => {
    if (!containerRef.current || !isMountedRef.current) {
      initializingRef.current = false;
      return;
    }

    // Create Cytoscape instance
    let cy: Core;
    try {
      cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => {
              const group = ele.data('group');
              if (group === 'entity') {
                // Entities: vibrant blue
                return '#3b82f6';
              } else {
                // Events: colored by severity
                const severity = ele.data('nodeData')?.data?.severity;
                const colorMap: Record<string, string> = {
                  'high': '#ef4444',
                  'medium': '#f59e0b',
                  'low': '#22c55e',
                };
                return colorMap[severity] || '#22c55e';
              }
            },
            'label': 'data(label)',
            'width': (ele: any) => {
              const group = ele.data('group');
              return group === 'entity' ? 60 : 50;
            },
            'height': (ele: any) => {
              const group = ele.data('group');
              return group === 'entity' ? 60 : 50;
            },
            'font-size': 9,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'ellipsis',
            'text-max-width': '100px',
            'color': '#ffffff',
            'text-outline-color': 'rgba(0,0,0,0.8)',
            'text-outline-width': 2.5,
            'border-width': 3,
            'border-color': '#ffffff',
            'shape': (ele: any) => {
              const group = ele.data('group');
              return group === 'entity' ? 'rectangle' : 'ellipse';
            },
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#6366f1',
          },
        },
        {
          selector: 'node:hover',
          style: {
            'border-width': 3,
            'border-color': '#a5b4fc',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': (ele: any) => {
              const edgeType = ele.data('type');
              if (edgeType === 'evolves_to') return 2.5;
              if (edgeType === 'involves') return 1.5;
              return 1;
            },
            'line-color': (ele: any) => {
              const edgeType = ele.data('type');
              if (edgeType === 'evolves_to') return 'rgba(255,255,255,0.7)';
              if (edgeType === 'involves') return 'rgba(100,200,255,0.4)'; // Light blue for entity connections
              return 'rgba(255,255,255,0.3)';
            },
            'target-arrow-color': (ele: any) => {
              const edgeType = ele.data('type');
              if (edgeType === 'evolves_to') return 'rgba(255,255,255,0.7)';
              if (edgeType === 'involves') return 'rgba(100,200,255,0.4)';
              return 'rgba(255,255,255,0.3)';
            },
            'target-arrow-shape': (ele: any) => {
              const edgeType = ele.data('type');
              return edgeType === 'evolves_to' ? 'triangle' : 'none';
            },
            'curve-style': 'bezier',
            'opacity': (ele: any) => {
              const edgeType = ele.data('type');
              if (edgeType === 'evolves_to') return 0.8;
              if (edgeType === 'involves') return 0.5;
              return 0.4;
            },
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 3,
            'opacity': 1,
          },
        },
      ],
      layout: layout === 'cose' ? {
        name: 'cose',
        // Disable component separation - treat all as one graph
        componentSpacing: 40,
        nodeOverlap: 20,
        // Increase repulsion to spread nodes out
        nodeRepulsion: function( node: any ){
          // Entities repel more to spread them out
          return node.data('group') === 'entity' ? 12000 : 8000;
        },
        idealEdgeLength: function( edge: any ){
          // Make event-entity edges shorter to pull entities into the graph
          return edge.data('type') === 'involves' ? 80 : 120;
        },
        edgeElasticity: function( edge: any ){
          return edge.data('type') === 'involves' ? 150 : 100;
        },
        nestingFactor: 5,
        gravity: 0.8,
        numIter: 2000,
        initialTemp: 500,
        coolingFactor: 0.95,
        minTemp: 1.0,
        // Randomize initial positions to avoid clustering
        randomize: true,
        animate: true,
        animationDuration: 500,
      } : LAYOUTS[layout],
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });
    } catch (e) {
      console.error('Failed to initialize Cytoscape:', e);
      initializingRef.current = false;
      return;
    }

    if (!isMountedRef.current) {
      try {
        cy.destroy();
      } catch (e) {
        // Ignore
      }
      initializingRef.current = false;
      return;
    }

    // Store reference and mark as initialized
    cyRef.current = cy;

    // Mark layout as running
    layoutRunningRef.current = true;

    // Run initial layout with completion callback
    const initialLayout = cy.layout(LAYOUTS[layout]);
    initialLayout.on('layoutstop', () => {
      layoutRunningRef.current = false;
    });
    initialLayout.run();

    setIsInitialized(true);
    initializingRef.current = false;

    // Event handlers with mounted checks
    cy.on('tap', 'node', (evt: EventObject) => {
      if (!isMountedRef.current) return;
      try {
        const node = evt.target as NodeSingular;
        const nodeData = node.data('nodeData') as Node;
        if (onNodeClick && nodeData) {
          onNodeClick(nodeData);
        }
      } catch (e) {
        // Ignore errors from destroyed nodes
      }
    });

    cy.on('mouseover', 'node', (evt: EventObject) => {
      if (!isMountedRef.current) return;
      try {
        const node = evt.target as NodeSingular;
        const nodeData = node.data('nodeData') as Node;
        if (onNodeHover && nodeData) {
          onNodeHover(nodeData);
        }
      } catch (e) {
        // Ignore errors from destroyed nodes
      }
    });

    cy.on('mouseout', 'node', () => {
      if (!isMountedRef.current) return;
      if (onNodeHover) {
        onNodeHover(null);
      }
    });

  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      initializingRef.current = false;

      if (cyRef.current) {
        try {
          const cy = cyRef.current;

          // Stop any running layouts immediately
          if (layoutRunningRef.current) {
            try {
              const runningLayout = cy.layout({ name: 'preset' });
              runningLayout.stop();
            } catch (e) {
              // Ignore
            }
            layoutRunningRef.current = false;
          }

          // Stop all animations
          try {
            cy.stop();
          } catch (e) {
            // Ignore
          }

          // Remove all event listeners
          try {
            cy.removeAllListeners();
          } catch (e) {
            // Ignore
          }

          // Destroy the instance
          try {
            cy.destroy();
          } catch (e) {
            // Ignore
          }
        } catch (e) {
          // Ignore all cleanup errors
        }
        cyRef.current = null;
      }
      setIsInitialized(false);
    };
  }, []);

  // Handle layout change
  useEffect(() => {
    if (cyRef.current && isInitialized && isMountedRef.current) {
      try {
        const cy = cyRef.current;

        // Stop previous layout if running
        if (layoutRunningRef.current) {
          try {
            const runningLayout = cy.layout({ name: 'preset' });
            runningLayout.stop();
            cy.stop(); // Stop all animations
          } catch (e) {
            // Ignore
          }
          layoutRunningRef.current = false;
        }

        // Start new layout
        layoutRunningRef.current = true;
        const newLayout = cy.layout(LAYOUTS[layout]);
        newLayout.on('layoutstop', () => {
          if (isMountedRef.current) {
            layoutRunningRef.current = false;
          }
        });
        newLayout.run();
      } catch (e) {
        // Ignore layout errors
        layoutRunningRef.current = false;
      }
    }
  }, [layout, isInitialized]);

  // Component mount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          minHeight: '600px',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        }}
      />

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-apple-lg border border-gray-100/50">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-700 text-lg font-semibold mb-2">No nodes to display</p>
            <p className="text-gray-500 text-sm">Adjust filters to see more data</p>
          </div>
        </div>
      )}

      {!isInitialized && nodes.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-apple-lg border border-gray-100/50">
            <div className="relative h-16 w-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-700 text-lg font-semibold">Loading graph...</p>
            <p className="text-gray-500 text-sm mt-2">Rendering {nodes.length} nodes and {edges.length} edges</p>
          </div>
        </div>
      )}
    </div>
  );
}
