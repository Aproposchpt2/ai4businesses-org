require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const AUTHOR_VOICE = `
AUTHOR: Jeffery E. Mitchell — Senior Unified Communications Engineer, Founder of Apropos Group LLC and AI4 Businesses.

DOCUMENTED PROJECT EXPERIENCE (reference these specifics to write with real authority):
- Designed and deployed Cisco UCCX IVR architecture at the College of Southern Nevada: 2,100+ users, 100+ departments, automated call flows, department queues, IVR scripts integrated with Cisco CUCM. Ongoing operational management of the contact center system.
- Led full lifecycle migration of 2,000+ users to Microsoft Teams Enterprise Voice across 100+ departments using Cisco CUBE SBC Direct Routing — replaced legacy Cisco CUCM, Unity Connection, and UCCX, eliminating long-term licensing, hardware, and support costs.
- Engineered emergency WebEx Teams deployment for 1,800 faculty and staff during COVID-19 — maintained operational continuity, eliminated cell phone forwarding across the college.
- Deployed Cisco CME voice infrastructure for a Veterans Affairs medical facility — SIP trunks, voice gateways, dial plans, clinical and administrative IP endpoints.
- Designed UCCX auto-attendant and call flow architecture for DWED Community Outreach Center: 70 staff, 8 departments including workforce development, ESL, medical programs.
- Managed FreePBX VoIP environment for Eye Surgery Centers — SIP configuration, endpoint provisioning, dial plan management.

LINKEDIN AUDIENCE: Jeff's professional network includes ex co-workers, senior network engineers, IT professionals, and peers from higher education, healthcare, government, and enterprise environments. They know his technical background firsthand. Posts should feel like a practitioner speaking to peers — not a founder selling a product.

THE "WHY" THAT SHOULD RUN THROUGH ALL LINKEDIN CONTENT:
Jeff built FlowDesk Pro because he spent years managing the exact enterprise contact center systems — Cisco UCCX, CUCM, Unity Connection — that small businesses can't afford. The hardware costs, the Cisco licensing, the support contracts, the need for specialized engineers, the endless upgrade cycles just to keep current. He rebuilt the same functionality in AI at a price any small business can afford. No hardware. No licensing treadmill. FlowDesk Pro is the enterprise contact center stack, without the enterprise price tag. He built CapGen after seeing the documentation and compliance burden that blocks small businesses and federal contractors from competing for government work.

PRODUCTS:
- FlowDesk Pro: AI contact center + CRM + lead management. Fast Track Bundle $349/month. https://aiflowdeskpro.com — "Never miss a lead from day one."
- CapGen: AI capability statement generator for federal contractors. SAM.gov verified data, branded PDF, submission ready. https://capgen.aproposgroupllc.com
`.trim();

class SocialAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // ── CAMPAIGN 1 — LinkedIn personal brand ────────────

  async createLinkedInPost(articleUrl, topic) {
    console.log('[Social C1] Creating LinkedIn post...');

    const isPersonalTopic = ['i managed', 'i built', 'i left', 'i learned', 'why i', 'how i', 'i migrated', 'i saw', 'what i']
      .some(m => topic.toLowerCase().includes(m));

    const toneGuide = isPersonalTopic
      ? `This is Jeff sharing a direct personal insight from his career. Write in first-person. Reference a specific project from his background where it strengthens the point. His LinkedIn contacts know he did this work — the specificity is what makes it credible.`
      : `Write in first-person from Jeff's practitioner perspective. He built FlowDesk Pro and CapGen because he saw the problem firsthand in the enterprise environments he managed. That experience is the authority.`;

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a LinkedIn post from Jeffery Mitchell.

${AUTHOR_VOICE}

Article topic: ${topic}
Article URL: ${articleUrl}

Tone guidance: ${toneGuide}

Requirements:
- First-person voice — Jeff is speaking directly to his professional network of engineers and business professionals
- Open with a specific, practitioner-level insight — not a generic hook. Something his ex co-workers and engineering peers would immediately recognize as real
- 150-200 words
- Reference FlowDesk Pro (https://aiflowdeskpro.com) and/or CapGen (https://capgen.aproposgroupllc.com) as the solution he built, not as products being marketed
- End with the article link
- 3-5 hashtags from: #UnifiedCommunications #AI #NetworkEngineering #SmallBusiness #BusinessAutomation #FlowDeskPro #CapGen #CiscoUCCX #EnterpriseTech
- Tone: senior engineer who built things, not a marketer who sells things

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
        content: `Write a Sunday LinkedIn teaser post from Jeffery Mitchell.

${AUTHOR_VOICE}

Monday article topic: ${topic}

Requirements:
- First-person, practitioner voice
- 80-120 words
- Build curiosity for Monday's article — hint at the insight without giving it away
- Draw from a specific real experience from his portfolio where it adds weight (UCCX at CSN, Teams migration, COVID deployment, VA facility, etc.)
- Link to https://ai4businesses.org
- 3 hashtags max from: #UnifiedCommunications #AI #NetworkEngineering #SmallBusiness #BusinessAutomation

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

Context: Jeffrey is sharing this with his personal Facebook network — friends, family, local connections. This is NOT a brand page post. It should feel personal, genuine, and helpful — like a friend telling you about something useful they built.

Requirements:
- Personal, warm, conversational tone
- 150-200 words
- Highlight the free website builder
- Key differentiator: "See your site live before you approve it" — no competitor offers this
- Include the income/agency angle naturally: someone ambitious can see a business opportunity here
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

Contexto: Jeffrey comparte esto en su página personal de Facebook. Debe sentirse personal y genuino — como un amigo compartiendo algo útil que construyó.

Requisitos:
- Tono personal, cálido, conversacional
- 150-200 palabras
- Destaca el constructor de sitios web gratuito
- Diferenciador clave: "Ve tu sitio EN VIVO antes de aprobarlo"
- Incluye el ángulo de oportunidad de negocio de forma natural
- Link: espanola.ai4websitedesign.com
- 3-5 hashtags en español

Devuelve solo el post. Sin preámbulo.`
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — TikTok (future use) ────────────────

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
- Hook in first 3 seconds
- Highlight: "See your site LIVE before you approve it"
- No competitor offers this
- CTA: platinum.ai4websitedesign.com
- Labels: [HOOK] [DEMO] [CTA]
Return script only. No preamble.`
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — Instagram (future use) ─────────────

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
- No competitor offers this
- CTA: Link in bio → platinum.ai4websitedesign.com
- 10-15 hashtags
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
- Ningún competidor ofrece esto
- Link: espanola.ai4websitedesign.com
- 10-15 hashtags en español
Devuelve solo el caption. Sin preámbulo.`
      }]
    });
    return response.content[0].text.trim();
  }
}

module.exports = SocialAgent;
