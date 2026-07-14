import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { API_BASE } from "../config";
import PartySetup, { PartySetupData } from "../components/party/PartySetup";
import GuessCharacterMode from "../components/party/GuessCharacterMode";
import GuessImposterMode from "../components/party/GuessImposterMode";
import { Loader2 } from "lucide-react";

interface AnimePartyGamesProps {
  onExit: () => void;
}

export default function AnimePartyGames({ onExit }: AnimePartyGamesProps) {
  const [phase, setPhase] = useState<"setup" | "loading" | "playing">("setup");
  const [gameData, setGameData] = useState<PartySetupData | null>(null);
  
  const [charactersPool, setCharactersPool] = useState<Character[]>([]);
  
  // Game states
  const [guessCharacterList, setGuessCharacterList] = useState<Character[]>([]);
  const [imposterCivilianChar, setImposterCivilianChar] = useState<Character | null>(null);
  const [imposterOddChar, setImposterOddChar] = useState<Character | null>(null);
  const [imposterIdx, setImposterIdx] = useState<number>(0);

  const handleStart = async (data: PartySetupData) => {
    setGameData(data);
    setPhase("loading");
    
    try {
      // Fetch characters pool if empty
      let pool = charactersPool;
      if (pool.length < data.players.length + 5) {
        const res = await fetch(`${API_BASE}/api/characters`);
        if (res.ok) {
          pool = await res.json();
          setCharactersPool(pool);
        }
      }
      
      // Shuffle pool
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      
      if (data.mode === "guess-character") {
        setGuessCharacterList(shuffled.slice(0, data.players.length));
      } else {
        setImposterCivilianChar(shuffled[0]);
        setImposterOddChar(shuffled[1]);
        setImposterIdx(Math.floor(Math.random() * data.players.length));
      }
      
      setPhase("playing");
    } catch (e) {
      console.error("Failed to load characters for party game", e);
      alert("Failed to load characters. Please check connection.");
      setPhase("setup");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4">
      {phase === "setup" && (
        <PartySetup onStart={handleStart} onBack={onExit} />
      )}
      
      {phase === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-white font-bold tracking-widest uppercase">Preparing Party...</p>
        </div>
      )}
      
      {phase === "playing" && gameData?.mode === "guess-character" && (
        <GuessCharacterMode 
          players={gameData.players} 
          characters={guessCharacterList} 
          onEndGame={() => setPhase("setup")}
        />
      )}
      
      {phase === "playing" && gameData?.mode === "guess-imposter" && imposterCivilianChar && imposterOddChar && (
        <GuessImposterMode 
          players={gameData.players} 
          civiliansChar={imposterCivilianChar} 
          imposterChar={imposterOddChar} 
          imposterIdx={imposterIdx}
          onEndGame={() => setPhase("setup")}
        />
      )}
    </div>
  );
}
