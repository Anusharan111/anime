# Graph Report - anime  (2026-07-31)

## Corpus Check
- 60 files · ~351,170 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 346 nodes · 539 edges · 23 communities (16 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e274d917`
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
- AnimeGuessWhoGame.tsx
- MyAnimeListPortal.tsx
- SoundEffects
- scripts
- vercel.json
- MatchCaster.tsx
- vite.config.ts
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- graphify

## God Nodes (most connected - your core abstractions)
1. `Character` - 24 edges
2. `compilerOptions` - 15 edges
3. `CHARACTERS` - 12 edges
4. `App()` - 11 edges
5. `SoundEffects` - 10 edges
6. `scripts` - 9 edges
7. `AnimeFeudGame()` - 8 edges
8. `RoleId` - 8 edges
9. `SlottedTeam` - 8 edges
10. `main()` - 7 edges

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

## Communities (23 total, 7 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.07
Nodes (31): react, react, CharacterCard(), CharacterCardProps, CharacterImage(), CharacterImageProps, DeployModal(), DeployModalProps (+23 more)

### Community 1 - "AnimeFeudGame.tsx"
Cohesion: 0.09
Nodes (29): FinalWinner(), FinalWinnerProps, GuessInputProps, PlayerSetupProps, QuestionBoard(), QuestionBoardProps, ScoreBoardProps, StrikeSystemProps (+21 more)

### Community 2 - "index.ts"
Cohesion: 0.08
Nodes (30): activeCharactersPool, app, BattleSide, BattleSlots, buildAniListCastCharacter(), buildBattleReport(), buildImportedStats(), calculateBalanceBonus() (+22 more)

### Community 3 - "devDependencies"
Cohesion: 0.10
Nodes (20): autoprefixer, esbuild, gh-pages, vite, devDependencies, autoprefixer, esbuild, gh-pages (+12 more)

### Community 4 - "dependencies"
Cohesion: 0.07
Nodes (27): dotenv, express, @google/genai, lucide-react, motion, dependencies, dotenv, express (+19 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (27): api, dist, DOM, DOM.Iterable, ES2022, node_modules, scratch, server.ts (+19 more)

### Community 6 - "characters.ts"
Cohesion: 0.13
Nodes (16): cleanDescription(), fetchPage(), generateStats(), getSignatureEmoji(), getThemeColor(), hashCode(), main(), sleep() (+8 more)

### Community 7 - "App.tsx"
Cohesion: 0.11
Nodes (22): App(), AppHistoryState, BattleReport, buildAnimeCatalog(), GameHubMode, getAnimeKey(), getBalancedCharacterPool(), getRequiredRarityForTeam() (+14 more)

### Community 8 - "AnimeGuessWhoGame.tsx"
Cohesion: 0.11
Nodes (12): GWLobbyProps, GWQuestionPanelProps, QuestionEntry, GWSecretCard(), GWSecretCardProps, RARITY_STYLES, PartyGameMode, PartySetupData (+4 more)

### Community 9 - "MyAnimeListPortal.tsx"
Cohesion: 0.31
Nodes (8): deriveStats(), favToColor(), favToRarity(), MALPortalProps, MyAnimeListPortal(), RARITY_GLOW, RARITY_GRADIENT, SUMMON_PHASES

### Community 11 - "scripts"
Cohesion: 0.13
Nodes (14): homepage, name, private, scripts, build, build:full, clean, deploy (+6 more)

### Community 12 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, framework, outputDirectory, rewrites

## Knowledge Gaps
- **113 isolated node(s):** `matchHistory`, `activeCharactersPool`, `generatedImages`, `RoleId`, `BattleSide` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `types.ts`, `devDependencies`, `scripts`?**
  _High betweenness centrality (0.244) - this node is a cross-community bridge._
- **Why does `pusher` connect `dependencies` to `App.tsx`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Why does `App()` connect `App.tsx` to `dependencies`, `characters.ts`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **What connects `matchHistory`, `activeCharactersPool`, `generatedImages` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06766917293233082 - nodes in this community are weakly interconnected._
- **Should `AnimeFeudGame.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08412698412698413 - nodes in this community are weakly interconnected._