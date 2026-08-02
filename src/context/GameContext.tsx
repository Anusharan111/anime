// Context for managing game state across the application
import { createContext, useContext, useState, ReactNode } from 'react';
import { Character } from '../types';

export interface GameState {
  playerTeams: Character[][];
  currentRound: number;
  scores: number[];
  gameMode: 'duel' | 'team' | 'party' | null;
  playerNames: string[];
}

interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  updateTeams: (teams: Character[][]) => void;
  updateScores: (scores: number[]) => void;
  resetGame: () => void;
}

const initialGameState: GameState = {
  playerTeams: [],
  currentRound: 0,
  scores: [],
  gameMode: null,
  playerNames: []
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const updateTeams = (teams: Character[][]) => {
    setGameState(prev => ({ ...prev, playerTeams: teams }));
  };

  const updateScores = (scores: number[]) => {
    setGameState(prev => ({ ...prev, scores }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  return (
    <GameContext.Provider value={{ gameState, setGameState, updateTeams, updateScores, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};