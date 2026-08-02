const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

const srcFiles = getAllFiles('./src');
const apiFiles = getAllFiles('./api');

console.log('=== PROJECT STRUCTURE ===\n');
console.log('SRC FILES:');
srcFiles.forEach(f => console.log(f.replace(/\\/g, '/')));
console.log('\nAPI FILES:');
apiFiles.forEach(f => console.log(f.replace(/\\/g, '/')));
