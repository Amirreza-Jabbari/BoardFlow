import React from 'react';
export default function Toolbar() {
  const tools = ["MagnifyingGlass","Dot","Circle"];
  return (
    <div className="flex gap-2 px-8 py-2 bg-gray-50 border-b">
      {tools.map(icon => (
        <button key={icon} className="p-2 bg-white rounded shadow-sm hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-800" viewBox="0 0 256 256" fill="currentColor">{/* icon path */}</svg>
        </button>
      ))}
    </div>
  );
}