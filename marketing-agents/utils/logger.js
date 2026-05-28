// ═══════════════════════════════════════════════════════════════
// UTILITY — LOGGER
// Tracks all agent activity for monitoring and debugging
// ═══════════════════════════════════════════════════════════════

const fs = require('fs').promises;
const LOG_PATH = '/tmp/agent-activity.log';

async function logAgentActivity(agentName, status, message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    agent: agentName,
    status,
    message
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  try {
    await fs.appendFile(LOG_PATH, logLine);
  } catch {
    // Silently fail — logging should never block agent execution
  }

  // Console output
  const statusIcon = {
    started: '🚀',
    completed: '✅',
    error: '❌',
    warning: '⚠️'
  }[status] || '📝';

  console.log(`${statusIcon} [${agentName}] ${message}`);
}

async function getActivityLog() {
  try {
    const data = await fs.readFile(LOG_PATH, 'utf8');
    return data.split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

module.exports = { logAgentActivity, getActivityLog };
