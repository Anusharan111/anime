# Graph Report - anime  (2026-08-03)

## Corpus Check
- 80 files · ~361,259 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 494 nodes · 730 edges · 35 communities (28 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bc1a1412`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/types.ts
- AnimeFeudGame.tsx
- index.ts
- devDependencies
- dependencies
- compilerOptions
- AnimePartyGames.tsx
- App.tsx
- GWQuestionPanel.tsx
- MyAnimeListPortal.tsx
- audio.ts
- router.ts
- vercel.json
- MatchCaster.tsx
- vite.config.ts
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- graphify
- execute-optimization.js
- optimize-reorganize.js
- Project Reorganization and Optimization Skill
- analyze-and-optimize.js
- React Performance Optimization Patterns
- cleanup-unused-code.js
- update-imports.js
- analyze-structure.js
- UI Designer Skill

## God Nodes (most connected - your core abstractions)
1. `Character` - 27 edges
2. `App()` - 16 edges
3. `compilerOptions` - 15 edges
4. `CHARACTERS` - 12 edges
5. `SoundEffects` - 10 edges
6. `scripts` - 9 edges
7. `ViewState` - 8 edges
8. `AnimeFeudGame()` - 8 edges
9. `RoleId` - 8 edges
10. `SlottedTeam` - 8 edges

## Surprising Connections (you probably didn't know these)
- `App()` --references--> `pusher`  [EXTRACTED]
  src/App.tsx → package.json
- `AnimeGuessWhoGame()` --references--> `pusher`  [EXTRACTED]
  src/pages/AnimeGuessWhoGame.tsx → package.json
- `AnimePartyGames()` --references--> `pusher`  [EXTRACTED]
  src/pages/AnimePartyGames.tsx → package.json
- `CharacterCard()` --references--> `react`  [EXTRACTED]
  src/components/CharacterCard.tsx → package.json
- `DeployModal()` --references--> `react`  [EXTRACTED]
  src/components/DeployModal.tsx → package.json

## Import Cycles
- None detected.

## Communities (35 total, 7 thin omitted)

### Community 0 - "src/types.ts"
Cohesion: 0.05
Nodes (42): pusher, react, pusher, react, CharacterCard(), CharacterCardProps, CharacterImage(), CharacterImageProps (+34 more)

### Community 1 - "AnimeFeudGame.tsx"
Cohesion: 0.09
Nodes (29): FinalWinner(), FinalWinnerProps, GuessInputProps, PlayerSetupProps, QuestionBoard(), QuestionBoardProps, ScoreBoardProps, StrikeSystemProps (+21 more)

### Community 2 - "index.ts"
Cohesion: 0.09
Nodes (33): activeCharactersPool, app, BattleSide, BattleSlots, buildAniListCastCharacter(), buildBattleReport(), buildImportedStats(), calculateBalanceBonus() (+25 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (34): autoprefixer, esbuild, gh-pages, vite, devDependencies, autoprefixer, esbuild, gh-pages (+26 more)

### Community 4 - "dependencies"
Cohesion: 0.09
Nodes (23): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (27): api, dist, DOM, DOM.Iterable, ES2022, node_modules, scratch, server.ts (+19 more)

### Community 6 - "AnimePartyGames.tsx"
Cohesion: 0.11
Nodes (19): cleanDescription(), fetchPage(), generateStats(), getSignatureEmoji(), getThemeColor(), hashCode(), main(), sleep() (+11 more)

### Community 7 - "App.tsx"
Cohesion: 0.09
Nodes (29): App(), AppHistoryState, BattleDuel, BattleReport, buildAnimeCatalog(), CINEMATIC_ROLE_ORDER, findCharacterForDuel(), GameHubMode (+21 more)

### Community 9 - "MyAnimeListPortal.tsx"
Cohesion: 0.27
Nodes (8): deriveStats(), favToColor(), favToRarity(), MALPortalProps, MyAnimeListPortal(), RARITY_GLOW, RARITY_GRADIENT, SUMMON_PHASES

### Community 10 - "audio.ts"
Cohesion: 0.14
Nodes (11): PartyGameMode, PartySetupData, PartySetupProps, AudioContext, AudioContextType, AudioProvider(), playSound(), sfx (+3 more)

### Community 11 - "router.ts"
Cohesion: 0.13
Nodes (12): StandardLayoutProps, getRouteHash(), navigateTo(), updateHistory(), AppHistoryState, GameHubMode, GameSetupConfig, NavigationState (+4 more)

### Community 12 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 23 - "execute-optimization.js"
Cohesion: 0.12
Nodes (15): assetsDir, barrelExports, componentMappings, componentsDir, configMoves, dataDir, foldersToRemove, fs (+7 more)

### Community 24 - "optimize-reorganize.js"
Cohesion: 0.18
Nodes (14): createDirectoryStructure(), determineTargetDir(), { execSync }, FILE_MAPPING_RULES, fs, getAllFiles(), main(), path (+6 more)

### Community 25 - "Project Reorganization and Optimization Skill"
Cohesion: 0.12
Nodes (15): File Classification Rules, Import Path Updates, Key Patterns Learned, Metrics for Success, Monolithic Component Decomposition, Overview, Phase 1: Project Analysis, Phase 2: Design Optimal Structure (+7 more)

### Community 26 - "analyze-and-optimize.js"
Cohesion: 0.25
Nodes (10): analyzeImports(), { execSync }, findUnusedImports(), fs, getAllFiles(), main(), OPTIMAL_STRUCTURE, path (+2 more)

### Community 27 - "React Performance Optimization Patterns"
Cohesion: 0.20
Nodes (9): 1. Route-Level Code Splitting with React.lazy() + Suspense, 2. Fixing Missing Module Exports, 3. Consistent UI Across Pages, 4. Rendering Optimizations, Problem Context, React Performance Optimization Patterns, Solution Approach, Validation (+1 more)

### Community 28 - "cleanup-unused-code.js"
Cohesion: 0.36
Nodes (7): findDeadCodeFiles(), findUnusedExports(), findUnusedImports(), fs, main(), path, PROJECT_ROOT

### Community 29 - "update-imports.js"
Cohesion: 0.36
Nodes (7): fs, getAllTsFiles(), main(), path, pathMappings, updateImportsInFile(), updateImportsSmartly()

### Community 30 - "analyze-structure.js"
Cohesion: 0.33
Nodes (4): apiFiles, fs, path, srcFiles

### Community 31 - "UI Designer Skill"
Cohesion: 0.40
Nodes (4): Capabilities, Description, UI Designer Skill, Usage

## Knowledge Gaps
- **180 isolated node(s):** `fs`, `path`, `{ execSync }`, `PROJECT_ROOT`, `OPTIMAL_STRUCTURE` (+175 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `src/types.ts`, `devDependencies`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `pusher` connect `src/types.ts` to `dependencies`, `App.tsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `App()` connect `App.tsx` to `src/types.ts`, `AnimePartyGames.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `{ execSync }` to the rest of the system?**
  _180 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0502283105022831 - nodes in this community are weakly interconnected._
- **Should `AnimeFeudGame.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08502024291497975 - nodes in this community are weakly interconnected._