require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const AUTHOR_BIO = `
Author context (use this to write in first-person voice where appropriate):
Jeffrey Mitchell is a Senior Network Engineer with 20+ years of experience in enterprise network infrastructure and systems design. He is the founder of Apropos Group LLC and AI4 Businesses, where he builds AI-powered business systems. His products include FlowDesk Pro (an AI contact center and CRM for small businesses) and CapGen (an AI capability statement generator for federal contractors). He writes from direct hands-on experience building and deploying these systems — not from theory.
`.trim();

class SEOWriterAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  isPersonalStoryTopic(topic) {
    const personalMarkers = [
      'i built', 'i left', 'i learned', 'why i', 'how i',
      'my ', 'i have', "i've", 'network engineer', 'what i'
    ];
    return personalMarkers.some(m => topic.toLowerCase().includes(m));
  }

  async writeArticle(topic) {
    console.log(`[SEO Writer] Writing: ${topic}`);

    const isPersonal = this.isPersonalStoryTopic(topic);
    const voiceInstruction = isPersonal
      ? `Write in first-person voice as Jeffrey Mitchell. This is a personal authority piece — speak from direct experience. Use "I" naturally. The reader should feel they are hearing from the person who actually built these systems.`
      : `Write in a credible third-person expert voice. The article can reference "AI4 Businesses" and the products as examples.`;

    const ctaProduct = topic.toLowerCase().includes('capgen')
      ? `CTA at end drives to CapGen at https://capgen.aproposgroupllc.com\nTagline: "Generate your capability statement in minutes — SAM.gov verified."`
      : `CTA at end drives to FlowDesk Pro Fast Track Bundle ($349/month) at https://aiflowdeskpro.com\nTagline: "Never miss a lead from day one."\nMention CapGen (https://capgen.aproposgroupllc.com) as a second product where relevant.`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Write a 1200-word SEO-optimized blog article for ai4businesses.org.

Topic: ${topic}

${AUTHOR_BIO}

Voice: ${voiceInstruction}

Requirements:
- Target audience: small business owners, entrepreneurs, and LinkedIn professionals who value technical credibility
- Include H1, H2, H3 headings in markdown
- Natural keyword integration throughout
- ${ctaProduct}
- DO NOT mention AI Contact-Center as a standalone product
- First two lines: meta title (60 chars max) and meta description (155 chars max)
- Format: markdown
- The article should read as expert insight from someone who has actually built and deployed these systems — not generic marketing copy

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
