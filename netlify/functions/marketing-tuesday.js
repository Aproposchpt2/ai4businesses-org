'use strict';
// Marketing Pipeline — Tuesday
// Triggers: Campaign 2 Facebook EN + ES (Facebook manual log)

const MarketingOrchestrator = require('../../marketing-agents/orchestrator');

exports.handler = async () => {
  try {
    const O = new MarketingOrchestrator();
    await O.runTuesday();
    return { statusCode: 200, body: JSON.stringify({ ok: true, day: 'tuesday' }) };
  } catch (err) {
    console.error('[marketing-tuesday] Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
