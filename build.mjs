import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'

await mkdir('dist', { recursive: true })

const shared = {
  entryPoints: ['src/otel-web.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2020'],
  legalComments: 'eof',
  sourcemap: false,
}

await Promise.all([
  build({
    ...shared,
    outfile: 'dist/otel-web.js',
    minify: false,
  }),
  build({
    ...shared,
    outfile: 'dist/otel-web.min.js',
    minify: true,
  }),
])
