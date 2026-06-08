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

    // Campaign 2 — Facebook personal page angles
    const facebookAngles = [
      'Free website builder — see your site live before you approve it',
      'How to start a website side hustle using AI — no design skills needed',
      'I would charge $1,500 for a website that takes 20 minutes to build',
      'The free website offer local business owners are missing',
      'Before and after: what an AI-built website looks like',
      'How anyone can run a website agency in 2026 with one subscription',
      'Want to make extra income? Build websites for local businesses with AI'
    ];

    const tiktokAngles = [
      'Watch AI build a complete website in 60 seconds',
      'See your site live before it goes live — no competitor offers this',
      'Live color switching demo — pick your brand palette in real time',
      'How I would charge $1,500 for a website that takes 20 minutes to build',
      'The side hustle most people are sleeping on in 2026'
    ];

    const instagramAngles = [
      'Template showcase — 12 design systems, zero cookie-cutter templates',
      'Color palette switching live demo',
      'Before and after client site reveal',
      'The agency opportunity inside a free website builder',
      'Side-by-side: what a client pays vs what it costs you to deliver'
    ];

    const output = {
      timestamp: new Date().toISOString(),
      campaign1: { keywords, articleTopic },
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

Angle 1 — AI contact center and business automation for SMBs (6 keywords):
Target: small and mid-size business owners who are paying too much for phone systems, CRM, and contact center tools — or going without.
Topics: AI contact center for small business, affordable business phone system, replace Cisco CUCM, IVR for small business, AI lead management, FlowDesk Pro.

Angle 2 — CapGen and federal contracting tools (6 keywords):
Target: federal contractors, small businesses pursuing government contracts, SAM.gov registered entities needing capability statements.
Topics: capability statement generator, SAM.gov capability statement, federal contractor AI tools, government contract bid tools, CapGen, automated capability statement.

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
      // ── Founder story — portfolio-backed authority ───────────
      'I Managed a Contact Center for 2,100 Users at a College. Here Is What I Learned About Small Business Phone Systems.',
      'Why I Replaced Cisco CUCM Unity Connection and UCCX With an AI System That Costs a Fraction of the Price',
      'What Enterprise IVR Architecture Actually Looks Like — and Why Small Businesses Never Get Access to It',
      'I Migrated 2,000 Users Off Legacy Cisco Systems. Here Is What I Built Instead for Small Businesses.',
      'From the VA to Small Business: Why Every Organization Deserves the Same Communication Stack',
      'The Real Cost of Enterprise Phone Systems — And How AI Finally Changes the Math',
      'What a COVID Emergency Deployment for 1,800 People Taught Me About What Businesses Actually Need',
      // ── FlowDesk Pro product authority ──────────────────────
      'FlowDesk Pro: The Problem I Saw in Every Organization I Worked In and Why I Built the Fix',
      'Why Small Businesses Lose Leads Before 9AM — and the System I Built to Stop It',
      'How AI Lead Management Replaces Three Software Tools Small Businesses Are Overpaying For',
      // ── CapGen product authority ─────────────────────────────
      'CapGen: Why I Built a Capability Statement Generator for Federal Contractors',
      'What Federal Contractors Get Wrong About Capability Statements — and How to Fix It in Minutes',
      'How CapGen Pulls Verified SAM.gov Data and Builds a Submission-Ready PDF Automatically',
      // ── Broader systems thought leadership ──────────────────
      'Building AI Business Systems in 2026: What I Have Learned After 18 Months',
      'The Difference Between an AI Tool Built by a Developer and One Built by a Systems Engineer'
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Given these SEO keywords: ${keywords.join(', ')}

Select the single best article topic from this list. Choose the topic that would rank well for those keywords AND resonate most with a LinkedIn audience of professionals, business owners, and engineers who would recognize the credibility of someone who has managed large enterprise UC systems:

${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return only the topic text. No explanation. No numbering.`
      }]
    });

    return response.content[0].text.trim();
  }
}

module.exports = ContentCommanderAgent;
