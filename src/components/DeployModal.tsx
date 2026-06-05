import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character, RoleId, SlottedTeam } from "../types";
import { ROLE_CATEGORIES } from "../data/roles";
import { Shield, Swords, Heart, Zap, Crosshair, Sparkles, X, Plus } from "lucide-react";
import CharacterImage from "./CharacterImage";

interface DeployModalProps {
  character: Character;
  slots: SlottedTeam;
  onSelect: (roleId: RoleId) => void;
  onClose: () => void;
}

const RoleIcon = ({ id, className }: { id: string; className?: string }) => {
  switch (id) {
    case "captain": return <TrophyIcon className={className} />;
    case "vice_captain": return <Swords className={className} />;
    case "tank": return <Shield className={className} />;
    case "healer": return <Heart className={className} />;
    case "support_1": return <Zap className={className} />;
    case "support_2": return <Crosshair className={className} />;
    default: return <Sparkles className={className} />;
  }
};

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V18" />
    <path d="M14 22V18" />
    <path d="M18 4H6v7a6 6 0 0 0 12 0V4Z" />
  </svg>
);

export default function DeployModal({ character, slots, onSelect, onClose }: DeployModalProps) {
  // Prevent clicks from reaching background
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <motion.div
        onClick={handleContentClick}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg overflow-hidden nexus-glass border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6"
      >
        {/* Header / Title */}
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nexus-cyan animate-pulse shadow-[0_0_8px_#00e5ff]" />
              Deploy Tactical Asset
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
              Select position for {character.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Quick Info */}
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
            <CharacterImage
              url={character.image}
              name={character.name}
              fallbackUrl={character.malFallbackUrl}
              themeColor={character.themeColor}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[8px] font-mono font-bold text-nexus-cyan uppercase tracking-widest">
              {character.anime}
            </span>
            <h4 className="text-base font-black text-white uppercase truncate tracking-tight">
              {character.name}
            </h4>
            <div className="flex gap-2 items-center mt-1">
              <span className="text-[9px] font-mono font-black text-amber-400 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                PWR {character.overallPower}
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400">
                {character.rarity}
              </span>
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
            Available Positions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLE_CATEGORIES.map((role) => {
              const occupant = slots[role.id];
              const isOccupied = !!occupant;

              return (
                <button
                  key={role.id}
                  disabled={isOccupied}
                  onClick={() => onSelect(role.id)}
                  className={`
                    w-full relative flex items-center justify-between p-3 rounded-xl border transition-all duration-300
                    ${isOccupied
                      ? "border-white/5 bg-white/2 cursor-not-allowed opacity-50"
                      : "border-white/10 bg-white/5 hover:border-nexus-cyan/50 hover:bg-nexus-cyan/5 active:scale-98 cursor-pointer group"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`
                      p-2 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isOccupied 
                        ? "bg-white/5 border border-white/5 text-slate-500" 
                        : "bg-nexus-blue/15 border border-nexus-blue/20 text-nexus-cyan group-hover:text-nexus-cyan shadow-[0_0_10px_rgba(0,229,255,0.05)]"
                      }
                    `}>
                      <RoleIcon id={role.id} className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className={`text-xs font-black uppercase tracking-wider ${isOccupied ? "text-slate-500" : "text-white"}`}>
                        {role.name}
                      </p>
                      {isOccupied ? (
                        <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          Filled by {occupant.name}
                        </p>
                      ) : (
                        <p className="text-[9px] font-mono text-slate-400">
                          Empty
                        </p>
                      )}
                    </div>
                  </div>

                  {!isOccupied && (
                    <div className="w-6 h-6 rounded-full bg-nexus-cyan/10 border border-nexus-cyan/20 flex items-center justify-center text-nexus-cyan opacity-40 group-hover:opacity-100 group-hover:bg-nexus-cyan group-hover:text-black transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5">
          Deploying slots finishes your current turn.
        </div>
      </motion.div>
    </div>
  );
}
