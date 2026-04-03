#!/usr/bin/env node
/**
 * WeChat jsapi_ticket refresh script
 *
 * Runs on Alibaba Cloud server (fixed IP, whitelisted by WeChat).
 * Fetches access_token + jsapi_ticket and stores them in Supabase.
 *
 * Setup:
 *   1. npm install @supabase/supabase-js   (run once)
 *   2. Create .env in same directory with the vars below
 *   3. Add to crontab: 0 * * * * node /path/to/refresh-wechat-token.js >> /var/log/wechat-token.log 2>&1
 *
 * Required .env:
 *   WECHAT_APP_ID=wx...
 *   WECHAT_APP_SECRET=...
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually (no dotenv dependency needed)
try {
  const envPath = resolve(__dirname, '.env')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    process.env[key] = process.env[key] ?? val
  }
} catch {
  // .env not found — rely on environment variables already set
}

const APP_ID = process.env.WECHAT_APP_ID
const APP_SECRET = process.env.WECHAT_APP_SECRET
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!APP_ID || !APP_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error(`[${now()}] ERROR: Missing required environment variables.`)
  console.error('Required: WECHAT_APP_ID, WECHAT_APP_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function now() {
  return new Date().toISOString()
}

async function fetchAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`Failed to get access_token: ${JSON.stringify(data)}`)
  }
  return { token: data.access_token, expiresIn: data.expires_in }
}

async function fetchJsapiTicket(accessToken) {
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.ticket) {
    throw new Error(`Failed to get jsapi_ticket: ${JSON.stringify(data)}`)
  }
  return { ticket: data.ticket, expiresIn: data.expires_in }
}

async function saveToSupabase(key, value, expiresInSeconds) {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString()
  const { error } = await supabase
    .from('ai_pulse_wechat_tokens')
    .upsert({ key, value, expires_at: expiresAt, updated_at: new Date().toISOString() })
  if (error) throw new Error(`Supabase upsert failed for key "${key}": ${error.message}`)
}

async function main() {
  console.log(`[${now()}] Starting WeChat token refresh...`)

  const { token, expiresIn: tokenExpiry } = await fetchAccessToken()
  console.log(`[${now()}] access_token fetched (expires in ${tokenExpiry}s)`)

  const { ticket, expiresIn: ticketExpiry } = await fetchJsapiTicket(token)
  console.log(`[${now()}] jsapi_ticket fetched (expires in ${ticketExpiry}s)`)

  await saveToSupabase('access_token', token, tokenExpiry)
  await saveToSupabase('jsapi_ticket', ticket, ticketExpiry)
  console.log(`[${now()}] Saved to Supabase. Done.`)
}

main().catch((err) => {
  console.error(`[${now()}] ERROR:`, err.message)
  process.exit(1)
})
