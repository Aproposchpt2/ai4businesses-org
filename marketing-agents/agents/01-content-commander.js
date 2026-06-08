require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

class ContentCommanderAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  selectAngle(angles) {
    return angles[Math.floor(Math.random() * angles.length)];
  }

  async runMondayStrategy() {
    console.log('[Content Commander] Monday strategy starting...');

    const keywords     = await this.generateKeywords();
    const articleTopic = await this.selectArticleTopic(keywords);

    // Campaign 2 — Facebook personal page angles (website design / agency opportunity)
    const facebookAngles = [
      'Free website builder — see your site live before you approve it',
      'How to start a website side hustle using AI — no design skills needed',
      'I charged $1,500 for a website that took 20 minutes to build',
      'The free website offer local business owners are missing',
      'Before and after: what an AI-built website looks like',
      'How anyone can run a website agency in 2026 with one subscription',
      'Want to make extra income? Build websites for local businesses with AI'
    ];

    // Campaign 2 — TikTok angles (website design demos — for future use)
    const tiktokAngles = [
      'Watch AI build a complete website in 60 seconds',
      'See your site live before it goes live — no competitor offers this',
      'Live color switching demo — pick your brand palette in real time',
      'How I would charge $1,500 for a website that takes 20 minutes to build',
      'The side hustle most people are sleeping on in 2026'
    ];

    // Campaign 2 — Instagram angles (for future use)
    const instagramAngles = [
      'Template showcase — 12 design systems, zero templates',
      'Color palette switching live demo',
      'Before and after client site reveal',
      'The agency opportunity inside a free website builder',
      'Side-by-side: what a client pays vs what it costs you to deliver'
    ];

    const output = {
      timestamp: new Date().toISOString(),
      campaign1: {
        keywords,
        articleTopic
      },
      campaign2: {
        fbAngle:     this.selectAngle(facebookAngles),
        tiktokAngle: this.selectAngle(tiktokAngles),
        igAngle:     this.selectAngle(instagramAngles)
      }
    };

    console.log('[Content Commander] Strategy complete:', JSON.stringify(output, null, 2));
    return output;
  }

  async generateKeywords() {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Generate 12 high-intent SEO keywords across two angles:

Angle 1 — AI systems building + business automation (6 keywords):
Target: business owners and professionals searching for AI-powered business tools, contact centers, CRM, and automation. Also professionals who follow AI systems builders on LinkedIn.
Topics: AI business systems, AI contact center for small business, FlowDesk Pro CRM, business automation 2026, AI lead management, government contractor tools.

Angle 2 — CapGen + federal contracting (6 keywords):
Target: federal contractors, small businesses pursuing government contracts, and companies needing SAM.gov capability statements.
Topics: capability statement generator, federal contractor tools, SAM.gov automation, government contract bid preparation, CapGen, AI for federal contractors.

Return as a flat JSON array of 12 strings only. No preamble. No markdown.`
      }]
    });

    try {
      const clean = response.content[0].text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return response.content[0].text
        .replace(/```json|```/g, '')
        .split('\n')
        .map(k => k.replace(/^[\s",-]+|[\s",-]+$/g, ''))
        .filter(k => k.length > 3);
    }
  }

  async selectArticleTopic(keywords) {
    const topics = [
      // ── Personal story / builder authority ──────────────────
      'Why I Left Senior Network Engineering to Build AI Systems for Small Businesses',
      'What 20 Years of Network Engineering Taught Me About Building AI Business Systems',
      'I Built an AI Contact Center from Scratch — Here Is What I Learned',
      'How a Network Engineer Thinks About AI Automation Differently Than a Marketer',
      'The AI Stack I Built to Run Three Business Products Simultaneously',
      // ── Product authority — FlowDesk Pro ────────────────────
      'FlowDesk Pro: The Problem I Built It to Solve and Why It Works',
      'Why Small Businesses Lose Leads Before 9AM — and How FlowDesk Pro Fixes It',
      'How AI Lead Management Replaced Three Software Tools for Small Business Owners',
      // ── Product authority — CapGen ──────────────────────────
      'CapGen: Why I Built a Capability Statement Generator for Federal Contractors',
      'How CapGen Pulls SAM.gov Data and Turns It Into a Submission-Ready PDF in Minutes',
      'What Federal Contractors Get Wrong About Capability Statements — and How to Fix It',
      // ── Broader AI systems thought leadership ───────────────
      'Building AI Business Systems in 2026: What I Have Learned After 18 Months',
      'The Difference Between an AI Tool Built by a Developer and One Built by a Systems Engineer'
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Given these SEO keywords: ${keywords.join(', ')}

Select the single best article topic from this list that would rank well for those keywords, resonate with a professional LinkedIn audience, and reinforce the author's credibility as a Senior Network Engineer who builds AI business systems:

${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return only the topic text. No explanation. No numbering.`
      }]
    });

    return response.content[0].text.trim();
  }
}

module.exports = ContentCommanderAgent;
