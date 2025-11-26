import { cn } from "../lib/utils";

const COLORS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
  "#ffff00", "#00ffff", "#ff00ff", "#C0C0C0", "#808080",
  "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"
];

function Toolbar({ 
  currentColor, 
  setCurrentColor, 
  currentSize, 
  setCurrentSize, 
  tool, 
  setTool,
  onUndo,
  onRedo,
  onClear
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-sm border border-glass-border rounded-xl shadow-2xl text-black max-w-[95%]">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Tools */}
        <div className="flex gap-1">
          <button onClick={onUndo} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Undo">↩️</button>
          <button onClick={onRedo} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Redo">↪️</button>
          <div className="w-px bg-gray-300 mx-1"></div>
          <button 
            onClick={() => setTool('brush')} 
            className={cn("p-2 rounded-lg transition-all", tool === 'brush' ? "bg-primary text-white shadow-md" : "hover:bg-gray-200")}
            title="Brush"
          >
            ✏️
          </button>
          <button 
            onClick={() => setTool('eraser')} 
            className={cn("p-2 rounded-lg transition-all", tool === 'eraser' ? "bg-primary text-white shadow-md" : "hover:bg-gray-200")}
            title="Eraser"
          >
            🧹
          </button>
          <button onClick={onClear} className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Clear">🗑️</button>
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
          <span className="text-xs font-bold text-gray-500">Size</span>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={currentSize} 
            onChange={(e) => setCurrentSize(parseInt(e.target.value))}
            className="w-20 accent-primary h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-wrap gap-1.5 justify-center pt-1 border-t border-gray-200">
        {COLORS.map(color => (
          <button
            key={color}
            className={cn(
              "w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110 shadow-sm",
              currentColor === color && tool === 'brush' && "ring-2 ring-primary ring-offset-2 scale-110"
            )}
            style={{ backgroundColor: color }}
            onClick={() => {
              setCurrentColor(color);
              setTool('brush');
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Toolbar;
