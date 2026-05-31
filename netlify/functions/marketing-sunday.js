'use strict';
// Marketing Pipeline — Sunday
// Triggers: LinkedIn teaser (Buffer) + Campaign 1 + Campaign 2 analytics reports (Resend)

const MarketingOrchestrator = require('../../marketing-agents/orchestrator');

exports.handler = async () => {
  try {
    const O = new MarketingOrchestrator();
    await O.runSunday();
    return { statusCode: 200, body: JSON.stringify({ ok: true, day: 'sunday' }) };
  } catch (err) {
    console.error('[marketing-sunday] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
