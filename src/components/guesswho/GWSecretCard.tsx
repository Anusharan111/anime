import React from "react";
import { motion } from "motion/react";
import { Shield, Star } from "lucide-react";
import { Character } from "../../types";
import CharacterImage from "../../components/CharacterImage";

interface GWSecretCardProps {
  character: Character;
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

export default function GWSecretCard({ character }: GWSecretCardProps) {
  const rarity = RARITY_STYLES[character.rarity] || RARITY_STYLES.Common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      {/* Pulsing golden border glow */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 15px rgba(245, 158, 11, 0.15), 0 0 30px rgba(245, 158, 11, 0.05)",
            "0 0 25px rgba(245, 158, 11, 0.3), 0 0 50px rgba(245, 158, 11, 0.1)",
            "0 0 15px rgba(245, 158, 11, 0.15), 0 0 30px rgba(245, 158, 11, 0.05)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-xl border-2 border-amber-500/50 bg-slate-950/70 nexus-glass overflow-hidden"
      >
        {/* Label */}
        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-400">
            Your Secret Character
          </span>
        </div>

        {/* Card Body */}
        <div className="flex gap-3 p-3">
          {/* Character Image */}
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-amber-500/30 flex-shrink-0">
            <CharacterImage
              url={character.image}
              name={character.name}
              themeColor={character.themeColor}
              fallbackUrl={character.malFallbackUrl}
              className="w-full h-full"
            />
          </div>

          {/* Character Info */}
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {character.signatureEmoji} {character.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {character.anime}
            </p>

            {/* Rarity Badge */}
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${rarity.bg} ${rarity.text} border ${rarity.border}`}
              >
                <Star className="w-2.5 h-2.5" />
                {character.rarity}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
