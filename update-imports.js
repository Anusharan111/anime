#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;

console.log('=== IMPORT PATH UPDATER ===\n');

// ===================== IMPORT PATH MAPPING =====================

const pathMappings = {
  // Config files moved
  '../vite.config': '../config/vite.config',
  './vite.config': './config/vite.config',
  '../tsconfig.json': '../config/tsconfig.json',
  './tsconfig.json': './config/tsconfig.json',
  
  // Server files moved
  './server': './server/server',
  '../server': '../server/server',
  
  // Components reorganized
  './components/Button': './components/common/Button',
  './components/Card': './components/common/Card',
  './components/Modal': './components/common/Modal',
  './components/Input': './components/common/Input',
  './components/Header': './components/layout/Header',
  './components/Footer': './components/layout/Footer',
  './components/Layout': './components/layout/Layout',
  './components/Character': './components/characters/Character',
  './components/CharacterCard': './components/characters/CharacterCard',
  './components/Battle': './components/battle/Battle',
  './components/CinematicClash': './components/battle/CinematicClash',
  
  // Pages moved
  './LandingPage': './pages/LandingPage',
  '../LandingPage': '../pages/LandingPage',
  
  // Types moved
  './types': './types/types',
  '../types': '../types/types',
  
  // Config moved
  './config': './constants/config',
  '../config': '../constants/config'
};

// ===================== FILE SCANNER =====================

function getAllTsFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, dist, .git
          if (!file.includes('node_modules') && 
              !file.includes('dist') && 
              !file.includes('.git') &&
              !file.includes('.qwen')) {
            arrayOfFiles = getAllTsFiles(fullPath, arrayOfFiles);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          arrayOfFiles.push(fullPath);
        }
      } catch (err) {
        // Skip files we can't access
      }
    });
  } catch (err) {
    console.warn(`Cannot read directory ${dirPath}: ${err.message}`);
  }
  
  return arrayOfFiles;
}

// ===================== IMPORT UPDATER =====================

function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    const originalContent = content;
    
    // Find all import statements
    const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*]+)(?:\s*,\s*)?)+\s+from\s+['"]([^'"]+)['"]/g;
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    // Update static imports
    content = content.replace(importRegex, (match, importPath) => {
      for (const [oldPath, newPath] of Object.entries(pathMappings)) {
        if (importPath === oldPath || importPath === oldPath.replace(/\\/g, '/')) {
          updated = true;
          return match.replace(importPath, newPath);
        }
        
        // Handle relative paths that might need updating
        if (importPath.includes(oldPath.split('/').pop())) {
          const updatedPath = importPath.replace(oldPath.split('/').pop(), newPath);
          updated = true;
          return match.replace(importPath, updatedPath);
        }
      }
      
      return match;
    });
    
    // Update dynamic imports
    content = content.replace(dynamicImportRegex, (match, importPath) => {
      for (const [oldPath, newPath] of Object.entries(pathMappings)) {
        if (importPath === oldPath) {
          updated = true;
          return match.replace(importPath, newPath);
        }
      }
      
      return match;
    });
    
    // Write back if changed
    if (updated && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      console.log(`✓ Updated: ${relativePath}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.warn(`✗ Error updating ${filePath}: ${error.message}`);
    return 0;
  }
}

// ===================== SMART PATH RESOLUTION =====================

function updateImportsSmartly(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    const originalContent = content;
    const fileDir = path.dirname(filePath);
    
    // Pattern to match imports
    const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*]+)(?:\s*,\s*)?)+\s+from\s+['"]([^'"]+)['"]/g;
    
    content = content.replace(importRegex, (match, importPath) => {
      // Skip node_modules imports
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        return match;
      }
      
      // Resolve the absolute path
      const absoluteImportPath = path.resolve(fileDir, importPath);
      
      // Check if the file exists (try with extensions)
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
      let existingPath = null;
      
      for (const ext of extensions) {
        const testPath = absoluteImportPath + ext;
        if (fs.existsSync(testPath)) {
          existingPath = testPath;
          break;
        }
        
        // Also check for index files
        const indexPath = path.join(absoluteImportPath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          existingPath = indexPath;
          break;
        }
      }
      
      if (!existingPath) {
        // File doesn't exist, try to find it in new locations
        const fileName = path.basename(importPath);
        const possibleNewLocations = [
          'src/components/common',
          'src/components/layout',
          'src/components/characters',
          'src/components/battle',
          'src/components/games',
          'src/components/ui',
          'src/pages',
          'src/types',
          'src/constants',
          'src/hooks',
          'src/utils',
          'config',
          'server'
        ];
        
        for (const newLoc of possibleNewLocations) {
          const newPath = path.join(PROJECT_ROOT, newLoc, fileName);
          
          for (const ext of extensions) {
            if (fs.existsSync(newPath + ext)) {
              // Calculate relative path from current file to new location
              const relativeNewPath = path.relative(fileDir, newPath).replace(/\\/g, '/');
              const fixedPath = relativeNewPath.startsWith('.') ? relativeNewPath : './' + relativeNewPath;
              
              updated = true;
              return match.replace(importPath, fixedPath);
            }
          }
        }
      }
      
      return match;
    });
    
    if (updated && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      console.log(`✓ Smart update: ${relativePath}`);
      return 1;
    }
    
    return 0;
  } catch (error) {
    console.warn(`✗ Error in smart update for ${filePath}: ${error.message}`);
    return 0;
  }
}

// ===================== MAIN EXECUTION =====================

function main() {
  console.log('Scanning for TypeScript/JavaScript files...\n');
  
  const allFiles = getAllTsFiles(PROJECT_ROOT);
  console.log(`Found ${allFiles.length} files to process\n`);
  
  console.log('PHASE 1: Basic path mapping updates...');
  let basicUpdates = 0;
  allFiles.forEach(file => {
    basicUpdates += updateImportsInFile(file);
  });
  console.log(`Basic updates: ${basicUpdates} files modified\n`);
  
  console.log('PHASE 2: Smart path resolution...');
  let smartUpdates = 0;
  allFiles.forEach(file => {
    smartUpdates += updateImportsSmartly(file);
  });
  console.log(`Smart updates: ${smartUpdates} files modified\n`);
  
  console.log('=== IMPORT UPDATE COMPLETE ===\n');
  console.log(`Total files processed: ${allFiles.length}`);
  console.log(`Files updated: ${basicUpdates + smartUpdates}`);
  
  console.log('\nNEXT STEPS:');
  console.log('1. Review the changes');
  console.log('2. Run: npm run build');
  console.log('3. Fix any remaining import errors manually');
  console.log('4. Delete old files after verifying everything works');
}

// Execute
if (require.main === module) {
  main();
}

module.exports = { updateImportsInFile, updateImportsSmartly };