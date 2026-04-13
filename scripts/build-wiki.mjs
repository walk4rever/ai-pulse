import { cp, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

const repoRoot = process.cwd()
const wikiContentDir = path.join(repoRoot, 'wiki-content')
const wikiSiteDir = path.join(repoRoot, 'wiki-site')
const quartzPackageDir = path.join(repoRoot, 'node_modules', '@jackyzha0', 'quartz')
const outputDir = path.join(wikiSiteDir, 'public')

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}`)
  }
}

async function prepareQuartzWorkspace() {
  if (!existsSync(quartzPackageDir)) {
    throw new Error(
      `Quartz package not found in node_modules: ${quartzPackageDir}. Run npm install first.`,
    )
  }

  await cp(path.join(wikiSiteDir, 'quartz.config.ts'), path.join(quartzPackageDir, 'quartz.config.ts'))
  await cp(path.join(wikiSiteDir, 'quartz.layout.ts'), path.join(quartzPackageDir, 'quartz.layout.ts'))
}

async function main() {
  if (!existsSync(wikiContentDir)) {
    throw new Error(
      `Missing wiki content directory: ${wikiContentDir}. Run npm run wiki:sync first.`,
    )
  }

  await prepareQuartzWorkspace()
  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })

  run('npx', ['quartz', 'build', '-d', '../../../wiki-content', '-o', '../../../wiki-site/public'], quartzPackageDir)
  console.log(`Built Quartz site into ${outputDir}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
