// ═══════════════════════════════════════════════════════════════
// UTILITY — GOOGLE AUTH
// Manages OAuth tokens for Search Console + GA4
// ═══════════════════════════════════════════════════════════════

const config = require('../config/config');
const fs = require('fs').promises;
const TOKEN_PATH = '/tmp/google-tokens.json';

// ── GET VALID TOKENS ──────────────────────────────────────────
async function getGoogleTokens() {
  try {
    const data = await fs.readFile(TOKEN_PATH, 'utf8');
    const tokens = JSON.parse(data);

    // Check if access token is still valid (expires_at in ms)
    if (tokens.expires_at && Date.now() < tokens.expires_at - 60000) {
      return tokens;
    }

    // Refresh if expired
    return await refreshAccessToken(tokens.refresh_token);
  } catch {
    throw new Error('Google tokens not found. Run oauth-setup.js first to authorize.');
  }
}

// ── REFRESH ACCESS TOKEN ──────────────────────────────────────
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${JSON.stringify(error)}`);
  }

  const tokens = await response.json();
  const updatedTokens = {
    access_token: tokens.access_token,
    refresh_token: refreshToken,
    expires_at: Date.now() + (tokens.expires_in * 1000)
  };

  await fs.writeFile(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
  return updatedTokens;
}

// ── SAVE TOKENS (called after initial OAuth) ──────────────────
async function saveTokens(tokens) {
  const tokenData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + (tokens.expires_in * 1000)
  };
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
}

module.exports = { getGoogleTokens, saveTokens };
