require('dotenv').config();
const token = process.env.GITHUB_TOKEN;
const tag = '<meta name="google-site-verification" content="rZDOW8sTxHxK_PcpM9VzJs3sHH7Qs3n1HipJq-IhMQI" />';
fetch('https://api.github.com/repos/Aproposchpt2/ai4businesses-org/contents/index.html', {
  headers: {'Authorization': 'token '+token, 'Accept': 'application/vnd.github.v3+json'}
}).then(r=>r.json()).then(file => {
  const content = Buffer.from(file.content, 'base64').toString('utf8');
  const updated = content.replace('<head>', '<head>\n'+tag);
  const encoded = Buffer.from(updated).toString('base64');
  return fetch('https://api.github.com/repos/Aproposchpt2/ai4businesses-org/contents/index.html', {
    method: 'PUT',
    headers: {'Authorization': 'token '+token, 'Content-Type': 'application/json'},
    body: JSON.stringify({message:'Add Search Console verification', content: encoded, sha: file.sha, branch:'main'})
  });
}).then(r=>r.json()).then(d=>{
  console.log(d.commit ? 'SUCCESS' : 'FAILED', d.commit?.sha || d.message);
}).catch(e=>console.error(e));
