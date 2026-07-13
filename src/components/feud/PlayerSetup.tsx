import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, Zap, Play, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { FEUD_CATEGORIES } from "../../data/animeFeudQuestions";
import { GameMode } from "../../game/turnManager";

interface PlayerSetupProps {
  onStartGame: (setup: {
    playerNames: string[];
    mode: GameMode;
    selectedCategories: string[];
    rounds: number;
  }) => void;
  onBack: () => void;
}

export default function PlayerSetup({ onStartGame, onBack }: PlayerSetupProps) {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [mode, setMode] = useState<GameMode>("duel");
  const [playerNames, setPlayerNames] = useState<string[]>(["Hero Picker", "AI Overlord"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [rounds, setRounds] = useState<number>(5);

  const handlePlayerCountSelect = (count: number) => {
    setPlayerCount(count);
    // Auto-mode detection
    let defaultMode: GameMode = "duel";
    if (count === 2) {
      defaultMode = "duel";
    } else if (count >= 3 && count <= 4) {
      defaultMode = "team";
    } else {
      defaultMode = "party";
    }
    setMode(defaultMode);

    // Initialize/resize player names
    const names = [...playerNames];
    if (names.length < count) {
      for (let i = names.length; i < count; i++) {
        names.push(`Player ${i + 1}`);
      }
    } else if (names.length > count) {
      names.splice(count);
    }
    setPlayerNames(names);
    setStep(2);
  };

  const handleNameChange = (index: number, val: string) => {
    const updated = [...playerNames];
    updated[index] = val;
    setPlayerNames(updated);
  };

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      setSelectedCategories(["All"]);
      return;
    }

    let next = selectedCategories.filter((c) => c !== "All");
    if (next.includes(cat)) {
      next = next.filter((c) => c !== cat);
      if (next.length === 0) {
        next = ["All"];
      }
    } else {
      next.push(cat);
    }
    setSelectedCategories(next);
  };

  const handleStart = () => {
    onStartGame({
      playerNames,
      mode,
      selectedCategories,
      rounds,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 nexus-glass rounded-2xl border border-violet-500/20 text-white shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-600/30 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-fuchsia-400" /> ANIME FEUD Setup
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure your offline multiplayer matchup</p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition duration-200 text-slate-300"
        >
          Cancel
        </button>
      </div>

      {/* Wizard Steps */}
      <div className="relative z-10 min-h-[350px] flex flex-col justify-between">
        
        {/* Step 1: Player Count */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center"
          >
            <h3 className="text-xl font-semibold mb-6 text-center text-slate-200">How many players?</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
              {[2, 3, 4, 6, 8].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountSelect(count)}
                  className="p-6 rounded-xl bg-slate-900/60 hover:bg-violet-950/40 border border-violet-500/20 hover:border-violet-500/50 flex flex-col items-center justify-center gap-2 transition duration-300 transform hover:-translate-y-1 group"
                >
                  <Users className="w-8 h-8 text-violet-400 group-hover:scale-110 transition duration-300" />
                  <span className="text-lg font-bold text-white">{count} Players</span>
                  <span className="text-xs text-slate-400">
                    {count === 2 ? "1v1 Duel" : count <= 4 ? "Teams or FFA" : "FFA Party"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Game Mode & Customization */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-3 text-slate-200 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> Select Game Mode
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "duel", title: "1v1 Duel", desc: "Classic head-to-head match" },
                  { id: "team", title: "Team VS", desc: "Crimson vs Cobalt team play" },
                  { id: "party", title: "Party FFA", desc: "Strict free-for-all rotation" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as GameMode)}
                    className={`p-3 rounded-lg border text-left transition duration-200 ${
                      mode === m.id
                        ? "bg-violet-600/30 border-violet-400/80 shadow-lg shadow-violet-500/10"
                        : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="font-semibold text-sm">{m.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-slate-200">Enter Player Names</h3>
              <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                {playerNames.map((name, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400">Player {index + 1}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      className="px-3 py-1.5 rounded bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                Next Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Categories & Rounds Selection */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-200">Select Categories</h3>
                <span className="text-[10px] text-slate-400">Pick specific categories or stick to "All"</span>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 border border-white/5 rounded-lg p-2 bg-slate-950/40">
                {FEUD_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`py-1.5 px-2.5 rounded text-xs text-left border flex items-center justify-between transition ${
                        isSelected
                          ? "bg-fuchsia-600/30 border-fuchsia-400/80 text-white"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-200">Rounds Per Game</h3>
                <span className="text-lg font-bold text-fuchsia-400">{rounds} Rounds</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 Round</span>
                <span>5 Rounds (Default)</span>
                <span>10 Rounds</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleStart}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-violet-500/20 transition duration-300 transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" /> Start Game
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
