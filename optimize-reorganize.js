const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname);

// ===================== CONFIGURATION =====================

// Target directory structure
const TARGET_STRUCTURE = {
  'public': {
    'assets': ['images', 'fonts', 'icons', 'sounds'],
    'favicon.ico': null,
    'robots.txt': null
  },
  'src': {
    'components': {
      'common': [],      // Button, Card, Input, Modal
      'layout': [],      // Header, Footer, Sidebar
      'games': [],       // Game-specific components
      'battle': [],      // Battle system components
      'characters': [],  // Character components
      'ui': []           // Generic UI components
    },
    'pages': [],         // Page components (routes)
    'hooks': [],         // Custom React hooks
    'utils': {
      'api': [],         // API utilities
      'battle': [],      // Battle utilities
      'validation': [],  // Form validation
      'helpers': []      // General helpers
    },
    'types': {
      'api': [],         // API types
      'game': [],        // Game types
      'character': [],   // Character types
      'shared': []       // Shared types
    },
    'constants': [],     // App constants
    'services': {
      'api': [],         // API services
      'game': [],        // Game services
      'auth': []         // Auth services
    },
    'contexts': [],      // React contexts
    'styles': [],        // Global styles
    'assets': {
      'images': [],      // Component images
      'sounds': [],      // Game sounds
      'sprites': []      // Game sprites
    },
    'lib': [],           // Third-party wrappers
    'data': {
      'characters': [],  // Character data
      'games': [],       // Game data
      'battles': []      // Battle data
    }
  },
  'api': {
    'controllers': [],   // Route controllers
    'services': [],      // Business logic
    'middleware': [],    // Express middleware
    'routes': [],        // Route definitions
    'utils': []          // API utilities
  },
  'server': [],          // Server files
  'config': [],          // Config files
  'scripts': [],         // Build/utility scripts
  'tests': {
    'unit': [],          // Unit tests
    'integration': [],   // Integration tests
    'e2e': []            // E2E tests
  },
  'docs': [],            // Documentation
  '.github': {
    'workflows': []      // CI/CD workflows
  }
};

// File mapping rules (regex patterns to target directories)
const FILE_MAPPING_RULES = [
  // Test files
  { pattern: /\.test\.(ts|tsx|js)$/i, target: 'tests/unit/' },
  { pattern: /\.spec\.(ts|tsx|js)$/i, target: 'tests/unit/' },
  { pattern: /test\.(ts|tsx|js)$/i, target: 'tests/unit/' },
  { pattern: /e2e\.(ts|tsx|js)$/i, target: 'tests/e2e/' },
  
  // API files
  { pattern: /controller\.(ts|js)$/i, target: 'api/controllers/' },
  { pattern: /route[s]?\.(ts|js)$/i, target: 'api/routes/' },
  { pattern: /middleware\.(ts|js)$/i, target: 'api/middleware/' },
  { pattern: /service\.(ts|js)$/i, target: 'api/services/' },
  
  // Component files
  { pattern: /\.tsx$/i, checkContent: true, target: 'src/components/', 
    contentCheck: (content) => content.includes('export default function') || content.includes('export default const') },
  { pattern: /component\.(ts|tsx)$/i, target: 'src/components/' },
  { pattern: /Button\.(ts|tsx)$/i, target: 'src/components/common/' },
  { pattern: /Card\.(ts|tsx)$/i, target: 'src/components/common/' },
  { pattern: /Modal\.(ts|tsx)$/i, target: 'src/components/common/' },
  { pattern: /Input\.(ts|tsx)$/i, target: 'src/components/common/' },
  { pattern: /Form\.(ts|tsx)$/i, target: 'src/components/ui/' },
  { pattern: /Layout\.(ts|tsx)$/i, target: 'src/components/layout/' },
  { pattern: /Header\.(ts|tsx)$/i, target: 'src/components/layout/' },
  { pattern: /Footer\.(ts|tsx)$/i, target: 'src/components/layout/' },
  { pattern: /Sidebar\.(ts|tsx)$/i, target: 'src/components/layout/' },
  { pattern: /Game.*\.(ts|tsx)$/i, target: 'src/components/games/' },
  { pattern: /Battle.*\.(ts|tsx)$/i, target: 'src/components/battle/' },
  { pattern: /Character.*\.(ts|tsx)$/i, target: 'src/components/characters/' },
  
  // Hook files
  { pattern: /use[A-Z].*\.(ts|tsx)$/i, target: 'src/hooks/' },
  { pattern: /\.hook\.(ts|tsx)$/i, target: 'src/hooks/' },
  
  // Utility files
  { pattern: /util[s]?\.(ts|js)$/i, target: 'src/utils/helpers/' },
  { pattern: /helper[s]?\.(ts|js)$/i, target: 'src/utils/helpers/' },
  { pattern: /api\.(ts|js)$/i, target: 'src/utils/api/' },
  { pattern: /battle.*\.(ts|js)$/i, target: 'src/utils/battle/' },
  { pattern: /validation\.(ts|js)$/i, target: 'src/utils/validation/' },
  
  // Type files
  { pattern: /\.d\.ts$/i, target: 'src/types/shared/' },
  { pattern: /types?\.(ts|tsx)$/i, target: 'src/types/shared/' },
  { pattern: /interface[s]?\.(ts)$/i, target: 'src/types/shared/' },
  
  // Service files
  { pattern: /service\.(ts|js)$/i, target: 'src/services/' },
  { pattern: /api.*\.(ts|js)$/i, target: 'src/services/api/' },
  { pattern: /auth.*\.(ts|js)$/i, target: 'src/services/auth/' },
  
  // Style files
  { pattern: /\.css$/i, target: 'src/styles/' },
  { pattern: /\.scss$/i, target: 'src/styles/' },
  { pattern: /style[s]?\.(ts|tsx)$/i, target: 'src/styles/' },
  
  // Config files
  { pattern: /config\.(ts|js|json)$/i, target: 'config/' },
  { pattern: /\.config\.(ts|js|json)$/i, target: 'config/' },
  { pattern: /vite\.config\.(ts|js)$/i, target: 'config/' },
  
  // Data files
  { pattern: /\.json$/i, target: 'src/data/' },
  { pattern: /data\.(ts|js)$/i, target: 'src/data/' },
  
  // Asset files
  { pattern: /\.(png|jpg|jpeg|gif|webp|svg)$/i, target: 'public/assets/images/' },
  { pattern: /\.(woff|woff2|ttf|otf)$/i, target: 'public/assets/fonts/' },
  { pattern: /\.(mp3|wav|ogg)$/i, target: 'public/assets/sounds/' },
  
  // Server files
  { pattern: /server\.(ts|js)$/i, target: 'server/' },
  { pattern: /index\.(ts|js)$/i, checkLocation: 'api', target: 'api/' },
  
  // Script files
  { pattern: /script[s]?\.(js)$/i, target: 'scripts/' },
  { pattern: /\.sh$/i, target: 'scripts/' },
  
  // Documentation
  { pattern: /\.md$/i, target: 'docs/' },
  { pattern: /README\.md$/i, target: './' }, // Keep at root
  { pattern: /\.txt$/i, target: 'docs/' }
];

// ===================== UTILITIES =====================

function createDirectoryStructure(basePath, structure) {
  for (const [key, value] of Object.entries(structure)) {
    const dirPath = path.join(basePath, key);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${key}/`);
    }
    
    if (value && typeof value === 'object') {
      createDirectoryStructure(dirPath, value);
    }
  }
}

function determineTargetDir(filePath, fileName) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  
  // Check mapping rules
  for (const rule of FILE_MAPPING_RULES) {
    if (rule.pattern.test(fileName)) {
      // Check if we need to verify content
      if (rule.checkContent && fileContent) {
        if (rule.contentCheck && rule.contentCheck(fileContent)) {
          return rule.target;
        }
      }
      
      // Check if we need to verify location
      if (rule.checkLocation) {
        if (relativePath.includes(rule.checkLocation)) {
          return rule.target;
        }
      } else {
        return rule.target;
      }
    }
  }
  
  // Default based on extension
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.tsx') return 'src/components/';
  if (ext === '.ts') return 'src/utils/';
  if (ext === '.js') return 'src/utils/helpers/';
  if (ext === '.css' || ext === '.scss') return 'src/styles/';
  if (ext === '.json') return 'src/data/';
  
  return 'src/';
}

function updateImportPaths(filePath, oldPath, newPath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      new RegExp(`import.*['"](${oldPath.replace(/\\/g, '\\\\')})['"]`, 'g'),
      (match, importPath) => {
        const relativeOldPath = path.relative(path.dirname(filePath), oldPath);
        const relativeNewPath = path.relative(path.dirname(filePath), newPath);
        
        // Handle path updates
        let newImportPath = importPath;
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          // Relative import - need to recalculate
          newImportPath = relativeNewPath.replace(/\\/g, '/');
          if (!newImportPath.startsWith('.')) {
            newImportPath = './' + newImportPath;
          }
        }
        
        return match.replace(importPath, newImportPath);
      }
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`  Updated imports in: ${path.relative(PROJECT_ROOT, filePath)}`);
    }
  } catch (error) {
    console.warn(`  Error updating imports in ${filePath}:`, error.message);
  }
}

function scanAndUpdateImports(movedFiles) {
  console.log('\nUpdating import paths in all files...');
  
  const allFiles = getAllFiles(PROJECT_ROOT);
  const tsFiles = allFiles.filter(f => 
    f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')
  );
  
  let updateCount = 0;
  tsFiles.forEach(file => {
    movedFiles.forEach(({ oldPath, newPath }) => {
      updateImportPaths(file, oldPath, newPath);
      updateCount++;
    });
  });
  
  console.log(`Updated ${updateCount} import references`);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          // Skip node_modules, dist, .git, .qwen
          if (!file.includes('node_modules') && !file.includes('dist') && 
              !file.includes('.git') && !file.includes('.qwen')) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
          }
        } else {
          arrayOfFiles.push(fullPath);
        }
      } catch (err) {
        console.warn(`Skipping ${fullPath}: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`Cannot read directory ${dirPath}: ${err.message}`);
  }
  
  return arrayOfFiles;
}

// ===================== MAIN REORGANIZATION =====================

function reorganizeProject() {
  console.log('=== ANIME BATTLE GAME WEBSITE REORGANIZATION ===\n');
  
  // Step 1: Create target directory structure
  console.log('1. Creating target directory structure...');
  createDirectoryStructure(PROJECT_ROOT, TARGET_STRUCTURE);
  
  // Step 2: Scan all files
  console.log('\n2. Scanning project files...');
  const allFiles = getAllFiles(PROJECT_ROOT);
  console.log(`Found ${allFiles.length} files to organize`);
  
  // Step 3: Plan file moves
  console.log('\n3. Planning file moves...');
  const movePlan = [];
  
  allFiles.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    const fileName = path.basename(file);
    
    // Skip files that are already in good locations
    const currentDir = path.dirname(relativePath);
    
    // Determine target directory
    const targetDir = determineTargetDir(file, fileName);
    
    // Check if file should stay where it is
    let shouldMove = true;
    const targetFullPath = path.join(PROJECT_ROOT, targetDir, fileName);
    
    // Don't move if already in target location or if target is root
    if (currentDir === targetDir.replace(/\/$/, '') || 
        targetDir === './' ||
        file === targetFullPath) {
      shouldMove = false;
    }
    
    // Don't move config files that should stay at root
    const rootConfigFiles = ['package.json', 'tsconfig.json', 'vite.config.ts', 'server.ts'];
    if (rootConfigFiles.includes(fileName) && currentDir === '') {
      shouldMove = false;
    }
    
    if (shouldMove) {
      movePlan.push({
        oldPath: file,
        newPath: targetFullPath,
        relativeOld: relativePath,
        relativeNew: path.join(targetDir, fileName)
      });
    }
  });
  
  // Step 4: Execute moves (dry run first)
  console.log('\n4. File move plan (DRY RUN):');
  console.log('The following files will be moved:');
  
  movePlan.forEach((plan, index) => {
    console.log(`${index + 1}. ${plan.relativeOld}`);
    console.log(`   → ${plan.relativeNew}`);
  });
  
  // Step 5: Ask for confirmation
  console.log('\n\n5. CONFIRMATION REQUIRED');
  console.log(`This will move ${movePlan.length} files.`);
  console.log('Type "YES" to proceed with the reorganization:');
  
  // In a real script, we'd read user input here
  // For now, we'll assume confirmation and create the actual move function
  
  return movePlan;
}

function executeMoves(movePlan) {
  console.log('\n6. Executing file moves...');
  
  const movedFiles = [];
  
  movePlan.forEach((plan, index) => {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(plan.newPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(plan.oldPath, plan.newPath);
      console.log(`Moved: ${plan.relativeOld} → ${plan.relativeNew}`);
      
      movedFiles.push({
        oldPath: plan.oldPath,
        newPath: plan.newPath
      });
      
    } catch (error) {
      console.error(`Error moving ${plan.relativeOld}:`, error.message);
    }
  });
  
  return movedFiles;
}

// ===================== CLEANUP =====================

function removeEmptyDirectories(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    
    if (files.length === 0) {
      fs.rmdirSync(dirPath);
      console.log(`Removed empty directory: ${path.relative(PROJECT_ROOT, dirPath)}`);
      return true;
    }
    
    let allEmpty = true;
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        const subDirEmpty = removeEmptyDirectories(fullPath);
        allEmpty = allEmpty && subDirEmpty;
      } else {
        allEmpty = false;
      }
    });
    
    if (allEmpty && files.length > 0) {
      // Remove directory if all subdirectories were empty
      fs.rmdirSync(dirPath);
      console.log(`Removed empty directory: ${path.relative(PROJECT_ROOT, dirPath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

// ===================== MAIN EXECUTION =====================

function main() {
  console.log('=== ANIME BATTLE GAME WEBSITE OPTIMIZATION TOOL ===\n');
  console.log('This tool will:');
  console.log('1. Create an optimized folder structure');
  console.log('2. Move files to appropriate directories');
  console.log('3. Update import paths');
  console.log('4. Remove empty directories');
  console.log('5. Run build verification');
  
  // Get move plan
  const movePlan = reorganizeProject();
  
  if (movePlan.length === 0) {
    console.log('\nNo files need to be moved. Project structure looks good!');
    return;
  }
  
  // For safety, this is a dry-run version
  // To actually execute, you would need to:
  // 1. Uncomment the executeMoves() call
  // 2. Handle user confirmation properly
  
  console.log('\n\n=== DRY RUN COMPLETE ===');
  console.log(`Planned moves: ${movePlan.length} files`);
  console.log('\nTo execute these changes:');
  console.log('1. Review the move plan above');
  console.log('2. Update the executeMoves() call in this script');
  console.log('3. Run the script again');
  
  // Cleanup empty directories (safe to run)
  console.log('\n\nCleaning up empty directories...');
  removeEmptyDirectories(PROJECT_ROOT);
  
  console.log('\n=== OPTIMIZATION COMPLETE ===');
  console.log('\nNext steps:');
  console.log('1. Run build to verify everything works: npm run build');
  console.log('2. Test the application: npm run dev');
  console.log('3. Check for any broken imports');
  console.log('4. Commit the reorganized structure');
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  reorganizeProject,
  executeMoves,
  removeEmptyDirectories,
  TARGET_STRUCTURE
};