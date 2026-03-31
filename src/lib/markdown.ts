import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'

interface MarkdownNode {
  type?: string
  tagName?: string
  value?: string
  properties?: {
    className?: string[]
  }
  children?: MarkdownNode[]
}

function extractText(node: MarkdownNode | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return typeof node.value === 'string' ? node.value : ''
  if (!Array.isArray(node.children)) return ''
  return node.children.map(extractText).join('')
}

function rehypeMermaidBlocks() {
  return (tree: MarkdownNode) => {
    const visit = (node: MarkdownNode) => {
      if (!node || !Array.isArray(node.children)) return

      node.children = node.children.map((child) => {
        if (child?.type !== 'element' || child.tagName !== 'pre') {
          visit(child)
          return child
        }

        const code = child.children?.[0]
        const classNames = Array.isArray(code?.properties?.className)
          ? code.properties.className
          : []

        if (code?.type !== 'element' || code.tagName !== 'code' || !classNames.includes('language-mermaid')) {
          visit(child)
          return child
        }

        return {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['mermaid'],
            'data-mermaid': 'true',
          },
          children: [
            {
              type: 'text',
              value: extractText(code).trim(),
            },
          ],
        }
      })
    }

    visit(tree)
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeMermaidBlocks)
    .use(rehypePrettyCode, {
      theme: 'github-light',
      keepBackground: false,
    })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)

  return String(file)
}
