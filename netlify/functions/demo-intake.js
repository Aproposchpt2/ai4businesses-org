'use strict';

// netlify/functions/demo-intake.js
// Handles demo intake form submissions from ai4businesses.org
// 1. Saves lead to Supabase lead_manager_records
// 2. Sends email notification to NOTIFY_EMAIL

const { createClient } = require('@supabase/supabase-js');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { business_name, contact_name, contact_info, system_interest, challenge } = payload;

  if (!business_name || !contact_name || !contact_info || !challenge) {
    return {
      statusCode: 422,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  const now = new Date().toISOString();

  // ── 1. Save to Supabase lead_manager_records ──────────────────
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from('lead_manager_records')
      .insert([{
        business_name,
        contact_name,
        email:          contact_info.includes('@') ? contact_info : null,
        phone:          !contact_info.includes('@') ? contact_info : null,
        service_needed: system_interest || 'Demo Request',
        message:        challenge,
        source:         'ai4businesses.org',
        channel:        'web',
        lead_status:    'New / Needs Review',
        follow_up_needed: true,
        created_at:     now,
        updated_at:     now,
      }]);

    if (error) console.error('[demo-intake] Supabase error:', error.message);
    else console.log('[demo-intake] Lead saved to lead_manager_records');
  } catch (err) {
    console.error('[demo-intake] Supabase exception:', err.message);
  }

  // ── 2. Send email notification to owner ───────────────────────
  const notifyEmail = process.env.OWNER_NOTIFICATION_EMAIL || process.env.RESEND_TO_EMAIL;
  const resendKey   = process.env.RESEND_API_KEY;

  if (notifyEmail && resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    process.env.RESEND_FROM_EMAIL || 'AI4 Businesses <notifications@ai4businesses.org>',
          to:      notifyEmail,
          subject: `New Demo Request — ${business_name}`,
          html: `
            <div style="font-family:Arial,sans-serif;background:#07111f;color:#f5f8ff;padding:28px;border-radius:16px;max-width:600px;margin:0 auto">
              <div style="color:#4A7FFF;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;margin-bottom:14px">AI4 Businesses — New Demo Request</div>
              <h2 style="color:#fff;margin:0 0 16px">New Demo Request: ${esc(business_name)}</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:7px;color:#90A3BC;width:140px">Business</td><td style="padding:7px;color:#fff">${esc(business_name)}</td></tr>
                <tr><td style="padding:7px;color:#90A3BC">Contact</td><td style="padding:7px;color:#fff">${esc(contact_name)}</td></tr>
                <tr><td style="padding:7px;color:#90A3BC">Contact Info</td><td style="padding:7px;color:#4A7FFF">${esc(contact_info)}</td></tr>
                <tr><td style="padding:7px;color:#90A3BC">System Interest</td><td style="padding:7px;color:#fff">${esc(system_interest || 'Not specified')}</td></tr>
                <tr><td style="padding:7px;color:#90A3BC;vertical-align:top">Challenge</td><td style="padding:7px;color:#fff">${esc(challenge)}</td></tr>
                <tr><td style="padding:7px;color:#90A3BC">Submitted</td><td style="padding:7px;color:#90A3BC">${now}</td></tr>
              </table>
            </div>
          `,
        }),
      });

      if (res.ok) console.log('[demo-intake] Notification sent to', notifyEmail);
      else console.error('[demo-intake] Resend error:', await res.text());
    } catch (err) {
      console.error('[demo-intake] Email exception:', err.message);
    }
  } else {
    console.warn('[demo-intake] NOTIFY_EMAIL or RESEND_API_KEY not set — email skipped');
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, message: 'Demo request received.' }),
  };
};
