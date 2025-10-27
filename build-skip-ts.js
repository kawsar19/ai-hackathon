#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables to skip TypeScript checking
process.env.SKIP_TYPE_CHECK = 'true';
process.env.NEXT_TYPESCRIPT = 'false';

// Run Next.js build with webpack
const buildProcess = spawn('npx', ['next', 'build', '--webpack'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    SKIP_TYPE_CHECK: 'true',
    NEXT_TYPESCRIPT: 'false',
  }
});

buildProcess.on('close', (code) => {
  process.exit(code);
});

buildProcess.on('error', (error) => {
  console.error('Build error:', error);
  process.exit(1);
});
