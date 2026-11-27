import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH = /nom-du-depot/ pour GitHub Pages ; / en local.
export default defineConfig({
  plugins: [react(), {
    name: 'lifetrack-offline-build',
    apply: 'build',
    async writeBundle({ dir }) {
      const out = resolve(dir ?? 'dist')
      const worker = resolve(out, 'sw.js')
      const source = await readFile(worker, 'utf8')
      const hash = createHash('sha256')
      const files = (await readdir(out, { recursive: true, withFileTypes: true }))
        .filter(entry => entry.isFile())
        .map(entry => resolve(entry.parentPath, entry.name))
        .sort()
      for (const file of files) hash.update(await readFile(file))
      const shellHash = createHash('sha256').update(await readFile(resolve(out, 'index.html'))).digest('hex')
      await writeFile(worker, source.replace('__LIFETRACK_BUILD__', hash.digest('hex').slice(0, 20))
        .replace('__LIFETRACK_SHELL__', shellHash))
    },
  }],
  base: '/LifeTrack-Training-Preview/',
})
