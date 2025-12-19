import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('login'); // login, game, leaderboard
  const [gameId, setGameId] = useState('');
  const [username, setUsername] = useState('');
  const [scores, setScores] = useState({});
  const [finalScores, setFinalScores] = useState({});
  
  // Game Round State
  const [isDrawer, setIsDrawer] = useState(false);
  const [currentWord, setCurrentWord] = useState('WAITING FOR PLAYERS...');
  const [timer, setTimer] = useState(60);
  const [drawerName, setDrawerName] = useState('');
  const [roundInfo, setRoundInfo] = useState({ round: 1, maxRounds: 3 });
  
  // Overlay State
  const [overlay, setOverlay] = useState({ show: false, text: '', subtext: '' });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('gameCreated', (data) => {
      setGameId(data.gameId);
      setGameState('game');
    });

    newSocket.on('gameJoined', (data) => {
      setGameId(data.gameId);
      setScores(data.scores);
      setGameState('game');
    });

    newSocket.on('updateScores', (newScores) => {
      setScores(newScores);
    });

    newSocket.on('newRound', (data) => {
      setIsDrawer(data.drawerId === newSocket.id);
      setDrawerName(data.drawer);
      setRoundInfo({ round: data.round, maxRounds: data.maxRounds });
      setOverlay({ show: false, text: '', subtext: '' });
      
      if (data.drawerId === newSocket.id) {
        setCurrentWord("YOUR TURN TO DRAW!");
      } else {
        setCurrentWord("_ ".repeat(data.wordLength));
      }
    });

    newSocket.on('yourWord', (word) => {
      setCurrentWord(word);
    });

    newSocket.on('timer', (time) => {
      setTimer(time);
    });

    newSocket.on('roundEnd', (data) => {
      setOverlay({ 
        show: true, 
        text: 'Round Over!', 
        subtext: `The word was: <span class="text-secondary font-bold">${data.word}</span><br>${data.reason}` 
      });
      setCurrentWord(data.word);
    });

    newSocket.on('gameOver', (data) => {
      setGameState('leaderboard');
      setFinalScores(data.scores);
    });

    newSocket.on('error', (msg) => {
      alert(msg);
    });

    return () => newSocket.close();
  }, []);

  const createGame = (user) => {
    setUsername(user);
    socket.emit('createGame', { username: user });
  };

  const joinGame = (user, id) => {
    setUsername(user);
    socket.emit('joinGame', { gameId: id, username: user });
  };

  return (
    <div className="app-container relative w-full h-full overflow-hidden">
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {gameState === 'login' && (
        <LoginScreen onCreateGame={createGame} onJoinGame={joinGame} isConnected={isConnected} />
      )}

      {gameState === 'game' && (
        <GameScreen 
          socket={socket}
          gameId={gameId}
          username={username}
          scores={scores}
          isDrawer={isDrawer}
          currentWord={currentWord}
          timer={timer}
          drawerName={drawerName}
          overlay={overlay}
        />
      )}

      {gameState === 'leaderboard' && (
        <LeaderboardScreen scores={finalScores} onPlayAgain={() => window.location.reload()} />
      )}
    </div>
  );
}

export default App;
