import { cp, rm, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'

const repoRoot = process.cwd()
const sourceDir = process.env.WIKI_SOURCE_DIR || path.join(os.homedir(), 'wiki')
const targetDir = path.join(repoRoot, 'wiki-content')

const EXCLUDE_NAMES = new Set(['.DS_Store', '.Trash', '.obsidian'])

async function main() {
  if (!existsSync(sourceDir)) {
    throw new Error(`Wiki source not found: ${sourceDir}`)
  }

  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })

  await cp(sourceDir, targetDir, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
    filter: (src) => {
      const rel = path.relative(sourceDir, src)
      if (!rel) return true
      const parts = rel.split(path.sep)
      return !parts.some((part) => EXCLUDE_NAMES.has(part) || part.startsWith('.'))
    },
  })

  console.log(`Synced wiki from ${sourceDir} -> ${targetDir}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
