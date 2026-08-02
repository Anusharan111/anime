const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname);

// ===================== ANALYSIS =====================

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip node_modules, dist, .git
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

function analyzeImports(fileContent) {
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(fileContent)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function findUnusedImports(files) {
  const importGraph = new Map();
  const exportGraph = new Map();
  
  // Build import/export graph
  files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(PROJECT_ROOT, file);
        
        // Track imports
        const imports = analyzeImports(content);
        importGraph.set(relativePath, imports);
        
        // Simple export detection
        const hasDefaultExport = content.includes('export default');
        const hasNamedExports = content.match(/export\s+(?:const|function|class|let)\s+(\w+)/g);
        
        if (hasDefaultExport || hasNamedExports) {
          exportGraph.set(relativePath, true);
        }
      } catch (error) {
        console.warn(`Error reading ${file}:`, error.message);
      }
    }
  });
  
  // Find unused imports
  const unusedFiles = [];
  
  for (const [file, isExported] of exportGraph) {
    let isUsed = false;
    
    for (const [importingFile, imports] of importGraph) {
      if (imports.some(imp => {
        // Convert import path to file path
        const importPath = imp.startsWith('.') ? 
          path.join(path.dirname(importingFile), imp) :
          imp;
        
        return importPath.includes(file.replace('.tsx', '').replace('.ts', ''));
      })) {
        isUsed = true;
        break;
      }
    }
    
    if (!isUsed) {
      unusedFiles.push(file);
    }
  }
  
  return unusedFiles;
}

// ===================== OPTIMIZATION =====================

const OPTIMAL_STRUCTURE = {
  // Top-level directories
  'public': ['assets', 'images', 'fonts', 'icons'],
  'src': {
    'components': ['common', 'layout', 'ui', 'games', 'battle', 'characters', 'forms'],
    'pages': ['home', 'games', 'battle', 'leaderboard', 'profile'],
    'hooks': [],
    'utils': ['api', 'battle', 'validation'],
    'types': ['api', 'game', 'character'],
    'constants': [],
    'services': ['api', 'game', 'auth'],
    'contexts': [],
    'styles': [],
    'assets': ['images', 'sounds', 'sprites'],
    'lib': [],
    'data': ['characters', 'games', 'battles']
  },
  'api': ['controllers', 'services', 'middleware', 'routes', 'utils'],
  'server': [],
  'config': [],
  'scripts': [],
  'tests': ['unit', 'integration', 'e2e'],
  'types': []
};

function suggestFileMove(filePath) {
  const filename = path.basename(filePath);
  const ext = path.extname(filePath);
  
  if (filename.includes('test') || filename.includes('spec')) {
    return 'tests/unit/';
  }
  
  if (filename.includes('api') || filename.includes('route') || filename.includes('controller')) {
    return 'api/controllers/';
  }
  
  if (filename.includes('component') || filename.includes('Component')) {
    if (filename.includes('Button') || filename.includes('Card') || filename.includes('Modal')) {
      return 'src/components/common/';
    }
    if (filename.includes('Header') || filename.includes('Footer') || filename.includes('Layout')) {
      return 'src/components/layout/';
    }
    if (filename.includes('Game') || filename.includes('Battle')) {
      return 'src/components/games/';
    }
    return 'src/components/';
  }
  
  if (filename.includes('hook') || filename.includes('use')) {
    return 'src/hooks/';
  }
  
  if (ext === '.css' || filename.includes('style')) {
    return 'src/styles/';
  }
  
  if (ext === '.json' && filename.includes('data')) {
    return 'src/data/';
  }
  
  if (filename.includes('type') || filename.includes('interface')) {
    return 'src/types/';
  }
  
  if (filename.includes('util') || filename.includes('helper')) {
    return 'src/utils/';
  }
  
  if (filename.includes('service') || filename.includes('api')) {
    return 'src/services/';
  }
  
  if (filename.includes('config') || filename.includes('setting')) {
    return 'config/';
  }
  
  return 'src/'; // Default
}

// ===================== MAIN =====================

function main() {
  console.log('=== ANIME BATTLE GAME WEBSITE OPTIMIZATION ANALYSIS ===\n');
  
  // Get all files
  console.log('Scanning project structure...');
  const allFiles = getAllFiles(PROJECT_ROOT);
  
  console.log(`\nFound ${allFiles.length} files total\n`);
  
  // Group by directory
  const dirStructure = {};
  allFiles.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const dir = path.dirname(relativePath);
    
    if (!dirStructure[dir]) {
      dirStructure[dir] = [];
    }
    dirStructure[dir].push(path.basename(file));
  });
  
  // Print current structure
  console.log('CURRENT STRUCTURE:');
  Object.keys(dirStructure).sort().forEach(dir => {
    if (dir) {
      console.log(`\n${dir}/`);
      dirStructure[dir].sort().forEach(file => {
        console.log(`  ${file}`);
      });
    }
  });
  
  // Analyze TypeScript/JS files for imports
  console.log('\n\n=== IMPORT ANALYSIS ===');
  const tsFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'));
  const unusedFiles = findUnusedImports(tsFiles);
  
  if (unusedFiles.length > 0) {
    console.log('\nPOTENTIALLY UNUSED FILES (not imported anywhere):');
    unusedFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  } else {
    console.log('\nNo obviously unused files found (based on import analysis)');
  }
  
  // Suggest optimal structure
  console.log('\n\n=== OPTIMAL FOLDER STRUCTURE SUGGESTIONS ===');
  console.log('\nRecommended moves:');
  
  tsFiles.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const suggestedDir = suggestFileMove(relativePath);
    const currentDir = path.dirname(relativePath);
    
    if (!currentDir.includes(suggestedDir) && !currentDir.startsWith(suggestedDir)) {
      console.log(`  ${relativePath}`);
      console.log(`    → Move to: ${suggestedDir}${path.basename(relativePath)}`);
    }
  });
  
  // Performance recommendations
  console.log('\n\n=== PERFORMANCE OPTIMIZATIONS ===');
  console.log(`
1. BUNDLE OPTIMIZATION:
   - Configure Vite code splitting in vite.config.ts
   - Use React.lazy() for route-based splitting
   - Enable tree-shaking with proper ES module exports

2. ASSET OPTIMIZATION:
   - Move large assets to public/ directory
   - Use WebP format for images
   - Implement lazy loading for images

3. CODE OPTIMIZATION:
   - Use React.memo() for static components
   - Implement useMemo/useCallback for expensive computations
   - Remove console.log statements in production

4. API OPTIMIZATION:
   - Implement caching for API responses
   - Use request batching where possible
   - Implement proper error boundaries

5. CSS OPTIMIZATION:
   - Purge unused Tailwind classes
   - Use CSS-in-JS for critical styles
   - Implement dark mode via CSS custom properties
  `);
  
  // Create reorganization script
  console.log('\n\n=== NEXT STEPS ===');
  console.log(`
To reorganize your project:

1. Create the new directory structure from OPTIMAL_STRUCTURE
2. Move files according to suggestions above
3. Update all import paths in moved files
4. Run tests to ensure nothing is broken
5. Build and verify the application

Run 'node optimize-reorganize.js' after reviewing this analysis.
`);
}

// Check if we're running directly
if (require.main === module) {
  main();
}

module.exports = { getAllFiles, findUnusedImports, suggestFileMove, OPTIMAL_STRUCTURE };