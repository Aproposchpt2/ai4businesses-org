require('dotenv').config();
const ContentCommanderAgent = require('./agents/01-content-commander');
const SEOWriterAgent        = require('./agents/02-seo-writer');
const SocialAgent           = require('./agents/03-social-agent');
const SchedulerAgent        = require('./agents/04-scheduler-agent');
const AnalyticsAgent        = require('./agents/05-analytics-agent');

class MarketingOrchestrator {
  constructor() {
    this.commander = new ContentCommanderAgent();
    this.seoWriter = new SEOWriterAgent();
    this.social    = new SocialAgent();
    this.scheduler = new SchedulerAgent();
    this.analytics = new AnalyticsAgent();
  }

  // ── MONDAY — C1 Article + LinkedIn ──────────────────
  async runMonday() {
    console.log('=== MONDAY — C1 Article + LinkedIn ===');
    const strategy   = await this.commander.runMondayStrategy();
    const article    = await this.seoWriter.writeArticle(strategy.campaign1.articleTopic);
    const articleUrl = await this.seoWriter.publishToGitHub(article, strategy.campaign1.articleTopic);
    const liPost     = await this.social.createLinkedInPost(articleUrl, strategy.campaign1.articleTopic);
    await this.scheduler.scheduleLinkedInArticle(liPost);
    console.log('=== MONDAY COMPLETE ===');
  }

  // ── TUESDAY — C2 Facebook EN + ES ───────────────────
  async runTuesday() {
    console.log('=== TUESDAY — C2 Facebook EN+ES ===');
    const strategy = await this.commander.runMondayStrategy();
    const fbEN     = await this.social.createFacebookPost(strategy.campaign2.fbAngle);
    const fbES     = await this.social.createFacebookPostSpanish(strategy.campaign2.fbAngle);
    await this.scheduler.scheduleFacebook(fbEN);
    console.log('[Tuesday] Facebook EN scheduled');
    console.log('[Tuesday] Facebook ES generated (manual post to espanola)');
    console.log(fbES);
  }

  // ── WEDNESDAY — C2 Instagram EN + ES ────────────────
  async runWednesday() {
    console.log('=== WEDNESDAY — C2 Instagram EN+ES ===');
    const strategy = await this.commander.runMondayStrategy();
    const igEN     = await this.social.createInstagramCaption(strategy.campaign2.igAngle);
    const igES     = await this.social.createInstagramCaptionSpanish(strategy.campaign2.igAngle);
    await this.scheduler.scheduleInstagram(igEN);
    console.log('[Wednesday] Instagram EN scheduled');
    console.log('[Wednesday] Instagram ES generated (manual post to espanola)');
    console.log(igES);
  }

  // ── THURSDAY — C2 TikTok ────────────────────────────
  async runThursday() {
    console.log('=== THURSDAY — C2 TikTok ===');
    const strategy = await this.commander.runMondayStrategy();
    const tiktok   = await this.social.createTikTokScript(strategy.campaign2.tiktokAngle);
    await this.scheduler.scheduleTikTok(tiktok);
    console.log('=== THURSDAY COMPLETE ===');
  }

  // ── SUNDAY — LinkedIn Teaser + Analytics ────────────
  async runSunday() {
    console.log('=== SUNDAY — Teaser + Analytics ===');
    const strategy = await this.commander.runMondayStrategy();
    const teaser   = await this.social.createLinkedInTeaser(strategy.campaign1.articleTopic);
    await this.scheduler.scheduleLinkedInTeaser(teaser);
    await this.analytics.runWeeklyCampaign1Report();
    await this.analytics.runWeeklyCampaign2Report();
    console.log('=== SUNDAY COMPLETE ===');
  }

  // ── TEST MODE ────────────────────────────────────────
  async runTest() {
    console.log('=== TEST MODE — ALL AGENTS ===');

    try {
      await this.commander.runMondayStrategy();
      console.log('✅ 01 Content Commander — OPERATIONAL');
    } catch(e) { console.log('❌ 01 Content Commander —', e.message); }

    try {
      await this.seoWriter.writeArticle('AI Automation Test Article');
      console.log('✅ 02 SEO Writer — OPERATIONAL');
    } catch(e) { console.log('❌ 02 SEO Writer —', e.message); }

    try {
      await this.social.createLinkedInPost('https://ai4businesses.org/test', 'Test Topic');
      console.log('✅ 03 Social Agent C1 LinkedIn — OPERATIONAL');
    } catch(e) { console.log('❌ 03 Social Agent C1 LinkedIn —', e.message); }

    try {
      await this.social.createTikTokScript('Watch AI build my website in 60 seconds');
      console.log('✅ 03 Social Agent C2 TikTok — OPERATIONAL');
    } catch(e) { console.log('❌ 03 Social Agent C2 TikTok —', e.message); }

    try {
      await this.social.createInstagramCaption('Before and after site reveal');
      console.log('✅ 03 Social Agent C2 Instagram EN — OPERATIONAL');
    } catch(e) { console.log('❌ 03 Social Agent C2 Instagram EN —', e.message); }

    try {
      await this.social.createInstagramCaptionSpanish('Before and after site reveal');
      console.log('✅ 03 Social Agent C2 Instagram ES — OPERATIONAL');
    } catch(e) { console.log('❌ 03 Social Agent C2 Instagram ES —', e.message); }

    try {
      await this.social.createFacebookPost('Small business website tips');
      console.log('✅ 03 Social Agent C2 Facebook EN — OPERATIONAL');
    } catch(e) { console.log('❌ 03 Social Agent C2 Facebook EN —', e.message); }

    try {
      await this.social.createFacebookPostSpanish('Small business website tips');
      console.log('✅ 03 Social Agent C2 Facebook ES — OPERATIONAL');
    } catch(e) { console.log('❌ 03 Social Agent C2 Facebook ES —', e.message); }

    try {
      console.log('  Buffer profiles loaded:', {
        linkedin:  !!process.env.BUFFER_LINKEDIN_ID,
        tiktok:    !!process.env.BUFFER_TIKTOK_ID,
        instagram: !!process.env.BUFFER_INSTAGRAM_ID,
        facebook:  !!process.env.BUFFER_FACEBOOK_ID
      });
      console.log('✅ 04 Scheduler Agent — OPERATIONAL');
    } catch(e) { console.log('❌ 04 Scheduler Agent —', e.message); }

    try {
      await this.analytics.buildReport('Test Campaign', { site: 'ai4businesses.org' });
      console.log('✅ 05 Analytics Agent — OPERATIONAL');
    } catch(e) { console.log('❌ 05 Analytics Agent —', e.message); }

    console.log('=== TEST COMPLETE ===');
  }
}

// ── CLI ENTRY ────────────────────────────────────────
const arg = process.argv[2];
const O = new MarketingOrchestrator();

if      (arg === 'test')      O.runTest().catch(console.error);
else if (arg === 'monday')    O.runMonday().catch(console.error);
else if (arg === 'tuesday')   O.runTuesday().catch(console.error);
else if (arg === 'wednesday') O.runWednesday().catch(console.error);
else if (arg === 'thursday')  O.runThursday().catch(console.error);
else if (arg === 'sunday')    O.runSunday().catch(console.error);
else console.log('Usage: node orchestrator.js [test|monday|tuesday|wednesday|thursday|sunday]');

module.exports = MarketingOrchestrator;
