// netlify/functions/demo-intake.js
// Handles demo intake form submissions → logs to Supabase flowdesk_intake_records

const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse body
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // Validate required fields
  const { business_name, contact_name, contact_info, challenge } = payload;
  if (!business_name || !contact_name || !contact_info || !challenge) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  // Init Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Insert record
  const { error } = await supabase
    .from('flowdesk_intake_records')
    .insert([
      {
        business_name:   payload.business_name,
        contact_name:    payload.contact_name,
        contact_info:    payload.contact_info,
        system_interest: payload.system_interest || null,
        challenge:       payload.challenge,
        source:          payload.source || 'ai4businesses.org',
        submitted_at:    payload.submitted_at || new Date().toISOString(),
        status:          'new',
      },
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database error. Please try again.' }),
    };
  }

  // Email notification handled via RESEND_API_KEY + NOTIFY_EMAIL env vars if configured

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, message: 'Demo request received.' }),
  };
};
