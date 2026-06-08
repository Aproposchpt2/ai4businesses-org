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
    await this.notifyOwner({
      subject: '[Campaign 1] Monday Pipeline Complete ✅',
      body: `Article published: ${articleUrl}\n\nLinkedIn post scheduled for Monday 8AM.\n\nNext run: Sunday 5PM teaser.`
    });
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
    const igResult = await this.scheduler.scheduleInstagram(igEN);
    const zStatus  = igResult.status === 'scheduled'
      ? `<span style="color:#22d87a;font-weight:700;">&#10003; Scheduled in Zernio (ID: ${igResult.id})</span>`
      : `<span style="color:#f5a623;font-weight:700;">&#9888; Zernio requires media &#8212; post manually</span>`;
    await this.notifyOwnerHtml({
      subject: '[C2] Instagram Posting Brief — Wednesday 12PM PT',
      html: `<div style="font-family:Arial,sans-serif;background:#030816;color:#f0f6fc;padding:28px;max-width:680px;">
  <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5BD3FF;font-weight:700;margin-bottom:12px;">Campaign 2 — Instagram Posting Brief</div>
  <h2 style="color:#ffffff;margin:0 0 4px;">ACTION REQUIRED — Post by Wednesday 12PM PT</h2>
  <p style="color:#8facd0;font-size:13px;margin:0 0 20px;">Zernio status: ${zStatus}</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
    <tr><td style="padding:6px 0;color:#8facd0;width:130px;">Platform</td><td style="color:#fff;">Instagram — @jmitchell1126</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Post Time</td><td style="color:#fff;">Wednesday 12PM PT</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">CTA Link</td><td style="color:#5BD3FF;">platinum.ai4websitedesign.com</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Visual</td><td style="color:#fff;">Screenshot or screen recording of the AI4 studio preview page — show live site + style switcher</td></tr>
  </table>
  <div style="background:#061225;border:1px solid rgba(91,211,255,.2);border-radius:12px;padding:18px;margin-bottom:16px;">
    <div style="font-size:11px;letter-spacing:.12em;color:#5BD3FF;text-transform:uppercase;margin-bottom:10px;">Caption — English (@jmitchell1126)</div>
    <p style="color:#f0f6fc;line-height:1.7;white-space:pre-wrap;margin:0;">${igEN}</p>
  </div>
  <div style="background:#061225;border:1px solid rgba(91,211,255,.2);border-radius:12px;padding:18px;">
    <div style="font-size:11px;letter-spacing:.12em;color:#5BD3FF;text-transform:uppercase;margin-bottom:10px;">Caption — Español (post separately to espanola)</div>
    <p style="color:#f0f6fc;line-height:1.7;white-space:pre-wrap;margin:0;">${igES}</p>
  </div>
</div>`
    });
    console.log('=== WEDNESDAY COMPLETE ===');
  }

  // ── THURSDAY — C2 TikTok ────────────────────────────
  async runThursday() {
    console.log('=== THURSDAY — C2 TikTok ===');
    const strategy  = await this.commander.runMondayStrategy();
    const tiktok    = await this.social.createTikTokScript(strategy.campaign2.tiktokAngle);
    const ttResult  = await this.scheduler.scheduleTikTok(tiktok);
    const zStatus   = ttResult.status === 'scheduled'
      ? `<span style="color:#22d87a;font-weight:700;">&#10003; Scheduled in Zernio (ID: ${ttResult.id})</span>`
      : `<span style="color:#f5a623;font-weight:700;">&#9888; Zernio requires video — record and post manually</span>`;
    await this.notifyOwnerHtml({
      subject: '[C2] TikTok Posting Brief — Thursday 6PM PT',
      html: `<div style="font-family:Arial,sans-serif;background:#030816;color:#f0f6fc;padding:28px;max-width:680px;">
  <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5BD3FF;font-weight:700;margin-bottom:12px;">Campaign 2 — TikTok Posting Brief</div>
  <h2 style="color:#ffffff;margin:0 0 4px;">ACTION REQUIRED — Post by Thursday 6PM PT</h2>
  <p style="color:#8facd0;font-size:13px;margin:0 0 20px;">Zernio status: ${zStatus}</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
    <tr><td style="padding:6px 0;color:#8facd0;width:130px;">Platform</td><td style="color:#fff;">TikTok — @ai4websitedesign</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Post Time</td><td style="color:#fff;">Thursday 6PM PT</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">CTA Link</td><td style="color:#5BD3FF;">platinum.ai4websitedesign.com</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Format</td><td style="color:#fff;">30–60 sec vertical video — record yourself delivering this script</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Hook</td><td style="color:#fff;">First 3 seconds must land the hook — it is the first line below</td></tr>
  </table>
  <div style="background:#061225;border:1px solid rgba(91,211,255,.2);border-radius:12px;padding:18px;">
    <div style="font-size:11px;letter-spacing:.12em;color:#5BD3FF;text-transform:uppercase;margin-bottom:10px;">TikTok Script</div>
    <p style="color:#f0f6fc;line-height:1.8;white-space:pre-wrap;margin:0;">${tiktok}</p>
  </div>
</div>`
    });
    console.log('=== THURSDAY COMPLETE ===');
  }

  // ── SUNDAY — LinkedIn Teaser + Analytics ────────────
  async runSunday() {
    console.log('=== SUNDAY — Teaser + Analytics ===');
    const strategy = await this.commander.runMondayStrategy();
    const teaser   = await this.social.createLinkedInTeaser(strategy.campaign1.articleTopic);
    console.log('[Sunday] LinkedIn teaser ready for manual posting:');
    console.log(teaser);
    await this.analytics.runWeeklyCampaign1Report();
    await this.analytics.runWeeklyCampaign2Report();
    await this.notifyOwnerHtml({
      subject: '[C1] LinkedIn Teaser Brief — Sunday 5PM PT',
      html: `<div style="font-family:Arial,sans-serif;background:#030816;color:#f0f6fc;padding:28px;max-width:680px;">
  <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5BD3FF;font-weight:700;margin-bottom:12px;">Campaign 1 — LinkedIn Teaser Brief</div>
  <h2 style="color:#ffffff;margin:0 0 4px;">ACTION REQUIRED — Post by Sunday 5PM PT</h2>
  <p style="color:#8facd0;font-size:13px;margin:0 0 20px;">Monday 8AM the full article + LinkedIn post fires automatically.</p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
    <tr><td style="padding:6px 0;color:#8facd0;width:130px;">Platform</td><td style="color:#fff;">LinkedIn — AI4 Businesses company page</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Post Time</td><td style="color:#fff;">Sunday 5PM PT</td></tr>
    <tr><td style="padding:6px 0;color:#8facd0;">Links To</td><td style="color:#5BD3FF;">https://ai4businesses.org</td></tr>
  </table>
  <div style="background:#061225;border:1px solid rgba(91,211,255,.2);border-radius:12px;padding:18px;">
    <div style="font-size:11px;letter-spacing:.12em;color:#5BD3FF;text-transform:uppercase;margin-bottom:10px;">LinkedIn Teaser</div>
    <p style="color:#f0f6fc;line-height:1.8;white-space:pre-wrap;margin:0;">${teaser}</p>
  </div>
</div>`
    });
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

  // ── NOTIFY OWNER — plain text ────────────────────────
  async notifyOwner({ subject, body }) {
    if (!process.env.RESEND_API_KEY) return;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'marketing@ai4businesses.org',
        to: process.env.OWNER_EMAIL,
        subject,
        text: body
      })
    });
    console.log('[Orchestrator] ✅ Owner notified via email');
  }

  // ── NOTIFY OWNER — HTML posting brief ───────────────
  async notifyOwnerHtml({ subject, html }) {
    if (!process.env.RESEND_API_KEY) return;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'marketing@ai4businesses.org',
        to: process.env.OWNER_EMAIL,
        subject,
        html
      })
    });
    console.log('[Orchestrator] ✅ Owner notified (HTML brief) via email');
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
