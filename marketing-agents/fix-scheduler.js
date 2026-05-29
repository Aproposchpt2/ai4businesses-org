const fs = require('fs');
let content = fs.readFileSync('agents/05-scheduler-agent.js', 'utf8');
const broken = /const \{ assets \}[^\n]+loadDesignAssets[^\n]+\n/;
const fixed = `      let assets = {};
      try {
        const assetData = await this.loadDesignAssets();
        assets = assetData.assets || {};
      } catch(e) {
        console.log('No design assets - text only mode');
      }
`;
content = content.replace(broken, fixed);
fs.writeFileSync('agents/05-scheduler-agent.js', content);
console.log('Done. Line 24 fixed.');
