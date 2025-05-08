// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const [mapName, setMapName] = useState('');
  const [loadingMap, setLoadingMap] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const navigate = useNavigate();

  const createBoard = async () => {
    if (loadingBoard) return;
    try {
      setLoadingBoard(true);
      const { data } = await axios.post(`${BACKEND}/api/boards/create/`);
      navigate(`/boards/${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create board.');
    } finally {
      setLoadingBoard(false);
    }
  };

  const createMindMap = async () => {
    if (!mapName.trim() || loadingMap) return;
    try {
      setLoadingMap(true);
      const { data } = await axios.post(`${BACKEND}/api/mindmaps/`, {
        name: mapName.trim(),
      });
      navigate(`/mindmaps/${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create mind map. See console for details.');
    } finally {
      setLoadingMap(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 space-y-8 p-6">
      <button
        onClick={createBoard}
        disabled={loadingBoard}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
      >
        {loadingBoard && (
          <svg
            className="w-5 h-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        <span>{loadingBoard ? 'Creating…' : 'Create New Whiteboard'}</span>
      </button>

      <div className="flex flex-col items-center space-y-2">
        <input
          type="text"
          placeholder="Enter mind-map name"
          value={mapName}
          onChange={e => setMapName(e.target.value)}
          className="px-4 py-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={createMindMap}
          disabled={!mapName.trim() || loadingMap}
          className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
        >
          {loadingMap && (
            <svg
              className="w-5 h-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          <span>{loadingMap ? 'Creating…' : 'Create New Mind Map'}</span>
        </button>
      </div>
    </div>
  );
}
