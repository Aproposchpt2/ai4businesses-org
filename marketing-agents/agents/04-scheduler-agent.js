require('dotenv').config();

class SchedulerAgent {
  constructor() {
    // Buffer — LinkedIn only (ai4businesses.org)
    this.bufferKey  = process.env.BUFFER_ACCESS_TOKEN;
    this.bufferApi  = 'https://api.bufferapp.com/1';
    this.linkedinId = process.env.BUFFER_LINKEDIN_ID;

    // Zernio — TikTok + Instagram (Campaign 2 → ai4websitedesign.com)
    this.zernioKey         = process.env.ZERNIO_API_KEY;
    this.zernioInstagramId = process.env.ZERNIO_INSTAGRAM_PROFILE_ID;
    this.zernioTikTokId    = process.env.ZERNIO_TIKTOK_PROFILE_ID;
  }

  // ── BUFFER — LinkedIn scheduling ────────────────────

  async scheduleBufferPost(profileId, text, scheduledAt) {
    const res = await fetch(`${this.bufferApi}/updates/create.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.bufferKey}`,
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ profile_ids: profileId, text, scheduled_at: scheduledAt })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Buffer API error: ${err}`);
    }

    const data = await res.json();
    console.log(`[Scheduler C1] ✅ LinkedIn scheduled:`, data.id);
    return data;
  }

  getNextWeekday(dayOfWeek, hour, minute) {
    const now    = new Date();
    const result = new Date(now);
    const diff   = (dayOfWeek - now.getDay() + 7) % 7 || 7;
    result.setDate(now.getDate() + diff);
    result.setHours(hour, minute, 0, 0);
    return result.toISOString();
  }

  // ── CAMPAIGN 1 — LinkedIn via Buffer ────────────────

  async scheduleLinkedInArticle(post) {
    const monday8am = this.getNextWeekday(1, 8, 0);
    return this.scheduleBufferPost(this.linkedinId, post, monday8am);
  }

  async scheduleLinkedInTeaser(post) {
    const sunday5pm = this.getNextWeekday(0, 17, 0);
    return this.scheduleBufferPost(this.linkedinId, post, sunday5pm);
  }

  // ── CAMPAIGN 2 — Zernio core method ─────────────────

  async scheduleZernio(platform, content, scheduledAt) {
    const profileIds = {
      instagram: process.env.ZERNIO_INSTAGRAM_PROFILE_ID,
      tiktok:    process.env.ZERNIO_TIKTOK_PROFILE_ID
    };

    const res = await fetch('https://zernio.com/api/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        content,
        scheduledFor: scheduledAt,
        platforms: [{ platform, accountId: profileIds[platform] }]
      })
    });

    if (!res.ok) throw new Error(`Zernio error (${platform}): ${await res.text()}`);

    const data = await res.json();
    console.log(`[Scheduler C2] ✅ ${platform} scheduled:`, data._id);
    return data;
  }

  // ── CAMPAIGN 2 — Scheduled posts ────────────────────

  async scheduleC2Instagram(post) {
    console.log('[Scheduler C2] Instagram caption ready for manual posting:');
    console.log(post);
    return { status: 'manual', platform: 'instagram', content: post };
  }

  async scheduleC2TikTok(post) {
    console.log('[Scheduler C2] TikTok script ready for manual posting:');
    console.log(post);
    return { status: 'manual', platform: 'tiktok', content: post };
  }

  async scheduleC2FridayRecap(post) {
    console.log('[Scheduler C2] Friday recap ready for manual posting:');
    console.log(post);
    return { status: 'manual', platform: 'instagram+tiktok', content: post };
  }

  // ── CAMPAIGN 2 — Legacy aliases ─────────────────────

  async scheduleInstagram(caption) {
    return this.scheduleC2Instagram(caption);
  }

  async scheduleTikTok(script) {
    return this.scheduleC2TikTok(script);
  }

  // ── CAMPAIGN 2 — Facebook (manual — log only) ────────

  async scheduleFacebook(post) {
    console.log('[Scheduler C2] Facebook — manual post:');
    console.log(post);
    return { status: 'manual', platform: 'facebook' };
  }
}

module.exports = SchedulerAgent;
