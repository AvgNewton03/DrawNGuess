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
    <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/95 backdrop-blur-sm border border-glass-border rounded-lg sm:rounded-xl shadow-2xl text-black max-w-[calc(100%-1rem)] sm:max-w-[95%] z-10">
      <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
        {/* Tools */}
        <div className="flex gap-0.5 sm:gap-1">
          <button 
            onClick={onUndo} 
            className="p-1.5 sm:p-2 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors touch-manipulation" 
            title="Undo"
            aria-label="Undo"
          >
            <span className="text-sm sm:text-base">↩️</span>
          </button>
          <button 
            onClick={onRedo} 
            className="p-1.5 sm:p-2 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors touch-manipulation" 
            title="Redo"
            aria-label="Redo"
          >
            <span className="text-sm sm:text-base">↪️</span>
          </button>
          <div className="w-px bg-gray-300 mx-0.5 sm:mx-1"></div>
          <button 
            onClick={() => setTool('brush')} 
            className={cn("p-1.5 sm:p-2 rounded-lg transition-all touch-manipulation", tool === 'brush' ? "bg-primary text-white shadow-md" : "hover:bg-gray-200 active:bg-gray-300")}
            title="Brush"
            aria-label="Brush"
          >
            <span className="text-sm sm:text-base">✏️</span>
          </button>
          <button 
            onClick={() => setTool('eraser')} 
            className={cn("p-1.5 sm:p-2 rounded-lg transition-all touch-manipulation", tool === 'eraser' ? "bg-primary text-white shadow-md" : "hover:bg-gray-200 active:bg-gray-300")}
            title="Eraser"
            aria-label="Eraser"
          >
            <span className="text-sm sm:text-base">🧹</span>
          </button>
          <button 
            onClick={onClear} 
            className="p-1.5 sm:p-2 hover:bg-red-100 active:bg-red-200 text-red-500 rounded-lg transition-colors touch-manipulation" 
            title="Clear"
            aria-label="Clear"
          >
            <span className="text-sm sm:text-base">🗑️</span>
          </button>
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 px-1.5 sm:px-2 py-1 rounded-lg">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 whitespace-nowrap">Size</span>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={currentSize} 
            onChange={(e) => setCurrentSize(parseInt(e.target.value))}
            className="w-16 sm:w-20 accent-primary h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer touch-manipulation"
            aria-label="Brush size"
          />
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center pt-1 border-t border-gray-200">
        {COLORS.map(color => (
          <button
            key={color}
            className={cn(
              "w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/10 transition-transform active:scale-95 shadow-sm touch-manipulation",
              currentColor === color && tool === 'brush' && "ring-2 ring-primary ring-offset-1 sm:ring-offset-2 scale-110"
            )}
            style={{ backgroundColor: color }}
            onClick={() => {
              setCurrentColor(color);
              setTool('brush');
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Toolbar;
