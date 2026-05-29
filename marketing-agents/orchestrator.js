require('dotenv').config();
// ═══════════════════════════════════════════════════════════════
// MASTER ORCHESTRATOR — AI4 MARKETING AGENT TEAM
// Runs the complete weekly pipeline
// Self-improving loop: Analytics → Commander → Writer → Social
//                      → Design → Scheduler → Analytics (repeat)
// ═══════════════════════════════════════════════════════════════

const ContentCommanderAgent = require('./agents/01-content-commander');
const SEOWriterAgent = require('./agents/02-seo-writer');
const SocialAgent = require('./agents/03-social-agent');
const DesignAgent = require('./agents/04-design-agent');
const SchedulerAgent = require('./agents/05-scheduler-agent');
const AnalyticsAgent = require('./agents/06-analytics-agent');
const { logAgentActivity } = require('./utils/logger');

class MarketingOrchestrator {
  constructor() {
    this.commander = new ContentCommanderAgent();
    this.writer = new SEOWriterAgent();
    this.social = new SocialAgent();
    this.design = new DesignAgent();
    this.scheduler = new SchedulerAgent();
    this.analytics = new AnalyticsAgent();
  }

  // ── RUN BASED ON DAY OF WEEK ──────────────────────────────────
  async runDailyTask() {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`AI4 MARKETING AGENT TEAM — ${day.toUpperCase()}`);
    console.log(`${'═'.repeat(60)}\n`);

    switch (day) {
      case 'monday':
        return await this.runMonday();
      case 'tuesday':
        return await this.runTuesday();
      case 'wednesday':
        return await this.runWednesday();
      case 'sunday':
        return await this.runSunday();
      default:
        console.log(`No agent tasks scheduled for ${day}.`);
        return null;
    }
  }

  // ── MONDAY: KEYWORD RESEARCH ──────────────────────────────────
  async runMonday() {
    console.log('📋 MONDAY — Content Commander: Keyword Research\n');

    // Load last week's analytics report if available
    let analyticsReport = null;
    try {
      const fs = require('fs').promises;
      const data = await fs.readFile('C:/temp/analytics-report.json', 'utf8');
      analyticsReport = JSON.parse(data);
      console.log('📊 Loaded last week\'s analytics — self-improving loop active\n');
    } catch {
      console.log('📊 No previous analytics — starting fresh\n');
    }

    const assignment = await this.commander.run(analyticsReport);
    console.log(`\n✅ MONDAY COMPLETE — Topic: "${assignment.articleTitle}"\n`);
    return assignment;
  }

  // ── TUESDAY: ARTICLE PUBLISHING ───────────────────────────────
  async runTuesday() {
    console.log('✍️ TUESDAY — SEO Writer: Article Generation & Publishing\n');
    const result = await this.writer.run();
    console.log(`\n✅ TUESDAY COMPLETE — Published: ${result.publishResult.url}\n`);
    return result;
  }

  // ── WEDNESDAY: SOCIAL + DESIGN + SCHEDULING ───────────────────
  async runWednesday() {
    console.log('📱 WEDNESDAY — Social + Design + Scheduler\n');

    // Step 1: Social Agent creates posts
    console.log('Step 1/3: Social Agent creating posts...');
    const socialPosts = await this.social.run();

    // Step 2: Design Agent creates visuals
    console.log('\nStep 2/3: Design Agent creating visuals...');
    const assets = await this.design.run();

    // Step 3: Scheduler queues everything
    console.log('\nStep 3/3: Scheduler Agent queuing posts...');
    const scheduled = await this.scheduler.run();

    const successCount = scheduled.filter(p => p.success).length;
    console.log(`\n✅ WEDNESDAY COMPLETE — ${successCount} posts scheduled\n`);

    return { socialPosts, assets, scheduled };
  }

  // ── SUNDAY: ANALYTICS + REPORT ────────────────────────────────
  async runSunday() {
    console.log('📊 SUNDAY — Analytics Agent: Performance Report\n');
    const report = await this.analytics.run();
    console.log(`\n✅ SUNDAY COMPLETE — Report ready for Monday Commander\n`);
    console.log(`   Top keyword: ${report.topKeywords?.[0]}`);
    console.log(`   Top platform: ${report.topPlatform}`);
    console.log(`   Growth: ${report.weekOverWeekGrowth}\n`);
    return report;
  }

  // ── FULL PIPELINE TEST (for end-to-end testing) ───────────────
  async runFullPipelineTest() {
    console.log('\n🧪 RUNNING FULL PIPELINE TEST\n');

    const results = {
      commander: null,
      writer: null,
      social: null,
      design: null,
      scheduler: null,
      analytics: null,
      errors: []
    };

    const steps = [
      { name: 'commander', fn: () => this.commander.run(null) },
      { name: 'writer', fn: () => this.writer.run() },
      { name: 'social', fn: () => this.social.run() },
      { name: 'design', fn: () => this.design.run() },
      { name: 'scheduler', fn: () => this.scheduler.run() },
      { name: 'analytics', fn: () => this.analytics.run() }
    ];

    for (const step of steps) {
      try {
        console.log(`\n🔄 Testing ${step.name}...`);
        results[step.name] = await step.fn();
        console.log(`✅ ${step.name} — PASSED`);
      } catch (error) {
        results.errors.push({ step: step.name, error: error.message });
        console.log(`❌ ${step.name} — FAILED: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('PIPELINE TEST RESULTS');
    console.log('═'.repeat(60));
    console.log(`Passed: ${steps.length - results.errors.length}/${steps.length}`);
    console.log(`Failed: ${results.errors.length}/${steps.length}`);
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach(e => console.log(`  ${e.step}: ${e.error}`));
    }
    console.log('═'.repeat(60) + '\n');

    return results;
  }
}

// ── ENTRY POINT ───────────────────────────────────────────────
const orchestrator = new MarketingOrchestrator();

const mode = process.argv[2];
if (mode === 'test') {
  orchestrator.runFullPipelineTest().catch(console.error);
} else {
  orchestrator.runDailyTask().catch(console.error);
}

module.exports = MarketingOrchestrator;

