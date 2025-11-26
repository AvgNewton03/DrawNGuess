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
    <div className="h-screen p-5 flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-4">
        {/* Header */}
        <div className="glass-panel p-4 flex items-center justify-between flex-wrap gap-4">
          <div className={`text-3xl font-extrabold ${timer <= 10 ? 'text-red-500' : 'text-secondary'}`}>
            {timer}
          </div>
          <div className="text-2xl font-semibold tracking-[0.2em] text-center flex-1">
            {currentWord}
          </div>
          <div className="text-sm font-medium opacity-80">
            Room: {gameId}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0 flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 glass-panel p-4 overflow-y-auto flex-shrink-0 order-2 md:order-1 max-h-32 md:max-h-none">
            <h3 className="font-bold mb-3 hidden md:block">Players</h3>
            <PlayerList scores={scores} drawerName={drawerName} />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 glass-panel p-3 relative flex flex-col bg-white order-1 md:order-2">
            {overlay.show && (
              <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center rounded-2xl">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">{overlay.text}</h2>
                  <div dangerouslySetInnerHTML={{ __html: overlay.subtext }} className="text-lg opacity-90" />
                </div>
              </div>
            )}
            
            <Canvas socket={socket} isDrawer={isDrawer} />
          </div>

          {/* Chat */}
          <div className="md:w-80 glass-panel p-4 flex flex-col order-3 h-48 md:h-auto">
            <Chat socket={socket} username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
