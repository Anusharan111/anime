import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../../types";
import { Search, Eye, EyeOff, RotateCcw } from "lucide-react";
import CharacterCard from "../CharacterCard";
import { sfx } from "../../utils/audio";

interface GuessCharacterModeProps {
  players: string[];
  characters: Character[];
  onEndGame: () => void;
}

export default function GuessCharacterMode({ players, characters, onEndGame }: GuessCharacterModeProps) {
  const [activePlayerIdx, setActivePlayerIdx] = useState<number | null>(null);

  // When a player is selected, they see everyone else's card but their own.
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-950/50 px-6 py-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black italic tracking-wider text-white">GUESS CHARACTER</h2>
          <p className="text-slate-400 text-sm">Pass the device. Don't let others see the screen!</p>
        </div>
        <button
          onClick={onEndGame}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" /> END GAME
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activePlayerIdx === null ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {players.map((player, idx) => (
              <button
                key={idx}
                onClick={() => { sfx.playSelect(); setActivePlayerIdx(idx); }}
                className="bg-slate-900/50 hover:bg-violet-900/40 border border-white/5 hover:border-violet-500/50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all transform hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition">
                  <Eye className="w-8 h-8" />
                </div>
                <span className="font-bold text-white text-lg">{player}</span>
                <span className="text-xs text-slate-500 group-hover:text-violet-300">Click to reveal board</span>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="bg-violet-950/30 border border-violet-500/20 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-violet-300 mb-1">
                You are {players[activePlayerIdx]}
              </h3>
              <p className="text-slate-400 text-sm">
                Ask the other players yes/no questions to guess your character! You can see everyone else's characters below.
              </p>
              
              <button
                onClick={() => { sfx.playSelect(); setActivePlayerIdx(null); }}
                className="mt-4 px-6 py-2 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700 transition shadow-lg"
              >
                HIDE BOARD
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map((player, idx) => {
                if (idx === activePlayerIdx) {
                  return (
                    <div key={idx} className="bg-slate-900 rounded-xl border border-dashed border-slate-700 p-4 flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
                      <EyeOff className="w-8 h-8 text-slate-600" />
                      <span className="font-bold text-white">{player} (You)</span>
                      <span className="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-white/5">HIDDEN</span>
                    </div>
                  );
                }
                const char = characters[idx];
                return (
                  <div key={idx} className="relative group">
                    <CharacterCard character={char} isFlipped={true} />
                    <div className="absolute -top-3 -right-3 bg-violet-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-slate-950 z-10">
                      {player}'s Card
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
