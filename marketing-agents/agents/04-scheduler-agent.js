require('dotenv').config();

class SchedulerAgent {
  constructor() {
    // Buffer — LinkedIn only (ai4businesses.org)
    this.bufferToken   = process.env.BUFFER_ACCESS_TOKEN;
    this.bufferApi     = 'https://api.bufferapp.com/1';
    this.linkedinId    = process.env.BUFFER_LINKEDIN_ID;

    // Zernio — TikTok + Instagram (ai4websitedesign.com)
    this.zernioKey         = process.env.ZERNIO_API_KEY;
    this.zernioInstagramId = process.env.ZERNIO_INSTAGRAM_PROFILE_ID;
    this.zernioTikTokId    = process.env.ZERNIO_TIKTOK_PROFILE_ID;
  }

  // ── BUFFER — LinkedIn scheduling ────────────────────

  async scheduleBufferPost(profileId, text, scheduledAt) {
    const body = new URLSearchParams({
      access_token: this.bufferToken,
      profile_ids:  profileId,
      text,
      scheduled_at: scheduledAt
    });

    const res = await fetch(`${this.bufferApi}/updates/create.json`, {
      method: 'POST',
      body
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Buffer API error: ${err}`);
    }

    const data = await res.json();
    console.log(`[Scheduler] ✅ Buffer scheduled to ${profileId}:`, data.id);
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

  // Campaign 1 — LinkedIn via Buffer
  async scheduleLinkedInArticle(post) {
    const monday8am = this.getNextWeekday(1, 8, 0);
    return this.scheduleBufferPost(this.linkedinId, post, monday8am);
  }

  async scheduleLinkedInTeaser(post) {
    const sunday5pm = this.getNextWeekday(0, 17, 0);
    return this.scheduleBufferPost(this.linkedinId, post, sunday5pm);
  }

  // ── ZERNIO — TikTok + Instagram (ai4websitedesign.com) ──

  async scheduleZernioPost(platforms, content, scheduledAt) {
    const res = await fetch('https://zernio.com/api/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.zernioKey}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        content,
        scheduledFor: scheduledAt,
        platforms
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Zernio API error: ${err}`);
    }

    const data = await res.json();
    console.log(`[Scheduler] ✅ Zernio scheduled (${platforms.map(p => p.platform).join('+')})`, data.id || '');
    return data;
  }

  // Campaign 2 — Instagram via Zernio (ai4websitedesign.com)
  async scheduleInstagram(caption) {
    const wednesday12pm = this.getNextWeekday(3, 12, 0);
    return this.scheduleZernioPost([
      { platform: 'instagram', accountId: this.zernioInstagramId }
    ], caption, wednesday12pm);
  }

  // Campaign 2 — TikTok via Zernio (ai4websitedesign.com)
  async scheduleTikTok(script) {
    const thursday6pm = this.getNextWeekday(4, 18, 0);
    return this.scheduleZernioPost([
      { platform: 'tiktok', accountId: this.zernioTikTokId }
    ], script, thursday6pm);
  }

  // Campaign 2 — Facebook (manual — log only)
  async scheduleFacebook(post) {
    console.log('[Scheduler] Facebook post ready for manual posting to ai4businesses.org:');
    console.log(post);
    return { status: 'manual', platform: 'facebook' };
  }
}

module.exports = SchedulerAgent;
