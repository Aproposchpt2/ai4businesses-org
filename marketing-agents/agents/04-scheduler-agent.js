require('dotenv').config();

class SchedulerAgent {
  constructor() {
    this.token    = process.env.BUFFER_ACCESS_TOKEN;
    this.api      = 'https://api.bufferapp.com/1';
    this.linkedin = process.env.BUFFER_LINKEDIN_ID;
  }

  async schedulePost(profileId, text, scheduledAt) {
    const body = new URLSearchParams({
      access_token: this.token,
      profile_ids:  profileId,
      text,
      scheduled_at: scheduledAt
    });

    const res = await fetch(`${this.api}/updates/create.json`, {
      method: 'POST',
      body
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Buffer API error: ${err}`);
    }

    const data = await res.json();
    console.log(`[Scheduler] ✅ Scheduled to ${profileId}:`, data.id);
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

  // Campaign 1 — LinkedIn only
  async scheduleLinkedInArticle(post) {
    const monday8am = this.getNextWeekday(1, 8, 0);
    return this.schedulePost(this.linkedin, post, monday8am);
  }

  async scheduleLinkedInTeaser(post) {
    const sunday5pm = this.getNextWeekday(0, 17, 0);
    return this.schedulePost(this.linkedin, post, sunday5pm);
  }
}

module.exports = SchedulerAgent;
