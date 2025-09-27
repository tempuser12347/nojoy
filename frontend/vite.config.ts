import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const getVersion = () => {
  // return 'v0.0.2';
  try {
    // Get the latest git tag
    return execSync('git describe --tags --abbrev=0').toString().trim();
  } catch (e) {
    console.warn('Could not get git tag, falling back to package.json version.');
    // Fallback to package.json version
    return JSON.parse(readFileSync('./package.json', 'utf-8')).version;
  }
};

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getVersion()),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});