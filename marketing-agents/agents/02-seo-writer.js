require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const AUTHOR_BIO = `
AUTHOR: Jeffery E. Mitchell — Senior Unified Communications Engineer. Founder of Apropos Group LLC and AI4 Businesses.

DOCUMENTED PROJECT EXPERIENCE — use these specific details to write with real authority:

PROJECT 1 — Cisco UCCX IVR Architecture, College of Southern Nevada:
Jeff identified that individual departments were fielding an extremely high volume of calls with a single operator trying to manually answer and route every call — creating constant stress and missed calls. His solution was to design and deploy a Cisco UCCX IVR and Auto-Attendant architecture supporting 2,100+ users and 100+ departments across a multi-campus environment. Automated call flows, department queues, and IVR scripts were integrated with Cisco Unified Communications Manager (CUCM). This eliminated the manual routing burden and ensured no call went unanswered. Jeff provides ongoing operational management and optimization of this system.
CONNECTION TO FLOWDESK PRO: The overwhelmed single operator manually routing every call is exactly the problem FlowDesk Pro solves for small businesses today — through AI-powered auto-attendant and intelligent call routing at a price any business can afford.

PROJECT 2 — Microsoft Teams Enterprise Voice Migration, Multi-Campus:
The College was evaluating outside agencies that wanted to charge $20 per seat per month to manage the migration to Microsoft Teams Enterprise Voice. Jeff was tasked to vet these companies. After evaluating the proposals, he identified a better path: engineer the migration in-house and eliminate the recurring vendor cost entirely.

Key cost-saving decisions he made:
- KEPT the existing Cox Communications SIP trunks — no number porting, no porting fees, no new provider onboarding costs
- CONFIGURED the college's own Cisco CUBE router as the Session Border Controller (SBC) to connect to Microsoft Teams via Direct Routing — no outside vendor, no new hardware required
- USED Microsoft Teams calling licenses the college had already purchased and owned but was not actively using — zero additional licensing cost
- ENGINEERED the entire solution in-house, eliminating the $20/seat/month ongoing management fee

Process: Jeff started with a small staff group POC that was successful. The migration bottleneck was not technical — it was regulatory. He had to contract Intrado to provide the E911 solution to achieve compliance with Kari's Law and the Ray Baum's Act before migrating all staff and faculty. While waiting on the Intrado E911 configuration, Jeff continued configuring the Microsoft Teams environment in parallel to keep the project moving. Migration of 2,000+ users across 100+ departments was completed successfully.
CONNECTION TO FLOWDESK PRO: Small businesses are being quoted similar enterprise management fees for phone systems and contact center tools they cannot afford. Jeff built FlowDesk Pro to give those businesses the same intelligent communication stack — AI auto-attendant, call queuing, lead capture, CRM — without the hardware, the licensing fees, or the $20-per-seat recurring cost.

PROJECT 3 — COVID WebEx Teams Deployment:
Engineered the rapid migration of approximately 1,800 faculty and staff to Cisco WebEx Teams for remote work and remote classroom collaboration during COVID-19. Integrated enterprise voice and collaboration services to eliminate departmental call forwarding to personal cell phones and maintain full operational continuity.

PROJECT 4 — VA Medical Facility Telephony:
Engineered and deployed Cisco Unified Communications Manager Express (CME) voice infrastructure for a Veterans Affairs medical facility. SIP trunk integration with Cox Communications, voice gateways, dial plans, and IP endpoints supporting clinical and administrative operations.

PROJECT 5 — DWED Community Outreach Center:
Designed Cisco UCCX auto-attendant and call flow architecture for a high-volume community outreach facility — 70 staff, 8 departments including workforce development, ESL training, medical programs, and administrative services.

PROJECT 6 — Eye Surgery Centers:
Managed FreePBX-based VoIP environment — SIP trunk configuration, endpoint provisioning, dial plan management for medical office operations.

THE "WHY" NARRATIVE — this should thread through all content:
Jeff spent years building and managing the enterprise communication systems that large organizations use and that small businesses can't afford. He watched organizations get quoted $20/seat/month by outside vendors for systems they already owned licenses for. He watched single operators drown in call volume because departments couldn't afford proper IVR systems. He watched businesses pay for Cisco hardware, licensing, support contracts, and compliance work that required specialized engineers. He built FlowDesk Pro to bring those same capabilities — intelligent auto-attendants, call queues, IVR routing, lead capture, CRM — to small and mid-size businesses through AI at a fraction of the cost. No hardware. No licensing treadmill. No specialized engineers required. He built CapGen after watching the documentation and compliance burden block small businesses from competing for federal contracts.

PRODUCTS:
- FlowDesk Pro: AI contact center + CRM + lead management. Fast Track Bundle $349/month. https://aiflowdeskpro.com — "Never miss a lead from day one."
- CapGen: AI capability statement generator for federal contractors. SAM.gov verified, branded PDF. https://capgen.aproposgroupllc.com

WRITING RULE: The specificity of these real projects is what makes this content impossible to replicate. Numbers, system names, regulatory requirements, cost decisions — these are the details that establish credibility on LinkedIn and differentiate these articles from every generic AI automation piece on the internet.
`.trim();

class SEOWriterAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  isPersonalStoryTopic(topic) {
    const personalMarkers = [
      'i managed', 'i built', 'i left', 'i learned', 'why i', 'how i',
      'i migrated', 'i saw', 'i spent', 'i saved', 'i refused', 'i configured',
      'what i', 'my ', "i've", 'i was', 'i identified'
    ];
    return personalMarkers.some(m => topic.toLowerCase().includes(m));
  }

  getCtaBlock(topic) {
    if (topic.toLowerCase().includes('capgen') || topic.toLowerCase().includes('federal') || topic.toLowerCase().includes('capability statement')) {
      return `Primary CTA drives to CapGen at https://capgen.aproposgroupllc.com\nTagline: "Generate your capability statement in minutes — SAM.gov verified data, branded PDF, submission ready."\nSecondary mention of FlowDesk Pro (https://aiflowdeskpro.com) where relevant.`;
    }
    return `Primary CTA drives to FlowDesk Pro Fast Track Bundle ($349/month) at https://aiflowdeskpro.com\nTagline: "Never miss a lead from day one."\nSecondary mention of CapGen (https://capgen.aproposgroupllc.com) where relevant.`;
  }

  async writeArticle(topic) {
    console.log(`[SEO Writer] Writing: ${topic}`);

    const isPersonal = this.isPersonalStoryTopic(topic);
    const voiceInstruction = isPersonal
      ? `Write in first-person as Jeffery Mitchell. Reference specific systems, real numbers, cost decisions, and regulatory details from his documented projects. The reader should feel they are hearing from the engineer who was in the room making these decisions — not reading a marketing article.`
      : `Write in a credible expert voice grounded in Jeffery's documented engineering experience. Reference his hands-on project history to establish authority. Use "in the environments I managed" or "from my experience deploying these systems" naturally.`;

    const ctaBlock = this.getCtaBlock(topic);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Write a 1200-word SEO-optimized blog article for ai4businesses.org.

Topic: ${topic}

${AUTHOR_BIO}

Voice: ${voiceInstruction}

Requirements:
- Target audience: small and mid-size business owners, entrepreneurs, IT professionals, and LinkedIn professionals who value technical credibility and are tired of enterprise pricing
- Include H1, H2, H3 headings in markdown
- Natural keyword integration throughout
- ${ctaBlock}
- DO NOT mention AI Contact-Center as a standalone product
- First two lines: meta title (60 chars max) and meta description (155 chars max)
- Format: markdown
- Specificity is credibility: use real system names, real numbers, real cost figures, and real regulatory references where they apply (Kari's Law, Ray Baum's Act, Direct Routing, CUBE SBC, UCCX, etc.)

Return article only. No preamble.`
      }]
    });

    const article = response.content[0].text;
    console.log('[SEO Writer] Article complete. Length:', article.length);
    return article;
  }

  async publishToGitHub(article, topic) {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);

    const date = new Date().toISOString().split('T')[0];
    const path = `blog/${date}-${slug}.md`;

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER || 'Aproposchpt2',
        repo:  'ai4businesses-org',
        path,
        message: `[SEO Writer] Publish: ${topic}`,
        content: Buffer.from(article).toString('base64'),
        branch: 'main'
      });

      const url = `https://ai4businesses.org/blog/${date}-${slug}`;
      console.log(`[SEO Writer] Published: ${url}`);
      return url;

    } catch (err) {
      console.error('[SEO Writer] GitHub publish error:', err.message);
      throw err;
    }
  }
}

module.exports = SEOWriterAgent;
