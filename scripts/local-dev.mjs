import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const nextBin = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))
const port = process.env.PORT || '3000'

const child = spawn(process.execPath, [nextBin, 'dev', '--port', port, '--hostname', '0.0.0.0'], {
  env: {
    ...process.env,
    NODE_OPTIONS: '--no-deprecation',
  },
  stdio: 'inherit',
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
