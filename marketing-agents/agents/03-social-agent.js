require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

class SocialAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // ── CAMPAIGN 1 — LinkedIn only ──────────────────────

  async createLinkedInPost(articleUrl, topic) {
    console.log('[Social C1] Creating LinkedIn post...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a LinkedIn post for a B2B audience.
Topic: ${topic}
Article URL: ${articleUrl}

Requirements:
- Hook in first line — no "I" opener
- 150-200 words
- Promote Fast Track Bundle $349/month
- Tagline: "Never miss a lead from day one"
- End with article link
- 3-5 relevant hashtags
- Professional but energetic tone

Return post only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  async createLinkedInTeaser(topic) {
    console.log('[Social C1] Creating LinkedIn Sunday teaser...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Write a Sunday LinkedIn teaser post for AI business automation.
Topic angle: ${topic}

Requirements:
- 80-120 words
- Drive curiosity about Monday's article
- Reference Fast Track Bundle $349/month
- Link to: https://ai4businesses.org
- 3 hashtags max

Return post only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — TikTok + Instagram + Facebook ──────

  async createTikTokScript(angle) {
    console.log('[Social C2] Creating TikTok script...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Write a TikTok video script for AI4 Website Design Studio.
Angle: ${angle}

Requirements:
- 45-60 seconds when spoken aloud
- Hook in first 3 seconds — stop the scroll
- Highlight live template + color switching
- "See your site LIVE before you approve it"
- No competitor offers this — emphasize it
- CTA: Visit ai4websitedesign.com
- Format with labels: [HOOK] [DEMO] [CTA]

Return script only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  async createInstagramCaption(angle) {
    console.log('[Social C2] Creating Instagram caption EN...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Write an Instagram caption for AI4 Website Design Studio.
Angle: ${angle}

Requirements:
- 100-150 words
- Strong visual hook opening line
- Highlight: "See your site LIVE before you approve it"
- Live template + color switching — unrivaled, no competitor offers this
- CTA: Link in bio → ai4websitedesign.com
- 10-15 hashtags at end

Return caption only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  async createInstagramCaptionSpanish(angle) {
    console.log('[Social C2] Creating Instagram caption ES...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Escribe un caption de Instagram en español para AI4 Website Design Studio.
Ángulo: ${angle}

Requisitos:
- 100-150 palabras
- Destaca: "Ve tu sitio EN VIVO antes de aprobarlo"
- Cambio de plantillas y colores en tiempo real — ningún competidor ofrece esto
- Link: espanola.ai4websitedesign.com
- 10-15 hashtags en español al final

Devuelve solo el caption. Sin preámbulo.`
      }]
    });
    return response.content[0].text.trim();
  }

  async createFacebookPost(angle) {
    console.log('[Social C2] Creating Facebook post EN...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `Write a Facebook community post for small business owners.
Angle: ${angle}

Requirements:
- 150-200 words
- Community-friendly, helpful tone
- Include a question to drive engagement
- Highlight: "See your site LIVE before you approve it"
- Live template + color switching — no competitor offers this
- CTA: ai4websitedesign.com
- 3-5 hashtags

Return post only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  async createFacebookPostSpanish(angle) {
    console.log('[Social C2] Creating Facebook post ES...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `Escribe un post de Facebook para pequeños empresarios en español.
Ángulo: ${angle}

Requisitos:
- 150-200 palabras
- Tono de comunidad, útil y accesible
- Incluye una pregunta para generar engagement
- Destaca: "Ve tu sitio EN VIVO antes de aprobarlo"
- Cambio de plantillas y colores — ningún competidor ofrece esto
- Link: espanola.ai4websitedesign.com
- 3-5 hashtags en español

Devuelve solo el post. Sin preámbulo.`
      }]
    });
    return response.content[0].text.trim();
  }
}

module.exports = SocialAgent;
