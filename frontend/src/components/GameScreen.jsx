import PlayerList from './PlayerList';
import Canvas from './Canvas';
import Chat from './Chat';

function GameScreen({ 
  socket, 
  gameId, 
  username, 
  scores, 
  isDrawer, 
  currentWord, 
  timer, 
  drawerName,
  overlay 
}) {
  return (
    <div className="h-full w-full p-2 sm:p-3 md:p-5 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-2 sm:gap-3 md:gap-4">
        {/* Header */}
        <div className="glass-panel p-2 sm:p-3 md:p-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${timer <= 10 ? 'text-red-500' : 'text-secondary'}`}>
            {timer}
          </div>
          <div className="text-sm sm:text-base md:text-xl lg:text-2xl font-semibold tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-center flex-1 min-w-0 px-1 sm:px-2">
            <span className="break-words">{currentWord}</span>
          </div>
          <div className="text-xs sm:text-sm font-medium opacity-80 hidden sm:block">
            Room: <span className="font-mono">{gameId}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-2 sm:gap-3 md:gap-4 min-h-0 flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Mobile: horizontal scroll, Desktop: vertical */}
          <div className="md:w-48 lg:w-64 glass-panel p-2 sm:p-3 md:p-4 overflow-y-auto md:overflow-y-auto overflow-x-auto md:overflow-x-visible flex-shrink-0 order-2 md:order-1">
            <h3 className="font-bold mb-2 md:mb-3 text-sm md:text-base hidden md:block">Players</h3>
            <PlayerList scores={scores} drawerName={drawerName} />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 glass-panel p-1 sm:p-2 md:p-3 relative flex flex-col bg-white order-1 md:order-2 min-w-0 min-h-0">
            {overlay.show && (
              <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center rounded-xl md:rounded-2xl">
                <div className="text-center text-white px-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{overlay.text}</h2>
                  <div dangerouslySetInnerHTML={{ __html: overlay.subtext }} className="text-sm sm:text-base md:text-lg opacity-90" />
                </div>
              </div>
            )}
            
            <Canvas socket={socket} isDrawer={isDrawer} />
          </div>

          {/* Chat */}
          <div className="md:w-64 lg:w-80 glass-panel p-2 sm:p-3 md:p-4 flex flex-col order-3 h-40 sm:h-48 md:h-auto flex-shrink-0">
            <Chat socket={socket} username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
