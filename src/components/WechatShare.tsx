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
  const [inWeChat, setInWeChat] = useState(false)

  useEffect(() => {
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    setInWeChat(isWeChat)
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
    <div className="mt-12 pt-8 border-t border-[var(--subtle)] border-opacity-20">
      <p className="text-xs text-[var(--subtle)] mb-4 tracking-widest uppercase">分享这篇文章</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={copyLink}
          className="text-sm border border-[var(--foreground)] px-4 py-2 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
        >
          {copied ? '已复制' : '复制链接'}
        </button>
        {inWeChat && (
          <span className="text-sm text-[var(--muted)] flex items-center">
            点击右上角菜单即可分享到朋友圈或好友
          </span>
        )}
        {!inWeChat && (
          <span className="text-sm text-[var(--muted)] flex items-center">
            粘贴到微信发给朋友
          </span>
        )}
      </div>
    </div>
  )
}
