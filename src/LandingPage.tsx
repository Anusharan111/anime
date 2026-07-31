import React from "react";
import {
  ArrowRight,
  Mic2,
  Search,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import "./LandingPage.css";

interface LandingPageProps {
  onSelectBattle: () => void;
  onSelectFeud: () => void;
  onSelectGuessWho: () => void;
  onSelectParty: () => void;
}

const MODES = [
  {
    title: "Anime Battle",
    tag: "Draft Duel",
    text: "Build a six-role team, counter your rival, and settle the matchup with power scoring.",
    cta: "Enter Battle",
    badge: "No. 01",
    className: "mode-battle",
    tilt: "-5deg",
    icon: Swords,
  },
  {
    title: "Anime Feud",
    tag: "Trivia Clash",
    text: "Guess the top anime answers, steal rounds, and turn fandom knowledge into points.",
    cta: "Play Feud",
    badge: "No. 02",
    className: "mode-feud",
    tilt: "5deg",
    icon: Mic2,
  },
  {
    title: "Guess Who",
    tag: "Secret Pick",
    text: "Ask clever yes-or-no questions and expose the hidden character before your rival does.",
    cta: "Start Search",
    badge: "No. 03",
    className: "mode-guess",
    tilt: "5deg",
    icon: Search,
  },
  {
    title: "Party Games",
    tag: "Group Room",
    text: "Bring friends into quick rounds of character guessing and imposter-style anime chaos.",
    cta: "Open Party",
    badge: "No. 04",
    className: "mode-party",
    tilt: "-5deg",
    icon: Users,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectBattle,
  onSelectFeud,
  onSelectGuessWho,
  onSelectParty,
}) => {
  const handlers = [onSelectBattle, onSelectFeud, onSelectGuessWho, onSelectParty];

  return (
    <div className="homepage-v2">
      {/* ── fixed background: vignette only (no stacking context trap) ── */}
      <div className="home-bg" aria-hidden="true">
        <div className="home-bg-vignette" />
      </div>

      {/* ── videos at root level so z-index is globally respected ── */}
      <video src="/zo.mp4" className="home-bg-video home-bg-video-left"  autoPlay loop muted playsInline aria-hidden="true" />
      <video src="/go.mp4" className="home-bg-video home-bg-video-right" autoPlay loop muted playsInline aria-hidden="true" />

      {/* ── Leaf Field Animation ── */}
      <div className="leaf-field" aria-hidden="true">
        <img className="leaf"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23ff7896' d='M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z'/%3E%3Cpath fill='%23ff7896' d='M50 10c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 60c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z'/%3E%3C/svg%3E"
          style={{
            left: '5%',
            width: '40px',
            animationDuration: '16s, 4s, 7s'
          }} />
        <img className="leaf"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23ff7896' d='M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z'/%3E%3Cpath fill='%23ff7896' d='M50 10c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 60c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z'/%3E%3C/svg%3E"
          style={{
            left: '40%',
            width: '28px',
            animationDuration: '12s, 5s, 5s'
          }} />
        <img className="leaf"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23ff7896' d='M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z'/%3E%3Cpath fill='%23ff7896' d='M50 10c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 60c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z'/%3E%3C/svg%3E"
          style={{
            left: '75%',
            width: '55px',
            animationDuration: '20s, 6s, 9s'
          }} />
      </div>

      <main className="home-shell">
        {/* Magic Circle */}
        <div className="magic-circle" aria-hidden="true" style={{ left: '50%', top: '30%', transform: 'translate(-50%, -50%)' }} />

        <section className="home-hero">
          <div className="home-kicker">
            <Sparkles className="home-kicker-icon" />
            Epic Anime Battle Multiverse
          </div>

          <h1>Anime Battle</h1>
          <p className="home-subtitle">
            Pick a mode, build your roster, and jump straight into anime party combat.
          </p>

          <div className="home-stats" aria-label="Game highlights">
            <span><Trophy aria-hidden="true" /> 4 Modes</span>
            <span><Users aria-hidden="true" /> Online Multiplayer</span>
            <span><Sparkles aria-hidden="true" /> Real-Time Duels</span>
          </div>
        </section>

        <section className="mode-grid" aria-label="Choose a game mode">
          {MODES.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.title}
                type="button"
                className={`mode-card glass ${mode.className}`}
                style={{ "--tilt": mode.tilt } as React.CSSProperties}
                onClick={handlers[index]}
              >
                <span className="mode-card-badge">{mode.badge}</span>
                <span className="mode-card-icon"><Icon aria-hidden="true" /></span>
                <span className="mode-card-tag">{mode.tag}</span>
                <h2>{mode.title}</h2>
                <p>{mode.text}</p>
                <span className="mode-card-cta">
                  {mode.cta}
                  <ArrowRight aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </section>
      </main>

      <footer className="home-footer">
        <span>(C) 2026 ANIME BATTLE. ALL RIGHTS RESERVED</span>
        <span>MADE FOR ANIME ENTHUSIASTS WORLDWIDE</span>
      </footer>
    </div>
  );
};

export default LandingPage;
