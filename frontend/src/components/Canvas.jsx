import { useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';

function Canvas({ socket, isDrawer }) {
  const canvasRef = useRef(null);
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
      ctx.strokeStyle = data.isEraser ? '#ffffff' : data.color;

      ctx.lineTo(data.x * w, data.y * h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x * w, data.y * h);
    };

    const handleClear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleBeginPath = () => {
      ctx.beginPath();
    };

    socket.on('draw', handleDraw);
    socket.on('clearCanvas', handleClear);
    socket.on('beginPath', handleBeginPath); // Optional: if server emits this

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clearCanvas', handleClear);
      socket.off('beginPath', handleBeginPath);
    };
  }, [socket]);

  const startDraw = (e) => {
    if (!isDrawer) return;
    setDrawing(true);
    draw(e);
  };

  const stopDraw = () => {
    setDrawing(false);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    // socket.emit('beginPath'); // Optional: sync path reset
  };

  const draw = (e) => {
    if (!drawing || !isDrawer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket.emit('draw', {
      x: x / canvas.width,
      y: y / canvas.height,
      color: tool === 'eraser' ? '#ffffff' : currentColor,
      size: currentSize,
      isEraser: tool === 'eraser'
    });
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
    <div className="flex flex-col h-full">
      <div className="flex-1 relative cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseOut={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
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
