import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import socket from '../socket';
import axios from 'axios';

const BoardCanvas = forwardRef(
  ({ boardId, tool, color, thickness }, ref) => {
    const canvasRef = useRef(null);
    const historyRef = useRef([]);      // array of draw events
    const historyIndexRef = useRef(0);  // how many events are currently drawn

    // Expose undo/redo
    useImperativeHandle(ref, () => ({
      undo: () => {
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          redrawFromHistory();
        }
      },
      redo: () => {
        if (historyIndexRef.current < historyRef.current.length) {
          historyIndexRef.current++;
          redrawFromHistory();
        }
      },
    }), []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // **Reset history & clear canvas on board change**
      historyRef.current = [];
      historyIndexRef.current = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Setup drawing style
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Join room
      socket.emit('join', { board_id: boardId });

      // Load past events
      axios
        .get(`/api/boards/${boardId}/state/`)
        .then((res) => {
          res.data.events.forEach((evt) => {
            pushToHistory(evt.data, false);
          });
        })
        .catch(() => { /* ignore */ });

      // Live events
      socket.on('draw_event', handleRemoteEvent);

      // Cleanup on unmount or boardId change:
      return () => {
        socket.emit('leave', { board_id: boardId });
        socket.off('draw_event', handleRemoteEvent);
        window.removeEventListener('resize', resizeCanvas);
      };
    }, [boardId]);

    // Redraw entire history up to historyIndexRef
    function redrawFromHistory() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < historyIndexRef.current; i++) {
        drawStroke(historyRef.current[i], false);
      }
    }

    // Add a stroke to history, then draw (and emit if needed)
    function pushToHistory(data, emit = true) {
      // if we undid, drop any "future" events
      if (historyIndexRef.current < historyRef.current.length) {
        historyRef.current.splice(
          historyIndexRef.current,
          historyRef.current.length - historyIndexRef.current
        );
      }
      historyRef.current.push(data);
      historyIndexRef.current++;
      drawStroke(data, emit);
    }

    // Draw a single segment on canvas
    function drawStroke(data, emit) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = data.tool === 'eraser' ? '#fff' : data.color;
      ctx.lineWidth = data.thickness;
      ctx.globalAlpha = data.tool === 'highlighter' ? 0.4 : 1;

      ctx.beginPath();
      ctx.moveTo(data.pmx, data.pmy);
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (emit) {
        socket.emit('draw_event', {
          board_id: boardId,
          tool,
          color,
          thickness,
          pmx: data.pmx,
          pmy: data.pmy,
          x: data.x,
          y: data.y,
        });
      }
    }

    // Handler for events received over socket
    function handleRemoteEvent(data) {
      // avoid re-emitting remote events
      pushToHistory(data, false);
    }

    // Resize canvas to fill container
    function resizeCanvas() {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      redrawFromHistory();
    }

    // Mouse event handlers
    function handleMouseDown(e) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      canvasRef.current.isDrawing = true;
      canvasRef.current.last = { x, y };
    }

    function handleMouseMove(e) {
      if (!canvasRef.current.isDrawing) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pm = canvasRef.current.last;
      const data = {
        pmx: pm.x,
        pmy: pm.y,
        x,
        y,
        tool,
        color,
        thickness,
      };
      pushToHistory(data, true);
      canvasRef.current.last = { x, y };
    }

    function handleMouseUp() {
      canvasRef.current.isDrawing = false;
    }

    return (
      <div className="relative flex-1 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    );
  }
);

export default BoardCanvas;
