import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  X,
  Target,
  Check,
  ChevronLeft,
} from "lucide-react";
import { Character } from "../../types";
import CharacterImage from "../../components/CharacterImage";

interface GWGuessModalProps {
  characters: Character[];
  eliminatedIds: Set<string>;
  onGuess: (characterId: string) => void;
  onCancel: () => void;
}

const RARITY_BORDER: Record<string, string> = {
  Common: "border-slate-600",
  Rare: "border-blue-500",
  Epic: "border-purple-500",
  Legendary: "border-amber-500",
};

export default function GWGuessModal({
  characters,
  eliminatedIds,
  onGuess,
  onCancel,
}: GWGuessModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const availableChars = characters.filter((c) => !eliminatedIds.has(c.id));
  const selectedChar = availableChars.find((c) => c.id === selected);

  const handleConfirm = () => {
    if (!selected) return;
    onGuess(selected);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl max-h-[85vh] nexus-glass rounded-2xl border border-violet-500/20 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Make Your Guess
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="mx-4 mt-3 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-400">
                ⚠️ WRONG GUESS = INSTANT LOSS
              </p>
              <p className="text-[10px] text-red-400/70">
                Choose carefully — you only get one shot!
              </p>
            </div>
          </div>

          {/* Character Selection Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs text-slate-500 mb-3">
              {availableChars.length} characters remaining — select who you
              think is your opponent's secret character:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {availableChars.map((char) => {
                const isSelected = selected === char.id;
                const borderClass =
                  RARITY_BORDER[char.rarity] || "border-slate-600";

                return (
                  <motion.button
                    key={char.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelected(char.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-fuchsia-400 shadow-lg shadow-fuchsia-500/30 ring-2 ring-fuchsia-400/30"
                        : `${borderClass} hover:border-violet-400/60`
                    } bg-slate-900/60`}
                  >
                    <div className="aspect-[3/4] w-full">
                      <CharacterImage
                        url={char.image}
                        name={char.name}
                        themeColor={char.themeColor}
                        fallbackUrl={char.malFallbackUrl}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Name Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5">
                      <p className="text-[9px] sm:text-[10px] font-bold text-white truncate">
                        {char.name}
                      </p>
                    </div>

                    {/* Selection Check */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-fuchsia-500 flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Confirmation Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-slate-950/60">
            {selectedChar ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-md overflow-hidden border border-fuchsia-500/40 flex-shrink-0">
                    <CharacterImage
                      url={selectedChar.image}
                      name={selectedChar.name}
                      themeColor={selectedChar.themeColor}
                      fallbackUrl={selectedChar.malFallbackUrl}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {selectedChar.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {selectedChar.anime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={onCancel}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 text-sm transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 transition duration-300 transform hover:scale-105"
                  >
                    <Target className="w-4 h-4" />
                    Confirm Guess
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Select a character above to make your guess
                </p>
                <button
                  onClick={onCancel}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 text-sm transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
