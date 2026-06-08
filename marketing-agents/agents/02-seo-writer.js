require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

class SEOWriterAgent {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async writeArticle(topic) {
    console.log('[SEO Writer] Writing:', topic);

    const t = topic.toLowerCase();
    const isPersonal = ['i managed','i built','i left','i learned','why i','how i',
      'i migrated','i saved','i refused','i vetted','i configured','i was',
      'i identified','what i','operator','$20','kari'].some(m => t.includes(m));

    const isCapGen = t.includes('capgen') || t.includes('federal') || t.includes('capability statement');

    const voiceInstruction = isPersonal
      ? 'Write in first-person as Jeffery Mitchell. Reference specific systems, real numbers, cost decisions, and regulatory details from his documented projects. The reader should feel they are hearing from the engineer who was in the room making these decisions.'
      : 'Write in a credible expert voice grounded in Jeffery\'s documented engineering background. Reference his hands-on project history to establish authority.';

    const ctaBlock = isCapGen
      ? 'Primary CTA drives to CapGen at https://capgen.aproposgroupllc.com — Tagline: "Generate your capability statement in minutes — SAM.gov verified data, branded PDF, submission ready." Secondary mention of FlowDesk Pro (https://aiflowdeskpro.com) where relevant.'
      : 'Primary CTA drives to FlowDesk Pro Fast Track Bundle ($349/month) at https://aiflowdeskpro.com — Tagline: "Never miss a lead from day one." Secondary mention of CapGen (https://capgen.aproposgroupllc.com) where relevant.';

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: 'Write a 1200-word SEO-optimized blog article for ai4businesses.org.\n\n'
          + 'Topic: ' + topic + '\n\n'
          + 'AUTHOR CONTEXT:\n'
          + 'Jeffery E. Mitchell is a Senior Unified Communications Engineer with 20+ years of experience. '
          + 'He is the founder of Apropos Group LLC and AI4 Businesses.\n\n'
          + 'DOCUMENTED PROJECTS (reference these for authority):\n'
          + '- Designed and deployed Cisco UCCX IVR architecture at the College of Southern Nevada supporting 2,100+ users and 100+ departments. '
          + 'Departments were fielding extremely high call volumes with a single operator manually routing every call. '
          + 'His solution automated call flows, department queues, and IVR scripts integrated with Cisco CUCM.\n'
          + '- Led full lifecycle migration of 2,000+ users to Microsoft Teams Enterprise Voice across 100+ departments. '
          + 'Outside agencies wanted $20/seat/month to manage it. Jeff vetted them, said no, and engineered it in-house: '
          + 'kept existing Cox SIP trunks (no porting), configured the college\'s own Cisco CUBE as the SBC via Direct Routing, '
          + 'used already-owned Teams calling licenses. Compliance with Kari\'s Law and Ray Baum\'s Act required contracting Intrado for E911.\n'
          + '- Engineered emergency migration of 1,800 faculty/staff to WebEx Teams during COVID-19, maintaining operational continuity.\n'
          + '- Deployed Cisco CME voice infrastructure for a Veterans Affairs medical facility.\n'
          + '- Designed UCCX auto-attendant for DWED Community Outreach Center: 70 staff, 8 departments.\n'
          + '- Managed FreePBX VoIP for Eye Surgery Centers.\n\n'
          + 'THE WHY: He built FlowDesk Pro because he watched small businesses get priced out of the same contact center '
          + 'capabilities he spent years building for large institutions. Hardware, licensing, support contracts, specialized engineers, '
          + 'perpetual upgrade cycles — he rebuilt it all in AI at a price any business can afford. '
          + 'He built CapGen after seeing the documentation burden blocking small businesses from federal contracts.\n\n'
          + 'Voice: ' + voiceInstruction + '\n\n'
          + 'Requirements:\n'
          + '- Target audience: small/mid-size business owners, entrepreneurs, and LinkedIn professionals who value technical credibility\n'
          + '- Include H1, H2, H3 headings in markdown\n'
          + '- Natural keyword integration throughout\n'
          + '- ' + ctaBlock + '\n'
          + '- DO NOT mention AI Contact-Center as a standalone product\n'
          + '- First two lines: meta title (60 chars max) and meta description (155 chars max)\n'
          + '- Format: markdown\n'
          + '- Use real system names, numbers, regulatory terms (Kari\'s Law, UCCX, Direct Routing, CUBE SBC) where they apply\n\n'
          + 'Return article only. No preamble.'
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
    const path = 'blog/' + date + '-' + slug + '.md';

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER || 'Aproposchpt2',
        repo: 'ai4businesses-org',
        path,
        message: '[SEO Writer] Publish: ' + topic,
        content: Buffer.from(article).toString('base64'),
        branch: 'main'
      });

      const url = 'https://ai4businesses.org/blog/' + date + '-' + slug;
      console.log('[SEO Writer] Published:', url);
      return url;
    } catch (err) {
      console.error('[SEO Writer] GitHub publish error:', err.message);
      throw err;
    }
  }
}

module.exports = SEOWriterAgent;
