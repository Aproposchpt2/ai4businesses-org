require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const AUTHOR_VOICE = `
Author: Jeffrey Mitchell — Senior Network Engineer (20+ years), founder of Apropos Group LLC and AI4 Businesses. Built FlowDesk Pro (AI contact center + CRM for small businesses) and CapGen (AI capability statement generator for federal contractors) from the ground up. His LinkedIn profile documents years of enterprise network infrastructure work. His professional contacts are ex co-workers, senior engineers, and professional peers who know him as a credible technical operator.
`.trim();

class SocialAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // ── CAMPAIGN 1 — LinkedIn (personal brand + products) ──

  async createLinkedInPost(articleUrl, topic) {
    console.log('[Social C1] Creating LinkedIn post...');

    const isPersonalTopic = ['i built', 'i left', 'i learned', 'why i', 'network engineer', 'what i', 'my ']
      .some(m => topic.toLowerCase().includes(m));

    const toneInstruction = isPersonalTopic
      ? `Write in first-person. This is Jeffrey sharing a personal insight from his experience. It should feel authentic — a practitioner sharing what they know, not a brand pushing a product.`
      : `Write in first-person from Jeffrey's perspective as the builder and operator. Reference his technical background where it adds credibility.`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a LinkedIn post from Jeffrey Mitchell's perspective.

${AUTHOR_VOICE}

Topic: ${topic}
Article URL: ${articleUrl}

Tone: ${toneInstruction}

Requirements:
- First-person voice — Jeffrey is speaking directly to his professional network
- Hook in the first line that speaks to a practitioner audience (engineers, business owners, professionals who know Jeffrey's background)
- 150-200 words
- Reference both FlowDesk Pro (https://aiflowdeskpro.com) and CapGen (https://capgen.aproposgroupllc.com) where relevant to the topic
- End with the article link
- 3-5 relevant hashtags: mix of #AI #NetworkEngineering #BusinessAutomation #SmallBusiness #CapGen or #FlowDeskPro
- Tone: credible, experienced practitioner — not a marketer. Jeffrey's 20 years of network engineering background lends weight to everything he says about systems.

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
        content: `Write a Sunday LinkedIn teaser post from Jeffrey Mitchell.

${AUTHOR_VOICE}

Topic angle for Monday's article: ${topic}

Requirements:
- First-person voice from Jeffrey
- 80-120 words
- Build curiosity for Monday's article without giving it away
- Lean into Jeffrey's background — something only a 20-year network engineer turned AI builder would know or say
- Reference ai4businesses.org
- 3 hashtags max: pick from #AI #NetworkEngineering #BusinessAutomation #SmallBusiness #FlowDeskPro #CapGen

Return post only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — Facebook personal page ─────────────

  async createFacebookPost(angle) {
    console.log('[Social C2] Creating Facebook post EN...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `Write a Facebook post from Jeffrey Mitchell's personal page.

Angle: ${angle}

Context: Jeffrey is sharing this with his personal Facebook network — friends, family, local connections, and people who know him personally. This is NOT a brand page post. It should feel personal and genuine, like a friend telling you about something useful.

Requirements:
- Personal, warm, conversational tone — not corporate
- 150-200 words
- Highlight the free website builder offer
- Key differentiator: "See your site live before you approve it" — no competitor offers this
- Include the agency/income angle where it fits naturally: ambitious visitors can see a business opportunity here
- CTA: platinum.ai4websitedesign.com
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
        content: `Escribe un post de Facebook personal de Jeffrey Mitchell en español.

Ángulo: ${angle}

Contexto: Jeffrey comparte esto en su página personal de Facebook con amigos, familia y contactos locales. NO es un post de página de marca. Debe sentirse personal y genuino.

Requisitos:
- Tono personal, cálido, conversacional — no corporativo
- 150-200 palabras
- Destaca la oferta del constructor de sitios web gratis
- Diferenciador clave: "Ve tu sitio EN VIVO antes de aprobarlo" — ningún competidor ofrece esto
- Incluye el ángulo de ingreso/agencia donde encaje: los visitantes ambiciosos pueden ver una oportunidad de negocio
- Link: espanola.ai4websitedesign.com
- 3-5 hashtags en español

Devuelve solo el post. Sin preámbulo.`
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — TikTok (for future use) ────────────

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
- CTA: Visit platinum.ai4websitedesign.com
- Format with labels: [HOOK] [DEMO] [CTA]

Return script only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — Instagram (for future use) ─────────

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
- CTA: Link in bio → platinum.ai4websitedesign.com
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
}

module.exports = SocialAgent;
