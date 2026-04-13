import { QuartzConfig } from './quartz/cfg'
import * as Plugin from './quartz/plugins'

const config: QuartzConfig = {
  configuration: {
    pageTitle: 'AI早知道 Wiki',
    pageTitleSuffix: '',
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: 'vercel',
    },
    locale: 'zh-CN',
    baseUrl: 'ai.air7.fun/wiki',
    ignorePatterns: ['private', 'templates', '.obsidian', '.git', 'node_modules'],
    defaultDateType: 'modified',
    theme: {
      fontOrigin: 'googleFonts',
      cdnCaching: true,
      typography: {
        header: 'Noto Serif SC',
        body: 'Noto Sans SC',
        code: 'IBM Plex Mono',
      },
      colors: {
        lightMode: {
          light: '#faf9f5',
          lightgray: '#f0eee6',
          gray: '#b8b6ac',
          darkgray: '#4d4c48',
          dark: '#141413',
          secondary: '#c96442',
          tertiary: '#8c7d73',
          highlight: 'rgba(201, 100, 66, 0.12)',
          textHighlight: '#f4d3c588',
        },
        darkMode: {
          light: '#1f1f1e',
          lightgray: '#373633',
          gray: '#5a5853',
          darkgray: '#d7d4cb',
          dark: '#f3f0e8',
          secondary: '#d97757',
          tertiary: '#a29589',
          highlight: 'rgba(217, 119, 87, 0.16)',
          textHighlight: '#d8aa8c88',
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ['frontmatter', 'git', 'filesystem'],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: 'github-light',
          dark: 'github-dark',
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: 'shortest' }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: 'katex' }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
