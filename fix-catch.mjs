const fs = require('fs');

const filePath = 'src/App.tsx';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const calcIdx = content.indexOf('const calculateWinner = async (');
const catchIdx = content.indexOf('    } catch (e) {', content.indexOf('calculateWinner'));
const finallyIdx = content.indexOf('    } finally {', content.indexOf('calculateWinner'));
const funcEnd = content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner')));

if (calcIdx === -1 || catchIdx === -1 || funcEnd === -1) {
  console.log('Failed to find indices');
  process.exit(1);
}

const beforeCatch = content.slice(0, content.indexOf('    } catch (e) {', content.indexOf('calculateWinner')));
const afterFunc = content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3);

const newCatch = `    } catch (e) {
      console.error("Match winner calculation error, using basic fallback", e);
      const team1Power = team1.reduce((sum, c) => sum + c.overallPower, 0);
      const team2Power = team2.reduce((sum, c) => sum + c.overallPower, 0);
      const winnerId = team1Power > team2Power ? "p1" : team2Power > team1Power ? "p2" : "draw";
      const winner = winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw";
      const allChars = [...team1, ...team2];
      const mvp = allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]);
      const localStats = { player1Power: team1Power, player2Power: team2Power, p1SubStats: null, p2SubStats: null, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", winnerId, mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), mvpReason: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, mvpAnalysis: undefined, commentary: "Fallback calculation: " + winner + " wins by total power " + team1Power + " vs " + team2Power, battleReport: undefined };
      setResultData(localStats);
      setCinematicStage("intro"); setClashIndex(0); setScoredClashIndex(-1); setP1CinematicScore(0); setP2CinematicScore(0);
      if (gameMode === "online-2p") { syncGameState({ resultData: localStats, loadingResult: false }); }
      try { await fetch(API_BASE + "/api/draft/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player1Name, player2Name, player1Team: team1, player2Team: team2, player1Power: team1Power, player2Power: team2Power, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), commentary: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) }); fetchMatchHistory(); } catch (_) {}
    } finally { setLoadingResult(false); }
  };`;

const bc = content.slice(0, content.indexOf('    } catch (e) {', content.indexOf('calculateWinner')));
const af = content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3);
const newContent = bc + '    } catch (e) {\n      console.error("Match winner calculation error, using basic fallback", e);\n      const team1Power = team1.reduce((sum, c) => sum + c.overallPower, 0);\n      const team2Power = team2.reduce((sum, c) => sum + c.overallPower, 0);\n      const winnerId = team1Power > team2Power ? "p1" : team2Power > team1Power ? "p2" : "draw";\n      const winner = winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw";\n      const allChars = [...team1, ...team2];\n      const mvp = allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]);\n      const localStats = { player1Power: team1Power, player2Power: team2Power, p1SubStats: null, p2SubStats: null, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", winnerId, mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), mvpReason: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, mvpAnalysis: undefined, commentary: "Fallback calculation: " + winner + " wins by total power " + team1Power + " vs " + team2Power, battleReport: undefined };\n      setResultData(localStats);\n      setCinematicStage("intro"); setClashIndex(0); setScoredClashIndex(-1); setP1CinematicScore(0); setP2CinematicScore(0);\n      if (gameMode === "online-2p") { syncGameState({ resultData: localStats, loadingResult: false }); }\n      try { await fetch(API_BASE + "/api/draft/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player1Name, player2Name, player1Team: team1, player2Team: team2, player1Power: team1Power, player2Power: team2Power, winner: winnerId === "p1" ? player1Name : winnerId === "p2" ? player2Name : "Draw", mvp: allChars.reduce((h, c) => c.overallPower > h.overallPower ? c : h, allChars[0]), commentary: "Fallback: " + winner + " wins by total power " + team1Power + " vs " + team2Power, createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }) }); fetchMatchHistory(); } catch (_) {}\n    } finally { setLoadingResult(false); }\n  };' + content.slice(content.indexOf('    } finally {', content.indexOf('calculateWinner'))).slice(content.slice(content.indexOf('    } finally {', content.indexOf('calculateWinner'))).indexOf('  };') + 3);

fs.writeFileSync('src/App.tsx', newContent);
console.log('Done');