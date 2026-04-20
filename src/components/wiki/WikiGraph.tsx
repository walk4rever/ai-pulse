'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import type { GraphData, GraphNode } from '@/lib/wiki'

const ForceGraph = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-sm text-[var(--subtle)]">
      加载图谱…
    </div>
  ),
})

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
  const router = useRouter()

  const handleNodeClick = useCallback(
    (node: object) => {
      const n = node as GraphNode
      router.push(`/wiki/${n.category}/${n.slug}`)
    },
    [router],
  )

  const paintNodeLabel = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as GraphNode & { x?: number; y?: number }
      const fontSize = Math.max(10, 12 / globalScale)
      ctx.font = `${fontSize}px "Noto Sans SC", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = 'rgba(64,60,56,0.85)'
      const radius = Math.sqrt(n.val) * 5
      ctx.fillText(n.title, n.x ?? 0, (n.y ?? 0) + radius + 3)
    },
    [],
  )

  return (
    <ForceGraph
      graphData={data}
      backgroundColor="transparent"
      nodeLabel={(node) => (node as GraphNode).title}
      nodeVal={(node) => (node as GraphNode).val}
      nodeColor={(node) => CATEGORY_COLORS[(node as GraphNode).category] ?? '#888'}
      nodeRelSize={5}
      linkColor={() => 'rgba(140,125,115,0.3)'}
      linkWidth={1}
      onNodeClick={handleNodeClick}
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={paintNodeLabel}
      cooldownTicks={120}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
    />
  )
}
