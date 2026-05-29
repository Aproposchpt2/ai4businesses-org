// ═══════════════════════════════════════════════════════════════
// AGENT 6 — ANALYTICS AGENT
// Role: Track performance, compile weekly report, feed Commander
// Runs: Every Sunday at 6:00 PM PST
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const { getGoogleTokens } = require('../utils/auth');
const { logAgentActivity } = require('../utils/logger');

class AnalyticsAgent {
  constructor() {
    this.name = 'Analytics Agent';
    this.role = 'performance_tracking_and_reporting';
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async run() {
    console.log(`[${this.name}] Starting Sunday analytics compilation...`);
    await logAgentActivity(this.name, 'started', 'Weekly analytics compilation initiated');

    try {
      // 1. Pull Search Console performance
      const searchData = await this.fetchSearchConsoleWeekly();

      // 2. Pull GA4 traffic data
      const trafficData = await this.fetchGA4Weekly();

      // 3. Pull Buffer post performance
      const socialData = await this.fetchBufferAnalytics();

      // 4. Compile weekly report via Claude
      const weeklyReport = await this.compileWeeklyReport(
        searchData, trafficData, socialData
      );

      // 5. Save report for Commander (next Monday)
      await this.saveReportForCommander(weeklyReport);

      // 6. Send monthly summary if it's the last Sunday of the month
      if (this.isLastSundayOfMonth()) {
        await this.sendMonthlyOwnerEmail(weeklyReport);
      }

      await logAgentActivity(this.name, 'completed', 'Weekly analytics report compiled');
      console.log(`[${this.name}] Analytics report ready for Commander`);

      return weeklyReport;
    } catch (error) {
      await logAgentActivity(this.name, 'error', error.message);
      throw error;
    }
  }

  // ── FETCH SEARCH CONSOLE WEEKLY ───────────────────────────────
  async fetchSearchConsoleWeekly() {
    const tokens = await getGoogleTokens();
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const response = await fetch(
      `${config.searchConsole.apiEndpoint}/sites/${encodeURIComponent(config.searchConsole.siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          rowLimit: 25,
          orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }]
        })
      }
    );

    const data = await response.json();
    return {
      rows: data.rows || [],
      period: { startDate, endDate }
    };
  }

  // ── FETCH GA4 WEEKLY ──────────────────────────────────────────
  async fetchGA4Weekly() {
    const tokens = await getGoogleTokens();

    const response = await fetch(
      `${config.ga4.apiEndpoint}/properties/${config.ga4.propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          dateRanges: [
            { startDate: '7daysAgo', endDate: 'today', name: 'this_week' },
            { startDate: '14daysAgo', endDate: '8daysAgo', name: 'last_week' }
          ],
          dimensions: [
            { name: 'pagePath' },
            { name: 'sessionSource' }
          ],
          metrics: [
            { name: 'sessions' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'conversions' }
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 20
        })
      }
    );

    const data = await response.json();
    return (data && data.rows) ? data.rows : [];
  }

  // ── FETCH BUFFER ANALYTICS ────────────────────────────────────
  async fetchBufferAnalytics() {
    // Buffer analytics per profile
    const platforms = ['linkedin', 'facebook', 'instagram', 'tiktok'];
    const analytics = {};

    for (const platform of platforms) {
      const profileId = config.buffer.profiles[platform];
      if (!profileId) continue;

      try {
        const response = await fetch(
          `${config.buffer.apiEndpoint}/profiles/${profileId}/analytics/posts.json?period=week`,
          {
            headers: {
              'Authorization': `Bearer ${config.buffer.accessToken}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          analytics[platform] = {
            posts: data.updates || [],
            totalReach: data.updates?.reduce((sum, p) => sum + (p.statistics?.reach || 0), 0) || 0,
            totalEngagement: data.updates?.reduce((sum, p) => sum + (p.statistics?.clicks || 0) + (p.statistics?.likes || 0), 0) || 0
          };
        }
      } catch {
        analytics[platform] = { posts: [], totalReach: 0, totalEngagement: 0 };
      }
    }

    return analytics;
  }

  // ── COMPILE WEEKLY REPORT VIA CLAUDE ─────────────────────────
  async compileWeeklyReport(searchData, trafficData, socialData) {
    const prompt = `You are the Analytics Agent for AI4 Businesses.

SEARCH CONSOLE DATA (this week):
${JSON.stringify(searchData, null, 2)}

GA4 TRAFFIC DATA:
${JSON.stringify(trafficData.slice(0, 10), null, 2)}

BUFFER SOCIAL ANALYTICS:
${JSON.stringify(socialData, null, 2)}

Analyze this week's marketing performance and compile a strategic report.
Identify what worked, what didn't, and what to prioritize next week.

Respond ONLY with JSON:
{
  "weekSummary": "2-3 sentence summary of the week",
  "topKeywords": ["keyword1", "keyword2", "keyword3"],
  "topPlatform": "linkedin|facebook|instagram|tiktok",
  "bestContentAngle": "description of what content angle performed best",
  "lowPerformers": ["topic or approach to avoid next week"],
  "totalOrganicSessions": 0,
  "totalSocialReach": 0,
  "totalSocialEngagement": 0,
  "weekOverWeekGrowth": "percentage or description",
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ],
  "nextWeekPriority": "what to focus on next week",
  "ownerAlert": "anything the owner should know (or null if nothing urgent)"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: config.anthropic.model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return {
      ...JSON.parse(clean),
      compiledAt: new Date().toISOString(),
      weekOf: new Date().toISOString().split('T')[0]
    };
  }

  // ── SAVE FOR COMMANDER ────────────────────────────────────────
  async saveReportForCommander(report) {
    const fs = require('fs').promises;
    await fs.writeFile('C:/temp/analytics-report.json',
      JSON.stringify(report, null, 2)
    );
  }

  // ── CHECK IF LAST SUNDAY OF MONTH ─────────────────────────────
  isLastSundayOfMonth() {
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + 7);
    return nextSunday.getMonth() !== now.getMonth();
  }

  // ── SEND MONTHLY OWNER EMAIL ──────────────────────────────────
  async sendMonthlyOwnerEmail(report) {
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
    .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
    .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .metric h3 { margin: 0 0 5px 0; color: #1a1a2e; }
    .metric p { margin: 0; font-size: 24px; font-weight: bold; color: #0066cc; }
    .section { padding: 15px 0; border-bottom: 1px solid #eee; }
    .btn { background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI4 Businesses</h1>
    <p>Monthly Marketing Report — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
  </div>

  <div style="padding: 20px;">
    <div class="section">
      <h2>Monthly Summary</h2>
      <p>${report.weekSummary}</p>
    </div>

    <div class="section">
      <h2>Key Metrics</h2>
      <div class="metric">
        <h3>Organic Sessions</h3>
        <p>${report.totalOrganicSessions}</p>
      </div>
      <div class="metric">
        <h3>Social Reach</h3>
        <p>${report.totalSocialReach}</p>
      </div>
      <div class="metric">
        <h3>Social Engagement</h3>
        <p>${report.totalSocialEngagement}</p>
      </div>
      <div class="metric">
        <h3>Growth</h3>
        <p>${report.weekOverWeekGrowth}</p>
      </div>
    </div>

    <div class="section">
      <h2>Top Performing Platform</h2>
      <p><strong>${report.topPlatform?.toUpperCase()}</strong></p>
    </div>

    <div class="section">
      <h2>Recommendations for Next Month</h2>
      <ul>
        ${report.recommendations?.map(r => `<li>${r}</li>`).join('') || ''}
      </ul>
    </div>

    ${report.ownerAlert ? `
    <div class="section" style="background: #fff3cd; padding: 15px; border-radius: 8px;">
      <h2>⚠️ Action Required</h2>
      <p>${report.ownerAlert}</p>
    </div>` : ''}

    <div style="text-align: center; padding: 20px;">
      <p>The AI Marketing Agent Team handled everything this month automatically.</p>
      <a href="https://ai4businesses.org" class="btn">View Your Site →</a>
    </div>
  </div>
</body>
</html>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resend.apiKey}`,
        'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        from: config.resend.fromEmail,
        to: config.resend.ownerEmail,
        subject: `AI4 Businesses — Monthly Marketing Report ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        html: emailHtml
      })
    });

    console.log(`[${this.name}] Monthly owner email sent`);
  }
}

module.exports = AnalyticsAgent;
