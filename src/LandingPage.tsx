import React from "react";
import "./LandingPage.css";

interface LandingPageProps {
  onSelectBattle: () => void;
  onSelectFeud: () => void;
  onSelectGuessWho: () => void;
  onSelectParty: () => void;
}

const CardButton = ({
  className,
  onClick,
  children,
}: {
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button type="button" className={className} onClick={onClick}>
    {children}
  </button>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectBattle,
  onSelectFeud,
  onSelectGuessWho,
  onSelectParty,
}) => {
  return (
    <div className="homepage-v2">
      <div className="bg-figures" aria-hidden="true">
        <video src="/zo.mp4" className="bg-fig char-1" autoPlay loop muted playsInline />
        <video src="/go.mp4" className="bg-fig char-2" autoPlay loop muted playsInline />

        <div className="portal-wrap">
          <div className="frame-glow" />
          <div className="frame-inner">
            <video src="/1.mp4" className="bg-fig char-3" autoPlay loop muted playsInline />
          </div>
          <div className="frame-flames" aria-hidden="true">
            <span className="flame flame-1" />
            <span className="flame flame-2" />
            <span className="flame flame-3" />
            <span className="flame flame-4" />
            <span className="flame flame-5" />
            <span className="flame flame-6" />
          </div>
          <span className="frame-corner fc-tl" />
          <span className="frame-corner fc-tr" />
          <span className="frame-corner fc-bl" />
          <span className="frame-corner fc-br" />
          <span className="frame-spark" />

          <div className="frame-embers" aria-hidden="true">
            <span className="fspark" style={{ left: "4%", width: "5px", height: "5px", "--fc": "#FFD23F", "--drift": "10px", animationDuration: "2.2s, .5s", animationDelay: "0s, 0s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "14%", width: "3px", height: "3px", "--fc": "#FF7A00", "--drift": "-8px", animationDuration: "1.8s, .4s", animationDelay: ".3s, .1s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "24%", width: "4px", height: "4px", "--fc": "#FF3B00", "--drift": "14px", animationDuration: "2.6s, .6s", animationDelay: ".6s, .2s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "34%", width: "3px", height: "3px", "--fc": "#FFD23F", "--drift": "-10px", animationDuration: "2s, .5s", animationDelay: ".9s, .3s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "50%", width: "5px", height: "5px", "--fc": "#FF7A00", "--drift": "6px", animationDuration: "2.4s, .4s", animationDelay: ".2s, 0s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "60%", width: "3px", height: "3px", "--fc": "#FFD23F", "--drift": "-12px", animationDuration: "1.9s, .5s", animationDelay: ".5s, .2s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "70%", width: "4px", height: "4px", "--fc": "#FF3B00", "--drift": "9px", animationDuration: "2.3s, .6s", animationDelay: ".8s, .1s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "80%", width: "3px", height: "3px", "--fc": "#FF7A00", "--drift": "-7px", animationDuration: "2.1s, .4s", animationDelay: "1.1s, .3s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "90%", width: "5px", height: "5px", "--fc": "#FFD23F", "--drift": "12px", animationDuration: "2.5s, .5s", animationDelay: ".4s, 0s" } as React.CSSProperties} />
            <span className="fspark" style={{ left: "96%", width: "3px", height: "3px", "--fc": "#FF3B00", "--drift": "-9px", animationDuration: "1.7s, .4s", animationDelay: "1.3s, .2s" } as React.CSSProperties} />
          </div>
        </div>
      </div>

      <div className="sparkle-field" aria-hidden="true">
        <span className="sparkle" style={{ left: "8%", top: "14%", "--c": "#FFE29A", animationDelay: "0s", animationDuration: "2.6s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "18%", top: "62%", "--c": "#00E5FF", animationDelay: ".4s", animationDuration: "3.1s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "27%", top: "30%", "--c": "#FF2E63", animationDelay: ".8s", animationDuration: "2.8s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "36%", top: "80%", "--c": "#FFC93F", animationDelay: "1.2s", animationDuration: "3.4s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "46%", top: "22%", "--c": "#9D4EFF", animationDelay: ".2s", animationDuration: "2.4s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "57%", top: "66%", "--c": "#00E5FF", animationDelay: "1.6s", animationDuration: "3s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "66%", top: "12%", "--c": "#FFC93F", animationDelay: ".6s", animationDuration: "2.9s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "74%", top: "48%", "--c": "#FF2E63", animationDelay: "2s", animationDuration: "3.3s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "83%", top: "74%", "--c": "#9D4EFF", animationDelay: "1s", animationDuration: "2.7s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "91%", top: "26%", "--c": "#FFE29A", animationDelay: "1.4s", animationDuration: "3.2s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "12%", top: "88%", "--c": "#00E5FF", animationDelay: "1.8s", animationDuration: "2.5s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "52%", top: "8%", "--c": "#FF2E63", animationDelay: ".3s", animationDuration: "3s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "63%", top: "90%", "--c": "#FFC93F", animationDelay: "2.2s", animationDuration: "2.6s" } as React.CSSProperties} />
        <span className="sparkle" style={{ left: "96%", top: "60%", "--c": "#9D4EFF", animationDelay: ".9s", animationDuration: "3.1s" } as React.CSSProperties} />
      </div>

      <div className="ember-field" aria-hidden="true">
        <span className="ember" style={{ left: "6%", "--c": "#FFC93F", width: "5px", animationDuration: "8s", animationDelay: "0s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "16%", "--c": "#FF2E63", width: "3px", animationDuration: "11s", animationDelay: "1.2s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "28%", "--c": "#9D4EFF", width: "4px", animationDuration: "9s", animationDelay: "2.4s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "41%", "--c": "#00E5FF", width: "3px", animationDuration: "12s", animationDelay: ".6s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "54%", "--c": "#FFC93F", width: "6px", animationDuration: "10s", animationDelay: "3s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "63%", "--c": "#FF2E63", width: "4px", animationDuration: "13s", animationDelay: "1.8s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "74%", "--c": "#9D4EFF", width: "3px", animationDuration: "9.5s", animationDelay: "4s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "83%", "--c": "#00E5FF", width: "5px", animationDuration: "11.5s", animationDelay: "2s" } as React.CSSProperties} />
        <span className="ember" style={{ left: "92%", "--c": "#FFC93F", width: "3px", animationDuration: "14s", animationDelay: ".3s" } as React.CSSProperties} />
      </div>

      <div className="scanline" aria-hidden="true" />

      <div className="leaf-field" aria-hidden="true">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <symbol id="leaf-shape" viewBox="0 0 40 60">
            <path d="M20 0 C34 10 40 30 20 60 C0 30 6 10 20 0 Z" />
            <path d="M20 4 L20 56" stroke="rgba(0,0,0,0.25)" strokeWidth="1.4" fill="none" />
            <path d="M20 18 L12 26 M20 30 L28 38 M20 42 L13 49" stroke="rgba(0,0,0,0.18)" strokeWidth="1" fill="none" />
          </symbol>
        </svg>

        <div className="leaf" style={{ left: "2%", width: "46px", height: "69px", animationDuration: "15s, 4.2s, 7s", animationDelay: "0s, 0s, 0s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#FF2E63" opacity="0.6" /></svg>
        </div>
        <div className="leaf" style={{ left: "12%", width: "30px", height: "45px", animationDuration: "12s, 5s, 5.5s", animationDelay: "1s, .5s, .2s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#FFC93F" opacity="0.65" /></svg>
        </div>
        <div className="leaf" style={{ left: "24%", width: "54px", height: "81px", animationDuration: "19s, 6s, 9s", animationDelay: "3s, 1s, 0s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#9D4EFF" opacity="0.55" /></svg>
        </div>
        <div className="leaf" style={{ left: "36%", width: "34px", height: "51px", animationDuration: "13s, 4.5s, 6s", animationDelay: "2s, 2s, .4s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#00E5FF" opacity="0.6" /></svg>
        </div>
        <div className="leaf" style={{ left: "48%", width: "50px", height: "75px", animationDuration: "17s, 5.5s, 8s", animationDelay: "5s, 0s, 1s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#FF2E63" opacity="0.55" /></svg>
        </div>
        <div className="leaf" style={{ left: "58%", width: "28px", height: "42px", animationDuration: "14s, 6.5s, 5s", animationDelay: "4s, 1.5s, 0s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#FFC93F" opacity="0.6" /></svg>
        </div>
        <div className="leaf" style={{ left: "68%", width: "58px", height: "87px", animationDuration: "20s, 4s, 9.5s", animationDelay: "6s, 3s, .6s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#9D4EFF" opacity="0.55" /></svg>
        </div>
        <div className="leaf" style={{ left: "78%", width: "32px", height: "48px", animationDuration: "16s, 5s, 6.5s", animationDelay: "2.5s, .5s, 0s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#00E5FF" opacity="0.6" /></svg>
        </div>
        <div className="leaf" style={{ left: "88%", width: "44px", height: "66px", animationDuration: "18s, 6s, 7.5s", animationDelay: "7s, 2s, 1s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#FF2E63" opacity="0.55" /></svg>
        </div>
        <div className="leaf" style={{ left: "94%", width: "26px", height: "39px", animationDuration: "11s, 5.2s, 5s", animationDelay: "9s, 1s, .3s" }}>
          <svg viewBox="0 0 40 60"><use href="#leaf-shape" fill="#FFC93F" opacity="0.5" /></svg>
        </div>
      </div>

      <section className="hero">
        <div className="aura-ring" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <circle className="c1" cx="100" cy="100" r="92" stroke="#9D4EFF" strokeDasharray="2 10" />
            <circle className="c2" cx="100" cy="100" r="74" stroke="#00E5FF" strokeDasharray="1 7" />
          </svg>
        </div>
        <div className="wrap">
          <div className="eyebrow">✦ EPIC ANIME BATTLE MULTIVERSE</div>
          <h1>
            Build the ultimate
            <br />
            <span className="line2">anime empire</span>
          </h1>
          <p className="sub">
            Four modes, one deck. Draft legendaries, duel in trivia feuds, run secret deduction rounds, or host the whole party. Pick your card below to begin.
          </p>
          <div className="stat-bar">
            <div className="stat">⚡ <b>4</b> game modes</div>
            <div className="stat">🌐 online <b>multiplayer</b></div>
            <div className="stat">🏆 <b>real-time</b> duels</div>
          </div>
        </div>
      </section>

      <section className="deck" aria-label="Game mode selection">
        <CardButton className="card card-1" onClick={onSelectBattle}>
          <svg className="card-bg-icon" viewBox="0 0 24 24" fill="none" stroke="#FFC93F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
            <path d="M13 19l6-6" />
            <path d="M16 16l4 4" />
            <path d="M19 21l2-2" />
            <path d="M21 3l-6 6" />
          </svg>
          <div className="card-top">
            <div className="icon-medal">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FFC93F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                <path d="M13 19l6-6" />
                <path d="M16 16l4 4" />
                <path d="M19 21l2-2" />
                <path d="M21 3l-6 6" />
              </svg>
            </div>
            <div className="rarity-badge r-legendary">★ LEGENDARY</div>
          </div>
          <h3>Anime Battle</h3>
          <p>Draft heroes turn-by-turn, assign strategic role bonuses, and duel against smart AI.</p>
          <div className="card-foot">
            <span className="cta cta-1">SELECT BATTLE DECK →</span>
            <span className="card-no">No.01/04</span>
          </div>
        </CardButton>

        <CardButton className="card card-2" onClick={onSelectFeud}>
          <svg className="card-bg-icon" viewBox="0 0 24 24" fill="none" stroke="#D9A6FF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 2a2 2 0 0 1 4 0v9a2 2 0 0 1-4 0z" />
            <path d="M6 11v1a6 6 0 0 0 12 0v-1" />
            <path d="M12 18v3" />
            <path d="M9 21h6" />
          </svg>
          <div className="card-top">
            <div className="icon-medal">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D9A6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2a2 2 0 0 1 4 0v9a2 2 0 0 1-4 0z" />
                <path d="M6 11v1a6 6 0 0 0 12 0v-1" />
                <path d="M12 18v3" />
                <path d="M9 21h6" />
              </svg>
            </div>
            <div className="rarity-badge r-epic">◆ EPIC</div>
          </div>
          <h3>Anime Feud</h3>
          <p>Family Feud style trivia. Guess top anime community answers and steal points.</p>
          <div className="card-foot">
            <span className="cta cta-2">PLAY ANIME FEUD →</span>
            <span className="card-no">No.02/04</span>
          </div>
        </CardButton>

        <CardButton className="card card-3" onClick={onSelectGuessWho}>
          <svg className="card-bg-icon" viewBox="0 0 24 24" fill="none" stroke="#F5F1FF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="6" />
            <path d="M20 20l-5.5-5.5" />
          </svg>
          <div className="card-top">
            <div className="icon-medal">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="6" />
                <path d="M20 20l-5.5-5.5" />
              </svg>
            </div>
            <div className="rarity-badge r-mythic">✦ <span>MYTHIC</span></div>
          </div>
          <h3>Guess Who</h3>
          <p>Ask yes/no questions in real time to uncover your rival's secret anime character.</p>
          <div className="card-foot">
            <span className="cta cta-3">START DEDUCTION DUEL →</span>
            <span className="card-no">No.03/04</span>
          </div>
        </CardButton>

        <CardButton className="card card-4" onClick={onSelectParty}>
          <svg className="card-bg-icon" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.6" />
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            <path d="M15 14.2c2.6.4 4.5 2.6 4.5 5.3" />
          </svg>
          <div className="card-top">
            <div className="icon-medal">
              <svg viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3" />
                <circle cx="17" cy="9" r="2.6" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <path d="M15 14.2c2.6.4 4.5 2.6 4.5 5.3" />
              </svg>
            </div>
            <div className="rarity-badge r-rare">● RARE</div>
          </div>
          <h3>Party Games</h3>
          <p>Multiplayer party room. Play Guess Character or spot the imposter with friends.</p>
          <div className="card-foot">
            <span className="cta cta-4">ENTER PARTY ROOM →</span>
            <span className="card-no">No.04/04</span>
          </div>
        </CardButton>
      </section>
    </div>
  );
};

export default LandingPage;
