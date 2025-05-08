// src/components/MindMap.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function MindMap({ boardId, nodesOverride }) {
  const [nodes, setNodes]     = useState(nodesOverride || []);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // 1) load if no override
  useEffect(() => {
    if (nodesOverride) return;
    setLoading(true);
    axios.get(`${BACKEND}/api/boards/${boardId}/mindmap/`)
      .then(res => setNodes(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load mind map');
      })
      .finally(() => setLoading(false));
  }, [boardId, nodesOverride]);

  // 2) override support
  useEffect(() => {
    if (nodesOverride) setNodes(nodesOverride);
  }, [nodesOverride]);

  // 3) layout calculation: group by depth, assign x positions evenly
  const { positions, containerSize, connections } = useMemo(() => {
    // build lookup
    const map = new Map(nodes.map(n => [n.id, { ...n, children: [] }]));
    nodes.forEach(n => {
      if (n.parent && map.has(n.parent)) {
        map.get(n.parent).children.push(map.get(n.id));
      }
    });
    // find roots
    const roots = Array.from(map.values()).filter(n => !n.parent || !map.has(n.parent));

    // BFS by depth
    const levels = [];
    function traverse(node, depth = 0) {
      levels[depth] = levels[depth] || [];
      levels[depth].push(node);
      node.children.forEach(child => traverse(child, depth + 1));
    }
    roots.forEach(r => traverse(r, 0));

    // calculate positions
    const pos = {};
    const layerHeight = 120;
    const nodeWidth = 140;
    const nodeHeight = 50;
    const horizontalGap = 40;
    levels.forEach((level, depth) => {
      const totalWidth = level.length * nodeWidth + (level.length - 1) * horizontalGap;
      let xOffset = horizontalGap;
      level.forEach(node => {
        pos[node.id] = {
          x: xOffset,
          y: depth * layerHeight + horizontalGap,
        };
        xOffset += nodeWidth + horizontalGap;
      });
    });

    // connections for SVG lines
    const conns = [];
    map.forEach(node => {
      node.children.forEach(child => {
        const p = pos[node.id];
        const c = pos[child.id];
        if (p && c) {
          conns.push({
            x1: p.x + nodeWidth / 2,
            y1: p.y + nodeHeight,
            x2: c.x + nodeWidth / 2,
            y2: c.y,
          });
        }
      });
    });

    // determine container bounds
    const width = Math.max(
      ...Object.values(pos).map(p => p.x + nodeWidth + horizontalGap),
      600
    );
    const height = Math.max(
      ...Object.values(pos).map(p => p.y + nodeHeight + horizontalGap),
      400
    );

    return { positions: pos, containerSize: { width, height }, connections: conns };
  }, [nodes]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error)   return <div className="p-4 text-red-600">{error}</div>;
  if (!nodes.length) return <div className="p-4 text-gray-500">No nodes to display</div>;

  return (
    <div className="overflow-auto border rounded bg-white p-4" style={{ width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', width: containerSize.width, height: containerSize.height }}>
        {/* SVG connectors */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={containerSize.width}
          height={containerSize.height}
        >
          {connections.map((ln, i) => (
            <line
              key={i}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke="#555"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map(n => {
          const p = positions[n.id] || { x: 0, y: 0 };
          return (
            <div
              key={n.id}
              className="absolute bg-yellow-100 p-2 rounded-lg shadow-md flex items-center justify-center text-center"
              style={{
                width: 140,
                height: 50,
                left: p.x,
                top: p.y,
              }}
            >
              {n.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
