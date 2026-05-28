// ═══════════════════════════════════════════════════════════════
// AGENT 3 — SOCIAL AGENT
// Role: Repurpose article into platform-specific social posts
// Runs: Every Wednesday at 7:00 AM PST
// Platforms: LinkedIn, Facebook, Instagram, TikTok
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const { logAgentActivity } = require('../utils/logger');

class SocialAgent {
  constructor() {
    this.name = 'Social Agent';
    this.role = 'social_content_creation';
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async run() {
    console.log(`[${this.name}] Starting Wednesday social content creation...`);
    await logAgentActivity(this.name, 'started', 'Social content creation initiated');

    try {
      // 1. Load published article data
      const { article, assignment, publishResult } = await this.loadPublishedArticle();

      // 2. Generate all platform posts via Claude
      const socialPosts = await this.generateAllPosts(article, assignment, publishResult);

      // 3. Save posts for Design Agent and Scheduler
      await this.saveSocialPosts(socialPosts);

      await logAgentActivity(this.name, 'completed', `Generated ${Object.keys(socialPosts).length} platform posts`);
      console.log(`[${this.name}] Social posts ready for all platforms`);

      return socialPosts;
    } catch (error) {
      await logAgentActivity(this.name, 'error', error.message);
      throw error;
    }
  }

  // ── LOAD PUBLISHED ARTICLE ────────────────────────────────────
  async loadPublishedArticle() {
    const fs = require('fs').promises;
    const data = await fs.readFile('/tmp/published-article.json', 'utf8');
    return JSON.parse(data);
  }

  // ── GENERATE ALL PLATFORM POSTS ───────────────────────────────
  async generateAllPosts(article, assignment, publishResult) {
    const prompt = `You are the Social Media Agent for AI4 Businesses.

PUBLISHED ARTICLE:
Title: "${article.title}"
URL: "${publishResult.url}"
Tags: ${article.tags.join(', ')}
Social Hook: "${assignment.socialHook}"
Target Product: "${assignment.targetProduct}"

Create platform-specific social media posts for this article.
Each post must feel native to its platform. Include the article URL.

Rules:
- LinkedIn: Professional, insight-driven, 150-200 words, 3-5 hashtags
- Facebook: Conversational, story-driven, 100-150 words, 2-3 hashtags  
- Instagram: Visual-focused, punchy, 80-100 words, 10-15 hashtags
- TikTok: Script for video caption, energetic, 50-80 words, 5-8 hashtags

Respond ONLY with JSON:
{
  "linkedin": {
    "text": "full post text",
    "hashtags": ["#hashtag1"],
    "imagePrompt": "description for Canva design agent",
    "postType": "article_share"
  },
  "facebook": {
    "text": "full post text",
    "hashtags": ["#hashtag1"],
    "imagePrompt": "description for Canva design agent",
    "postType": "engagement"
  },
  "instagram": {
    "text": "full post text",
    "hashtags": ["#hashtag1"],
    "imagePrompt": "description for Canva design agent",
    "postType": "carousel_teaser"
  },
  "tiktok": {
    "text": "full caption",
    "hashtags": ["#hashtag1"],
    "imagePrompt": "description for Canva design agent",
    "postType": "video_hook"
  }
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.anthropic.model,
        max_tokens: config.anthropic.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const posts = JSON.parse(clean);

    // Add metadata to each post
    const articleUrl = publishResult.url;
    for (const platform of Object.keys(posts)) {
      posts[platform].articleUrl = articleUrl;
      posts[platform].platform = platform;
      posts[platform].createdAt = new Date().toISOString();
      posts[platform].status = 'ready';
      // Combine text and hashtags
      posts[platform].fullText = `${posts[platform].text}\n\n${posts[platform].hashtags.join(' ')}\n\n${articleUrl}`;
    }

    return posts;
  }

  // ── SAVE POSTS FOR DESIGN + SCHEDULER ────────────────────────
  async saveSocialPosts(socialPosts) {
    const fs = require('fs').promises;
    await fs.writeFile('/tmp/social-posts.json', JSON.stringify({
      posts: socialPosts,
      createdAt: new Date().toISOString(),
      status: 'ready_for_design'
    }, null, 2));
  }
}

module.exports = SocialAgent;
