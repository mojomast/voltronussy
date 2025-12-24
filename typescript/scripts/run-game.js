#!/usr/bin/env node

/**
 * Game Runner Script
 *
 * Usage: pnpm game <game-name>
 *
 * For web games, starts vite dev server.
 * For headless games, runs directly with ts-node.
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function main() {
  const gameName = process.argv[2];

  if (!gameName) {
    console.error('Usage: pnpm game <game-name>');
    console.error('');
    console.error('Available games:');
    listGames();
    process.exit(1);
  }

  const gameDir = join(rootDir, 'games', gameName);

  if (!existsSync(gameDir)) {
    console.error(`Game not found: ${gameName}`);
    console.error('');
    console.error('Available games:');
    listGames();
    process.exit(1);
  }

  // Read game.json to determine adapter
  const gameJsonPath = join(gameDir, 'game.json');
  if (!existsSync(gameJsonPath)) {
    console.error(`No game.json found in ${gameDir}`);
    process.exit(1);
  }

  const gameConfig = JSON.parse(readFileSync(gameJsonPath, 'utf-8'));
  const adapter = gameConfig.adapter || 'adapter-null';

  console.log(`Starting ${gameConfig.name || gameName}...`);
  console.log(`Adapter: ${adapter}`);
  console.log('');

  if (adapter === 'adapter-webcanvas' || adapter.includes('web')) {
    // Web game - use vite
    runVite(gameDir);
  } else {
    // Headless game - use tsx
    runHeadless(gameDir);
  }
}

function listGames() {
  const gamesDir = join(rootDir, 'games');
  const { readdirSync, statSync } = require('fs');

  try {
    const entries = readdirSync(gamesDir);
    for (const entry of entries) {
      if (entry.startsWith('_')) continue; // Skip templates
      const entryPath = join(gamesDir, entry);
      if (statSync(entryPath).isDirectory()) {
        const gameJsonPath = join(entryPath, 'game.json');
        if (existsSync(gameJsonPath)) {
          const config = JSON.parse(readFileSync(gameJsonPath, 'utf-8'));
          console.log(`  ${entry} - ${config.name || '(no name)'}`);
        }
      }
    }
  } catch (e) {
    console.log('  (no games found)');
  }
}

function runVite(gameDir) {
  console.log('Starting Vite dev server...');
  console.log('Open http://localhost:5173 in your browser');
  console.log('');

  const vite = spawn('npx', ['vite', '--host'], {
    cwd: gameDir,
    stdio: 'inherit',
    shell: true,
  });

  vite.on('error', (err) => {
    console.error('Failed to start Vite:', err);
    process.exit(1);
  });
}

function runHeadless(gameDir) {
  console.log('Running headless game...');
  console.log('');

  const entryPoint = join(gameDir, 'src', 'index.ts');

  const tsx = spawn('npx', ['tsx', entryPoint], {
    cwd: gameDir,
    stdio: 'inherit',
    shell: true,
  });

  tsx.on('error', (err) => {
    console.error('Failed to run game:', err);
    process.exit(1);
  });

  tsx.on('close', (code) => {
    process.exit(code || 0);
  });
}

main();
