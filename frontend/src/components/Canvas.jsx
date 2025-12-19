import { useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';

function Canvas({ socket, isDrawer }) {
  const canvasRef = useRef(null);
  const lastPosRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(5);
  const [tool, setTool] = useState('brush'); // brush, eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    
    const resizeCanvas = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleDraw = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.lineWidth = data.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = data.isEraser ? '#ffffff' : data.color;

      ctx.beginPath();
      ctx.moveTo(data.from.x * w, data.from.y * h);
      ctx.lineTo(data.to.x * w, data.to.y * h);
      ctx.stroke();
    };

    const handleClear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('draw', handleDraw);
    socket.on('clearCanvas', handleClear);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clearCanvas', handleClear);
    };
  }, [socket]);

  // Helper to get coordinates
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    if (clientX === undefined || clientY === undefined) return null;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDraw = (e) => {
    if (!isDrawer) return;
    
    const pos = getPos(e);
    if (!pos) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Start fresh path
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    // Draw a single dot
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    setDrawing(true);
    lastPosRef.current = pos;
    
    // Emit single point draw
    socket.emit('draw', {
      from: { x: pos.x / canvas.width, y: pos.y / canvas.height },
      to: { x: pos.x / canvas.width, y: pos.y / canvas.height },
      color: tool === 'eraser' ? '#ffffff' : currentColor,
      size: currentSize,
      isEraser: tool === 'eraser'
    });
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPosRef.current = null;
  };

  const draw = (e) => {
    if (!drawing || !isDrawer || !lastPosRef.current) return;

    const pos = getPos(e);
    if (!pos) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    socket.emit('draw', {
      from: { x: lastPosRef.current.x / canvas.width, y: lastPosRef.current.y / canvas.height },
      to: { x: pos.x / canvas.width, y: pos.y / canvas.height },
      color: tool === 'eraser' ? '#ffffff' : currentColor,
      size: currentSize,
      isEraser: tool === 'eraser'
    });

    lastPosRef.current = pos;
  };

  const handleClear = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearCanvas'); // You might need to add this event listener on server if not exists
    // Based on script.js, there is no explicit 'clearCanvas' emit from client, only tool button.
    // But server has 'clearCanvas' method in Room class, but it's not exposed via socket event in server.js provided.
    // Wait, server.js DOES NOT have a socket listener for 'clearCanvas'.
    // It only clears on new round.
    // The original script.js has a clearTool but no logic attached to it in the snippet I saw?
    // Let me check script.js again.
    // script.js: const clearTool = document.getElementById("clearTool");
    // But no event listener attached to clearTool in script.js! 
    // So the original app's clear button didn't work? 
    // Or I missed it.
    // I will implement it locally at least.
  };
  
  // Checking script.js again...
  // Lines 220-228: Canvas listeners.
  // No listeners for clearTool.
  // So the original app had a broken clear button?
  // I will fix it by adding a clear event. But I can't modify server.js easily without permission (though I can).
  // I'll just implement local clear for now, but it won't sync if server doesn't handle it.
  // Actually, I should probably add the event to server.js if I want it to work.
  // But the user asked to "keep the functionality the same". If it was broken, maybe I should leave it?
  // No, "help me fix it" was the previous prompt. This prompt is "keep functionality the same".
  // I'll stick to what's there.
  // However, I'll add the UI for it.

  // Undo/Redo logic is also missing in client-side script.js provided?
  // script.js has `undoBtn` and `redoBtn` but no listeners attached.
  // server.js has `undo` and `redo` methods in Room class, but no socket listeners calling them.
  // So the original app had UI for Undo/Redo but no implementation?
  // I will implement the UI but maybe disable them or just log "Not implemented".
  
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <div className="flex-1 relative cursor-crosshair touch-none min-h-0" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseOut={stopDraw}
          onTouchStart={(e) => {
            e.preventDefault();
            startDraw(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDraw();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            stopDraw();
          }}
        />
      </div>
      
      {isDrawer && (
        <Toolbar 
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          currentSize={currentSize}
          setCurrentSize={setCurrentSize}
          tool={tool}
          setTool={setTool}
          onUndo={() => {}}
          onRedo={() => {}}
          onClear={handleClear}
        />
      )}
    </div>
  );
}

export default Canvas;
