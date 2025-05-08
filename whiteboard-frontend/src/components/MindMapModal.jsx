import React, { useState } from 'react';
import axios from 'axios';
import MindMap from './MindMap';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function MindMapModal({ boardId, onClose }) {
  const [topic, setTopic] = useState('');
  const [nodes, setNodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/api/mindmaps/`, { name: topic });
      setNodes(res.data.nodes || []);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <div className="p-6 flex-shrink-0 border-b">
          <h2 className="text-2xl font-semibold">Generate Mind Map</h2>
        </div>

        <div className="p-6 flex-shrink-0 border-b">
          {!nodes ? (
            <>
              <label className="block mb-2 font-medium">Enter topic:</label>
              <div className="flex space-x-2">
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder="e.g. Project Planning"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Generating…' : 'Create'}
                </button>
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </>
          ) : (
            <h3 className="text-xl font-medium">Topic: {topic}</h3>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {nodes && (
            <MindMap
              boardId={boardId}
              nodesOverride={nodes}
              // force full height
            />
          )}
        </div>
      </div>
    </div>
  );
}
