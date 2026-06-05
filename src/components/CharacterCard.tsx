import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { Swords, Shield, Zap, Sparkles, Brain, Trophy } from "lucide-react";
import CharacterImage from "./CharacterImage";

interface CharacterCardProps {
  character: Character;
  isFlipped: boolean;
  activePlayerName?: string;
  activeTurn?: "p1" | "p2";
  onFlipComplete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onClickBackSide?: () => void;
}

export default function CharacterCard({
  character,
  isFlipped,
  activePlayerName = "Commander",
  activeTurn = "p1",
  onFlipComplete,
  onDragStart,
  onDragEnd,
  onClickBackSide,
}: CharacterCardProps) {
  
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [hoverX, setHoverX] = React.useState(0);
  const [hoverY, setHoverY] = React.useState(0);
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(
        window.innerWidth < 1024 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset spinning state when character changes
  React.useEffect(() => {
    setIsSpinning(false);
  }, [character.id]);

  const handleBackClick = () => {
    if (isSpinning || !isFlipped) return;
    setIsSpinning(true);
    if (onClickBackSide) onClickBackSide();
    setTimeout(() => setIsSpinning(false), 750);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setHoverX(x);
    setHoverY(y);
  };

  const rarityConfig = {
    Legendary: {
      color: "#f59e0b",
      bg: "from-amber-900/40 via-black to-amber-950/40",
      glow: "shadow-[0_0_40px_rgba(245,158,11,0.3)]",
      border: "border-amber-500/50",
      text: "text-amber-400",
      foil: "rgba(245,158,11,0.15)"
    },
    Epic: {
      color: "#a855f7",
      bg: "from-purple-900/40 via-black to-indigo-950/40",
      glow: "shadow-[0_0_40px_rgba(168,85,247,0.3)]",
      border: "border-purple-500/50",
      text: "text-purple-400",
      foil: "rgba(168,85,247,0.15)"
    },
    Rare: {
      color: "#3b82f6",
      bg: "from-blue-900/40 via-black to-cyan-950/40",
      glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
      border: "border-blue-500/50",
      text: "text-blue-400",
      foil: "rgba(59,130,246,0.15)"
    },
    Common: {
      color: "#94a3b8",
      bg: "from-slate-800/40 via-black to-slate-900/40",
      glow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
      border: "border-slate-500/50",
      text: "text-slate-400",
      foil: "rgba(148,163,184,0.1)"
    }
  };

  const config = rarityConfig[character.rarity] || rarityConfig.Common;


  return (
    <div 
      className="relative w-[140px] h-[250px] sm:w-[260px] sm:h-[460px] md:w-[340px] md:h-[600px] perspective-1000 z-10 select-none group"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={isSpinning ? { rotateY: [180, 360, 540, 720] } : { rotateY: isFlipped ? 180 : 0 }}
        transition={isSpinning ? { duration: 0.75, ease: "easeInOut" } : { duration: 0.6, ease: "easeOut" }}
        style={{
          rotateX: !isFlipped ? (hoverY - 0.5) * -15 : 0,
          rotateY: !isFlipped ? (hoverX - 0.5) * 15 : (isSpinning ? undefined : 180),
        }}
        onAnimationComplete={() => {
          if (!isFlipped && onFlipComplete) onFlipComplete();
        }}
      >
        {/* FRONT SIDE */}
        <div
          draggable={!isFlipped && !isMobileDevice}
          onDragStart={(e) => {
            if (isFlipped || isMobileDevice) {
              e.preventDefault();
              return;
            }
            if (onDragStart) onDragStart(e);
          }}
          onDragEnd={onDragEnd}
          className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b ${config.bg} border-2 ${config.border} ${config.glow} backface-hidden overflow-hidden flex flex-col p-2 sm:p-4 ${isFlipped ? "pointer-events-none" : isMobileDevice ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
        >
          {/* Holographic Shimmer Overlay */}
          <div 
            className="absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle at ${hoverX * 100}% ${hoverY * 100}%, ${config.foil}, transparent 60%)`
            }}
          />

          {/* Rarity Tag Header */}
          <div className="flex justify-between items-center mb-2 sm:mb-3 z-30">
            <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-md border ${config.border} bg-black/60 backdrop-blur-md flex items-center gap-1 sm:gap-1.5`}>
              <Sparkles className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${config.text} animate-pulse`} />
              <span className={`text-[8px] sm:text-[10px] font-black tracking-[0.2em] uppercase ${config.text}`}>
                {character.rarity}
              </span>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${i < (character.overallPower / 100) ? config.text : 'bg-white/10'} shadow-sm`} />
              ))}
            </div>
          </div>

          {/* Portrait Container */}
          <div className="relative w-full h-[130px] sm:h-[240px] md:h-[320px] rounded-xl border border-white/10 overflow-hidden bg-black/40 group/portrait z-10 flex items-center justify-center mb-2 sm:mb-4">
            {/* Digital Scan Line */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className={`w-full h-[2px] bg-gradient-to-r from-transparent via-${config.color} to-transparent opacity-50 absolute animate-nexus-scan`} 
                   style={{ backgroundColor: config.color }} />
            </div>

            <CharacterImage 
              url={character.image}
              name={character.name}
              fallbackUrl={character.malFallbackUrl}
              themeColor={character.themeColor}
              layoutId={`char-image-${character.id}`}
              className="w-full h-full"

            />
            
            {/* Image HUD Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10 z-20">
              <span className="text-[8px] sm:text-[10px] font-mono font-bold text-white/70">PWR {character.overallPower}</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20">
               <p className={`text-[7.5px] sm:text-[9px] font-mono font-bold uppercase tracking-[0.3em] ${config.text} opacity-90 mb-0.5 sm:mb-1`}>
                {character.anime}
              </p>
              <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white uppercase tracking-tighter leading-none nexus-glow-text">
                {character.name}
              </h3>
            </div>
          </div>

          {/* Stats HUD Matrix */}

          <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-3 z-30">
            {[
              { label: "STR", val: character.stats.strength, icon: Swords, color: "text-red-400" },
              { label: "SPD", val: character.stats.speed, icon: Zap, color: "text-yellow-400" },
              { label: "DEF", val: character.stats.defense, icon: Shield, color: "text-emerald-400" },
              { label: "INT", val: character.stats.iq, icon: Brain, color: "text-cyan-400" },
              { label: "MAG", val: character.stats.magic, icon: Sparkles, color: "text-purple-400" },
            ].map((s, idx) => (
              <div key={idx} className={`flex items-center justify-between bg-white/5 border border-white/5 p-1 sm:p-1.5 rounded-lg backdrop-blur-sm group-hover:border-white/10 transition-colors ${idx === 4 ? 'col-span-2' : ''}`}>
                <div className="flex items-center gap-1 sm:gap-2">
                  <s.icon className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${s.color}`} />
                  <span className="text-[7.5px] sm:text-[9px] font-mono font-bold text-slate-400">{s.label}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-white">{s.val}</span>
              </div>
            ))}
          </div>

          {/* Skills Section */}
          {character.skills && character.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 sm:mb-3 z-30">
              {character.skills.slice(0, 2).map((skill, i) => (
                <div key={i} className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm group-hover:border-white/10 transition-all">
                   <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-nexus-cyan animate-pulse" />
                   <span className="text-[7px] sm:text-[8px] font-mono font-bold text-slate-300 uppercase tracking-tighter truncate max-w-[80px] sm:max-w-[120px]">{skill}</span>
                </div>
              ))}
            </div>
          )}

          {/* Abilities / Lore Footer */}
          <div className="mt-auto relative z-30 bg-black/40 border border-white/5 rounded-xl p-1.5 sm:p-2.5 md:p-3 backdrop-blur-md overflow-hidden group/lore">
            <div className={`absolute top-0 left-0 w-1 h-full ${config.text}`} style={{ backgroundColor: config.color }} />
            <p className="text-[8px] sm:text-[10px] md:text-[11px] leading-tight sm:leading-relaxed text-slate-300 font-medium italic line-clamp-2">
              "{character.quote || character.description}"
            </p>
          </div>

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent opacity-20 rotate-45 translate-x-10 -translate-y-10" />
        </div>

        {/* BACK SIDE */}
        <div 
          onClick={handleBackClick}
          className={`absolute inset-0 w-full h-full rounded-2xl bg-[#0a0a1f] border-2 border-nexus-blue/30 backface-hidden rotate-y-180 shadow-[0_0_30px_rgba(30,144,255,0.2)] flex items-center justify-center overflow-hidden ${isFlipped && !isSpinning ? "cursor-pointer group-hover:border-nexus-cyan/50" : "pointer-events-none"}`}
        >
          {/* Interaction shield */}
          <div className="absolute inset-0 z-[100]" />

          <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-8">
            {/* Digital Grid Background */}
            <div className="absolute inset-0 opacity-20"
                 style={{ backgroundImage: 'radial-gradient(#1e90ff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            {/* Animated scanning rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 sm:w-64 sm:h-64 border border-nexus-blue/10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
              <div className="w-28 h-28 sm:w-48 sm:h-48 border border-nexus-purple/10 rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 w-full flex justify-between items-center">
              <div className="text-[7.5px] sm:text-[9px] font-mono font-black text-nexus-blue/50 tracking-widest uppercase">Battle Card</div>
              <div className="flex gap-1">
                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-nexus-cyan animate-pulse" />
                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-nexus-cyan animate-pulse delay-75" />
                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-nexus-cyan animate-pulse delay-150" />
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-6 md:gap-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 md:w-32 rounded-3xl border-2 border-nexus-cyan/30 rotate-45 animate-nexus-float flex items-center justify-center bg-nexus-blue/5 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                  <div className="w-13 h-13 sm:w-16 md:w-20 rounded-2xl border border-nexus-purple/40 -rotate-45 flex items-center justify-center bg-black/40 backdrop-blur-xl">
                    <Trophy className="w-6 h-6 sm:w-7 md:w-10 text-nexus-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1.5 sm:space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-[0.1em] font-serif nexus-glow-text uppercase leading-none">
                  Anime Battle
                </h2>
                <div className="inline-flex items-center gap-1.5 bg-nexus-blue/10 border border-nexus-blue/20 px-2.5 py-0.5 sm:px-4 sm:py-1 rounded-full">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-nexus-cyan animate-ping" />
                  <span className="text-[7.5px] sm:text-[10px] text-nexus-cyan font-mono font-black tracking-widest uppercase">Ready to reveal</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full glassmorphism bg-white/5 border border-white/10 rounded-xl p-2 sm:p-4 text-center">
              <p className="text-[7.5px] sm:text-[10px] text-nexus-cyan font-mono uppercase tracking-[0.35em] mb-1 sm:mb-2 font-black">Pick Card</p>
              <h4 className="text-xs sm:text-sm font-black text-white tracking-widest uppercase truncate max-w-[120px] sm:max-w-none mx-auto">
                {activePlayerName}
              </h4>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

