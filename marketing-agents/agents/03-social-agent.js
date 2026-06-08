require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

class SocialAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // ── CAMPAIGN 1 — LinkedIn personal brand ────────────

  async createLinkedInPost(articleUrl, topic) {
    console.log('[Social C1] Creating LinkedIn post...');

    const t = topic.toLowerCase();
    const isPersonal = ['i managed','i built','i left','i learned','why i','how i',
      'i migrated','i saw','i saved','i refused','i vetted','i configured',
      'i was','i identified','what i','operator','$20','kari'].some(m => t.includes(m));

    const toneGuide = isPersonal
      ? 'First-person. This is Jeff sharing a direct insight from a real project. Reference a specific moment — a cost figure ($20/seat), a system name (UCCX, CUBE, CUCM), a regulatory term (Kari\'s Law), or a situation he was in.'
      : 'First-person from Jeff\'s perspective as the practitioner who built these systems. He shares insight earned from real deployments.';

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: 'Write a LinkedIn post from Jeffery Mitchell.\n\n'
          + 'AUTHOR: Jeffery E. Mitchell, Senior Unified Communications Engineer, founder of Apropos Group LLC / AI4 Businesses.\n\n'
          + 'BACKGROUND (use these specific details for credibility):\n'
          + '- Designed Cisco UCCX IVR for College of Southern Nevada: 2,100+ users, 100+ departments. '
          + 'One operator was manually routing every single call for high-volume departments. His IVR fixed it.\n'
          + '- Led Teams Enterprise Voice migration of 2,000+ users. Outside vendors wanted $20/seat/month. '
          + 'He vetted them, said no, engineered it in-house using existing Cox SIP, own Cisco CUBE as SBC via Direct Routing, '
          + 'already-owned Teams licenses. Had to contract Intrado for E911 — Kari\'s Law and Ray Baum\'s Act compliance.\n'
          + '- Emergency WebEx Teams deployment for 1,800 faculty/staff during COVID-19.\n'
          + '- Cisco CME for a Veterans Affairs medical facility.\n'
          + '- UCCX auto-attendant for DWED Community Outreach: 70 staff, 8 departments.\n\n'
          + 'WHY HE BUILT THE PRODUCTS: He watched small businesses get priced out of the same enterprise communication '
          + 'stacks he built for institutions. He rebuilt it in AI. FlowDesk Pro = enterprise contact center at SMB price. '
          + 'CapGen = AI capability statement generator for federal contractors.\n\n'
          + 'Article topic: ' + topic + '\n'
          + 'Article URL: ' + articleUrl + '\n\n'
          + 'Tone: ' + toneGuide + '\n\n'
          + 'Requirements:\n'
          + '- First-person voice — Jeff speaking directly to his professional network of engineers and business professionals\n'
          + '- Open with a specific practitioner-level insight — something only someone who has done this work would say\n'
          + '- 150-200 words\n'
          + '- Reference FlowDesk Pro (https://aiflowdeskpro.com) and/or CapGen (https://capgen.aproposgroupllc.com) naturally\n'
          + '- End with article link\n'
          + '- 3-5 hashtags from: #UnifiedCommunications #AI #NetworkEngineering #SmallBusiness #BusinessAutomation #FlowDeskPro #CapGen #MicrosoftTeams #DirectRouting\n'
          + '- Tone: senior engineer sharing real experience with peers — not a marketer\n\n'
          + 'Return post only. No preamble.'
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
        content: 'Write a Sunday LinkedIn teaser post from Jeffery Mitchell.\n\n'
          + 'AUTHOR: Senior UC Engineer who managed Cisco UCCX for 2,100 users, led a 2,000-user Teams migration by '
          + 'refusing a $20/seat vendor and engineering it in-house, deployed WebEx Teams for 1,800 people during COVID. '
          + 'Founder of FlowDesk Pro and CapGen.\n\n'
          + 'Monday article topic: ' + topic + '\n\n'
          + 'Requirements:\n'
          + '- First-person, practitioner voice\n'
          + '- 80-120 words\n'
          + '- Build curiosity for Monday\'s article — hint at the insight from a real project without giving it away\n'
          + '- Anchor to something real: a cost figure, a system, a moment from his work\n'
          + '- Link to https://ai4businesses.org\n'
          + '- 3 hashtags max\n\n'
          + 'Return post only. No preamble.'
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
        content: 'Write a Facebook post from Jeffrey Mitchell\'s personal page.\n\n'
          + 'Angle: ' + angle + '\n\n'
          + 'Context: Personal page post — warm, genuine, like a friend sharing something useful they built.\n\n'
          + 'Requirements:\n'
          + '- Personal, conversational tone\n'
          + '- 150-200 words\n'
          + '- Highlight the free website builder\n'
          + '- Key differentiator: "See your site live before you approve it" — no competitor offers this\n'
          + '- Include the income/agency angle naturally: ambitious visitors can see a business opportunity here\n'
          + '- CTA: platinum.ai4websitedesign.com\n'
          + '- 3-5 hashtags\n\n'
          + 'Return post only. No preamble.'
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
        content: 'Escribe un post de Facebook personal de Jeffrey Mitchell en espanol.\n\n'
          + 'Angulo: ' + angle + '\n\n'
          + 'Contexto: Post personal, no de marca. Como un amigo compartiendo algo util.\n\n'
          + 'Requisitos:\n'
          + '- Tono personal, calido, conversacional\n'
          + '- 150-200 palabras\n'
          + '- Destaca el constructor de sitios web gratuito\n'
          + '- Diferenciador: "Ve tu sitio EN VIVO antes de aprobarlo"\n'
          + '- Incluye el angulo de oportunidad de negocio de forma natural\n'
          + '- Link: espanola.ai4websitedesign.com\n'
          + '- 3-5 hashtags en espanol\n\n'
          + 'Devuelve solo el post. Sin preambulo.'
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — TikTok ──────────────────────────────

  async createTikTokScript(angle) {
    console.log('[Social C2] Creating TikTok script...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: 'Write a TikTok video script for AI4 Website Design Studio.\n'
          + 'Angle: ' + angle + '\n'
          + 'Requirements:\n'
          + '- 45-60 seconds when spoken aloud\n'
          + '- Hook in first 3 seconds\n'
          + '- Highlight: "See your site LIVE before you approve it"\n'
          + '- No competitor offers this\n'
          + '- CTA: platinum.ai4websitedesign.com\n'
          + '- Labels: [HOOK] [DEMO] [CTA]\n\n'
          + 'Return script only. No preamble.'
      }]
    });
    return response.content[0].text.trim();
  }

  // ── CAMPAIGN 2 — Instagram ───────────────────────────

  async createInstagramCaption(angle) {
    console.log('[Social C2] Creating Instagram caption EN...');
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: 'Write an Instagram caption for AI4 Website Design Studio.\n'
          + 'Angle: ' + angle + '\n'
          + 'Requirements:\n'
          + '- 100-150 words, strong visual hook opening\n'
          + '- Highlight: "See your site LIVE before you approve it"\n'
          + '- No competitor offers this\n'
          + '- CTA: Link in bio -> platinum.ai4websitedesign.com\n'
          + '- 10-15 hashtags\n\n'
          + 'Return caption only. No preamble.'
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
        content: 'Escribe un caption de Instagram en espanol para AI4 Website Design Studio.\n'
          + 'Angulo: ' + angle + '\n'
          + 'Requisitos:\n'
          + '- 100-150 palabras\n'
          + '- Destaca: "Ve tu sitio EN VIVO antes de aprobarlo"\n'
          + '- Ningun competidor ofrece esto\n'
          + '- Link: espanola.ai4websitedesign.com\n'
          + '- 10-15 hashtags en espanol\n\n'
          + 'Devuelve solo el caption. Sin preambulo.'
      }]
    });
    return response.content[0].text.trim();
  }
}

module.exports = SocialAgent;
