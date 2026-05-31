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

    // Campaign 2 angles
    const tiktokAngles    = [
      'Watch AI build my website in 60 seconds',
      'Before and after site reveal',
      'Live color switching demo',
      'Live template switching demo',
      'Your website approved before it goes live'
    ];
    const instagramAngles = [
      'Template showcase visual',
      'Color palette switching demo',
      'Client site spotlight reveal',
      'Before and after comparison'
    ];
    const facebookAngles  = [
      'Small business community tips',
      'Website checklist post',
      'Client success story format',
      'Question that drives engagement'
    ];

    const output = {
      timestamp: new Date().toISOString(),
      campaign1: {
        keywords,
        articleTopic
      },
      campaign2: {
        tiktokAngle:   this.selectAngle(tiktokAngles),
        igAngle:       this.selectAngle(instagramAngles),
        fbAngle:       this.selectAngle(facebookAngles)
      }
    };

    console.log('[Content Commander] Strategy complete:', JSON.stringify(output, null, 2));
    return output;
  }

  async generateKeywords() {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Generate 10 high-intent SEO keywords for:
AI business automation, AI contact center, CRM, small business efficiency.
Return as JSON array only. No preamble. No markdown.`
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
      'Why Small Businesses Using AI Automation See 40% Lower Operating Costs',
      'How AI Contact Centers Are Replacing Traditional Receptionists in 2026',
      'The ROI of Business Automation: What the Numbers Actually Show',
      'How to Launch a Business in 24 Hours Using AI Automation',
      'What Is a White Label AI System and How Can Agencies Profit From It'
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Given these keywords: ${keywords.join(', ')}

Select the best article topic from this list:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return only the topic text. No explanation. No numbering.`
      }]
    });

    return response.content[0].text.trim();
  }
}

module.exports = ContentCommanderAgent;
