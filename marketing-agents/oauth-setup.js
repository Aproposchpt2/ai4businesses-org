// ═══════════════════════════════════════════════════════════════
// OAUTH SETUP — ONE-TIME AUTHORIZATION
// Run this once to authorize Google APIs
// Command: node oauth-setup.js
// ═══════════════════════════════════════════════════════════════

const config = require('./config/config');
const { saveTokens } = require('./utils/auth');
const http = require('http');
const url = require('url');

async function startOAuthFlow() {
  console.log('\n🔐 AI4 Marketing Agent — Google OAuth Setup\n');

  // Build authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', config.google.clientId);
  authUrl.searchParams.set('redirect_uri', config.google.redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', config.google.scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log('Step 1: Open this URL in your browser:');
  console.log('\n' + authUrl.toString() + '\n');
  console.log('Step 2: Sign in with the Google account that owns:');
  console.log('  - ai4businesses.org in Search Console');
  console.log('  - AI4 Businesses GA4 property\n');
  console.log('Step 3: After authorizing, you will be redirected.');
  console.log('Copy the "code" parameter from the URL and paste it below.\n');

  // Wait for code input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Paste the authorization code here: ', async (code) => {
    rl.close();

    try {
      // Exchange code for tokens
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.google.clientId,
          client_secret: config.google.clientSecret,
          code: code.trim(),
          redirect_uri: config.google.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await response.json();

      if (tokens.error) {
        throw new Error(`Token exchange failed: ${tokens.error_description}`);
      }

      await saveTokens(tokens);

      console.log('\n✅ Google OAuth authorization complete!');
      console.log('Tokens saved to /tmp/google-tokens.json\n');
      console.log('The following APIs are now authorized:');
      console.log('  ✅ Google Search Console API');
      console.log('  ✅ Google Analytics 4 Data API\n');
      console.log('You can now run the agents:');
      console.log('  node orchestrator.js        — run today\'s task');
      console.log('  node orchestrator.js test   — run full pipeline test\n');

    } catch (error) {
      console.error('\n❌ Authorization failed:', error.message);
      console.error('Try running oauth-setup.js again.\n');
    }
  });
}

startOAuthFlow();
