require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const AUTHOR_VOICE = `
AUTHOR: Jeffery E. Mitchell — Senior Unified Communications Engineer. Founder of Apropos Group LLC and AI4 Businesses.

DOCUMENTED PROJECT EXPERIENCE — reference these specific details to write with real authority:

STORY 1 — THE DROWNING OPERATOR (IVR Origin Story):
Jeff identified that departments at the College of Southern Nevada were fielding extremely high call volumes with a single operator trying to manually answer and route every call — fielding each one by hand, routing to the right department, over and over. He designed and deployed a Cisco UCCX IVR and Auto-Attendant architecture to solve it: automated call flows, department queues, and IVR scripts integrated with Cisco CUCM across 2,100+ users and 100+ departments. The single operator's burden was eliminated. Calls reached the right destination automatically.
WHY IT MATTERS FOR LINKEDIN: This exact situation — one person manually handling every incoming call — is what most small businesses deal with daily. They either miss calls or exhaust staff. FlowDesk Pro is the affordable AI version of what Jeff built at the college.

STORY 2 — THE $20/SEAT REFUSAL (Teams Migration Origin Story):
The college was evaluating outside agencies that wanted to charge $20 per seat per month to manage the migration to Microsoft Teams Enterprise Voice. Jeff was tasked to vet these vendors. He sat across from them, reviewed their proposals, and identified a better path: do it in-house and engineer the entire solution himself.

His cost-saving engineering decisions:
- Kept the college's existing Cox Communications SIP trunks — no number porting, no porting fees, no new provider onboarding cost
- Configured the college's own Cisco CUBE router as the SBC for Microsoft Teams Direct Routing — no outside vendor, no new hardware
- Used Microsoft Teams calling licenses the college had already paid for but never activated — zero additional licensing cost
- Eliminated the $20/seat/month recurring management fee entirely

He started with a small staff POC that validated the approach. The migration bottleneck was regulatory, not technical: achieving compliance with Kari's Law and the Ray Baum's Act required contracting Intrado for an E911 solution. While waiting on the Intrado E911 configuration, Jeff continued building the Microsoft Teams environment in parallel so no time was wasted. The migration of 2,000+ users across 100+ departments was completed successfully.
WHY IT MATTERS FOR LINKEDIN: Small businesses and organizations are being quoted similar enterprise vendor fees for phone systems, contact center tools, and communication infrastructure they could have for a fraction of the cost. Jeff's experience vetting vendors and engineering the in-house solution is what led him to build FlowDesk Pro — the enterprise communication stack without the enterprise pricing.

STORY 3 — COVID DEPLOYMENT:
Engineered emergency migration of 1,800 faculty and staff to Cisco WebEx Teams during COVID-19 — under crisis conditions and time pressure. Eliminated the need for employees to forward calls to personal cell phones and maintained operational continuity across the entire college.

STORY 4 — VA MEDICAL FACILITY:
Deployed Cisco CME voice infrastructure for a Veterans Affairs medical facility — SIP trunks via Cox, voice gateways, dial plans, IP endpoints supporting clinical and administrative operations.

STORY 5 — DWED COMMUNITY OUTREACH CENTER:
Designed UCCX auto-attendant and call flow architecture for 70 staff across 8 departments including workforce development, ESL training, medical programs.

LINKEDIN AUDIENCE: Jeff's professional contacts are ex co-workers, senior network engineers, IT professionals, and peers from higher education, healthcare, government, and enterprise environments. Many of them have been in the same room when vendors quote $20/seat for something the organization already owns. Posts should feel like a credible peer sharing a real insight — not a founder pitching a product.

THE "WHY" CORE STATEMENT:
Jeff built FlowDesk Pro because he spent years building the exact systems small businesses can't afford — UCCX, CUCM, enterprise auto-attendants, direct routing. He watched organizations get quoted $20/seat by outside vendors for migrations they could engineer in-house. He watched single operators drown in call volume because departments couldn't afford proper IVR systems. He rebuilt all of it in AI at a price any business can afford. No hardware. No licensing treadmill. No specialized engineers required.

PRODUCTS:
- FlowDesk Pro: AI contact center + CRM + lead management. Fast Track Bundle $349/month. https://aiflowdeskpro.com — "Never miss a lead from day one."
- CapGen: AI capability statement generator for federal contractors. SAM.gov verified, branded PDF. https://capgen.aproposgroupllc.com
`.trim();

class SocialAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // ── CAMPAIGN 1 — LinkedIn personal brand ────────────

  async createLinkedInPost(articleUrl, topic) {
    console.log('[Social C1] Creating LinkedIn post...');

    const isPersonalTopic = [
      'i managed', 'i built', 'i left', 'i learned', 'why i', 'how i',
      'i migrated', 'i saw', 'i saved', 'i refused', 'i vetted', 'i configured',
      'i was', 'i identified', 'what i', 'operator', '$20', 'kari'
    ].some(m => topic.toLowerCase().includes(m));

    const toneGuide = isPersonalTopic
      ? `This is Jeff sharing a direct insight from a real project. Write in first-person. Reference a specific moment, cost figure, system name, or regulatory detail from his background. His LinkedIn contacts will recognize it as real because many of them have been in the same situations.`
      : `Write in first-person from Jeff's perspective as a practitioner who has built these systems. He is sharing insight earned from real deployments — not theory.`;

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
- First-person voice throughout
- Open with a specific practitioner insight — something that only someone who has been in these technical environments would say. Use real system names, cost figures, regulatory terms, or project specifics where they strengthen the point.
- 150-200 words
- Reference FlowDesk Pro (https://aiflowdeskpro.com) and/or CapGen (https://capgen.aproposgroupllc.com) as the solution he built — not as products being pitched
- End with the article link
- 3-5 hashtags from: #UnifiedCommunications #AI #NetworkEngineering #SmallBusiness #BusinessAutomation #FlowDeskPro #CapGen #MicrosoftTeams #DirectRouting #UCCX
- Tone: Senior engineer sharing real experience with peers. Not a marketer. Not a founder pitching. The product mention should feel like a natural consequence of the story — not the point of the post.

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
- Build curiosity for Monday's article — hint at the specific insight without giving it away
- Anchor to a real moment from his work: a cost figure ($20/seat), a regulatory term (Kari's Law), a system he managed (UCCX, CUBE, CUCM), a situation he was in (vetting vendors, watching an operator drown in calls, doing a COVID deployment)
- Link to https://ai4businesses.org
- 3 hashtags max

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

Context: Jeffrey is sharing this with his personal network — friends, family, and local connections. This is a personal page post, not a brand post. It should feel warm and genuine, like a friend sharing something useful.

Requirements:
- Personal, conversational tone
- 150-200 words
- Highlight the free website builder
- Key differentiator: "See your site live before you approve it" — no competitor offers this
- Include the income opportunity angle naturally: ambitious readers can see a business opportunity here
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

Contexto: Post personal, no de marca. Debe sentirse como un amigo compartiendo algo útil.

Requisitos:
- Tono personal, cálido, conversacional
- 150-200 palabras
- Destaca el constructor de sitios web gratuito
- Diferenciador: "Ve tu sitio EN VIVO antes de aprobarlo"
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
- 45-60 seconds spoken aloud
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
- 100-150 words, strong visual hook opening
- "See your site LIVE before you approve it" — no competitor offers this
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
- "Ve tu sitio EN VIVO antes de aprobarlo" — ningún competidor ofrece esto
- Link: espanola.ai4websitedesign.com
- 10-15 hashtags en español
Devuelve solo el caption. Sin preámbulo.`
      }]
    });
    return response.content[0].text.trim();
  }
}

module.exports = SocialAgent;
