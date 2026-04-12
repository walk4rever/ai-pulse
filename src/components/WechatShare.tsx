'use client'

import { useEffect, useState } from 'react'

interface WechatShareProps {
  title: string
  description: string
  imageUrl?: string
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wx?: any
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export function WechatShare({ title, description, imageUrl }: WechatShareProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    if (!isWeChat) return

    const url = window.location.href

    loadScript('https://res.wx.qq.com/open/js/jweixin-1.6.0.js')
      .then(() => fetch(`/api/wechat/signature?url=${encodeURIComponent(url)}`))
      .then((r) => r.json())
      .then(({ appId, timestamp, nonceStr, signature }) => {
        if (!appId) return
        window.wx?.config({
          debug: false,
          appId,
          timestamp,
          nonceStr,
          signature,
          jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
        })
        window.wx?.ready(() => {
          const shareImg = imageUrl || `${window.location.origin}/og-default.png`
          window.wx?.updateAppMessageShareData({ title, desc: description, link: url, imgUrl: shareImg })
          window.wx?.updateTimelineShareData({ title, link: url, imgUrl: shareImg })
        })
      })
      .catch(() => {/* silent — sharing still works via native WeChat menu */})
  }, [title, description, imageUrl])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-14 pt-8 border-t border-[var(--border)] flex justify-end">
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 bg-[var(--surface-sand)] text-[var(--charcoal)] px-5 py-2.5 text-sm font-medium rounded-xl hover:bg-[var(--border)] transition-colors shadow-[0_0_0_1px_var(--ring)]"
      >
        {copied ? '已复制链接' : '分享链接'}
      </button>
    </div>
  )
}
