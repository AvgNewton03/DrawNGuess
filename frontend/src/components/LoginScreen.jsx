import { useState } from 'react';

function LoginScreen({ onCreateGame, onJoinGame }) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleCreate = () => {
    if (!username.trim()) return alert("Please enter a nickname!");
    onCreateGame(username);
  };

  const handleJoin = () => {
    if (!username.trim() || !roomId.trim()) return alert("Please enter nickname and Room ID!");
    onJoinGame(username, roomId);
  };

  return (
    <div className="h-screen flex items-center justify-center p-5">
      <div className="glass-panel p-10 w-full max-w-md text-center">
        <h1 className="text-5xl mb-8 font-extrabold drop-shadow-lg">
          Draw<span className="text-secondary">&</span>Guess
        </h1>
        
        <div className="mb-5">
          <input
            type="text"
            className="w-full bg-black/20 border border-glass-border p-3 rounded-lg text-white text-center text-xl outline-none placeholder:text-text-muted"
            placeholder="Enter your nickname"
            maxLength={15}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={handleCreate} className="btn btn-primary w-full">
            Create Private Room
          </button>
          
          <div className="flex items-center gap-4 text-text-muted text-sm">
            <div className="h-px bg-glass-border flex-1"></div>
            OR
            <div className="h-px bg-glass-border flex-1"></div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-black/20 border border-glass-border p-3 rounded-lg text-white outline-none placeholder:text-text-muted"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoin} className="btn btn-secondary whitespace-nowrap">
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
