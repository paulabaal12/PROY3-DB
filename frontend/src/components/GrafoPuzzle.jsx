import { useEffect, useState } from "react";
import { Puzzle } from 'lucide-react';
import React from 'react';
import '../App.css'

function GrafoPuzzle({ nodes = [], edges = [] }) {
  const nodeElements = nodes.map((node) => ({
    id: node.id,
    label: node.label || node.id,
    x: Math.random() * 400 + 50,
    y: Math.random() * 300 + 50
  }));

  const edgeElements = edges.map((edge, idx) => ({
    id: `edge-${idx}`,
    source: edge.source,
    target: edge.target,
    label: edge.label || ''
  }));

  return (
    <div className="puzzle-graph">
      {nodeElements.length > 0 ? (
        <div className="puzzle-graph-container">
          <svg width="100%" height="100%" className="absolute inset-0">
            {edgeElements.map((edge) => {
              const sourceNode = nodeElements.find(n => n.id === edge.source);
              const targetNode = nodeElements.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <g key={edge.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#10B981"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    fill="#059669"
                    fontSize="12"
                    textAnchor="middle"
                    className="font-medium"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
            
            {/* Definir marcador de flecha */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="#10B981"
                />
              </marker>
            </defs>
          </svg>
          
          {/* Renderizar nodos */}
          {nodeElements.map((node) => (
            <div
              key={node.id}
              className="puzzle-graph-node"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`
              }}
              title={node.label}
            >
              <div className="text-center leading-tight">
                {node.id}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="puzzle-graph-empty">
          <div className="text-center">
            <Puzzle size={48} className="puzzle-empty-icon" />
            <p className="puzzle-empty-text">Selecciona un puzzle para ver su visualización</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GrafoPuzzle;