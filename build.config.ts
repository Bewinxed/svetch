import { defineBuildConfig } from 'unbuild'
import fs from 'fs'
import path from 'path'


const copyFolderRecursive = (src: string, dest: string) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

export default defineBuildConfig({
  entries: [
    "src/bin.ts"
  ],
  clean: true,
  declaration: true, // Generate .d.ts files
  outDir: 'dist',
  rollup: {
    emitCJS: true,
    inlineDependencies: false,

  },
  hooks: {
    'build:done': () => {
      const srcDir = path.join(__dirname, 'src/assets');
      const destDir = path.join(__dirname, 'dist/assets');
      
      if (fs.existsSync(srcDir)) {
        copyFolderRecursive(srcDir, destDir);
        console.log('Copied src/assets to dist/assets');
      } else {
        console.warn('Source directory not found: src/assets');
      }
    },
  },
})