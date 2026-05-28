// AI4 Marketing Agent Team — Master Configuration
// Project: AI4 Businesses — ai4businesses.org
// Built by: Command Advisor II

module.exports = {
  // ── GOOGLE CREDENTIALS ──────────────────────────────────────
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://ai4businesses.org/oauth/callback',
    scopes: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly'
    ]
  },

  // ── GOOGLE SEARCH CONSOLE ───────────────────────────────────
  searchConsole: {
    siteUrl: 'https://ai4businesses.org',
    apiEndpoint: 'https://searchconsole.googleapis.com/webmasters/v3'
  },

  // ── GOOGLE ANALYTICS 4 ──────────────────────────────────────
  ga4: {
    propertyId: '539366495',
    measurementId: 'G-KEPF58FKCS',
    streamId: '14963067289',
    apiEndpoint: 'https://analyticsdata.googleapis.com/v1beta'
  },

  // ── BUFFER ──────────────────────────────────────────────────
  buffer: {
    accessToken: process.env.BUFFER_ACCESS_TOKEN,
    apiEndpoint: 'https://api.bufferapp.com/1',
    profiles: {
      linkedin: process.env.BUFFER_LINKEDIN_PROFILE_ID,
      facebook: process.env.BUFFER_FACEBOOK_PROFILE_ID,
      instagram: process.env.BUFFER_INSTAGRAM_PROFILE_ID,
      tiktok: process.env.BUFFER_TIKTOK_PROFILE_ID
    },
    // Optimal posting times (PST)
    schedule: {
      linkedin: ['08:00', '12:00', '17:00'],
      facebook: ['09:00', '13:00', '18:00'],
      instagram: ['08:30', '12:30', '19:00'],
      tiktok: ['07:00', '12:00', '21:00']
    }
  },

  // ── CANVA API ───────────────────────────────────────────────
  canva: {
    apiKey: process.env.CANVA_API_KEY,
    apiEndpoint: 'https://api.canva.com/rest/v1',
    brandKitId: process.env.CANVA_BRAND_KIT_ID,
    templates: {
      linkedin: process.env.CANVA_LINKEDIN_TEMPLATE_ID,
      facebook: process.env.CANVA_FACEBOOK_TEMPLATE_ID,
      instagram: process.env.CANVA_INSTAGRAM_TEMPLATE_ID,
      tiktok: process.env.CANVA_TIKTOK_TEMPLATE_ID,
      blogHeader: process.env.CANVA_BLOG_HEADER_TEMPLATE_ID
    }
  },

  // ── GITHUB / NETLIFY PUBLISHING ─────────────────────────────
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: 'Aproposchpt2',
    repo: 'ai4businesses-org',
    branch: 'main',
    blogPath: 'blog/articles'
  },

  // ── RESEND (EMAIL) ──────────────────────────────────────────
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: 'marketing@ai4businesses.org',
    ownerEmail: process.env.OWNER_EMAIL
  },

  // ── ANTHROPIC (CLAUDE AI) ───────────────────────────────────
  anthropic: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4000
  },

  // ── SITE SETTINGS ───────────────────────────────────────────
  site: {
    baseUrl: 'https://ai4businesses.org',
    blogUrl: 'https://ai4businesses.org/blog',
    brand: 'AI4 Businesses',
    products: [
      'Smart Auto-Attendant',
      'Lead Manager',
      'AI Voice Attendant',
      'Business Intake System'
    ],
    targetAudience: 'small and medium business owners',
    valueProps: [
      'AI-powered business automation',
      'reduce operating costs',
      'never miss a lead',
      'automated call handling',
      'intelligent CRM'
    ]
  },

  // ── WEEKLY SCHEDULE ─────────────────────────────────────────
  weeklySchedule: {
    monday: 'keyword_research',      // Commander runs
    tuesday: 'article_publish',      // Writer publishes
    wednesday: 'social_content',     // Social + Design create
    thursday: 'social_post_1',       // Scheduler posts
    friday: 'social_post_2',         // Scheduler posts
    saturday: 'social_post_3',       // Scheduler posts
    sunday: 'analytics_report'       // Analytics compiles
  }
}
