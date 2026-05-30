'use strict';

// contact-inquiry.js — AI4 Businesses Contact Form Handler
// Saves inquiry to Supabase and sends Resend notification to owner.

const { createClient } = require('@supabase/supabase-js');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(statusCode, payload) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(payload) };
}

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function sendResendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'AI4 Businesses <support@ai4businesses.org>',
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { success: false, error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { success: false, error: 'Invalid JSON' }); }

  const { first_name, last_name, business_name, email, phone, inquiry_type, message } = body;

  if (!first_name || !last_name || !email || !business_name || !message) {
    return json(400, { success: false, error: 'Required fields missing' });
  }

  const full_name = `${first_name} ${last_name}`.trim();
  const internalEmail = process.env.AI4_INTERNAL_NOTIFICATION_EMAIL ||
    process.env.RESEND_TO_EMAIL ||
    'support@ai4businesses.org';

  // Save to Supabase
  try {
    const supabase = getSupabase();
    await supabase.from('contact_inquiries').insert({
      full_name,
      email,
      phone: phone || null,
      business_name,
      inquiry_type: inquiry_type || 'general',
      message,
      source: 'ai4businesses.org',
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Supabase insert error:', err.message);
  }

  // Send owner notification
  try {
    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#080c10;color:#f0f6fc;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 22px;">
          <h1 style="font-size:20px;color:#f0f6fc;margin:0 0 16px;">New Contact Inquiry — AI4 Businesses</h1>
          <table style="width:100%;border-collapse:collapse;background:#0E1928;border:1px solid rgba(74,127,255,0.15);border-radius:12px;overflow:hidden;margin-bottom:20px;">
            <tr><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#8b949e;width:140px;">Name</td><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#f0f6fc;">${esc(full_name)}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#8b949e;">Email</td><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#f0f6fc;">${esc(email)}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#8b949e;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#f0f6fc;">${esc(phone || 'Not provided')}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#8b949e;">Business</td><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#f0f6fc;">${esc(business_name)}</td></tr>
            <tr><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#8b949e;">Interest</td><td style="padding:8px 12px;border-bottom:1px solid rgba(74,127,255,0.1);color:#6B9FFF;">${esc(inquiry_type || 'general')}</td></tr>
            <tr><td style="padding:8px 12px;color:#8b949e;vertical-align:top;">Message</td><td style="padding:8px 12px;color:#f0f6fc;">${esc(message)}</td></tr>
          </table>
          <p style="color:#586880;font-size:0.78rem;">Submitted via ai4businesses.org/contact</p>
        </div>
      </body></html>
    `;

    await sendResendEmail({
      to: internalEmail,
      subject: `New Inquiry: ${esc(business_name)} — ${esc(inquiry_type || 'general')}`,
      html,
    });
  } catch (emailErr) {
    console.error('Owner notification failed:', emailErr.message);
  }

  return json(200, { success: true });
};
