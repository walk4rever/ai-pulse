const WIKI_THEME_STYLE = `
<style id="ai-pulse-wiki-theme">
  :root {
    --light: #faf9f5;
    --lightgray: #f0eee6;
    --gray: #87867f;
    --darkgray: #5e5d59;
    --dark: #141413;
    --secondary: #c96442;
    --tertiary: #3d3d3a;
    --highlight: rgba(201, 100, 66, 0.12);
  }

  html, body {
    background: #f5f4ed !important;
    color: #141413 !important;
  }

  .page {
    max-width: 1200px !important;
    padding: 0 16px 56px !important;
  }

  .page > #quartz-body {
    grid-template:
      "grid-sidebar-left grid-header"
      "grid-sidebar-left grid-center"
      "grid-sidebar-left grid-footer" / minmax(220px, 260px) minmax(0, 1fr) !important;
    gap: 20px !important;
  }

  .page > #quartz-body .sidebar.right {
    display: none !important;
  }

  .page > #quartz-body .sidebar.left {
    padding: 2.2rem 1rem 1rem !important;
  }

  .page-title a {
    color: #141413 !important;
    font-size: 1.9rem !important;
    letter-spacing: -0.01em;
  }

  .search > .search-button {
    border: 1px solid #e8e6dc !important;
    border-radius: 12px !important;
    height: 2.25rem !important;
    background: #faf9f5 !important;
  }

  .explorer-content ul li > a.active {
    color: #141413 !important;
  }

  .explorer-content ul li > a {
    color: #3d3d3a !important;
  }

  .page > #quartz-body .page-header {
    margin-top: 2.4rem !important;
  }

  .page > #quartz-body .center,
  .page > #quartz-body footer {
    max-width: 860px !important;
    margin-left: 0 !important;
  }

  .page > #quartz-body .center > article {
    background: #faf9f5;
    border: 1px solid #f0eee6;
    border-radius: 24px;
    padding: 28px 34px;
    box-shadow: 0 0 0 1px rgba(232, 230, 220, 0.65), 0 10px 28px rgba(20, 20, 19, 0.06);
  }

  .article-title {
    font-size: clamp(2rem, 3vw, 2.7rem) !important;
    line-height: 1.18 !important;
    margin-top: 0.4rem !important;
    color: #141413 !important;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #141413 !important;
  }

  p, li, td {
    color: #5e5d59 !important;
    line-height: 1.75 !important;
  }

  a {
    color: #c96442 !important;
  }

  a:hover {
    color: #d97757 !important;
  }

  a.internal {
    border-radius: 8px !important;
    background: rgba(201, 100, 66, 0.12) !important;
    color: #3d3d3a !important;
    font-weight: 500 !important;
    padding: 0 0.28rem !important;
  }

  blockquote {
    border-left: 2px solid #e8e6dc !important;
    margin: 1.5rem 0 !important;
  }

  code {
    background: #f0eee6 !important;
    color: #4d4c48 !important;
    border-radius: 6px !important;
  }

  pre {
    border: 1px solid #f0eee6 !important;
    border-radius: 12px !important;
    background: #faf9f5 !important;
  }

  hr, tr {
    border-color: #f0eee6 !important;
  }

  footer {
    margin-top: 18px !important;
    color: #87867f !important;
  }

  @media (max-width: 900px) {
    .page {
      padding: 0 10px 36px !important;
    }

    .page > #quartz-body {
      grid-template:
        "grid-sidebar-left"
        "grid-header"
        "grid-center"
        "grid-footer" / minmax(0, 1fr) !important;
      gap: 12px !important;
    }

    .page > #quartz-body .sidebar.left {
      padding: 1rem 0 0 !important;
    }

    .page > #quartz-body .center > article {
      border-radius: 16px;
      padding: 18px 16px;
    }
  }
</style>
<script id="ai-pulse-wiki-link-fix">
  (function () {
    var WIKI_BASE = "/wiki";
    var SKIP_PREFIXES = ["/wiki", "/_next", "/_vercel", "/api"];

    function shouldRewrite(href) {
      if (!href || href[0] !== "/" || href.startsWith("//")) return false;
      for (var i = 0; i < SKIP_PREFIXES.length; i++) {
        if (href.startsWith(SKIP_PREFIXES[i])) return false;
      }
      return true;
    }

    function normalizeLinks(root) {
      var scope = root || document;
      var anchors = scope.querySelectorAll(
        ".explorer-content a[href], .search-layout a[href], .popover-inner a[href], .page-header a[href]"
      );
      for (var i = 0; i < anchors.length; i++) {
        var href = anchors[i].getAttribute("href");
        if (shouldRewrite(href)) {
          anchors[i].setAttribute("href", WIKI_BASE + href);
        }
      }
    }

    function startObserver() {
      var target = document.getElementById("quartz-body") || document.body;
      if (!target) return;
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          for (var j = 0; j < mutation.addedNodes.length; j++) {
            var node = mutation.addedNodes[j];
            if (node && node.nodeType === 1) {
              normalizeLinks(node);
            }
          }
        }
      });
      observer.observe(target, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        normalizeLinks(document);
        startObserver();
      });
    } else {
      normalizeLinks(document);
      startObserver();
    }

    document.addEventListener("nav", function () {
      normalizeLinks(document);
    });
  })();
</script>
`

function normalizeRootHtml(html: string) {
  return html
    .replaceAll('href="./', 'href="/wiki/')
    .replaceAll('src="./', 'src="/wiki/')
    .replaceAll('fetch("./', 'fetch("/wiki/')
    .replaceAll("fetch('./", "fetch('/wiki/")
    .replaceAll('href="."', 'href="/wiki"')
}

function injectTheme(html: string) {
  if (html.includes('id="ai-pulse-wiki-theme"')) return html
  return html.includes('</head>')
    ? html.replace('</head>', `${WIKI_THEME_STYLE}</head>`)
    : `${WIKI_THEME_STYLE}${html}`
}

export function transformWikiHtml(html: string, options?: { root?: boolean }) {
  const normalized = options?.root ? normalizeRootHtml(html) : html
  return injectTheme(normalized)
}
