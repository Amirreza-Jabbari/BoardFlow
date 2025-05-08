import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ToolBarBottom from '../components/ToolBarBottom';
import BoardCanvas from '../components/BoardCanvas';

export default function BoardRoom() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  // Drawing tool state
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(2);

  // Refs & handlers for undo/redo
  const canvasRef = useRef(null);

  const handleUndo = () => {
    canvasRef.current?.undo();
  };
  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  // If no boardId, redirect home
  if (!boardId) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* pass boardId so Header’s Mind-Map button knows which room */}
      <Header boardId={boardId} />

      <div className="flex flex-1 relative">
        <Sidebar />
        <BoardCanvas
          ref={canvasRef}
          boardId={boardId}
          tool={tool}
          color={color}
          thickness={thickness}
        />
        <ToolBarBottom
          tool={tool} setTool={setTool}
          color={color} setColor={setColor}
          thickness={thickness} setThickness={setThickness}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>
    </div>
  );
}