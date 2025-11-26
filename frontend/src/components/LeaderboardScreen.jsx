function LeaderboardScreen({ scores, onPlayAgain }) {
  const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);

  return (
    <div className="h-screen flex items-center justify-center p-5">
      <div className="glass-panel p-10 w-full max-w-md text-center">
        <h1 className="text-4xl mb-8 font-bold drop-shadow-lg">Game Over!</h1>
        
        <div className="flex flex-col gap-3 mb-8 max-h-60 overflow-y-auto">
          {sortedScores.map(([name, score], index) => (
            <div key={name} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="font-semibold">#{index + 1} {name}</span>
              <span className="text-secondary font-bold">{score} pts</span>
            </div>
          ))}
        </div>

        <button onClick={onPlayAgain} className="btn btn-primary w-full">
          Play Again
        </button>
      </div>
    </div>
  );
}

export default LeaderboardScreen;
