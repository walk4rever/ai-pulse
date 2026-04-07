import fs from 'fs'
import path from 'path'
import { markdownToHtml } from '@/lib/markdown'
import { MermaidContent } from '@/components/MermaidContent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent 发布指南 | AI早知道',
  description: 'Monica、Dwight、Ross 的内容发布操作手册',
}

export default async function AgentGuidePage() {
  const filePath = path.join(process.cwd(), 'docs', 'agent-publishing-guide.md')
  const markdown = fs.readFileSync(filePath, 'utf-8')
  const html = await markdownToHtml(markdown)

  return (
    <article className="max-w-2xl">
      <MermaidContent className="prose" html={html} />
    </article>
  )
}
