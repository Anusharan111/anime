import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../../types";
import { EyeOff, StopCircle, Eye } from "lucide-react";
import CharacterCard from "../CharacterCard";

interface GuessCharacterModeProps {
  myCharacter: Character;
  otherPlayers: { name: string; character: Character }[];
  isHost: boolean;
  onEndGame: () => void;
}

export default function GuessCharacterMode({ myCharacter, otherPlayers, isHost, onEndGame }: GuessCharacterModeProps) {
  const [cardRevealed, setCardRevealed] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[80vh] space-y-6 p-4">
      {/* Header */}
      <div className="bg-slate-950/50 px-6 py-4 rounded-xl border border-white/5">
        <h2 className="text-2xl font-black italic tracking-wider text-white">🎭 GUESS CHARACTER</h2>
        <p className="text-slate-400 text-sm">Ask the others yes/no questions — figure out YOUR character!</p>
      </div>

      {/* YOUR card — toggleable */}
      <div className="bg-violet-950/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div 
          onClick={() => setCardRevealed(prev => !prev)}
          className="cursor-pointer select-none relative shrink-0 transition-transform hover:scale-[1.02]"
        >
          <AnimatePresence mode="wait">
            {cardRevealed ? (
              <motion.div
                key="shown"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <CharacterCard character={myCharacter} isFlipped={true} />
                {/* Overlay badge to prompt hide on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center rounded-2xl group">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/80 px-4 py-2 rounded-xl text-xs text-white font-bold transition-opacity flex items-center gap-1.5 border border-white/10 shadow-xl">
                    <EyeOff className="w-3.5 h-3.5 text-violet-400" /> Tap to Hide Card
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-[160px] h-[286px] sm:w-[260px] sm:h-[460px] md:w-[340px] md:h-[600px] rounded-2xl border-2 border-dashed border-violet-500/40 flex flex-col items-center justify-center gap-3 bg-violet-950/20 hover:bg-violet-950/30 transition-colors"
              >
                <EyeOff className="w-10 h-10 text-violet-500/50 sm:w-16 sm:h-16" />
                <span className="text-violet-400/60 font-bold text-sm uppercase tracking-wider">Your Character</span>
                <span className="text-violet-400/40 text-xs bg-violet-950/40 px-3 py-1 rounded-full border border-violet-500/20 font-mono">
                  Hidden — Tap to Reveal
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold font-mono">
            {cardRevealed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {cardRevealed ? "CARD REVEALED" : "CARD HIDDEN"}
          </div>

          <h3 className="text-2xl font-black text-white">
            {cardRevealed ? `You are ${myCharacter.name}!` : "This is YOUR card — it's hidden!"}
          </h3>
          
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            {cardRevealed ? (
              <>
                You've revealed your character. Remember to keep it hidden from the other players if you want to keep playing by the rules! Tap the card again at any time to hide it.
              </>
            ) : (
              <>
                You cannot see your own character. Ask the other players yes/no questions to figure out who you are!<br />
                <span className="text-violet-300 font-semibold">Everyone else's cards are shown below. Tap your card to reveal/hide it.</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Other players' cards */}
      <div className="flex-1">
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

      {/* Sticky bottom bar — End Game for host only */}
      {isHost && (
        <div className="sticky bottom-4 mt-auto">
          <button
            onClick={onEndGame}
            className="w-full py-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white transition-all font-black flex items-center justify-center gap-2 text-sm backdrop-blur-sm shadow-lg"
          >
            <StopCircle className="w-4 h-4" />
            END GAME — Return Everyone to Lobby
          </button>
        </div>
      )}
    </div>
  );
}
