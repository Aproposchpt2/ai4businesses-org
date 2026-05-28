// ═══════════════════════════════════════════════════════════════
// AGENT 4 — DESIGN AGENT
// Role: Create visual assets for all platforms via Canva API
// Runs: Every Wednesday at 9:00 AM PST (after Social Agent)
// Assets: LinkedIn, Facebook, Instagram, TikTok, Blog Header
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const { logAgentActivity } = require('../utils/logger');

class DesignAgent {
  constructor() {
    this.name = 'Design Agent';
    this.role = 'visual_asset_creation';

    // Platform dimensions
    this.dimensions = {
      linkedin:   { width: 1200, height: 627 },
      facebook:   { width: 1200, height: 630 },
      instagram:  { width: 1080, height: 1080 },
      tiktok:     { width: 1080, height: 1920 },
      blogHeader: { width: 1200, height: 630 }
    };
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async run() {
    console.log(`[${this.name}] Starting Wednesday visual asset creation...`);
    await logAgentActivity(this.name, 'started', 'Visual asset creation initiated');

    try {
      // 1. Load social posts data
      const { posts } = await this.loadSocialPosts();

      // 2. Load weekly assignment for context
      const assignment = await this.loadWeeklyAssignment();

      // 3. Create designs for each platform
      const assets = {};
      const platforms = ['linkedin', 'facebook', 'instagram', 'tiktok', 'blogHeader'];

      for (const platform of platforms) {
        console.log(`[${this.name}] Creating ${platform} visual...`);
        const postData = platform === 'blogHeader' ? null : posts[platform];
        assets[platform] = await this.createDesign(platform, postData, assignment);
        // Brief pause between API calls
        await new Promise(r => setTimeout(r, 1000));
      }

      // 4. Save asset URLs for Scheduler
      await this.saveAssets(assets);

      await logAgentActivity(this.name, 'completed', `Created ${Object.keys(assets).length} visual assets`);
      console.log(`[${this.name}] All visual assets created`);

      return assets;
    } catch (error) {
      await logAgentActivity(this.name, 'error', error.message);
      throw error;
    }
  }

  // ── CREATE SINGLE DESIGN VIA CANVA API ───────────────────────
  async createDesign(platform, postData, assignment) {
    // Step 1: Create design from template
    const templateId = config.canva.templates[platform] ||
                       config.canva.templates.linkedin;

    const createResponse = await fetch(
      `${config.canva.apiEndpoint}/designs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.canva.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          design_type: { name: this.getCanvaDesignType(platform) },
          ...(templateId && { asset_id: templateId })
        })
      }
    );

    if (!createResponse.ok) {
      const err = await createResponse.json();
      throw new Error(`Canva design creation failed for ${platform}: ${JSON.stringify(err)}`);
    }

    const design = await createResponse.json();
    const designId = design.design?.id;

    // Step 2: Export the design
    const exportUrl = await this.exportDesign(designId);

    return {
      platform,
      designId,
      exportUrl,
      dimensions: this.dimensions[platform] || this.dimensions.linkedin,
      createdAt: new Date().toISOString(),
      status: 'ready'
    };
  }

  // ── EXPORT DESIGN ─────────────────────────────────────────────
  async exportDesign(designId) {
    const response = await fetch(
      `${config.canva.apiEndpoint}/designs/${designId}/exports`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.canva.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: { type: 'png', export_quality: 'regular' }
        })
      }
    );

    if (!response.ok) {
      // Return placeholder if export fails — Scheduler will handle
      return `https://ai4businesses.org/assets/social-default.png`;
    }

    const exportData = await response.json();

    // Poll for export completion
    const jobId = exportData.job?.id;
    if (!jobId) return `https://ai4businesses.org/assets/social-default.png`;

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusResponse = await fetch(
        `${config.canva.apiEndpoint}/exports/${jobId}`,
        {
          headers: { 'Authorization': `Bearer ${config.canva.apiKey}` }
        }
      );
      const status = await statusResponse.json();
      if (status.job?.status === 'success') {
        return status.job?.urls?.[0] || `https://ai4businesses.org/assets/social-default.png`;
      }
    }

    return `https://ai4businesses.org/assets/social-default.png`;
  }

  // ── GET CANVA DESIGN TYPE ─────────────────────────────────────
  getCanvaDesignType(platform) {
    const types = {
      linkedin:   'SocialMedia',
      facebook:   'SocialMedia',
      instagram:  'InstagramPost',
      tiktok:     'MobileVideo',
      blogHeader: 'Presentation'
    };
    return types[platform] || 'SocialMedia';
  }

  // ── LOAD DATA ─────────────────────────────────────────────────
  async loadSocialPosts() {
    const fs = require('fs').promises;
    const data = await fs.readFile('/tmp/social-posts.json', 'utf8');
    return JSON.parse(data);
  }

  async loadWeeklyAssignment() {
    const fs = require('fs').promises;
    const data = await fs.readFile('/tmp/weekly-assignment.json', 'utf8');
    return JSON.parse(data);
  }

  // ── SAVE ASSETS ───────────────────────────────────────────────
  async saveAssets(assets) {
    const fs = require('fs').promises;
    await fs.writeFile('/tmp/design-assets.json', JSON.stringify({
      assets,
      createdAt: new Date().toISOString(),
      status: 'ready_for_scheduler'
    }, null, 2));
  }
}

module.exports = DesignAgent;
