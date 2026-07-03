#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')
const os = require('os')

const root = __dirname

function run(cmd, args, cwd, label) {
  const shell = process.env.SHELL || '/bin/zsh'
  const fullCmd = cmd + ' ' + args.join(' ')
  const proc = spawn(shell, ['-l', '-c', fullCmd], {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: `${os.homedir()}/.local/bin:${os.homedir()}/.cargo/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`,
    },
  })
  proc.on('exit', (code) => {
    console.log(`[${label}] exited with code ${code}`)
  })
  return proc
}

// Kill stale processes
const { execSync } = require('child_process')
try { execSync("lsof -ti:8000 | xargs kill -9 2>/dev/null || true", { stdio: 'ignore' }) } catch {}
try { execSync("lsof -ti:3000 | xargs kill -9 2>/dev/null || true", { stdio: 'ignore' }) } catch {}

console.log('[backend] starting...')
const backend = run(
  'uv run pocket-tts serve --host localhost --port 8000',
  [],
  path.join(root, 'pocket-tts'),
  'backend'
)

// Wait 5s for backend to boot, then start frontend
setTimeout(() => {
  console.log('[frontend] starting...')
  run('npm run dev', [], path.join(root, 'frontend'), 'frontend')
}, 5000)

// Keep process alive and forward signals
process.on('SIGINT', () => { backend.kill(); process.exit(0) })
process.on('SIGTERM', () => { backend.kill(); process.exit(0) })
