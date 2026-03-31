'use client'

import { useEffect, useRef } from 'react'

interface MermaidContentProps {
  className?: string
  html: string
}

export function MermaidContent({ className, html }: MermaidContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    const renderDiagrams = async () => {
      const container = containerRef.current
      if (!container) return

      const diagrams = Array.from(
        container.querySelectorAll<HTMLElement>('[data-mermaid="true"]:not([data-mermaid-processed="true"])')
      )

      if (diagrams.length === 0) return

      const mermaid = (await import('mermaid')).default
      if (cancelled) return

      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
      })

      for (const diagram of diagrams) {
        diagram.dataset.mermaidProcessed = 'true'
      }

      try {
        await mermaid.run({ nodes: diagrams })
      } catch (error) {
        console.error('[mermaid] failed to render diagram', error)
      }
    }

    void renderDiagrams()

    return () => {
      cancelled = true
    }
  }, [html])

  return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
