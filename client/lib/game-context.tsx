"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { GameState } from "@/types";

interface GameContextType {
  state: GameState;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  updateState: (patch: Partial<GameState>) => void;
}

const defaultState: GameState = {
  socket: null,
  sessionId: null,
  playerName: null,
  role: null,
  currentStage: 1,
  level: 1,
  score: 0,
  completedStages: 0,
};

export const GameContext = createContext<GameContextType>({
  state: defaultState,
  setState: () => {},
  updateState: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(defaultState);

  const updateState = useCallback((patch: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ state, setState, updateState }), [state, updateState]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
