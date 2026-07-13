import React from "react";
import { motion } from "motion/react";
import { X, Eye } from "lucide-react";
import { Character } from "../../types";
import CharacterImage from "../../components/CharacterImage";

interface GWCharacterGridProps {
  characters: Character[];
  eliminatedIds: Set<string>;
  onEliminate: (id: string) => void;
  onRestore: (id: string) => void;
  disabled: boolean;
}

const RARITY_BORDER: Record<string, string> = {
  Common: "border-slate-600",
  Rare: "border-blue-500",
  Epic: "border-purple-500",
  Legendary: "border-amber-500",
};

const RARITY_GLOW: Record<string, string> = {
  Common: "",
  Rare: "shadow-blue-500/10",
  Epic: "shadow-purple-500/10",
  Legendary: "shadow-amber-500/20",
};

export default function GWCharacterGrid({
  characters,
  eliminatedIds,
  onEliminate,
  onRestore,
  disabled,
}: GWCharacterGridProps) {
  const remaining = characters.length - eliminatedIds.size;

  const handleClick = (id: string) => {
    if (disabled) return;
    if (eliminatedIds.has(id)) {
      onRestore(id);
    } else {
      onEliminate(id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Remaining Count Badge */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-slate-400">Your Tracking Board</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-bold ${
              remaining <= 5
                ? "text-amber-400"
                : remaining <= 10
                ? "text-cyan-400"
                : "text-violet-400"
            }`}
          >
            {remaining}
          </span>
          <span className="text-xs text-slate-500">
            / {characters.length} remaining
          </span>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {characters.map((char, i) => {
          const isEliminated = eliminatedIds.has(char.id);
          const borderClass =
            RARITY_BORDER[char.rarity] || "border-slate-600";
          const glowClass = RARITY_GLOW[char.rarity] || "";

          return (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              onClick={() => handleClick(char.id)}
              disabled={disabled}
              className={`relative rounded-lg overflow-hidden border transition-all duration-200 group ${borderClass} ${
                isEliminated
                  ? "opacity-40 scale-95 border-red-500/50"
                  : `hover:scale-[1.03] hover:shadow-lg ${glowClass} shadow-md`
              } ${
                disabled
                  ? "cursor-default"
                  : "cursor-pointer"
              } bg-slate-900/60`}
            >
              {/* Character Image */}
              <div
                className={`aspect-[3/4] w-full ${
                  isEliminated ? "grayscale" : ""
                }`}
              >
                <CharacterImage
                  url={char.image}
                  name={char.name}
                  themeColor={char.themeColor}
                  fallbackUrl={char.malFallbackUrl}
                  className="w-full h-full"
                />
              </div>

              {/* Name Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 sm:p-1.5">
                <p className="text-[9px] sm:text-[10px] font-bold text-white truncate leading-tight">
                  {char.name}
                </p>
                <p className="text-[7px] sm:text-[8px] text-slate-400 truncate leading-tight">
                  {char.anime}
                </p>
              </div>

              {/* Eliminated Overlay */}
              {isEliminated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-red-950/30"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/30 flex items-center justify-center backdrop-blur-sm">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                  </div>
                </motion.div>
              )}

              {/* Hover hint when not eliminated */}
              {!isEliminated && !disabled && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <X className="w-5 h-5 text-red-400/80" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
