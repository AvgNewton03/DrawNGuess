function LeaderboardScreen({ scores, onPlayAgain }) {
  const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);

  return (
    <div className="h-full w-full flex items-center justify-center p-4 sm:p-5 md:p-6">
      <div className="glass-panel p-6 sm:p-8 md:p-10 w-full max-w-md text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-7 md:mb-8 font-bold drop-shadow-lg">Game Over!</h1>
        
        <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-7 md:mb-8 max-h-[50vh] sm:max-h-60 overflow-y-auto">
          {sortedScores.map(([name, score], index) => (
            <div key={name} className="flex justify-between items-center p-2.5 sm:p-3 bg-white/5 rounded-lg text-sm sm:text-base">
              <span className="font-semibold truncate flex-1 text-left mr-2">#{index + 1} {name}</span>
              <span className="text-secondary font-bold flex-shrink-0">{score} pts</span>
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
