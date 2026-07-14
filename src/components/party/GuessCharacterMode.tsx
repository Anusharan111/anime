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
          className="cursor-pointer select-none relative shrink-0 transition-transform active:scale-95"
        >
          {/* Wrap in pointer-events-none so custom click handler does not trigger default back click spin */}
          <div className="pointer-events-none">
            <CharacterCard character={myCharacter} isFlipped={!cardRevealed} />
          </div>
          {/* Overlay text prompt */}
          <div className="absolute inset-x-0 bottom-6 flex justify-center z-30 pointer-events-none">
            <span className="bg-slate-950/90 text-white border border-white/10 px-3.5 py-2 rounded-full text-xs font-black shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
              {cardRevealed ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              {cardRevealed ? "Tap to Hide" : "Tap to Reveal"}
            </span>
          </div>
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
              <CharacterCard character={op.character} isFlipped={false} />
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
