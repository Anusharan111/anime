const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the broken type definition
const startIdx = content.indexOf('type BattleDuel = BattleReport["duels"][number];');
if (startIdx === -1) { console.log('Not found'); process.exit(1); }

// Find the end of the broken type (after the bonuses closing)
const finallyIdx = content.indexOf('};', content.indexOf('p2: Record<string, number>;'));
if (finallyIdx === -1) { console.log('Finally not found'); process.exit(1); }

const funcEnd = content.indexOf('  };', finallyIdx);
if (funcEnd === -1) { console.log('Func end not found'); process.exit(1); }

const beforeCatch = content.slice(0, startIdx);
const afterFunc = content.slice(funcEnd + 3);

const newCatch = `type BattleDuel = BattleReport["duels"][number];

type BattleReport = {
  p1BattleScore: number;
  p2BattleScore: number;
  p1DuelWins: number;
  p2DuelWins: number;
  drawDuels: number;
  rules: string[];
  duels: Array<{
    role: string;
    label: string;
    p1Name: string;
    p2Name: string;
    p1Score: number;
    p2Score: number;
    p1FitScore?: number;
    p2FitScore?: number;
    p1BaseScore?: number;
    p2BaseScore?: number;
    p1FitMultiplier?: number;
    p2FitMultiplier?: number;
    p1Suitability?: string;
    p2Suitability?: string;
    p1FitAdjustment?: number;
    p2FitAdjustment?: number;
    winner: "p1" | "p2" | "draw";
    detail: string;
  }>;
  bonuses: {
    p1: Record<string, number>;
    p2: Record<string, number>;
  };
};`;

const newContent = content.slice(0, content.indexOf('type BattleDuel = BattleReport["duels"][number];')) + 
  'type BattleDuel = BattleReport["duels"][number];\n\n' +
  'type BattleReport = {\n' +
  '  p1BattleScore: number;\n' +
  '  p2BattleScore: number;\n' +
  '  p1DuelWins: number;\n' +
  '  p2DuelWins: number;\n' +
  '  drawDuels: number;\n' +
  '  rules: string[];\n' +
  '  duels: Array<{\n' +
  '    role: string;\n' +
  '    label: string;\n' +
  '    p1Name: string;\n' +
  '    p2Name: string;\n' +
  '    p1Score: number;\n' +
  '    p2Score: number;\n' +
  '    p1FitScore?: number;\n' +
  '    p2FitScore?: number;\n' +
  '    p1BaseScore?: number;\n' +
  '    p2BaseScore?: number;\n' +
  '    p1FitMultiplier?: number;\n' +
  '    p2FitMultiplier?: number;\n' +
  '    p1Suitability?: string;\n' +
  '    p2Suitability?: string;\n' +
  '    p1FitAdjustment?: number;\n' +
  '  p2FitAdjustment?: number;\n' +
  '    winner: "p1" | "p2" | "draw";\n' +
  '    detail: string;\n' +
  '  }>;\n' +
  '  bonuses: {\n' +
  '    p1: Record<string, number>;\n' +
  '  p2: Record<string, number>;\n' +
  '  };\n' +
  '};' + content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3);

fs.writeFileSync('src/App.tsx', content.slice(0, content.indexOf('type BattleDuel = BattleReport["duels"][number];')) + 'type BattleDuel = BattleReport["duels"][number];\n\n' + 'type BattleReport = {\n' + '  p1BattleScore: number;\n' + '  p2BattleScore: number;\n' + '  p1DuelWins: number;\n' + '  p2DuelWins: number;\n' + '  drawDuels: number;\n' + '  rules: string[];\n' + '  duels: Array<{\n' + '    role: string;\n' + '    label: string;\n' + '    p1Name: string;\n' + '    p2Name: string;\n' + '    p1Score: number;\n' + '    p2Score: number;\n' + '    p1FitScore?: number;\n' + '    p2FitScore?: number;\n' + '    p1BaseScore?: number;\n' + '    p2BaseScore?: number;\n' + '    p1FitMultiplier?: number;\n' + '    p2FitMultiplier?: number;\n' + '    p1Suitability?: string;\n' + '    p2Suitability?: string;\n' + '    p1FitAdjustment?: number;\n' + '  p2FitAdjustment?: number;\n' + '    winner: "p1" | "p2" | "draw";\n' + '    detail: string;\n' + '  }>;\n' + '  bonuses: {\n' + '    p1: Record<string, number>;\n' + '    p2: Record<string, number>;\n' + '  };\n' + '};' + content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3);

fs.writeFileSync('src/App.tsx', content.slice(0, content.indexOf('type BattleDuel = BattleReport["duels"][number];')) + 'type BattleDuel = BattleReport["duels"][number];\n\n' + 'type BattleReport = {\n' + '  p1BattleScore: number;\n' + '  p2BattleScore: number;\n' + '  p1DuelWins: number;\n' + '  p2DuelWins: number;\n' + '  drawDuels: number;\n' + '  rules: string[];\n' + '  duels: Array<{\n' + '    role: string;\n' + '    label: string;\n' + '    p1Name: string;\n' + '    p2Name: string;\n' + '    p1Score: number;\n' + '    p2Score: number;\n' + '    p1FitScore?: number;\n' + '    p2FitScore?: number;\n' + '    p1BaseScore?: number;\n' + '    p2BaseScore?: number;\n' + '    p1FitMultiplier?: number;\n' + '    p2FitMultiplier?: number;\n' + '    p1Suitability?: string;\n' + '    p2Suitability?: string;\n' + '    p1FitAdjustment?: number;\n' + '  p2FitAdjustment?: number;\n' + '    winner: "p1" | "p2" | "draw";\n' + '    detail: string;\n' + '  }>;\n' + '  bonuses: {\n' + '    p1: Record<string, number>;\n' + '    p2: Record<string, number>;\n' + '  };\n' + '};' + content.slice(content.indexOf('  };', content.indexOf('    } finally {', content.indexOf('calculateWinner'))) + 3));

console.log('Done');