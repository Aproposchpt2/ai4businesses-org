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

    const keywords = await this.generateKeywords();
    const articleTopic = await this.selectArticleTopic(keywords);

    const facebookAngles = [
      'Free website builder — see your site live before you approve it',
      'How to start a website side hustle using AI — no design skills needed',
      'The free website offer local business owners are missing',
      'Before and after: what an AI-built website looks like',
      'How anyone can run a website agency in 2026 with one subscription',
      'Want to make extra income? Build websites for local businesses with AI'
    ];

    const tiktokAngles = [
      'Watch AI build a complete website in 60 seconds',
      'See your site live before it goes live — no competitor offers this',
      'Live color switching demo — pick your brand palette in real time',
      'The side hustle most people are sleeping on in 2026'
    ];

    const instagramAngles = [
      'Template showcase — 12 design systems, zero cookie-cutter templates',
      'Live color palette switching demo',
      'Before and after client site reveal',
      'The agency opportunity inside a free website builder'
    ];

    const output = {
      timestamp: new Date().toISOString(),
      campaign1: { keywords, articleTopic },
      campaign2: {
        fbAngle: this.selectAngle(facebookAngles),
        tiktokAngle: this.selectAngle(tiktokAngles),
        igAngle: this.selectAngle(instagramAngles)
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
        content: 'Generate 12 high-intent SEO keywords across two angles:\n\n'
          + 'Angle 1 — Affordable enterprise communication systems for SMBs (6 keywords):\n'
          + 'Target: business owners overpaying for phone systems or missing calls with no automated routing.\n'
          + 'Topics: AI contact center for small business, affordable IVR system, Microsoft Teams Direct Routing, '
          + 'business auto-attendant, replace Cisco phone system, FlowDesk Pro CRM.\n\n'
          + 'Angle 2 — CapGen and federal contractor tools (6 keywords):\n'
          + 'Target: federal contractors and small businesses needing SAM.gov capability statements.\n'
          + 'Topics: capability statement generator, SAM.gov automation, federal contractor tools, '
          + 'government contract capability statement, AI for federal contractors, CapGen.\n\n'
          + 'Return as a flat JSON array of 12 strings only. No preamble. No markdown.'
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
      'The Operator Who Was Drowning in Calls — And the IVR System That Changed Everything',
      'How I Saved the College of Southern Nevada Thousands Per Month by Refusing a $20 Per Seat Proposal',
      'I Vetted the Vendors. Then I Engineered the Whole Thing In-House. Here Is What I Learned.',
      'The Microsoft Teams Migration Nobody Told You About — Existing Licenses Your Own SBC No Porting Fees',
      'Why Your Teams Migration Might Be Stalled at E911 — Karis Law Ray Baums Act and How to Get Through It',
      'Three Cost Decisions That Saved a College a Fortune on a Phone System Migration',
      'What Enterprise IVR Architecture Actually Looks Like and Why Small Businesses Never Get Access to It',
      'I Migrated 2000 Users Off Legacy Cisco Systems. Here Is What I Built Instead for Small Businesses.',
      'FlowDesk Pro: The Problem I Watched Repeat Itself in Every Organization I Worked In',
      'Why Small Businesses Lose Leads Before 9AM and the AI System I Built to Stop It',
      'CapGen: Why I Built a Capability Statement Generator for Federal Contractors',
      'What Federal Contractors Get Wrong About Capability Statements and How to Fix It in Minutes',
      'The Enterprise Communication Stack That Small Businesses Deserve But Cannot Afford Until Now',
      'What 20 Years of Building Enterprise Systems Taught Me About What Small Businesses Actually Need',
      'How AI Lead Management Replaces Three Software Tools Small Businesses Are Overpaying For'
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: 'Given these SEO keywords: ' + keywords.join(', ') + '\n\n'
          + 'Select the single best article topic from this list. '
          + 'Choose the topic that would rank well for those keywords AND resonate most with a LinkedIn audience '
          + 'of professionals, engineers, and business owners who respect real-world technical experience:\n\n'
          + topics.map(function(t, i) { return (i + 1) + '. ' + t; }).join('\n') + '\n\n'
          + 'Return only the topic text. No explanation. No numbering.'
      }]
    });

    return response.content[0].text.trim();
  }
}

module.exports = ContentCommanderAgent;
