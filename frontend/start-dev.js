#!/usr/bin/env node
const { spawn, execSync } = require('child_process')
const path = require('path')
const os = require('os')

const backendDir = path.resolve(__dirname, '..', 'pocket-tts')

const env = {
  ...process.env,
  PATH: [
    path.join(os.homedir(), '.local', 'bin'),
    path.join(os.homedir(), '.cargo', 'bin'),
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    process.env.PATH || '',
  ].join(':'),
}

// Kill any stale backend on port 8000
try { execSync('lsof -ti:8000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' }) } catch {}

// Start backend in background — non-blocking
const backend = spawn(
  process.env.SHELL || '/bin/zsh',
  ['-l', '-c', 'uv run pocket-tts serve --host localhost --port 8000'],
  { cwd: backendDir, stdio: 'inherit', env }
)
backend.on('exit', (code) => console.log(`[backend] exited with code ${code}`))
console.log('[backend] starting on port 8000…')

// Forward any extra args passed by DevHub (e.g. --port 3003)
const extraArgs = process.argv.slice(2).join(' ')
const nextCmd = `next dev --turbopack ${extraArgs}`.trim()

console.log('[frontend] starting…')
const frontend = spawn(
  process.env.SHELL || '/bin/zsh',
  ['-l', '-c', nextCmd],
  { cwd: __dirname, stdio: 'inherit', env }
)

frontend.on('exit', (code) => {
  backend.kill()
  process.exit(code ?? 0)
})

const cleanup = () => { backend.kill(); frontend.kill(); process.exit(0) }
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
