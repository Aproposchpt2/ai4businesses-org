require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const AUTHOR_BIO = `
AUTHOR: Jeffery E. Mitchell — Senior Unified Communications Engineer and Founder of Apropos Group LLC / AI4 Businesses.

PROFESSIONAL BACKGROUND (use these specific details to write with authority):
- Designed and deployed Cisco UCCX Enterprise IVR architecture at the College of Southern Nevada supporting 2,100+ users and 100+ departments. Built automated call flows, department queues, and IVR scripts integrated with Cisco Unified Communications Manager (CUCM). Provided ongoing operational management and optimization of the contact center system.
- Led full lifecycle migration of enterprise telephony to Microsoft Teams Enterprise Voice supporting 2,000+ users across 100+ departments. Designed centralized Direct Routing using Cisco CUBE SBC infrastructure, replacing legacy Cisco CUCM, Unity Connection, and UCCX — reducing long-term licensing, hardware, and support costs.
- Engineered rapid deployment of Cisco WebEx Teams for 1,800 faculty and staff during COVID-19, maintaining operational continuity and eliminating the need for employees to forward calls to personal cell phones.
- Deployed Cisco Unified Communications Manager Express (CME) voice infrastructure for a Veterans Affairs medical facility — SIP trunks, voice gateways, dial plans, IP endpoints supporting clinical and administrative operations.
- Designed Cisco UCCX auto-attendant and call flow architecture for the DWED Community Outreach Center supporting 70 staff across 8 departments including workforce development, ESL training, medical programs, and administrative services.
- Managed FreePBX-based VoIP environment for Eye Surgery Centers — SIP trunk configuration, endpoint provisioning, dial plan management.

THE "WHY" BEHIND THE PRODUCTS:
After years of building and managing the enterprise UC systems that large organizations pay hundreds of thousands of dollars to deploy and maintain, Jeff watched small and mid-size businesses get completely priced out of the same capabilities — the hardware costs, the Cisco licensing, the annual support contracts, the engineers required to keep it running, and the perpetual cycle of replacing equipment to stay current with software versions. He built FlowDesk Pro to deliver the same contact center intelligence — automated attendants, call queues, IVR flows, lead capture — through AI at a price any small business can afford. No hardware. No licensing treadmill. No $200/hour engineers. He built CapGen after seeing the documentation burden faced by federal contractors trying to compete for government work.

PRODUCTS:
- FlowDesk Pro: AI contact center + CRM + lead management for small and mid-size businesses. Fast Track Bundle $349/month. https://aiflowdeskpro.com — "Never miss a lead from day one."
- CapGen: AI capability statement generator for federal contractors. Pulls verified SAM.gov data and produces a branded PDF ready for submission. https://capgen.aproposgroupllc.com

WRITING RULE: This is not generic marketing copy. Every article should read as if written by the person who actually built and operated these systems at scale. Specific project references, real numbers, and practitioner insights make this content impossible to replicate by any competitor.
`.trim();

class SEOWriterAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  isPersonalStoryTopic(topic) {
    const personalMarkers = [
      'i managed', 'i built', 'i left', 'i learned', 'why i', 'how i',
      'i migrated', 'i saw', 'i spent', 'what i', 'my ', "i've"
    ];
    return personalMarkers.some(m => topic.toLowerCase().includes(m));
  }

  getCtaBlock(topic) {
    if (topic.toLowerCase().includes('capgen')) {
      return `CTA drives to CapGen at https://capgen.aproposgroupllc.com\nTagline: "Generate your capability statement in minutes — SAM.gov verified data, branded PDF, submission ready."`;
    }
    return `Primary CTA drives to FlowDesk Pro Fast Track Bundle ($349/month) at https://aiflowdeskpro.com\nTagline: "Never miss a lead from day one."\nSecondary mention of CapGen (https://capgen.aproposgroupllc.com) where relevant.`;
  }

  async writeArticle(topic) {
    console.log(`[SEO Writer] Writing: ${topic}`);

    const isPersonal = this.isPersonalStoryTopic(topic);
    const voiceInstruction = isPersonal
      ? `Write in first-person as Jeffery Mitchell. This is a personal authority piece. Speak from his documented project experience — reference specific systems he managed (UCCX, CUCM, WebEx Teams, Teams Enterprise Voice), real user counts, real organizations where appropriate. The reader should feel they are hearing directly from the engineer who built and operated these systems.`
      : `Write in a credible expert voice grounded in Jeffery's documented engineering background. Reference his hands-on experience with enterprise UC systems to establish authority. Use "based on my experience" or "in the environments I managed" where appropriate.`;

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
- Target audience: small and mid-size business owners, entrepreneurs, and LinkedIn professionals who value technical credibility and are tired of overpaying for enterprise tools — or going without them
- Include H1, H2, H3 headings in markdown
- Natural keyword integration throughout
- ${ctaBlock}
- DO NOT mention AI Contact-Center as a standalone product
- First two lines: meta title (60 chars max) and meta description (155 chars max)
- Format: markdown
- The article must read as expert insight from someone who has personally built and operated these systems at scale — not as a marketing piece. The specificity of the experience is the credibility.

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
