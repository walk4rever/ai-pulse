#!/usr/bin/env python3
"""
WeChat jsapi_ticket refresh script

Runs on Alibaba Cloud server (fixed IP, whitelisted by WeChat).
Fetches access_token + jsapi_ticket and stores them in Supabase via REST API.

Setup:
  1. Create .env in same directory (see vars below)
  2. Run manually to test: python3 refresh-wechat-token.py
  3. Add to crontab:
     0 * * * * python3 /root/wechat-token/refresh-wechat-token.py >> /var/log/wechat-token.log 2>&1

Required .env:
  WECHAT_APP_ID=wx...
  WECHAT_APP_SECRET=...
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=...
"""

import json
import os
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path


def load_env():
    env_path = Path(__file__).parent / '.env'
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        key, _, val = line.partition('=')
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key not in os.environ:
            os.environ[key] = val


def now():
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


def http_get(url):
    with urllib.request.urlopen(url, timeout=10) as res:
        return json.loads(res.read().decode())


def http_post(url, data, headers):
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.status


def fetch_access_token(app_id, app_secret):
    url = f'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={app_id}&secret={app_secret}'
    data = http_get(url)
    if 'access_token' not in data:
        raise RuntimeError(f'Failed to get access_token: {data}')
    return data['access_token'], data['expires_in']


def fetch_jsapi_ticket(access_token):
    url = f'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={access_token}&type=jsapi'
    data = http_get(url)
    if 'ticket' not in data:
        raise RuntimeError(f'Failed to get jsapi_ticket: {data}')
    return data['ticket'], data['expires_in']


def save_to_supabase(supabase_url, service_role_key, key, value, expires_in_seconds):
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in_seconds)).strftime('%Y-%m-%dT%H:%M:%SZ')
    url = f'{supabase_url}/rest/v1/ai_pulse_wechat_tokens'
    headers = {
        'apikey': service_role_key,
        'Authorization': f'Bearer {service_role_key}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
    }
    payload = {
        'key': key,
        'value': value,
        'expires_at': expires_at,
        'updated_at': now(),
    }
    status = http_post(url, payload, headers)
    if status not in (200, 201):
        raise RuntimeError(f'Supabase upsert failed for key "{key}", status: {status}')


def main():
    load_env()

    app_id = os.environ.get('WECHAT_APP_ID')
    app_secret = os.environ.get('WECHAT_APP_SECRET')
    supabase_url = os.environ.get('SUPABASE_URL')
    service_role_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not all([app_id, app_secret, supabase_url, service_role_key]):
        raise RuntimeError('Missing required environment variables: WECHAT_APP_ID, WECHAT_APP_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')

    print(f'[{now()}] Starting WeChat token refresh...')

    access_token, token_expiry = fetch_access_token(app_id, app_secret)
    print(f'[{now()}] access_token fetched (expires in {token_expiry}s)')

    ticket, ticket_expiry = fetch_jsapi_ticket(access_token)
    print(f'[{now()}] jsapi_ticket fetched (expires in {ticket_expiry}s)')

    save_to_supabase(supabase_url, service_role_key, 'access_token', access_token, token_expiry)
    save_to_supabase(supabase_url, service_role_key, 'jsapi_ticket', ticket, ticket_expiry)
    print(f'[{now()}] Saved to Supabase. Done.')


if __name__ == '__main__':
    main()
