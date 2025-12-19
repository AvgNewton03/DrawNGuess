import { useState } from 'react';

function LoginScreen({ onCreateGame, onJoinGame, isConnected = true }) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreate = () => {
    if (!isConnected) return;
    if (!username.trim()) return alert("Please enter a nickname!");
    onCreateGame(username);
  };

  const handleJoin = () => {
    if (!isConnected) return;
    if (!username.trim() || !roomId.trim()) return alert("Please enter nickname and Room ID!");
    onJoinGame(username, roomId);
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 sm:p-5 md:p-6">
      <div className="glass-panel p-6 sm:p-8 md:p-10 w-full max-w-md text-center relative">
        {/* Connection Status Indicator */}
        <div className={`absolute top-4 right-4 flex items-center gap-2 text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
          {isConnected ? 'Online' : 'Offline'}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl mb-6 sm:mb-7 md:mb-8 font-extrabold drop-shadow-lg">
          Draw<span className="text-secondary">&</span>Guess
        </h1>
        
        <div className="mb-4 sm:mb-5">
          <input
            type="text"
            className="w-full bg-black/20 border border-glass-border p-2.5 sm:p-3 rounded-lg text-white text-center text-base sm:text-lg md:text-xl outline-none placeholder:text-text-muted transition-all focus:border-primary/50"
            placeholder="Enter your nickname"
            maxLength={15}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {!isConnected && (
            <div className="text-red-300 text-xs sm:text-sm bg-red-500/10 p-2 rounded border border-red-500/20 mb-2">
              Cannot connect to server.
              <br/>
              Check VITE_BACKEND_URL config.
            </div>
          )}
          <button 
            onClick={handleCreate} 
            disabled={!isConnected}
            className={`btn btn-primary w-full ${!isConnected ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            Create Private Room
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4 text-text-muted text-xs sm:text-sm">
            <div className="h-px bg-glass-border flex-1"></div>
            OR
            <div className="h-px bg-glass-border flex-1"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              className="flex-1 bg-black/20 border border-glass-border p-2.5 sm:p-3 rounded-lg text-white text-center sm:text-left outline-none placeholder:text-text-muted text-sm sm:text-base transition-all focus:border-primary/50"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button 
              onClick={handleJoin} 
              disabled={!isConnected}
              className={`btn btn-secondary whitespace-nowrap ${!isConnected ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
