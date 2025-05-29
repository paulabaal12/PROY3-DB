import { useEffect, useState, useRef } from "react";
import { Puzzle } from "lucide-react";
import React from "react";
import dagre from "dagre";
import "../App.css";

function GrafoPuzzle({ nodes = [], edges = [] }) {
  const [layoutNodes, setLayoutNodes] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (nodes.length === 0) {
      setLayoutNodes([]);
      return;
    }

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 100, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => {
      g.setNode(node.id, { label: node.label || node.id, width: 80, height: 80 });
    });

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const graphNodes = nodes.map(node => g.node(node.id));
    const minX = Math.min(...graphNodes.map(n => n.x));
    const maxX = Math.max(...graphNodes.map(n => n.x));
    const minY = Math.min(...graphNodes.map(n => n.y));
    const maxY = Math.max(...graphNodes.map(n => n.y));

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 400;

    const offsetX = (containerWidth - graphWidth) / 2 - minX;
    const offsetY = (containerHeight - graphHeight) / 2 - minY;

    const positionedNodes = nodes.map((node) => {
      const pos = g.node(node.id);
      return {
        ...node,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      };
    });

    setLayoutNodes(positionedNodes);
  }, [nodes, edges]);


  const calculateTextOffsetFixed = (sourceNode, targetNode) => {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const offsetDistance = 40; 
    const offsetX = -dy / length * offsetDistance;
    const offsetY = dx / length * offsetDistance;

    return { offsetX, offsetY };
  };

  const isReversedEdge = (source, target) => {
    return edges.some(
      (e) => e.source === target && e.target === source
    );
  };

  const edgeElements = edges.map((edge, idx) => {
    const sourceNode = layoutNodes.find(n => n.id === edge.source);
    const targetNode = layoutNodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const { x: x1, y: y1 } = sourceNode;
    const { x: x2, y: y2 } = targetNode;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const { offsetX, offsetY } = calculateTextOffsetFixed(sourceNode, targetNode);


    const useCurve = isReversedEdge(edge.source, edge.target);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;

    const path = useCurve
      ? `M${x1},${y1} A${dr},${dr} 0 0,1 ${x2},${y2}`
      : `M${x1},${y1} L${x2},${y2}`;

    return (
      <g key={`edge-${idx}`}>
        <path
          d={path}
          stroke="#10B981"
          strokeWidth="3"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
        <text
          x={midX + offsetX}
          y={midY + offsetY}
          fill="#059669"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          className="font-semibold"
          style={{
            filter: 'drop-shadow(1px 1px 2px rgba(255,255,255,0.8))'
          }}
        >
          {edge.label && `${edge.label} - `}{`${edge.source} → ${edge.target}`}
        </text>
      </g>
    );
  });

  return (
    <div className="puzzle-graph">
      {layoutNodes.length > 0 ? (
        <div className="puzzle-graph-container" ref={containerRef}>
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 12 4, 0 8" fill="#10B981" />
              </marker>
            </defs>
            {edgeElements}
          </svg>
          {layoutNodes.map((node) => (
            <div
              key={node.id}
              className="puzzle-graph-node"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
              }}
              title={node.label}
            >
              <div className="text-center leading-tight">{node.id}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="puzzle-graph-empty">
          <div className="text-center">
            <Puzzle size={48} className="puzzle-empty-icon" />
            <p className="puzzle-empty-text">
              Selecciona un puzzle para ver su visualización
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrafoPuzzle;
