'use strict';
// Marketing Pipeline — Monday
// Triggers: Content Commander → SEO Writer → GitHub → LinkedIn (Buffer)
// Env vars pulled automatically from Netlify environment

const MarketingOrchestrator = require('../../marketing-agents/orchestrator');

exports.handler = async () => {
  try {
    const O = new MarketingOrchestrator();
    await O.runMonday();
    return { statusCode: 200, body: JSON.stringify({ ok: true, day: 'monday' }) };
  } catch (err) {
    console.error('[marketing-monday] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
