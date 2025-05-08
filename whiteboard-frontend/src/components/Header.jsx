import React, { useState } from 'react';
import MindMapModal from './MindMapModal';

export default function Header({ boardId }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b px-8 py-3 bg-white">
        <div className="flex items-center gap-4">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 48 48" fill="currentColor">
            {/* your logo paths here */}
          </svg>
          <h2 className="text-xl font-bold">Flow</h2>
        </div>

        <nav className="flex gap-6">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-800 hover:text-blue-600"
          >
            Mind Map
          </button>
          {['Edit','View','Insert','Shape','Comments'].map(item => (
            <a key={item} href="#" className="text-gray-800 hover:text-blue-600">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Share</button>
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">Present</button>
        </div>
      </header>

      {open && (
        <MindMapModal
          boardId={boardId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
