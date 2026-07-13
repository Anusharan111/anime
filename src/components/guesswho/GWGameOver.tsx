import React from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Skull,
  MessageCircle,
  RotateCcw,
  Home,
  Sparkles,
  Star,
} from "lucide-react";
import { Character } from "../../types";
import CharacterImage from "../../components/CharacterImage";

interface GWGameOverProps {
  won: boolean;
  mySecret: Character;
  opponentSecret: Character;
  myName: string;
  opponentName: string;
  questionsAsked: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

const RARITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Common: {
    bg: "bg-slate-600/20",
    text: "text-slate-400",
    border: "border-slate-500/40",
  },
  Rare: {
    bg: "bg-blue-600/20",
    text: "text-blue-400",
    border: "border-blue-500/40",
  },
  Epic: {
    bg: "bg-purple-600/20",
    text: "text-purple-400",
    border: "border-purple-500/40",
  },
  Legendary: {
    bg: "bg-amber-600/20",
    text: "text-amber-400",
    border: "border-amber-500/40",
  },
};

function RevealCard({
  character,
  label,
  delay,
}: {
  character: Character;
  label: string;
  delay: number;
}) {
  const rarity = RARITY_STYLES[character.rarity] || RARITY_STYLES.Common;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="flex-1 min-w-0"
    >
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-2 text-center">
        {label}
      </p>
      <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-xl">
        <div className="aspect-[3/4] w-full max-h-[220px]">
          <CharacterImage
            url={character.image}
            name={character.name}
            themeColor={character.themeColor}
            fallbackUrl={character.malFallbackUrl}
            className="w-full h-full"
          />
        </div>
        <div className="p-3 bg-gradient-to-t from-slate-950 to-slate-900/80 space-y-1.5">
          <h4 className="text-sm font-bold text-white truncate">
            {character.signatureEmoji} {character.name}
          </h4>
          <p className="text-[10px] text-slate-400 truncate">
            {character.anime}
          </p>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${rarity.bg} ${rarity.text} border ${rarity.border}`}
          >
            <Star className="w-2.5 h-2.5" />
            {character.rarity}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function GWGameOver({
  won,
  mySecret,
  opponentSecret,
  myName,
  opponentName,
  questionsAsked,
  onPlayAgain,
  onExit,
}: GWGameOverProps) {
  return (
    <div className="w-full max-w-xl mx-auto p-6 nexus-glass rounded-2xl border border-violet-500/20 text-white shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div
        className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[80px] ${
          won ? "bg-amber-500/15" : "bg-red-500/15"
        }`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-[80px] ${
          won ? "bg-violet-500/15" : "bg-slate-500/10"
        }`}
      />

      <div className="relative z-10 space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            damping: 15,
            stiffness: 200,
          }}
          className="text-center"
        >
          <motion.div
            animate={
              won
                ? {
                    rotate: [0, -5, 5, -3, 3, 0],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 1.2, delay: 0.3 }}
            className="inline-block"
          >
            {won ? (
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
            ) : (
              <Skull className="w-16 h-16 text-red-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
            )}
          </motion.div>

          <h2
            className={`text-4xl sm:text-5xl font-black tracking-wider ${
              won
                ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-r from-red-400 via-red-500 to-rose-500 bg-clip-text text-transparent"
            }`}
          >
            {won ? "VICTORY!" : "DEFEAT"}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {won
              ? `${myName} correctly guessed the secret character!`
              : `${opponentName} outsmarted you this time.`}
          </p>

          {won && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center mt-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400/60" />
            </motion.div>
          )}
        </motion.div>

        {/* Revealed Characters */}
        <div className="flex gap-4">
          <RevealCard
            character={mySecret}
            label="Your Secret"
            delay={0.4}
          />
          <RevealCard
            character={opponentSecret}
            label="Opponent's Secret"
            delay={0.6}
          />
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-6 py-3 px-4 rounded-xl bg-slate-950/60 border border-white/5"
        >
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="w-4 h-4 text-violet-400" />
            <span className="text-slate-400">Questions Asked:</span>
            <span className="font-bold text-violet-300">
              {questionsAsked}
            </span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-3"
        >
          <button
            onClick={onExit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-sm font-medium transition duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Hub
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition duration-300 transform hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </motion.div>
      </div>
    </div>
  );
}
