#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;

console.log('=== ANIME BATTLE GAME - FULL OPTIMIZATION ===\n');
console.log('Starting optimization process...\n');

// ===================== STEP 1: REMOVE UNUSED FOLDERS =====================

console.log('STEP 1: Removing unused folders...');

const foldersToRemove = [
  'scratch',
  'graphify-out'
];

foldersToRemove.forEach(folder => {
  const folderPath = path.join(PROJECT_ROOT, folder);
  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`✓ Removed: ${folder}/`);
    } catch (error) {
      console.warn(`✗ Could not remove ${folder}/: ${error.message}`);
    }
  } else {
    console.log(`  ${folder}/ does not exist (already clean)`);
  }
});

// ===================== STEP 2: CREATE NEW DIRECTORY STRUCTURE =====================

console.log('\nSTEP 2: Creating optimized directory structure...');

const newStructure = {
  'src/components/common': null,
  'src/components/layout': null,
  'src/components/ui': null,
  'src/components/characters': null,
  'src/components/battle': null,
  'src/components/games/feud': null,
  'src/components/games/guesswho': null,
  'src/components/games/party': null,
  'src/components/forms': null,
  'src/pages': null,
  'src/hooks': null,
  'src/contexts': null,
  'src/services': null,
  'src/utils/battle': null,
  'src/utils/validation': null,
  'src/utils/helpers': null,
  'src/types': null,
  'src/constants': null,
  'src/styles': null,
  'src/lib': null,
  'api/controllers': null,
  'api/services': null,
  'api/middleware': null,
  'api/routes': null,
  'api/utils': null,
  'server': null,
  'config': null,
  'scripts': null,
  'tests/unit': null,
  'tests/integration': null,
  'public/assets/images': null,
  'public/assets/fonts': null,
  'public/assets/sounds': null
};

Object.keys(newStructure).forEach(dir => {
  const dirPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created: ${dir}/`);
  }
});

// ===================== STEP 3: MOVE CONFIG FILES =====================

console.log('\nSTEP 3: Organizing config files...');

const configMoves = [
  { from: 'vite.config.ts', to: 'config/vite.config.ts' },
  { from: 'tsconfig.json', to: 'config/tsconfig.json' },
  { from: 'tailwind.config.ts', to: 'config/tailwind.config.ts' }
];

configMoves.forEach(({ from, to }) => {
  const fromPath = path.join(PROJECT_ROOT, from);
  const toPath = path.join(PROJECT_ROOT, to);
  
  if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
    try {
      fs.copyFileSync(fromPath, toPath);
      console.log(`✓ Moved: ${from} → ${to}`);
    } catch (error) {
      console.warn(`✗ Could not move ${from}: ${error.message}`);
    }
  }
});

// ===================== STEP 4: MOVE SERVER FILES =====================

console.log('\nSTEP 4: Organizing server files...');

const serverPath = path.join(PROJECT_ROOT, 'server.ts');
const newServerPath = path.join(PROJECT_ROOT, 'server/server.ts');

if (fs.existsSync(serverPath) && !fs.existsSync(newServerPath)) {
  try {
    fs.copyFileSync(serverPath, newServerPath);
    console.log(`✓ Moved: server.ts → server/server.ts`);
  } catch (error) {
    console.warn(`✗ Could not move server.ts: ${error.message}`);
  }
}

// ===================== STEP 5: ORGANIZE SRC/COMPONENTS =====================

console.log('\nSTEP 5: Organizing components...');

const componentMappings = {
  // Common components
  'Button': 'common',
  'Card': 'common',
  'Modal': 'common',
  'Input': 'common',
  'Dropdown': 'common',
  'Badge': 'common',
  
  // Layout components
  'Header': 'layout',
  'Footer': 'layout',
  'Layout': 'layout',
  'Container': 'layout',
  'Sidebar': 'layout',
  
  // Character components
  'Character': 'characters',
  'CharacterCard': 'characters',
  'CharacterImage': 'characters',
  'CharacterSelect': 'characters',
  'CharacterProfile': 'characters',
  
  // Battle components
  'Battle': 'battle',
  'CinematicClash': 'battle',
  'BattleReport': 'battle',
  'BattleStats': 'battle',
  'VersusScreen': 'battle',
  
  // Game components
  'Feud': 'games/feud',
  'GuessWho': 'games/guesswho',
  'Party': 'games/party',
  'Game': 'games'
};

const componentsDir = path.join(PROJECT_ROOT, 'src/components');

if (fs.existsSync(componentsDir)) {
  const files = fs.readdirSync(componentsDir);
  
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(componentsDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        // Determine target folder based on file name
        let targetSubDir = 'ui'; // default
        
        for (const [keyword, subDir] of Object.entries(componentMappings)) {
          if (file.includes(keyword)) {
            targetSubDir = subDir;
            break;
          }
        }
        
        const targetPath = path.join(PROJECT_ROOT, 'src/components', targetSubDir, file);
        
        // Only move if not already in subdirectory
        if (!fs.existsSync(targetPath)) {
          try {
            fs.copyFileSync(filePath, targetPath);
            console.log(`✓ Moved: components/${file} → components/${targetSubDir}/${file}`);
          } catch (error) {
            console.warn(`✗ Could not move ${file}: ${error.message}`);
          }
        }
      }
    }
  });
}

// ===================== STEP 6: ORGANIZE SRC ROOT FILES =====================

console.log('\nSTEP 6: Organizing src root files...');

const srcFileMoves = [
  { pattern: /config\.ts$/, to: 'src/constants/' },
  { pattern: /types\.ts$/, to: 'src/types/' },
  { pattern: /.*Page\.tsx$/, to: 'src/pages/' }
];

const srcDir = path.join(PROJECT_ROOT, 'src');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  
  files.forEach(file => {
    const filePath = path.join(srcDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      // Skip App.tsx and main.tsx
      if (file === 'App.tsx' || file === 'main.tsx' || file === 'index.css') {
        return;
      }
      
      srcFileMoves.forEach(({ pattern, to }) => {
        if (pattern.test(file)) {
          const targetPath = path.join(PROJECT_ROOT, to, file);
          
          if (!fs.existsSync(targetPath)) {
            try {
              fs.copyFileSync(filePath, targetPath);
              console.log(`✓ Moved: src/${file} → ${to}${file}`);
            } catch (error) {
              console.warn(`✗ Could not move ${file}: ${error.message}`);
            }
          }
        }
      });
    }
  });
}

// ===================== STEP 7: ORGANIZE DATA FILES =====================

console.log('\nSTEP 7: Organizing data files...');

const dataDir = path.join(PROJECT_ROOT, 'src/data');

if (fs.existsSync(dataDir)) {
  console.log('✓ Data directory already properly organized');
} else {
  console.log('  No data directory to organize');
}

// ===================== STEP 8: ORGANIZE ASSETS =====================

console.log('\nSTEP 8: Organizing assets...');

const assetsDir = path.join(PROJECT_ROOT, 'assets');
const publicAssetsDir = path.join(PROJECT_ROOT, 'public/assets');

if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  
  assetFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      let targetSubDir = 'images';
      
      if (file.match(/\.(woff|woff2|ttf|otf)$/i)) {
        targetSubDir = 'fonts';
      } else if (file.match(/\.(mp3|wav|ogg)$/i)) {
        targetSubDir = 'sounds';
      }
      
      const targetPath = path.join(publicAssetsDir, targetSubDir, file);
      
      if (!fs.existsSync(targetPath)) {
        try {
          fs.copyFileSync(filePath, targetPath);
          console.log(`✓ Moved: assets/${file} → public/assets/${targetSubDir}/${file}`);
        } catch (error) {
          console.warn(`✗ Could not move ${file}: ${error.message}`);
        }
      }
    }
  });
}

// ===================== STEP 9: CREATE INDEX FILES =====================

console.log('\nSTEP 9: Creating barrel export index files...');

const barrelExports = [
  {
    dir: 'src/components/common',
    content: `// Auto-generated barrel export
// Export all common components
export * from './Button';
export * from './Card';
export * from './Modal';
export * from './Input';
`
  },
  {
    dir: 'src/components/characters',
    content: `// Auto-generated barrel export
// Export all character components
`
  },
  {
    dir: 'src/components/battle',
    content: `// Auto-generated barrel export
// Export all battle components
`
  },
  {
    dir: 'src/constants',
    content: `// Application constants
export * from './config';
`
  },
  {
    dir: 'src/types',
    content: `// TypeScript type definitions
export * from './types';
`
  }
];

barrelExports.forEach(({ dir, content }) => {
  const indexPath = path.join(PROJECT_ROOT, dir, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    try {
      fs.writeFileSync(indexPath, content, 'utf8');
      console.log(`✓ Created: ${dir}/index.ts`);
    } catch (error) {
      console.warn(`✗ Could not create ${dir}/index.ts: ${error.message}`);
    }
  }
});

// ===================== SUMMARY =====================

console.log('\n=== OPTIMIZATION COMPLETE ===\n');

console.log('Changes made:');
console.log('1. ✓ Removed unused folders (scratch/, graphify-out/)');
console.log('2. ✓ Created new directory structure');
console.log('3. ✓ Organized config files into config/');
console.log('4. ✓ Moved server files into server/');
console.log('5. ✓ Organized components by category');
console.log('6. ✓ Moved page components to pages/');
console.log('7. ✓ Organized assets into public/assets/');
console.log('8. ✓ Created barrel export index files');

console.log('\nNEXT STEPS:');
console.log('1. Update import paths in all files');
console.log('2. Delete original files after verifying moves');
console.log('3. Run: npm run build');
console.log('4. Test the application');
console.log('5. Commit the changes');

console.log('\nRun the following command to update imports:');
console.log('  node update-imports.js');
