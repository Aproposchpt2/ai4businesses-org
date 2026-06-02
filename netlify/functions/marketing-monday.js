'use strict';
// Marketing Pipeline — Monday
// Triggers: Content Commander → SEO Writer → GitHub → LinkedIn (Buffer)

const MarketingOrchestrator = require('../../marketing-agents/orchestrator');

exports.handler = async () => {
  // Diagnostic: confirm env vars are present (names only — no values)
  const envCheck = {
    ANTHROPIC_API_KEY:  !!process.env.ANTHROPIC_API_KEY,
    GITHUB_TOKEN:       !!process.env.GITHUB_TOKEN,
    GITHUB_OWNER:       !!process.env.GITHUB_OWNER,
    BUFFER_ACCESS_TOKEN:!!process.env.BUFFER_ACCESS_TOKEN,
    BUFFER_LINKEDIN_ID: !!process.env.BUFFER_LINKEDIN_ID,
    RESEND_API_KEY:     !!process.env.RESEND_API_KEY,
    OWNER_EMAIL:        !!process.env.OWNER_EMAIL,
  };
  console.log('[marketing-monday] Env check:', JSON.stringify(envCheck));

  try {
    const O = new MarketingOrchestrator();
    await O.runMonday();
    return { statusCode: 200, body: JSON.stringify({ ok: true, day: 'monday', envCheck }) };
  } catch (err) {
    console.error('[marketing-monday] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message, envCheck }) };
  }
};
