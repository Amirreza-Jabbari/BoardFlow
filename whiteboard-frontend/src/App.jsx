import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BoardRoom from './pages/BoardRoom';
import MindMapEditor from './pages/MindMapEditor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boards/:boardId" element={<BoardRoom />} />
        <Route path="/mindmaps/:mapId" element={<MindMapEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
