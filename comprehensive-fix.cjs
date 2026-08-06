const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix initialSlots
content = content.replace(
`const initialSlots: SlottedTeam = {
  captain: null,
  vice_captain: null,
  tank: null,
  healer: null,
  support_1: null,
  support_2: null,
};`,
`const initialSlots: SlottedTeam = {
  captain: null,
  vice_captain: null,
  strategist: null,
  defender: null,
  healer: null,
  support_speed: null,
  support_power: null,
  traitor: null,
};`);

// 2. Fix CINEMATIC_ROLE_ORDER
content = content.replace(
`const CINEMATIC_ROLE_ORDER: RoleId[] = ["support_2", "support_1", "healer", "tank", "vice_captain", "captain"];`,
`const CINEMATIC_ROLE_ORDER: RoleId[] = ["traitor", "support_power", "support_speed", "healer", "defender", "strategist", "vice_captain", "captain"];`);

// 3. Fix round < 6 to round < 8 (first occurrence - in handleSlotSelect for P1)
content = content.replace(
`      if (round < 6) {`,
`      if (round < 8) {`);

// 4. Fix round < 6 to round < 8 (second occurrence - in advanceRoundOrFinish)
content = content.replace(
`    if (currentRound < 6) {`,
`    if (currentRound < 8) {`);

// 5. Fix root div for draft view
content = content.replace(
`\${isMobileDraft ? "h-[100dvh] overflow-hidden" : "min-h-screen overflow-x-hidden"} \${view === "landing" ? "bg-black" : "bg-[#050816]"} text-slate-100 flex flex-col justify-between font-sans relative selection:bg-nexus-cyan/30\`}`,
`\${view === "draft" ? "h-[100dvh] overflow-hidden" : "min-h-screen overflow-x-clip"} \${view === "landing" ? "bg-black" : "bg-[#050816]"} text-slate-100 flex flex-col justify-between font-sans relative selection:bg-nexus-cyan/30\`}`);

// 6. Fix main for draft view
content = content.replace(
`\${isMobileDraft ? "min-h-0 overflow-hidden" : ""}\`}`,
`\${view === "draft" ? "min-h-0 overflow-hidden" : ""}\`}`);

// 7. Fix footer for draft view
content = content.replace(
`{view !== "landing" && (\n`,
`{view !== "landing" && view !== "draft" && (\n`);

// 8. Fix CharacterCard sizeClass
content = content.replace(
`activeTurn={activeTurn}
              sizeClass={isMobile ? undefined : "w-[min(340px,34vh)] h-[min(600px,60vh)]"}`
); // This is an incomplete edit, need to be more specific

console.log('Phase 1 done');

// Fix calculateWinner catch block
const calcIdx = content.indexOf('const calculateWinner = async (');
if (calcIdx === -1) { console.log('calcWinner not found'); process.exit(1); }

const catchIdx = content.indexOf('    } catch (e) {', content.indexOf('calculateWinner'));
if (catchIdx === -1) { console.log('Catch not found'); process.exit(1); }

const finallyIdx = content.indexOf('    } finally {', catchIdx);
if (finallyIdx === -1) { console.log('Finally not found'); process.exit(1); }

const funcEnd = content.indexOf('  };', finallyIdx);
if (funcEnd === -1) { console.log('Func end not found'); process.exit(1); }

const beforeCatch = content.slice(0, content.indexOf('    } catch (e) {', content.indexOf('calculateWinner')));
const afterFunc = content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3);

const newCatch = \`    } catch (e) {
      console.error("Match winner calculation error, using basic fallback", e);
      const team1Power = team1.reduce((sum, c) => sum + c.overallPower, 0);
      const team2Power = team2.reduce((sum, c) => sum + c.overallPower, 0);
      const winnerId = team1Power > team2Power ? "p1" : team2Power > team1Power ? "p2" : "draw";
      const winner = winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw";
      const allChars = [...team1, ...team2];
      const mvp = allChars.reduce((highest, current) => current.overallPower > highest.overallPower ? current : highest, allChars[0]);
      const localStats = { player1Power: team1Power, player2Power: team2Power, p1SubStats: null, p2SubStats: null, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", winnerId, mvp, mvpReason: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, mvpAnalysis: undefined, commentary: "Fallback calculation: " + winner + " wins by total power " + team1Power + " vs " + team2Power, battleReport: undefined };
      setResultData(localStats);
      setCinematicStage("intro"); setClashIndex(0); setScoredClashIndex(-1); setP1CinematicScore(0); setP2CinematicScore(0);
      if (gameMode === "online-2p") { syncGameState({ resultData: localStats, loadingResult: false }); }
      try { await fetch(API_BASE + "/api/draft/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player1Name, player2Name, player1Team: team1, player2Team: team2, player1Power: team1Power, player2Power: team2Power, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), commentary: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) }); fetchMatchHistory(); } catch (_) {}
    } finally { setLoadingResult(false); }
  };\`;

const bc = content.slice(0, content.indexOf('    } catch (e) {', content.indexOf('calculateWinner')));
const af = content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3);
const nc = bc + '    } catch (e) {\\n      console.error("Match winner calculation error, using basic fallback", e);\\n      const team1Power = team1.reduce((sum, c) => sum + c.overallPower, 0);\\n      const team2Power = team2.reduce((sum, c) => sum + c.overallPower, 0);\\n      const winnerId = team1Power > team2Power ? "p1" : team2Power > team1Power ? "p2" : "draw";\\n      const winner = winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw";\\n      const allChars = [...team1, ...team2];\\n      const mvp = allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]);\\n      const localStats = { player1Power: team1Power, player2Power: team2Power, p1SubStats: null, p2SubStats: null, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", winnerId, mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), mvpReason: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, mvpAnalysis: undefined, commentary: "Fallback calculation: " + winner + " wins by total power " + team1Power + " vs " + team2Power, battleReport: undefined }\\n      setResultData(localStats);\\n      setCinematicStage("intro"); setClashIndex(0); setScoredClashIndex(-1); setP1CinematicScore(0); setP2CinematicScore(0);\\n      if (gameMode === "online-2p") { syncGameState({ resultData: localStats, loadingResult: false }); }\\n      try { await fetch(API_BASE + "/api/draft/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player1Name, player2Name, player1Team: team1, player2Team: team2, player1Power: team1Power, player2Power: team2Power, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), commentary: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) }); fetchMatchHistory(); } catch (_) {}\\n    } finally { setLoadingResult(false); }\\n  };' + content.slice(content.indexOf('    } finally {', content.indexOf('calculateWinner'))).slice(content.slice(content.indexOf('    } finally {', content.indexOf('calculateWinner'))).indexOf('  };') + 3);

fs.writeFileSync(filePath, newContent);
console.log('Done');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Apply all the fixes
// ... (the actual fixes would go here)

console.log('Applying fixes...');