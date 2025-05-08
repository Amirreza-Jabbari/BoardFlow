import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

function NodeItem({ node, onUpdate, children }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(node.content);

  // Sync local text whenever the prop changes
  useEffect(() => {
    setText(node.content);
  }, [node.content]);

  const save = () => {
    if (text !== node.content) {
      onUpdate(node.id, { content: text });
    }
    setEditing(false);
  };

  return (
    <li className="pl-4 border-l ml-2">
      {editing ? (
        <input
          className="border-b"
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={save}
          onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
        />
      ) : (
        <span
          className="cursor-pointer hover:underline"
          onClick={() => setEditing(true)}
        >
          {node.content}
        </span>
      )}
      {children && <ul>{children}</ul>}
    </li>
  );
}

export default function MindMapEditor() {
  const { mapId } = useParams();
  const [nodes, setNodes] = useState([]);

  // 1) Fetch all nodes for this mindmap
  useEffect(() => {
    axios
      .get(`${BACKEND}/api/mindmaps/${mapId}/nodes/`)
      .then(res => setNodes(res.data))
      .catch(console.error);
  }, [mapId]);

  // 2) Send PATCH to update a single node
  const updateNode = (id, changes) => {
    axios
      .patch(`${BACKEND}/api/mindnodes/${id}/`, changes)
      .then(() => {
        setNodes(ns => ns.map(n => n.id === id ? { ...n, ...changes } : n));
      })
      .catch(console.error);
  };

  // 3) Build a lookup and parent→children tree
  const lookup = {};
  nodes.forEach(n => lookup[n.id] = { ...n, children: [] });
  const roots = [];
  nodes.forEach(n => {
    if (n.parent && lookup[n.parent]) {
      lookup[n.parent].children.push(lookup[n.id]);
    } else {
      roots.push(lookup[n.id]);
    }
  });

  // 4) Recursive renderer
  const renderTree = node => (
    <NodeItem key={node.id} node={node} onUpdate={updateNode}>
      {node.children.map(child => renderTree(child))}
    </NodeItem>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Mind Map Editor</h1>
      {roots.length === 0 ? (
        <p className="text-gray-500">No nodes yet.</p>
      ) : (
        <ul>
          {roots.map(root => renderTree(root))}
        </ul>
      )}
    </div>
  );
}
