'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { GraphData, GraphNode } from '@/lib/wiki'

const CATEGORY_COLORS: Record<string, string> = {
  entities: '#c96442',
  concepts: '#4a7c8e',
  comparisons: '#7a6e5f',
  queries: '#5a7a5a',
}

interface WikiGraphProps {
  data: GraphData
}

export function WikiGraph({ data }: WikiGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<unknown>(null)
  const router = useRouter()

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      router.push(`/wiki/${node.category}/${node.slug}`)
    },
    [router],
  )

  useEffect(() => {
    if (!containerRef.current) return
    let destroyed = false

    const init = async () => {
      const ForceGraph = (await import('react-force-graph-2d')).default
      const { createRoot } = await import('react-dom/client')

      if (destroyed || !containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      const root = createRoot(containerRef.current)
      graphRef.current = root

      root.render(
        <ForceGraph
          graphData={data}
          width={width}
          height={height}
          backgroundColor="transparent"
          nodeLabel={(node) => (node as GraphNode).title}
          nodeVal={(node) => (node as GraphNode).val}
          nodeColor={(node) => CATEGORY_COLORS[(node as GraphNode).category] ?? '#888'}
          nodeRelSize={5}
          linkColor={() => 'rgba(140,125,115,0.3)'}
          linkWidth={1}
          onNodeClick={(node) => handleNodeClick(node as GraphNode)}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n = node as GraphNode & { x?: number; y?: number }
            const label = n.title
            const fontSize = Math.max(10, 12 / globalScale)
            ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = 'rgba(64,60,56,0.85)'
            const x = n.x ?? 0
            const y = n.y ?? 0
            const radius = Math.sqrt(n.val) * 5
            ctx.fillText(label, x, y + radius + 3)
          }}
          cooldownTicks={120}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />,
      )
    }

    void init()

    return () => {
      destroyed = true
      if (graphRef.current) {
        ;(graphRef.current as { unmount?: () => void }).unmount?.()
      }
    }
  }, [data, handleNodeClick])

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-pointer"
    />
  )
}
