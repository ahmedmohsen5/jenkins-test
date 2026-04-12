'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'src');
const outputDir = path.join(projectRoot, 'dist');

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const fileName of ['app.js', 'index.js']) {
  const sourceFile = path.join(sourceDir, fileName);
  const outputFile = path.join(outputDir, fileName);
  fs.copyFileSync(sourceFile, outputFile);
}

console.log('Build completed. Output available in dist/.');
