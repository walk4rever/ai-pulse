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

'use strict'

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')

// Load .env manually
try {
  const envPath = path.resolve(__dirname, '.env')
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (var i = 0; i < lines.length; i++) {
    var trimmed = lines[i].trim()
    if (!trimmed || trimmed.charAt(0) === '#') continue
    var idx = trimmed.indexOf('=')
    if (idx === -1) continue
    var key = trimmed.slice(0, idx).trim()
    var val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch (e) {
  // .env not found — rely on environment variables already set
}

var APP_ID = process.env.WECHAT_APP_ID
var APP_SECRET = process.env.WECHAT_APP_SECRET
var SUPABASE_URL = process.env.SUPABASE_URL
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!APP_ID || !APP_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[' + now() + '] ERROR: Missing required environment variables.')
  console.error('Required: WECHAT_APP_ID, WECHAT_APP_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

var supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function now() {
  return new Date().toISOString()
}

function httpGet(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(res) {
      var data = ''
      res.on('data', function(chunk) { data += chunk })
      res.on('end', function() {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error('Invalid JSON: ' + data)) }
      })
    }).on('error', reject)
  })
}

function fetchAccessToken() {
  var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APP_ID + '&secret=' + APP_SECRET
  return httpGet(url).then(function(data) {
    if (!data.access_token) throw new Error('Failed to get access_token: ' + JSON.stringify(data))
    return { token: data.access_token, expiresIn: data.expires_in }
  })
}

function fetchJsapiTicket(accessToken) {
  var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi'
  return httpGet(url).then(function(data) {
    if (!data.ticket) throw new Error('Failed to get jsapi_ticket: ' + JSON.stringify(data))
    return { ticket: data.ticket, expiresIn: data.expires_in }
  })
}

function saveToSupabase(key, value, expiresInSeconds) {
  var expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString()
  return supabase
    .from('ai_pulse_wechat_tokens')
    .upsert({ key: key, value: value, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .then(function(result) {
      if (result.error) throw new Error('Supabase upsert failed for key "' + key + '": ' + result.error.message)
    })
}

console.log('[' + now() + '] Starting WeChat token refresh...')

fetchAccessToken()
  .then(function(result) {
    console.log('[' + now() + '] access_token fetched (expires in ' + result.expiresIn + 's)')
    return fetchJsapiTicket(result.token).then(function(ticketResult) {
      console.log('[' + now() + '] jsapi_ticket fetched (expires in ' + ticketResult.expiresIn + 's)')
      return saveToSupabase('access_token', result.token, result.expiresIn)
        .then(function() { return saveToSupabase('jsapi_ticket', ticketResult.ticket, ticketResult.expiresIn) })
    })
  })
  .then(function() {
    console.log('[' + now() + '] Saved to Supabase. Done.')
  })
  .catch(function(err) {
    console.error('[' + now() + '] ERROR:', err.message)
    process.exit(1)
  })
