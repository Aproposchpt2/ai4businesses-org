'use strict';
// Marketing Pipeline — Thursday
// Triggers: Campaign 2 TikTok script (Zernio → ai4websitedesign.com)

const MarketingOrchestrator = require('../../marketing-agents/orchestrator');

exports.handler = async () => {
  try {
    const O = new MarketingOrchestrator();
    await O.runThursday();
    return { statusCode: 200, body: JSON.stringify({ ok: true, day: 'thursday' }) };
  } catch (err) {
    console.error('[marketing-thursday] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
