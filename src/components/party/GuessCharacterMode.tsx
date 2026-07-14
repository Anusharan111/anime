import React from "react";
import { motion } from "motion/react";
import { Character } from "../../types";
import { EyeOff, RotateCcw, StopCircle } from "lucide-react";
import CharacterCard from "../CharacterCard";

interface GuessCharacterModeProps {
  myCharacter: Character;
  otherPlayers: { name: string; character: Character }[];
  isHost: boolean;
  onEndGame: () => void;
}

export default function GuessCharacterMode({ myCharacter, otherPlayers, isHost, onEndGame }: GuessCharacterModeProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-950/50 px-6 py-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black italic tracking-wider text-white">🎭 GUESS CHARACTER</h2>
          <p className="text-slate-400 text-sm">Ask the others yes/no questions — figure out YOUR character!</p>
        </div>
        {isHost ? (
          <button
            onClick={onEndGame}
            className="px-4 py-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600/40 hover:text-white transition flex items-center gap-2 text-sm font-bold"
          >
            <StopCircle className="w-4 h-4" /> End Game
          </button>
        ) : (
          <div className="px-4 py-2 rounded-lg bg-slate-900 border border-white/5 text-slate-500 text-sm font-bold">
            Waiting for host...
          </div>
        )}
      </div>

      {/* YOUR card — hidden */}
      <div className="bg-violet-950/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-44 h-64 rounded-2xl border-2 border-dashed border-violet-500/40 flex flex-col items-center justify-center gap-3 bg-violet-950/20 shrink-0">
          <EyeOff className="w-10 h-10 text-violet-500/50" />
          <span className="text-violet-400/60 font-bold text-sm uppercase tracking-wider">Your Character</span>
          <span className="text-violet-400/40 text-xs bg-violet-950/40 px-3 py-1 rounded-full border border-violet-500/20">Hidden</span>
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-black text-white">This is YOUR card — it's hidden!</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            You cannot see your own character. Ask the other players yes/no questions to figure out who you are!<br />
            <span className="text-violet-300 font-semibold">Everyone else's cards are shown below.</span>
          </p>
        </div>
      </div>

      {/* Other players' cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Other Players' Characters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherPlayers.map((op, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              className="relative group"
            >
              <CharacterCard character={op.character} isFlipped={true} />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-slate-950 z-10 whitespace-nowrap">
                {op.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
