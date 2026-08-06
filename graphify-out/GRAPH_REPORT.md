# Graph Report - anime  (2026-08-07)

## Corpus Check
- 83 files · ~380,079 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 495 nodes · 800 edges · 32 communities (26 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8f1c17fe`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- AnimeFeudGame.tsx
- index.ts
- devDependencies
- dependencies
- compilerOptions
- characters.ts
- LandingPage.tsx
- gameLogic.ts
- fix-catch.cjs
- AnimePartyGames.tsx
- Character
- vercel.json
- MatchCaster.tsx
- vite.config.ts
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- graphify
- comprehensive-fix.cjs
- Project Reorganization and Optimization Skill
- fix-catch.mjs
- React Performance Optimization Patterns
- fix-types.cjs
- ratingAdapter.ts
- MyAnimeListPortal.tsx
- UI Designer Skill

## God Nodes (most connected - your core abstractions)
1. `Character` - 37 edges
2. `App()` - 18 edges
3. `compilerOptions` - 16 edges
4. `CHARACTERS` - 14 edges
5. `RoleId` - 13 edges
6. `SlottedTeam` - 12 edges
7. `scripts` - 10 edges
8. `SoundEffects` - 10 edges
9. `DraftQueue` - 9 edges
10. `AnimeFeudGame()` - 8 edges

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

## Communities (32 total, 6 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (45): react, react, App(), AppHistoryState, BattleDuel, CINEMATIC_ROLE_ORDER, findCharacterForDuel(), GameHubMode (+37 more)

### Community 1 - "AnimeFeudGame.tsx"
Cohesion: 0.09
Nodes (29): FinalWinner(), FinalWinnerProps, GuessInputProps, PlayerSetupProps, QuestionBoard(), QuestionBoardProps, ScoreBoardProps, StrikeSystemProps (+21 more)

### Community 2 - "index.ts"
Cohesion: 0.07
Nodes (37): activeCharactersPool, app, BattleSide, BattleSlots, buildAniListCastCharacter(), buildBattleReport(), buildImportedStats(), calculateBalanceBonus() (+29 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (35): autoprefixer, esbuild, gh-pages, vite, devDependencies, autoprefixer, esbuild, gh-pages (+27 more)

### Community 4 - "dependencies"
Cohesion: 0.09
Nodes (23): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): api, dist, DOM, DOM.Iterable, ES2022, node_modules, scratch, server.ts (+20 more)

### Community 6 - "characters.ts"
Cohesion: 0.13
Nodes (16): cleanDescription(), fetchPage(), generateStats(), getSignatureEmoji(), getThemeColor(), hashCode(), main(), sleep() (+8 more)

### Community 7 - "LandingPage.tsx"
Cohesion: 0.25
Nodes (5): LeafConfig, LEAVES, LandingPage(), LandingPageProps, MODES

### Community 8 - "gameLogic.ts"
Cohesion: 0.19
Nodes (15): buildApiUrl(), CharacterFetchOptions, fetchFromAPI(), filterLocalPool(), pickFromPool(), pullRandomCharacter(), getBalancedCharacterPool(), getRequiredRarityForTeam() (+7 more)

### Community 9 - "fix-catch.cjs"
Cohesion: 0.17
Nodes (11): af, afterFunc, bc, beforeCatch, calcIdx, catchIdx, content, finallyIdx (+3 more)

### Community 10 - "AnimePartyGames.tsx"
Cohesion: 0.11
Nodes (11): GuessImposterModeProps, PlayerInfo, PartyGameMode, PartySetupData, PartySetupProps, AnimePartyGamesProps, GamePhase, PlayerInfo (+3 more)

### Community 11 - "Character"
Cohesion: 0.08
Nodes (18): CharacterCardProps, GWCharacterGridProps, RARITY_BORDER, RARITY_GLOW, GWGameOverProps, RARITY_STYLES, GWGuessModalProps, RARITY_BORDER (+10 more)

### Community 12 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

### Community 23 - "comprehensive-fix.cjs"
Cohesion: 0.18
Nodes (10): afterFunc, beforeCatch, calcIdx, catchIdx, content, filePath, finallyIdx, fs (+2 more)

### Community 25 - "Project Reorganization and Optimization Skill"
Cohesion: 0.12
Nodes (15): File Classification Rules, Import Path Updates, Key Patterns Learned, Metrics for Success, Monolithic Component Decomposition, Overview, Phase 1: Project Analysis, Phase 2: Design Optimal Structure (+7 more)

### Community 26 - "fix-catch.mjs"
Cohesion: 0.18
Nodes (10): af, afterFunc, bc, beforeCatch, calcIdx, catchIdx, content, finallyIdx (+2 more)

### Community 27 - "React Performance Optimization Patterns"
Cohesion: 0.20
Nodes (9): 1. Route-Level Code Splitting with React.lazy() + Suspense, 2. Fixing Missing Module Exports, 3. Consistent UI Across Pages, 4. Rendering Optimizations, Problem Context, React Performance Optimization Patterns, Solution Approach, Validation (+1 more)

### Community 28 - "fix-types.cjs"
Cohesion: 0.20
Nodes (9): afterFunc, beforeCatch, content, filePath, finallyIdx, fs, funcEnd, path (+1 more)

### Community 29 - "ratingAdapter.ts"
Cohesion: 0.16
Nodes (14): AnimeSearch(), AnimeSearchProps, highlightMatch(), adaptRatingCharacter(), adaptRatingCharacters(), getRarityColor(), getRarityFromRating(), getSignatureEmoji() (+6 more)

### Community 30 - "MyAnimeListPortal.tsx"
Cohesion: 0.31
Nodes (8): deriveStats(), favToColor(), favToRarity(), MALPortalProps, MyAnimeListPortal(), RARITY_GLOW, RARITY_GRADIENT, SUMMON_PHASES

### Community 31 - "UI Designer Skill"
Cohesion: 0.40
Nodes (4): Capabilities, Description, UI Designer Skill, Usage

## Knowledge Gaps
- **176 isolated node(s):** `matchHistory`, `activeCharactersPool`, `generatedImages`, `RoleId`, `BattleSide` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `App.tsx`, `devDependencies`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `pusher` connect `dependencies` to `App.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `App()` connect `App.tsx` to `Character`, `dependencies`, `ratingAdapter.ts`, `characters.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `matchHistory`, `activeCharactersPool`, `generatedImages` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06298904538341157 - nodes in this community are weakly interconnected._
- **Should `AnimeFeudGame.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07149758454106281 - nodes in this community are weakly interconnected._