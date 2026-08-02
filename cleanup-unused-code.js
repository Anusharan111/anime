const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname);

// ===================== UNUSED CODE DETECTION =====================

function findUnusedExports() {
  console.log('Scanning for potentially unused exports...');
  
  // Track all exports and their usage
  const exportMap = new Map(); // file -> array of export names
  const importMap = new Map(); // file -> array of imports (module names)
  
  // First pass: collect all exports
  function collectExports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      
      // Find named exports
      const namedExportRegex = /export\s+(?:const|function|class|let|var)\s+(\w+)/g;
      const namedExports = [];
      let match;
      
      while ((match = namedExportRegex.exec(content)) !== null) {
        namedExports.push(match[1]);
      }
      
      // Find default exports
      const hasDefaultExport = content.includes('export default');
      
      if (namedExports.length > 0 || hasDefaultExport) {
        exportMap.set(relativePath, {
          named: namedExports,
          hasDefault: hasDefaultExport,
          filePath: filePath
        });
      }
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  // Second pass: collect all imports
  function collectImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      
      // Find all imports
      const importRegex = /from\s+['"]([^'"]+)['"]/g;
      const imports = [];
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      
      importMap.set(relativePath, imports);
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  // Scan all TypeScript/JavaScript files
  function scanFiles(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, dist, .git
          if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
            scanFiles(fullPath);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          collectExports(fullPath);
          collectImports(fullPath);
        }
      });
    } catch (error) {
      console.warn(`Cannot scan directory ${dirPath}: ${error.message}`);
    }
  }
  
  // Start scanning from project root
  scanFiles(PROJECT_ROOT);
  
  // Analyze which exports are unused
  const unusedExports = [];
  
  for (const [exportingFile, exportInfo] of exportMap) {
    const { named: exportNames, hasDefault: hasDefaultExport, filePath } = exportInfo;
    
    let isUsed = false;
    
    // Check if any file imports from this module
    for (const [importingFile, imports] of importMap) {
      for (const importPath of imports) {
        // Convert import path to relative file path
        const importingDir = path.dirname(path.join(PROJECT_ROOT, importingFile));
        let importedModulePath;
        
        if (importPath.startsWith('.')) {
          // Relative import
          importedModulePath = path.resolve(importingDir, importPath);
          importedModulePath = path.relative(PROJECT_ROOT, importedModulePath);
        } else {
          // Absolute import (node_modules or alias)
          importedModulePath = importPath;
        }
        
        // Check if this import matches our export file
        const exportFileWithoutExt = exportingFile.replace(/\.(ts|tsx|js)$/, '');
        const importedModuleWithoutExt = importedModulePath.replace(/\.(ts|tsx|js)$/, '');
        
        if (importedModuleWithoutExt.includes(exportFileWithoutExt) ||
            exportFileWithoutExt.includes(importedModuleWithoutExt)) {
          isUsed = true;
          break;
        }
      }
      
      if (isUsed) break;
    }
    
    if (!isUsed) {
      unusedExports.push({
        file: exportingFile,
        namedExports: exportNames,
        hasDefaultExport,
        fullPath: filePath
      });
    }
  }
  
  return unusedExports;
}

// ===================== DEAD CODE REMOVAL =====================

function findDeadCodeFiles() {
  console.log('Looking for files that might be dead code...');
  
  const potentialDeadFiles = [];
  
  // Check for files that:
  // 1. Are not imported anywhere
  // 2. Don't export anything useful
  // 3. Might be leftover from refactoring
  
  function scanForDeadFiles(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, dist, .git
          if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
            scanForDeadFiles(fullPath);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            
            // Heuristics for potential dead code:
            // 1. No exports (unless it's an entry point like main.tsx)
            const hasExport = content.includes('export') || 
                              content.includes('module.exports') ||
                              content.includes('export default');
            
            // 2. Not imported anywhere (we'd need import graph for this)
            // 3. Small file that might be leftover
            const lineCount = content.split('\n').length;
            
            // Skip entry points
            const isEntryPoint = file === 'main.tsx' || 
                                file === 'App.tsx' || 
                                file === 'index.ts' ||
                                file.includes('server') ||
                                file.includes('vite.config');
            
            if (!hasExport && !isEntryPoint && lineCount < 50) {
              potentialDeadFiles.push({
                file: relativePath,
                fullPath: fullPath,
                lineCount: lineCount,
                reason: 'Small file with no exports (might be leftover)'
              });
            }
            
            // Check for commented out code blocks
            const hasLargeCommentedBlocks = (content.match(/\/\*[\s\S]*?\*\//g) || []).some(
              block => block.split('\n').length > 10
            );
            
            if (hasLargeCommentedBlocks) {
              potentialDeadFiles.push({
                file: relativePath,
                fullPath: fullPath,
                reason: 'Contains large commented code blocks'
              });
            }
            
          } catch (error) {
            // Skip files we can't read
          }
        }
      });
    } catch (error) {
      console.warn(`Cannot scan directory ${dirPath}: ${error.message}`);
    }
  }
  
  scanForDeadFiles(PROJECT_ROOT);
  return potentialDeadFiles;
}

// ===================== UNUSED IMPORTS =====================

function findUnusedImports() {
  console.log('Looking for potentially unused imports...');
  
  const unusedImports = [];
  
  function scanFileForUnusedImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      
      // Find all imports
      const importRegex = /import\s+(?:{[^}]*}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g;
      const imports = [];
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[0]);
      }
      
      // Simple heuristic: if import is only used once or not at all
      imports.forEach(importStatement => {
        const importNameMatch = importStatement.match(/import\s+({[^}]*}|[\w*]+)/);
        if (importNameMatch) {
          const importName = importNameMatch[1];
          
          // Count occurrences of imported names
          let usageCount = 0;
          
          if (importName.startsWith('{')) {
            // Named imports: { Component1, Component2 }
            const importedNames = importName.slice(1, -1).split(',').map(n => n.trim());
            importedNames.forEach(name => {
              const nameWithoutAlias = name.split(' as ')[0].trim();
              const regex = new RegExp(`\\b${nameWithoutAlias}\\b`, 'g');
              const matches = content.match(regex) || [];
              usageCount += matches.length;
            });
          } else {
            // Default or namespace import
            const importedName = importName.includes(' as ') ? 
              importName.split(' as ')[1].trim() : 
              importName.trim();
            
            if (importedName !== '*' && importedName !== 'type') {
              const regex = new RegExp(`\\b${importedName}\\b`, 'g');
              const matches = content.match(regex) || [];
              usageCount = matches.length;
            }
          }
          
          // If usage count is very low (0-1), flag it
          if (usageCount <= 1) {
            unusedImports.push({
              file: relativePath,
              importStatement: importStatement.trim(),
              usageCount: usageCount,
              suggestion: usageCount === 0 ? 'Remove import' : 'Check if truly needed'
            });
          }
        }
      });
      
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  function scanForUnusedImports(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, dist, .git
          if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
            scanForUnusedImports(fullPath);
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          scanFileForUnusedImports(fullPath);
        }
      });
    } catch (error) {
      console.warn(`Cannot scan directory ${dirPath}: ${error.message}`);
    }
  }
  
  scanForUnusedImports(PROJECT_ROOT);
  return unusedImports;
}

// ===================== MAIN ANALYSIS =====================

function main() {
  console.log('=== ANIME BATTLE GAME - UNUSED CODE ANALYSIS ===\n');
  
  // Run all analysis
  console.log('Running comprehensive code analysis...\n');
  
  const unusedExports = findUnusedExports();
  const deadFiles = findDeadCodeFiles();
  const unusedImports = findUnusedImports();
  
  // Report results
  console.log('\n=== ANALYSIS RESULTS ===\n');
  
  // Unused exports
  if (unusedExports.length > 0) {
    console.log(`POTENTIALLY UNUSED EXPORTS (${unusedExports.length}):`);
    unusedExports.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.file}`);
      if (exp.namedExports.length > 0) {
        console.log(`   Exports: ${exp.namedExports.join(', ')}`);
      }
      if (exp.hasDefaultExport) {
        console.log(`   Has default export`);
      }
      console.log();
    });
  } else {
    console.log('✓ No unused exports found');
  }
  
  // Dead files
  if (deadFiles.length > 0) {
    console.log(`\nPOTENTIAL DEAD FILES (${deadFiles.length}):`);
    deadFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.file}`);
      console.log(`   Reason: ${file.reason}`);
      if (file.lineCount) {
        console.log(`   Lines: ${file.lineCount}`);
      }
      console.log();
    });
  } else {
    console.log('\n✓ No obvious dead files found');
  }
  
  // Unused imports
  if (unusedImports.length > 0) {
    console.log(`\nPOTENTIALLY UNUSED IMPORTS (${unusedImports.length}):`);
    unusedImports.forEach((imp, index) => {
      console.log(`${index + 1}. ${imp.file}`);
      console.log(`   Import: ${imp.importStatement}`);
      console.log(`   Usage count: ${imp.usageCount} - ${imp.suggestion}`);
      console.log();
    });
  } else {
    console.log('\n✓ No unused imports found');
  }
  
  // Summary and recommendations
  console.log('\n=== RECOMMENDATIONS ===\n');
  
  const totalIssues = unusedExports.length + deadFiles.length + unusedImports.length;
  
  if (totalIssues === 0) {
    console.log('Your codebase looks clean! No obvious unused code detected.');
  } else {
    console.log(`Found ${totalIssues} potential issues to review:\n`);
    
    if (unusedExports.length > 0) {
      console.log(`1. Review ${unusedExports.length} unused exports:`);
      console.log('   - Check if these exports are truly unused or imported via dynamic imports');
      console.log('   - Consider removing or consolidating these modules\n');
    }
    
    if (deadFiles.length > 0) {
      console.log(`2. Review ${deadFiles.length} potential dead files:`);
      console.log('   - Verify these files are not needed');
      console.log('   - Check git history to see if they were recently active');
      console.log('   - Consider moving useful code and deleting the rest\n');
    }
    
    if (unusedImports.length > 0) {
      console.log(`3. Review ${unusedImports.length} potentially unused imports:`);
      console.log('   - Remove imports that are not used');
      console.log('   - Some imports might be used for type-only purposes (check TypeScript usage)');
      console.log('   - Run build after removing imports to ensure nothing breaks\n');
    }
    
    console.log('=== SAFETY CHECK ===');
    console.log('\nBefore deleting anything:');
    console.log('1. Make sure you have a backup or use version control');
    console.log('2. Run tests to ensure functionality is preserved');
    console.log('3. Check if code is used dynamically (e.g., via string references)');
    console.log('4. Consider moving useful code before deleting entire files');
  }
  
  // Create cleanup script
  console.log('\n=== QUICK CLEANUP SCRIPT ===');
  console.log('\nCreate a cleanup script with this content:');
  
  const cleanupScript = `
// cleanup-selected.js
const fs = require('fs');
const path = require('path');

// Files to delete (add paths from analysis above)
const FILES_TO_DELETE = [
  ${deadFiles.map(f => `"${f.file}"`).join(',\n  ')}
];

// Imports to remove (file -> import statement)
const IMPORTS_TO_REMOVE = {
  ${unusedImports.map(imp => `"${imp.file}": "${imp.importStatement.replace(/"/g, '\\"')}"`).join(',\n  ')}
};

console.log('Cleanup script ready. Review the arrays above before running.');
  `.trim();
  
  console.log(cleanupScript);
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  findUnusedExports,
  findDeadCodeFiles,
  findUnusedImports
};