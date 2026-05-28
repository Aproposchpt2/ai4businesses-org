// ═══════════════════════════════════════════════════════════════
// AGENT 1 — CONTENT COMMANDER
// Role: Keyword research, topic assignment, weekly strategy
// Runs: Every Monday at 6:00 AM PST
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const { getGoogleTokens } = require('../utils/auth');
const { logAgentActivity } = require('../utils/logger');

class ContentCommanderAgent {
  constructor() {
    this.name = 'Content Commander';
    this.role = 'keyword_research_and_strategy';
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async run(analyticsReport = null) {
    console.log(`[${this.name}] Starting Monday keyword research...`);
    await logAgentActivity(this.name, 'started', 'Weekly keyword research initiated');

    try {
      // 1. Pull keyword data from Search Console
      const keywordData = await this.fetchSearchConsoleData();

      // 2. Pull traffic data from GA4
      const trafficData = await this.fetchGA4Data();

      // 3. Factor in last week's analytics if available
      const performanceInsights = analyticsReport
        ? this.analyzePerformance(analyticsReport)
        : null;

      // 4. Use Claude to determine best keyword and topic
      const weeklyAssignment = await this.generateWeeklyAssignment(
        keywordData,
        trafficData,
        performanceInsights
      );

      // 5. Save assignment for SEO Writer
      await this.saveWeeklyAssignment(weeklyAssignment);

      await logAgentActivity(this.name, 'completed', `Topic assigned: ${weeklyAssignment.articleTitle}`);
      console.log(`[${this.name}] Weekly assignment ready: "${weeklyAssignment.articleTitle}"`);

      return weeklyAssignment;
    } catch (error) {
      await logAgentActivity(this.name, 'error', error.message);
      throw error;
    }
  }

  // ── FETCH SEARCH CONSOLE DATA ────────────────────────────────
  async fetchSearchConsoleData() {
    const tokens = await getGoogleTokens();
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const response = await fetch(
      `${config.searchConsole.apiEndpoint}/sites/${encodeURIComponent(config.searchConsole.siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 50,
          orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }]
        })
      }
    );

    const data = await response.json();
    return data.rows || [];
  }

  // ── FETCH GA4 DATA ───────────────────────────────────────────
  async fetchGA4Data() {
    const tokens = await getGoogleTokens();

    const response = await fetch(
      `${config.ga4.apiEndpoint}/properties/${config.ga4.propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'sessions' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 20
        })
      }
    );

    const data = await response.json();
    return data.rows || [];
  }

  // ── ANALYZE PREVIOUS PERFORMANCE ─────────────────────────────
  analyzePerformance(analyticsReport) {
    return {
      topPerformingKeywords: analyticsReport.topKeywords || [],
      topPerformingPlatform: analyticsReport.topPlatform || 'linkedin',
      contentAngleWorking: analyticsReport.bestContentAngle || null,
      avoidTopics: analyticsReport.lowPerformers || []
    };
  }

  // ── GENERATE WEEKLY ASSIGNMENT VIA CLAUDE ────────────────────
  async generateWeeklyAssignment(keywordData, trafficData, performanceInsights) {
    const prompt = `You are the Content Commander for AI4 Businesses, a SaaS company selling:
- Smart Auto-Attendant
- Lead Manager / CRM
- AI Voice Attendant  
- Business Intake System

Target audience: Small and medium business owners who want to automate operations.

SEARCH CONSOLE DATA (last 28 days):
${JSON.stringify(keywordData.slice(0, 20), null, 2)}

GA4 TRAFFIC DATA (top pages):
${JSON.stringify(trafficData.slice(0, 10), null, 2)}

${performanceInsights ? `PERFORMANCE INSIGHTS FROM LAST WEEK:
${JSON.stringify(performanceInsights, null, 2)}` : ''}

Based on this data, determine the BEST keyword opportunity for this week.
Choose a keyword with high impressions but room for content improvement.

Respond ONLY with a JSON object:
{
  "targetKeyword": "the exact keyword phrase",
  "articleTitle": "SEO-optimized article title using the keyword",
  "articleAngle": "the specific angle/hook for the article",
  "targetProduct": "which FlowDesk Pro product this supports",
  "estimatedSearchVolume": "low/medium/high",
  "contentBrief": "3-4 sentences describing what the article should cover",
  "callToAction": "the CTA to use at end of article",
  "socialHook": "one punchy sentence for social media posts",
  "platforms": ["linkedin", "facebook", "instagram", "tiktok"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.anthropic.model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      // Fallback assignment if parsing fails
      return {
        targetKeyword: 'AI business automation',
        articleTitle: 'How AI Business Automation Saves Small Businesses 10+ Hours Per Week',
        articleAngle: 'ROI and time savings for small business owners',
        targetProduct: 'Smart Auto-Attendant',
        estimatedSearchVolume: 'medium',
        contentBrief: 'Cover the real cost of manual processes, how AI automation works, ROI calculator, and how FlowDesk Pro solves this.',
        callToAction: 'Start your free trial at ai4businesses.org',
        socialHook: 'Your competitors are already using AI. Are you?',
        platforms: ['linkedin', 'facebook', 'instagram', 'tiktok']
      };
    }
  }

  // ── SAVE ASSIGNMENT FOR OTHER AGENTS ─────────────────────────
  async saveWeeklyAssignment(assignment) {
    const fs = require('fs').promises;
    const assignmentData = {
      ...assignment,
      createdAt: new Date().toISOString(),
      weekOf: new Date().toISOString().split('T')[0],
      status: 'assigned'
    };

    await fs.writeFile(
      '/tmp/weekly-assignment.json',
      JSON.stringify(assignmentData, null, 2)
    );

    return assignmentData;
  }
}

module.exports = ContentCommanderAgent;
