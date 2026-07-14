import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../../types";
import { Eye, EyeOff, RotateCcw, AlertTriangle } from "lucide-react";
import CharacterCard from "../CharacterCard";
import { sfx } from "../../utils/audio";

interface GuessImposterModeProps {
  players: string[];
  civiliansChar: Character;
  imposterChar: Character;
  imposterIdx: number;
  onEndGame: () => void;
}

export default function GuessImposterMode({ players, civiliansChar, imposterChar, imposterIdx, onEndGame }: GuessImposterModeProps) {
  const [activePlayerIdx, setActivePlayerIdx] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-950/50 px-6 py-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black italic tracking-wider text-white">GUESS IMPOSTER</h2>
          <p className="text-slate-400 text-sm">Pass the device. Keep your character a secret!</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sfx.playShowdown(); setShowReveal(true); }}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-2 text-sm shadow-lg shadow-rose-900/30"
          >
            <AlertTriangle className="w-4 h-4" /> REVEAL IMPOSTER
          </button>
          <button
            onClick={onEndGame}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-2 text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" /> END GAME
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showReveal ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-8 flex flex-col items-center text-center space-y-6"
          >
            <h2 className="text-3xl font-black text-rose-500 uppercase tracking-widest">
              THE IMPOSTER IS {players[imposterIdx]}!
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-sm">Civilians Had</span>
                <div className="scale-90 opacity-70">
                  <CharacterCard character={civiliansChar} isFlipped={true} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-rose-400 font-bold uppercase tracking-wider text-sm">Imposter Had</span>
                <div className="scale-110 shadow-[0_0_40px_rgba(244,63,94,0.3)] rounded-2xl">
                  <CharacterCard character={imposterChar} isFlipped={true} />
                </div>
              </div>
            </div>
            <button
              onClick={onEndGame}
              className="mt-4 px-8 py-3 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
            >
              FINISH
            </button>
          </motion.div>
        ) : activePlayerIdx === null ? (
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
                className="bg-slate-900/50 hover:bg-rose-900/40 border border-white/5 hover:border-rose-500/50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all transform hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition">
                  <Eye className="w-8 h-8" />
                </div>
                <span className="font-bold text-white text-lg">{player}</span>
                <span className="text-xs text-slate-500 group-hover:text-rose-300">Click to view role</span>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-6 text-center max-w-lg w-full">
              <h3 className="text-xl font-bold text-rose-300 mb-1">
                Role for {players[activePlayerIdx]}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Memorize your character, then hide the board! Do not show this to anyone else.
              </p>
              
              <div className="flex justify-center mb-6">
                <CharacterCard 
                  character={activePlayerIdx === imposterIdx ? imposterChar : civiliansChar} 
                  isFlipped={true} 
                />
              </div>

              <button
                onClick={() => { sfx.playSelect(); setActivePlayerIdx(null); }}
                className="px-8 py-3 rounded-full bg-slate-800 text-white font-black tracking-wider hover:bg-slate-700 transition shadow-lg"
              >
                HIDE BOARD
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
