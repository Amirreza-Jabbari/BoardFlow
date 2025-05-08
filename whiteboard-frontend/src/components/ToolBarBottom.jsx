import React from 'react';
import { Undo, Redo } from 'lucide-react';

const tools = [
  { id: 'pen', label: 'Pen' },
  { id: 'highlighter', label: 'Highlighter' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'circle', label: 'Circle' },
  { id: 'arrow', label: 'Arrow' },
];

const colors = ['#000000','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff'];

export default function ToolBarBottom({
  tool, setTool,
  color, setColor,
  thickness, setThickness,
  onUndo, onRedo
}) {
  return (
    <div className="absolute bottom-0 left-64 right-0 bg-white border-t p-2 flex items-center space-x-4">
      {/* Undo / Redo */}
      <div className="flex space-x-2">
        <button
          onClick={onUndo}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={onRedo}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
          title="Redo"
        >
          <Redo size={20} />
        </button>
      </div>

      {/* Drawing Tools */}
      <div className="flex space-x-2">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-3 py-1 rounded ${
              tool === t.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            title={t.label}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Color picker */}
      <div className="flex items-center space-x-1">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 rounded-full border-2 ${
              color === c ? 'border-black' : 'border-transparent'
            }`}
          />
        ))}
      </div>

      {/* Thickness slider */}
      <div className="flex items-center space-x-2">
        <label className="text-sm">Thickness</label>
        <input
          type="range"
          min="1"
          max="20"
          value={thickness}
          onChange={e => setThickness(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
