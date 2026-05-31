require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

class SEOWriterAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async writeArticle(topic) {
    console.log(`[SEO Writer] Writing: ${topic}`);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Write a 1200-word SEO-optimized blog article for ai4businesses.org.

Topic: ${topic}

Requirements:
- Target small business owners
- Include H1, H2, H3 headings in markdown
- Natural keyword integration throughout
- CTA at end driving to Fast Track Bundle ($349/month)
- CTA links to: https://aiflowdeskpro.com
- Tagline in CTA: "Never miss a lead from day one"
- DO NOT mention AI Contact-Center as a standalone product
- First two lines: meta title (60 chars max) and meta description (155 chars max)
- Format: markdown

Return article only. No preamble.`
      }]
    });

    const article = response.content[0].text;
    console.log('[SEO Writer] Article complete. Length:', article.length);
    return article;
  }

  async publishToGitHub(article, topic) {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);

    const date = new Date().toISOString().split('T')[0];
    const path = `blog/${date}-${slug}.md`;

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER || 'Aproposchpt2',
        repo:  'ai4businesses-org',
        path,
        message: `[SEO Writer] Publish: ${topic}`,
        content: Buffer.from(article).toString('base64'),
        branch: 'main'
      });

      const url = `https://ai4businesses.org/blog/${date}-${slug}`;
      console.log(`[SEO Writer] Published: ${url}`);
      return url;

    } catch (err) {
      console.error('[SEO Writer] GitHub publish error:', err.message);
      throw err;
    }
  }
}

module.exports = SEOWriterAgent;
