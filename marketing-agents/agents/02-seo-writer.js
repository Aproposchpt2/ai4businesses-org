// ═══════════════════════════════════════════════════════════════
// AGENT 2 — SEO WRITER
// Role: Write full SEO article, publish to GitHub → Netlify
// Runs: Every Tuesday at 7:00 AM PST
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const { logAgentActivity } = require('../utils/logger');

class SEOWriterAgent {
  constructor() {
    this.name = 'SEO Writer';
    this.role = 'article_generation_and_publishing';
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async run() {
    console.log(`[${this.name}] Starting Tuesday article generation...`);
    await logAgentActivity(this.name, 'started', 'Article generation initiated');

    try {
      // 1. Load this week's assignment from Commander
      const assignment = await this.loadWeeklyAssignment();

      // 2. Generate full article via Claude
      const article = await this.generateArticle(assignment);

      // 3. Generate article HTML
      const articleHtml = this.buildArticleHTML(article, assignment);

      // 4. Publish to GitHub → auto-deploys to Netlify
      const publishResult = await this.publishToGitHub(article, articleHtml);

      // 5. Save article data for Social Agent
      await this.saveArticleForSocialAgent(article, assignment, publishResult);

      await logAgentActivity(this.name, 'completed', `Published: ${publishResult.url}`);
      console.log(`[${this.name}] Article published: ${publishResult.url}`);

      return { article, publishResult };
    } catch (error) {
      await logAgentActivity(this.name, 'error', error.message);
      throw error;
    }
  }

  // ── LOAD WEEKLY ASSIGNMENT ────────────────────────────────────
  async loadWeeklyAssignment() {
    const fs = require('fs').promises;
    const data = await fs.readFile('C:/temp/weekly-assignment.json', 'utf8');
    return JSON.parse(data);
  }

  // ── GENERATE ARTICLE VIA CLAUDE ──────────────────────────────
  async generateArticle(assignment) {
    const prompt = `You are an expert SEO content writer for AI4 Businesses, a SaaS company.

PRODUCTS:
- Smart Auto-Attendant (AI phone system)
- Lead Manager (AI CRM)
- AI Voice Attendant (24/7 AI receptionist)
- Business Intake System (automated intake)

THIS WEEK'S ASSIGNMENT:
- Target Keyword: "${assignment.targetKeyword}"
- Article Title: "${assignment.articleTitle}"
- Angle: "${assignment.articleAngle}"
- Target Product: "${assignment.targetProduct}"
- Brief: "${assignment.contentBrief}"
- CTA: "${assignment.callToAction}"

Write a complete, high-quality SEO article. Requirements:
- 1,200-1,500 words
- Use the target keyword naturally 4-6 times
- Include H2 and H3 subheadings
- Write for small business owners (non-technical language)
- Include real statistics and data points where relevant
- End with a strong CTA linking to ai4businesses.org
- Include a meta description (155 characters max)
- Include 5 relevant tags

Respond ONLY with JSON:
{
  "title": "article title",
  "metaDescription": "155 char max meta description",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "body": "full article in markdown format",
  "wordCount": 1250,
  "readTime": "5 min read"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: config.anthropic.model,
        max_tokens: config.anthropic.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  // ── BUILD ARTICLE HTML ────────────────────────────────────────
  buildArticleHTML(article, assignment) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Convert markdown to basic HTML
    const bodyHtml = article.body
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|u|l])(.+)$/gm, '<p>$1</p>');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | AI4 Businesses</title>
  <meta name="description" content="${article.metaDescription}">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${article.metaDescription}">
  <meta property="og:url" content="${config.site.blogUrl}/${article.slug}">
  <meta property="og:type" content="article">
  <meta name="keywords" content="${article.tags.join(', ')}">
  <!-- GA4 Tag -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga4.measurementId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${config.ga4.measurementId}');
  </script>
  <link rel="stylesheet" href="/css/blog.css">
</head>
<body>
  <header class="site-header">
    <nav>
      <a href="/" class="logo">AI4 Businesses</a>
      <a href="/blog" class="nav-link">Blog</a>
      <a href="/#products" class="nav-link">Products</a>
      <a href="/#contact" class="btn-primary">Get Started</a>
    </nav>
  </header>

  <main class="article-container">
    <article>
      <header class="article-header">
        <div class="article-meta">
          <span class="date">${date}</span>
          <span class="read-time">${article.readTime}</span>
        </div>
        <h1>${article.title}</h1>
        <div class="article-tags">
          ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </header>

      <div class="article-body">
        ${bodyHtml}
      </div>

      <div class="article-cta">
        <h3>Ready to Automate Your Business?</h3>
        <p>Join hundreds of business owners using AI4 Businesses to save time and never miss a lead.</p>
        <a href="${config.site.baseUrl}/#products" class="btn-cta">
          Explore FlowDesk Pro Products →
        </a>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <p>&copy; ${new Date().getFullYear()} AI4 Businesses. All rights reserved.</p>
    <nav>
      <a href="/blog">Blog</a>
      <a href="/#products">Products</a>
      <a href="/#contact">Contact</a>
    </nav>
  </footer>
</body>
</html>`;
  }

  // ── PUBLISH TO GITHUB ─────────────────────────────────────────
  async publishToGitHub(article, htmlContent) {
    const fileName = `${article.slug}.html`;
    const filePath = `${config.github.blogPath}/${fileName}`;
    const contentBase64 = Buffer.from(htmlContent).toString('base64');

    // Check if file exists (for updates)
    let sha = null;
    try {
      const checkResponse = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${filePath}`,
        {
          headers: {
            'Authorization': `token ${config.github.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        sha = existingFile.sha;
      }
    } catch {}

    // Publish or update file
    const payload = {
      message: `📝 Auto-publish article: ${article.title}`,
      content: contentBase64,
      branch: config.github.branch,
      ...(sha && { sha })
    };

    const response = await fetch(
      `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub publish failed: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    const articleUrl = `${config.site.blogUrl}/${article.slug}`;

    // Also update blog index
    await this.updateBlogIndex(article);

    return {
      success: true,
      url: articleUrl,
      githubUrl: result.content?.html_url,
      slug: article.slug
    };
  }

  // ── UPDATE BLOG INDEX ─────────────────────────────────────────
  async updateBlogIndex(article) {
    // Fetch existing index
    let existingPosts = [];
    try {
      const response = await fetch(
        `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/blog/index.json`,
        {
          headers: {
            'Authorization': `token ${config.github.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (response.ok) {
        const file = await response.json();
        const decoded = Buffer.from(file.content, 'base64').toString('utf8');
        existingPosts = JSON.parse(decoded);
      }
    } catch {}

    // Add new post to index
    const newPost = {
      title: article.title,
      slug: article.slug,
      metaDescription: article.metaDescription,
      tags: article.tags,
      readTime: article.readTime,
      publishedAt: new Date().toISOString(),
      url: `${config.site.blogUrl}/${article.slug}`
    };

    existingPosts.unshift(newPost);

    // Save updated index
    const indexContent = Buffer.from(JSON.stringify(existingPosts, null, 2)).toString('base64');
    await fetch(
      `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/blog/index.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          message: `📚 Update blog index: ${article.title}`,
          content: indexContent,
          branch: config.github.branch
        })
      }
    );
  }

  // ── SAVE FOR SOCIAL AGENT ─────────────────────────────────────
  async saveArticleForSocialAgent(article, assignment, publishResult) {
    const fs = require('fs').promises;
    await fs.writeFile('C:/temp/published-article.json', JSON.stringify({
      article,
      assignment,
      publishResult,
      publishedAt: new Date().toISOString()
    }, null, 2));
  }
}

module.exports = SEOWriterAgent;
