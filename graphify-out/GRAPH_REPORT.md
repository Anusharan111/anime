# Graph Report - anime  (2026-08-04)

## Corpus Check
- 70 files · ~357,834 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 410 nodes · 660 edges · 27 communities (20 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eafd8923`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- AnimeFeudGame.tsx
- index.ts
- devDependencies
- dependencies
- compilerOptions
- characters.ts
- App.tsx
- gameLogic.ts
- MyAnimeListPortal.tsx
- SoundEffects
- Character
- vercel.json
- MatchCaster.tsx
- vite.config.ts
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- graphify
- Project Reorganization and Optimization Skill
- React Performance Optimization Patterns
- UI Designer Skill

## God Nodes (most connected - your core abstractions)
1. `Character` - 27 edges
2. `compilerOptions` - 15 edges
3. `App()` - 14 edges
4. `CHARACTERS` - 14 edges
5. `RoleId` - 13 edges
6. `SlottedTeam` - 12 edges
7. `SoundEffects` - 10 edges
8. `scripts` - 9 edges
9. `AnimeFeudGame()` - 8 edges
10. `Project Reorganization and Optimization Skill` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --references--> `pusher`  [EXTRACTED]
  src/App.tsx → package.json
- `AnimeGuessWhoGame()` --references--> `pusher`  [EXTRACTED]
  src/pages/AnimeGuessWhoGame.tsx → package.json
- `AnimePartyGames()` --references--> `pusher`  [EXTRACTED]
  src/pages/AnimePartyGames.tsx → package.json
- `DeployModal()` --references--> `react`  [EXTRACTED]
  src/components/DeployModal.tsx → package.json
- `CharacterCard()` --references--> `react`  [EXTRACTED]
  src/components/CharacterCard.tsx → package.json

## Import Cycles
- None detected.

## Communities (27 total, 7 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.15
Nodes (14): DeployModal(), DeployModalProps, DraftViewProps, MobileOnline2PProps, RoleIcon(), RoleIconProps, TeamSlotsProps, ROLE_CATEGORIES (+6 more)

### Community 1 - "AnimeFeudGame.tsx"
Cohesion: 0.09
Nodes (29): FinalWinner(), FinalWinnerProps, GuessInputProps, PlayerSetupProps, QuestionBoard(), QuestionBoardProps, ScoreBoardProps, StrikeSystemProps (+21 more)

### Community 2 - "index.ts"
Cohesion: 0.08
Nodes (34): activeCharactersPool, app, BattleSide, BattleSlots, buildAniListCastCharacter(), buildBattleReport(), buildImportedStats(), calculateBalanceBonus() (+26 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): autoprefixer, esbuild, gh-pages, vite, devDependencies, autoprefixer, esbuild, gh-pages (+26 more)

### Community 4 - "dependencies"
Cohesion: 0.09
Nodes (23): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (27): api, dist, DOM, DOM.Iterable, ES2022, node_modules, scratch, server.ts (+19 more)

### Community 6 - "characters.ts"
Cohesion: 0.13
Nodes (16): cleanDescription(), fetchPage(), generateStats(), getSignatureEmoji(), getThemeColor(), hashCode(), main(), sleep() (+8 more)

### Community 7 - "App.tsx"
Cohesion: 0.09
Nodes (27): App(), AppHistoryState, BattleDuel, BattleReport, buildAnimeCatalog(), CINEMATIC_ROLE_ORDER, findCharacterForDuel(), GameHubMode (+19 more)

### Community 8 - "gameLogic.ts"
Cohesion: 0.21
Nodes (14): buildApiUrl(), fetchFromAPI(), filterLocalPool(), pickFromPool(), pullRandomCharacter(), getBalancedCharacterPool(), getRequiredRarityForTeam(), getRoleFitScore() (+6 more)

### Community 9 - "MyAnimeListPortal.tsx"
Cohesion: 0.31
Nodes (8): deriveStats(), favToColor(), favToRarity(), MALPortalProps, MyAnimeListPortal(), RARITY_GLOW, RARITY_GRADIENT, SUMMON_PHASES

### Community 11 - "Character"
Cohesion: 0.05
Nodes (31): react, react, CharacterCard(), CharacterCardProps, CharacterImage(), CharacterImageProps, GWCharacterGridProps, RARITY_BORDER (+23 more)

### Community 12 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 25 - "Project Reorganization and Optimization Skill"
Cohesion: 0.12
Nodes (15): File Classification Rules, Import Path Updates, Key Patterns Learned, Metrics for Success, Monolithic Component Decomposition, Overview, Phase 1: Project Analysis, Phase 2: Design Optimal Structure (+7 more)

### Community 27 - "React Performance Optimization Patterns"
Cohesion: 0.20
Nodes (9): 1. Route-Level Code Splitting with React.lazy() + Suspense, 2. Fixing Missing Module Exports, 3. Consistent UI Across Pages, 4. Rendering Optimizations, Problem Context, React Performance Optimization Patterns, Solution Approach, Validation (+1 more)

### Community 31 - "UI Designer Skill"
Cohesion: 0.40
Nodes (4): Capabilities, Description, UI Designer Skill, Usage

## Knowledge Gaps
- **135 isolated node(s):** `matchHistory`, `activeCharactersPool`, `generatedImages`, `RoleId`, `BattleSide` (+130 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `Character`, `devDependencies`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `pusher` connect `dependencies` to `App.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `CHARACTERS` connect `characters.ts` to `gameLogic.ts`, `index.ts`, `Character`, `App.tsx`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `matchHistory`, `activeCharactersPool`, `generatedImages` to the rest of the system?**
  _135 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AnimeFeudGame.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08205128205128205 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._