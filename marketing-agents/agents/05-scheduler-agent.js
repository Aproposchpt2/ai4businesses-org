// ═══════════════════════════════════════════════════════════════
// AGENT 5 — SCHEDULER AGENT
// Role: Schedule and post all content via Buffer API
// Runs: Every Wednesday at 11:00 AM PST (after Design Agent)
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const { logAgentActivity } = require('../utils/logger');

class SchedulerAgent {
  constructor() {
    this.name = 'Scheduler Agent';
    this.role = 'content_scheduling_and_posting';
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async run() {
    console.log(`[${this.name}] Starting Wednesday scheduling...`);
    await logAgentActivity(this.name, 'started', 'Content scheduling initiated');

    try {
      // 1. Load social posts and design assets
      const { posts } = await this.loadSocialPosts();
            let assets = {};
      try {
        const assetData = await this.loadDesignAssets();
        assets = assetData.assets || {};
      } catch(e) {
        console.log('No design assets - text only mode');
      }

      // 2. Schedule posts for Thursday–Saturday
      const scheduledPosts = await this.scheduleAllPosts(posts, assets);

      // 3. Save scheduling results
      await this.saveSchedulingResults(scheduledPosts);

      const totalScheduled = scheduledPosts.filter(p => p.success).length;
      await logAgentActivity(this.name, 'completed', `Scheduled ${totalScheduled} posts across all platforms`);
      console.log(`[${this.name}] ${totalScheduled} posts scheduled across all platforms`);

      return scheduledPosts;
    } catch (error) {
      await logAgentActivity(this.name, 'error', error.message);
      throw error;
    }
  }

  // ── SCHEDULE ALL POSTS ────────────────────────────────────────
  async scheduleAllPosts(posts, assets) {
    const scheduledPosts = [];

    // Build posting schedule — Thu/Fri/Sat spread
    const postingSchedule = this.buildPostingSchedule();

    for (const [platform, scheduleTime] of Object.entries(postingSchedule)) {
      const post = posts[platform];
      const asset = assets[platform];

      if (!post || !config.buffer.profiles[platform]) {
        console.log(`[${this.name}] Skipping ${platform} — no profile configured`);
        continue;
      }

      try {
        const result = await this.scheduleBufferPost(
          platform,
          post,
          asset,
          scheduleTime
        );
        scheduledPosts.push({
          platform,
          success: true,
          bufferId: result.id,
          scheduledFor: scheduleTime,
          text: post.text.substring(0, 100) + '...'
        });
        console.log(`[${this.name}] ✅ ${platform} scheduled for ${scheduleTime}`);
      } catch (err) {
        scheduledPosts.push({
          platform,
          success: false,
          error: err.message,
          scheduledFor: scheduleTime
        });
        console.log(`[${this.name}] ❌ ${platform} scheduling failed: ${err.message}`);
      }

      // Rate limit protection
      await new Promise(r => setTimeout(r, 500));
    }

    return scheduledPosts;
  }

  // ── BUILD OPTIMAL POSTING SCHEDULE ───────────────────────────
  buildPostingSchedule() {
    const now = new Date();
    const thursday = new Date(now);
    const friday = new Date(now);
    const saturday = new Date(now);

    // Find next Thursday
    const daysUntilThursday = (4 - now.getDay() + 7) % 7 || 7;
    thursday.setDate(now.getDate() + daysUntilThursday);
    friday.setDate(thursday.getDate() + 1);
    saturday.setDate(thursday.getDate() + 2);

    return {
      linkedin:  this.buildTimestamp(thursday, '08:00'),  // Thu 8AM — professionals
      facebook:  this.buildTimestamp(thursday, '13:00'),  // Thu 1PM — lunch scroll
      instagram: this.buildTimestamp(friday, '12:30'),    // Fri 12:30PM — peak engagement
      tiktok:    this.buildTimestamp(saturday, '09:00')   // Sat 9AM — weekend scroll
    };
  }

  // ── BUILD UNIX TIMESTAMP ──────────────────────────────────────
  buildTimestamp(date, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduled = new Date(date);
    scheduled.setHours(hours, minutes, 0, 0);
    return Math.floor(scheduled.getTime() / 1000);
  }

  // ── SCHEDULE SINGLE POST VIA BUFFER ──────────────────────────
  async scheduleBufferPost(platform, post, asset, scheduledAt) {
    const profileId = config.buffer.profiles[platform];

    const payload = {
      text: post.fullText,
      profile_ids: [profileId],
      scheduled_at: scheduledAt
    };

    // Add media if available
    if (asset?.exportUrl && !asset.exportUrl.includes('social-default')) {
      payload.media = { picture: asset.exportUrl };
    }

    const response = await fetch(
      `${config.buffer.apiEndpoint}/updates/create.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.buffer.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(payload).toString()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Buffer API error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  // ── LOAD DATA ─────────────────────────────────────────────────
  async loadSocialPosts() {
    const fs = require('fs').promises;
    const data = await fs.readFile('C:/temp/social-posts.json', 'utf8');
    return JSON.parse(data);
  }

  async loadDesignAssets() {
    const fs = require('fs').promises;
    const data = await fs.readFile('C:/temp/design-assets.json', 'utf8');
    return JSON.parse(data);
  }

  // ── SAVE RESULTS ──────────────────────────────────────────────
  async saveSchedulingResults(scheduledPosts) {
    const fs = require('fs').promises;
    await fs.writeFile('C:/temp/scheduling-results.json', JSON.stringify({
      scheduledPosts,
      scheduledAt: new Date().toISOString(),
      totalScheduled: scheduledPosts.filter(p => p.success).length,
      totalFailed: scheduledPosts.filter(p => !p.success).length
    }, null, 2));
  }
}

module.exports = SchedulerAgent;

