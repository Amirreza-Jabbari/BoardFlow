import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit2, Check, X } from 'lucide-react';

export default function Sidebar() {
  const [boards, setBoards] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const navigate = useNavigate();
  const { boardId } = useParams();
  const BACKEND = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const res = await axios.get(`${BACKEND}/api/boards/`);
      setBoards(res.data);
    } catch (e) {
      console.error("Failed to load boards", e);
    }
  }

  async function createBoard() {
    const res = await axios.post(`${BACKEND}/api/boards/create/`);
    navigate(`/boards/${res.data.id}`);
    fetchBoards();
  }

  async function deleteBoard(id) {
    await axios.delete(`${BACKEND}/api/boards/${id}/`);
    if (id === boardId) navigate('/');
    fetchBoards();
  }

  function startEditing(b) {
    setEditingId(b.id);
    setTempName(b.name || b.id.slice(0,8));
  }

  async function saveName(id) {
    if (!tempName.trim()) return cancelEditing();
    try {
      await axios.patch(`${BACKEND}/api/boards/${id}/`, { name: tempName });
      setEditingId(null);
      fetchBoards();
    } catch (e) {
      console.error("Rename failed", e);
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setTempName('');
  }

  const handleKey = (e, id) => {
    if (e.key === 'Enter') saveName(id);
    if (e.key === 'Escape') cancelEditing();
  };

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col">
      <h3 className="font-bold mb-4 flex items-center justify-between">
        <span>Boards</span>
      </h3>

      <ul className="flex-1 overflow-auto space-y-2">
        {boards.map(b => {
          const isCurrent = b.id === boardId;
          return (
            <li key={b.id} className="flex items-center justify-between">
              <div className="flex-1 flex items-center">
                {editingId === b.id ? (
                  <input
                    autoFocus
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onBlur={() => saveName(b.id)}
                    onKeyDown={e => handleKey(e, b.id)}
                    className="flex-1 border-b px-2 py-1"
                  />
                ) : (
                  <button
                    className={`text-left flex-1 px-2 py-1 rounded ${
                      isCurrent ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => navigate(`/boards/${b.id}`)}
                  >
                    {b.name || b.id.slice(0, 8)}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {editingId === b.id ? (
                  <>
                    <button onClick={() => saveName(b.id)} title="Save">
                      <Check size={16} />
                    </button>
                    <button onClick={cancelEditing} title="Cancel">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(b)} title="Rename">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteBoard(b.id)}
                      className="text-red-500"
                      title="Delete board"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={createBoard}
        className="mt-4 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-1"
      >
        <PlusIcon className="w-4 h-4" /> New Board
      </button>
    </aside>
  );
}

// you can import any plus icon from lucide or substitute:
import { Plus } from 'lucide-react';
function PlusIcon(props) {
  return <Plus {...props} />;
}
