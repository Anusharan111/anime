import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RoleId, SlottedTeam } from "../types";
import { ROLE_CATEGORIES } from "../data/roles";
import { Shield, Swords, Heart, Zap, Crosshair, Sparkles } from "lucide-react";
import CharacterImage from "./CharacterImage";

interface TeamSlotsProps {
  playerName: string;
  isAI?: boolean;
  slots: SlottedTeam;
  skipUsed: boolean;
  activeTurn: boolean;
  onSlotSelect?: (roleId: RoleId) => void;
  isDraggingActive?: boolean;
  layout?: "standard" | "compact-vertical" | "compact-horizontal" | "compact-horizontal-top";
  isMobile?: boolean;
  selectedCardId?: string | null;
  isLarge?: boolean;
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

export default function TeamSlots({
  playerName,
  isAI = false,
  slots,
  skipUsed,
  activeTurn,
  onSlotSelect,
  isDraggingActive = false,
  layout = "standard",
  isMobile = false,
  selectedCardId = null,
  isLarge = false,
}: TeamSlotsProps) {
  const handleDragOver = (e: React.DragEvent) => {
    if (!activeTurn || isAI || layout === "compact-horizontal" || layout === "compact-horizontal-top") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, roleId: RoleId) => {
    if (!activeTurn || isAI || layout === "compact-horizontal" || layout === "compact-horizontal-top") return;
    e.preventDefault();
    if (onSlotSelect) onSlotSelect(roleId);
  };

  const isCompact = layout === "compact-vertical" || layout === "compact-horizontal" || layout === "compact-horizontal-top";

  return (
    <div className={`flex flex-col gap-2.5 h-full ${activeTurn ? 'opacity-100' : 'opacity-60'} transition-all duration-500 ${isMobile && layout === "compact-vertical" ? 'bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-2xl' : ''}`}>
      {/* Player Identity Header */}
      {!isCompact ? (
        <div className="nexus-glass rounded-xl p-4 border-l-4 border-nexus-blue flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-nexus-blue/10 to-transparent pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-mono font-black text-nexus-cyan/70 tracking-widest uppercase">
              {isAI ? "Automated Combatant" : "Field Commander"}
            </span>
            {activeTurn && (
              <div className="flex items-center gap-1.5 bg-nexus-blue/20 px-2 py-0.5 rounded border border-nexus-blue/30 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-nexus-cyan shadow-[0_0_8px_#00e5ff]" />
                <span className="text-[8px] font-mono font-black text-nexus-cyan">UPLINK ACTIVE</span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight truncate nexus-glow-text">
            {playerName}
          </h3>
          <div className="flex gap-2 mt-1">
            <div className={`h-1 flex-1 rounded-full bg-white/10 overflow-hidden`}>
               <motion.div 
                 className="h-full bg-nexus-blue" 
                 initial={{ width: 0 }}
                 animate={{ width: `${(Object.values(slots).filter(Boolean).length / 6) * 100}%` }}
               />
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-500">{Object.values(slots).filter(Boolean).length}/6</span>
          </div>
        </div>
      ) : (
        /* Compact Vertical/Horizontal Title label */
        (layout === "compact-vertical" || layout === "compact-horizontal-top") && (
          <div className={`text-center py-1 bg-black/60 border border-white/10 rounded-lg w-full flex flex-col items-center justify-center gap-0.5 shadow-md overflow-hidden ${layout === "compact-horizontal-top" ? 'max-w-[80px]' : ''}`}>
            <span className="text-[7.5px] font-mono font-black text-slate-300 tracking-wider block truncate max-w-[55px] uppercase">
              {isAI ? "AI" : playerName.split(" ")[0]}
            </span>
            {activeTurn && (
              <span className="text-[6px] font-mono font-black text-nexus-cyan tracking-tighter uppercase animate-pulse">
                ● ACTIVE
              </span>
            )}
          </div>
        )
      )}

      {/* Deployment Grid / Stack / Row */}
      <div className={`
        ${layout === "compact-horizontal" || layout === "compact-horizontal-top"
          ? "flex flex-row gap-1 justify-center" 
          : layout === "compact-vertical"
            ? "flex flex-col gap-2 flex-1 justify-center items-center"
            : "grid grid-cols-2 gap-3 flex-1"
        }
      `}>
        {ROLE_CATEGORIES.map((role) => {
          const char = slots[role.id];
          const isOccupied = !!char;
          const isInteractive = activeTurn && !isAI && layout !== "compact-horizontal" && layout !== "compact-horizontal-top";
          const canDrop = isInteractive && isDraggingActive && !isOccupied;
          const canTapPlace = isInteractive && !!selectedCardId && !isOccupied;

          if (isCompact) {
            return (
              <div
                key={role.id}
                data-role-id={role.id}
                data-occupied={isOccupied ? 'true' : undefined}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, role.id)}
                onClick={() => isInteractive && onSlotSelect?.(role.id)}
                className={`
                  relative rounded-lg border transition-all duration-300 group touch-manipulation
                  ${layout === "compact-horizontal-top" ? 'w-10 h-10 sm:w-12 sm:h-12' : (isMobile ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-11 h-11 sm:w-13 sm:h-13')}
                  ${isOccupied 
                    ? 'border-nexus-blue/40 bg-nexus-blue/10 shadow-[0_0_15px_rgba(30,144,255,0.1)]' 
                    : canDrop || canTapPlace
                      ? 'border-nexus-cyan animate-nexus-pulse bg-nexus-cyan/20 cursor-pointer scale-110 z-20 shadow-[0_0_20px_rgba(0,229,255,0.3)]' 
                      : isInteractive
                        ? 'border-white/20 bg-white/10 hover:border-nexus-cyan/40 hover:bg-white/15 cursor-pointer shadow-lg active:scale-95' 
                        : 'border-white/5 bg-white/5 opacity-50'
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  {isOccupied ? (
                    <motion.div
                      key={`filled-compact-${char.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 p-0.5 flex flex-col justify-between"
                    >
                      <div className="relative flex-1 rounded overflow-hidden border border-white/5">
                        <CharacterImage
                          url={char.image}
                          name={char.name}
                          fallbackUrl={char.malFallbackUrl}
                          themeColor={char.themeColor}
                          layoutId={`slotted-${char.id}`}
                          className="w-full h-full object-cover object-top"
                        />
                        {/* Compact HUD Overlay showing power score */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-[1px] flex justify-center items-center">
                          <span className="text-[5.5px] font-mono font-black text-white leading-none">
                            {char.overallPower}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tiny Role Icon Badge */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded bg-black border border-white/10 flex items-center justify-center shadow-md z-20">
                        <RoleIcon id={role.id} className="w-1.5 h-1.5 text-nexus-cyan" />
                      </div>
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-0.5">
                      <RoleIcon id={role.id} className={`${layout === "compact-horizontal-top" ? 'w-3 h-3' : 'w-5 h-5'} ${canDrop || canTapPlace ? 'text-nexus-cyan' : 'text-slate-600'}`} />
                      {canTapPlace && (
                        <span className="text-[5px] font-mono font-black text-nexus-cyan uppercase tracking-wider mt-0.5 animate-pulse">TAP</span>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Standard Grid slots for Desktop/large screen standard layouts
          return (
            <div
              key={role.id}
              data-role-id={role.id}
              data-occupied={isOccupied ? 'true' : undefined}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, role.id)}
              onClick={() => activeTurn && !isAI && onSlotSelect?.(role.id)}
              className={`
                relative h-32 rounded-xl border-2 transition-all duration-300 group
                ${isOccupied 
                  ? 'border-nexus-blue/40 bg-nexus-blue/5 shadow-inner' 
                  : canDrop 
                    ? 'border-nexus-cyan animate-nexus-pulse bg-nexus-cyan/10 cursor-pointer scale-105 z-20' 
                    : activeTurn && !isAI 
                      ? 'border-white/5 bg-white/5 hover:border-white/20 cursor-pointer' 
                      : 'border-white/5 bg-white/5 opacity-50'
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isOccupied ? (
                  <motion.div
                    key={`filled-${char.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 p-1.5 flex flex-col"
                  >
                    <div className="relative flex-1 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                      <CharacterImage
                        url={char.image}
                        name={char.name}
                        fallbackUrl={char.malFallbackUrl}
                        themeColor={char.themeColor}
                        layoutId={`slotted-${char.id}`}
                        className="w-full h-full object-cover object-top brightness-90 group-hover:brightness-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Stat Overlays in Mini Card */}
                      <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                        <Zap className="w-2 h-2 text-nexus-cyan" />
                        <span className="text-[8px] font-mono font-black text-white">{char.overallPower}</span>
                      </div>
                    </div>

                    <div className="mt-1 px-1 flex justify-between items-center">
                      <span className="text-[9px] font-black text-white/90 uppercase tracking-tighter truncate max-w-[60px]">
                        {char.name.split(' ')[0]}
                      </span>
                      <div className="w-3 h-3 rounded bg-nexus-blue/20 flex items-center justify-center border border-nexus-blue/30">
                        <RoleIcon id={role.id} className="w-2 h-2 text-nexus-cyan" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <div className={`p-2 rounded-lg bg-white/5 border border-white/5 mb-2 transition-transform duration-300 ${canDrop ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <RoleIcon id={role.id} className={`w-5 h-5 ${canDrop ? 'text-nexus-cyan' : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-[11px] font-mono font-black tracking-wider uppercase ${canDrop ? 'text-nexus-cyan' : 'text-slate-400'}`}>
                      {role.name}
                    </span>
                    {canDrop && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="mt-1 text-[7px] text-nexus-cyan/70 font-mono animate-bounce"
                      >
                        DEPLOY UNIT
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>

              {/* Decorative Corner Lines */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 rounded-tl" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 rounded-br" />
            </div>
          );
        })}
      </div>

      {/* Strategic Skip Indicator */}
      {!isCompact && (
        <div className={`nexus-glass rounded-xl p-3 border border-white/5 flex items-center justify-between transition-all ${skipUsed ? 'bg-red-500/5' : 'bg-nexus-purple/5 hover:border-nexus-purple/30'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${skipUsed ? 'bg-red-500/10' : 'bg-nexus-purple/10'}`}>
              <Zap className={`w-4 h-4 ${skipUsed ? 'text-red-400' : 'text-nexus-purple'}`} />
            </div>
            <div>
              <p className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Skip Status</p>
              <p className={`text-[10px] font-bold uppercase ${skipUsed ? 'text-red-400' : 'text-white'}`}>
                {skipUsed ? "Skip Used" : "Skip Available"}
              </p>
            </div>
          </div>
          {!skipUsed && activeTurn && !isAI && (
            <div className="w-1.5 h-1.5 rounded-full bg-nexus-purple animate-ping" />
          )}
        </div>
      )}
    </div>
  );
}
