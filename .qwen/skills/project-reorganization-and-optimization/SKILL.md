---
name: project-reorganization-and-optimization
description: Comprehensive approach for analyzing, reorganizing, and optimizing a React/Vite project structure with proper folder hierarchy
source: auto-skill
extracted_at: '2026-08-02T12:31:15.741Z'
---

# Project Reorganization and Optimization Skill

## Overview
This skill captures a systematic approach for analyzing a React/Vite/TypeScript project, identifying unused code and poor structure, and reorganizing it into a scalable, maintainable folder hierarchy that follows web server best practices for content storage and access.

## When to Apply
- Project has grown organically with flat/poor folder structure
- Need to remove unused/dead code and files
- Need to organize files into proper hierarchy for web server deployment
- Multiple games/features mixed in single directories
- Large monolithic components needing decomposition

## Procedure

### Phase 1: Project Analysis
1. **Scan complete project structure** - Use recursive file discovery to catalog all files
2. **Analyze import/export graph** - Build dependency graph to find unused exports
3. **Identify dead code** - Find files with no imports, no exports, or large commented blocks
4. **Detect unused imports** - Check import usage count within files
5. **Categorize file types** - Group by component, page, hook, utility, type, data, etc.

### Phase 2: Design Optimal Structure
Create hierarchy following web server best practices:
```
public/              # Static assets served directly by web server
├── assets/          # Images, fonts, sounds
└── favicon.ico, robots.txt

src/                 # Application source (bundled)
├── components/      # Reusable UI (organized by domain)
│   ├── common/      # Generic: Button, Card, Modal
│   ├── layout/      # Header, Footer, Container
│   ├── ui/          # Tabs, Dropdown, Tooltip
│   ├── [feature]/   # Feature-specific components
│   └── forms/       # Form components
├── pages/           # Route-level components
├── hooks/           # Custom React hooks
├── contexts/        # React Context providers
├── services/        # External service wrappers
├── utils/           # Pure utility functions
├── types/           # TypeScript definitions
├── constants/       # Application constants
├── data/            # Static JSON/TS data files
├── styles/          # Global CSS
├── lib/             # Third-party library wrappers
├── assets/          # Component-specific assets
├── App.tsx
└── main.tsx

api/                 # Backend API (Express)
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── utils/           # API utilities
└── index.ts

server/              # Server configuration
config/              # Build/runtime config
scripts/             # Build/deploy utilities
tests/               # Test files (unit, integration, e2e)
```

### Phase 3: Implementation
1. **Create target directory structure** recursively
2. **Plan file moves** using pattern matching:
   - Test files → `tests/unit/`
   - API routes → `api/routes/`
   - Components → `src/components/[domain]/`
   - Hooks → `src/hooks/`
   - Types → `src/types/[domain]/`
   - Utils → `src/utils/[category]/`
   - Styles → `src/styles/`
   - Data → `src/data/`
   - Assets → `public/assets/`
3. **Execute moves** with `fs.renameSync()`
4. **Update all import paths** recursively across codebase
5. **Remove empty directories** after moves

### Phase 4: Cleanup & Verification
1. **Remove unused files** identified in Phase 1
2. **Delete development artifacts** (scratch/, build outputs, temp files)
3. **Run build** to verify all imports resolve
4. **Run tests** to ensure functionality preserved
5. **Verify dev server** starts correctly

## Key Patterns Learned

### File Classification Rules
```javascript
// Component files
Button.tsx → src/components/common/
GameBattle.tsx → src/components/battle/
CharacterCard.tsx → src/components/characters/

// Hooks
useAudio.ts → src/hooks/
useBattle.ts → src/hooks/

// Types
character.ts → src/types/character/
api.ts → src/types/api/

// Utils
battleHelpers.ts → src/utils/battle/
validation.ts → src/utils/validation/

// Data
characters.ts → src/data/characters/
questions.json → src/data/
```

### Import Path Updates
- Relative imports: recalculate based on new locations
- Alias imports (`@/`): update vite.config.ts alias if needed
- Absolute imports: verify they still resolve

### Monolithic Component Decomposition
For large files like App.tsx (3000+ lines):
1. Extract custom hooks for state logic
2. Move complex UI to dedicated components
3. Create contexts for shared state
4. Extract utility functions
5. Keep App.tsx as thin composition root

## Tools Created
- `analyze-and-optimize.js` - Full structure analysis with move suggestions
- `optimize-reorganize.js` - Automated reorganization with import updates
- `cleanup-unused-code.js` - Dead code and unused import detection

## Safety Checks
- Always dry-run first, show move plan before executing
- Require explicit confirmation before moving files
- Backup via git before major reorganization
- Run build after each phase to catch breakage
- Keep entry points (main.tsx, server.ts, package.json) at root

## Metrics for Success
- Zero unused exports/imports
- Logical file grouping by feature/domain
- Maximum 200 lines per component file
- Clear separation: UI vs logic vs data vs types
- Build completes without warnings
- All tests pass post-reorganization