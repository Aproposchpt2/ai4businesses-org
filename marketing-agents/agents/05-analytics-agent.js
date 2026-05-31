require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

class AnalyticsAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async runWeeklyCampaign1Report() {
    console.log('[Analytics] Running Campaign 1 weekly report...');
    const report = await this.buildReport('Campaign 1 — FlowDesk Pro', {
      site:      'ai4businesses.org',
      platform:  'LinkedIn',
      products:  ['Fast Track Bundle $349/mo', 'Growth Engine Bundle $349/mo']
    });
    await this.sendReport(report, 'Campaign 1 — FlowDesk Pro Weekly Report');
    return report;
  }

  async runWeeklyCampaign2Report() {
    console.log('[Analytics] Running Campaign 2 weekly report...');
    const report = await this.buildReport('Campaign 2 — Website Design Studio', {
      site:        'ai4websitedesign.com',
      spanishSite: 'espanola.ai4websitedesign.com',
      platforms:   ['TikTok', 'Instagram', 'Facebook'],
      products:    ['Studio Standard $149/mo', 'Studio Platinum $249/mo', 'Care-Plan Complete $249/mo']
    });
    await this.sendReport(report, 'Campaign 2 — Website Design Studio Weekly Report');
    return report;
  }

  async buildReport(campaign, context) {
    const response = await this.client.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{
        role:    'user',
        content: `Generate a weekly marketing performance summary.
Campaign: ${campaign}
Context: ${JSON.stringify(context)}

Include:
- Content performance summary
- Top performing topics or angles
- Recommended focus for next week
- Self-improving suggestions to optimize agent output

Format as executive summary. Plain text only.`
      }]
    });
    return response.content[0].text.trim();
  }

  async sendReport(report, subject) {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Analytics] No Resend key — logging report locally');
      console.log(report);
      return;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        from:    'marketing@ai4businesses.org',
        to:      process.env.OWNER_EMAIL,
        subject: `[Weekly Report] ${subject}`,
        text:    report
      })
    });

    if (res.ok) console.log('[Analytics] ✅ Report emailed successfully');
    else        console.error('[Analytics] Email error:', await res.text());
  }
}

module.exports = AnalyticsAgent;
