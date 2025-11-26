import { cn } from "../lib/utils";

function PlayerList({ scores, drawerName }) {
  return (
    <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
      {Object.entries(scores).map(([name, score]) => {
        const isDrawer = name === drawerName;
        return (
          <li 
            key={name} 
            className={cn(
              "flex justify-between items-center p-2 rounded-lg min-w-[120px] md:min-w-0 bg-white/5",
              isDrawer && "border border-primary bg-primary/10"
            )}
          >
            <span className="font-medium truncate max-w-[100px]">{name}</span>
            <span className="text-sm font-bold opacity-80">{score} pts</span>
          </li>
        );
      })}
    </ul>
  );
}

export default PlayerList;
