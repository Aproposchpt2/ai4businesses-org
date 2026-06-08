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

    // Campaign 2 angles — mix of product demos + agency/income hooks
    const tiktokAngles = [
      'Watch AI build my website in 60 seconds',
      'Before and after site reveal',
      'Live color switching demo',
      'Live template switching demo',
      'Your website approved before it goes live',
      'How I would charge $1,500 for a website that takes 20 minutes to build',
      'Want a side hustle in 2026? Build AI websites for local businesses',
      'This is how anyone can run a website agency with one subscription',
      'The business model most people are sleeping on right now'
    ];

    const instagramAngles = [
      'Template showcase visual',
      'Color palette switching demo',
      'Client site spotlight reveal',
      'Before and after comparison',
      'The agency opportunity hidden inside this AI tool',
      'From zero to website agency — what the subscription actually unlocks',
      'Side-by-side: what a client pays vs what it costs you to deliver'
    ];

    const facebookAngles = [
      'Small business community tips',
      'Website checklist post',
      'Client success story format',
      'Question that drives engagement',
      'How to start a website business with no design experience',
      'Real talk: what white label AI tools actually mean for freelancers'
    ];

    const output = {
      timestamp: new Date().toISOString(),
      campaign1: {
        keywords,
        articleTopic
      },
      campaign2: {
        tiktokAngle: this.selectAngle(tiktokAngles),
        igAngle:     this.selectAngle(instagramAngles),
        fbAngle:     this.selectAngle(facebookAngles)
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

Angle 1 — AI business automation (6 keywords):
Target: small business owners looking to automate operations, replace manual work, reduce costs.
Topics: AI contact center, CRM automation, small business efficiency, AI receptionist.

Angle 2 — Agency/income opportunity (6 keywords):
Target: entrepreneurs, freelancers, side-hustlers who want to build a website business or resell AI tools.
Topics: how to start a website business, white label website builder, AI website agency, make money building websites, website reseller.

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
      // ── Original C1 topics — FlowDesk Pro / AI automation ──
      'Why Small Businesses Using AI Automation See 40% Lower Operating Costs',
      'How AI Contact Centers Are Replacing Traditional Receptionists in 2026',
      'The ROI of Business Automation: What the Numbers Actually Show',
      'How to Launch a Business in 24 Hours Using AI Automation',
      'What Is a White Label AI System and How Can Agencies Profit From It',
      // ── Agency / income-opportunity topics ──────────────────
      'How to Start a Website Agency in 2026 Using AI — No Design Skills Required',
      'I Charged $1,500 for a Website That Took 20 Minutes to Build — Here Is How',
      'The White Label AI Tool That Lets Anyone Run a Website Design Business',
      'How to Turn a $149 Subscription Into a $5,000 Per Month Agency',
      'Why Entrepreneurs Are Using AI Website Builders to Launch Service Businesses'
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Given these SEO keywords: ${keywords.join(', ')}

Select the single best article topic from this list that would rank well for those keywords and deliver the most value to a reader who is either a small business owner OR an entrepreneur looking to start a website or automation business:

${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return only the topic text. No explanation. No numbering.`
      }]
    });

    return response.content[0].text.trim();
  }
}

module.exports = ContentCommanderAgent;
