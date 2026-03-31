#!/usr/bin/env node
/**
 * Clears all posts and prints the DDL migration to run in Supabase Studio.
 * Run: node scripts/migrate-schema.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

async function loadEnv() {
  const merged = { ...process.env }
  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), fileName)
    try {
      const content = await fs.readFile(filePath, 'utf8')
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const sep = trimmed.indexOf('=')
        if (sep === -1) continue
        const key = trimmed.slice(0, sep).trim()
        let value = trimmed.slice(sep + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        merged[key] = value
      }
    } catch (e) {
      if (e?.code !== 'ENOENT') throw e
    }
  }
  return merged
}

async function main() {
  const env = await loadEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(url, serviceRoleKey)

  console.log('Deleting all rows from ai_pulse_posts...')
  const { error, count } = await supabase
    .from('ai_pulse_posts')
    .delete()
    .not('id', 'is', null)

  if (error) throw new Error(`Delete failed: ${error.message}`)
  console.log(`Deleted ${count ?? 'all'} rows.\n`)

  console.log('='.repeat(60))
  console.log('Now run this SQL in Supabase Studio (SQL Editor):')
  console.log('='.repeat(60))
  console.log(`
ALTER TABLE ai_pulse_posts
  DROP CONSTRAINT IF EXISTS ai_pulse_posts_content_type_check;

ALTER TABLE ai_pulse_posts
  ADD CONSTRAINT ai_pulse_posts_content_type_check
  CHECK (content_type IN ('daily', 'weekly', 'series', 'interview'));

ALTER TABLE ai_pulse_posts
  ALTER COLUMN content_type SET DEFAULT 'daily';

ALTER TABLE ai_pulse_posts
  DROP COLUMN IF EXISTS source_type;
`.trim())
  console.log('='.repeat(60))
  console.log('\nAfter running the SQL, re-import all articles:')
  console.log('  npm run import:batch')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
