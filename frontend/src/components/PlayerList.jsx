import { cn } from "../lib/utils";

function PlayerList({ scores, drawerName }) {
  return (
    <ul className="flex flex-row md:flex-col gap-1.5 sm:gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
      {Object.entries(scores).map(([name, score]) => {
        const isDrawer = name === drawerName;
        return (
          <li 
            key={name} 
            className={cn(
              "flex justify-between items-center p-1.5 sm:p-2 rounded-lg min-w-[100px] sm:min-w-[120px] md:min-w-0 bg-white/5 flex-shrink-0 md:flex-shrink",
              isDrawer && "border border-primary bg-primary/10"
            )}
          >
            <span className="font-medium truncate text-xs sm:text-sm md:text-base max-w-[80px] sm:max-w-[100px] md:max-w-none">{name}</span>
            <span className="text-xs sm:text-sm font-bold opacity-80 ml-2 flex-shrink-0">{score} pts</span>
          </li>
        );
      })}
    </ul>
  );
}

export default PlayerList;
