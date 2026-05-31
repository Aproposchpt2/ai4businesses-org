'use strict';
// Marketing Pipeline — Wednesday
// Triggers: Campaign 2 Instagram EN (Zernio) + ES (manual log)

const MarketingOrchestrator = require('../../marketing-agents/orchestrator');

exports.handler = async () => {
  try {
    const O = new MarketingOrchestrator();
    await O.runWednesday();
    return { statusCode: 200, body: JSON.stringify({ ok: true, day: 'wednesday' }) };
  } catch (err) {
    console.error('[marketing-wednesday] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
