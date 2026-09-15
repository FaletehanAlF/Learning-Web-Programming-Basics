const store = {};
global.localStorage = { getItem: (k) => store[k] || '', setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
global.window = { JURUSAN_DATA: [{ name: 'Psikologi', catLabel: 'Soshum', desc: 'Perilaku.', cocok: 'Empati.', durasi: '8 smt', biaya: 'Rp 40jt' }] };
let lastUrl = '', lastBody = null, lastHeaders = null;
global.fetch = (url, opt) => {
  lastUrl = url; lastBody = JSON.parse(opt.body); lastHeaders = opt.headers;
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ choices: [{ message: { content: 'Jawaban GPT' } }] }) });
};
const fs = require('fs');
eval(fs.readFileSync('assets/js/openai.js', 'utf8'));
console.log('hasKey kosong:', window.OpenAIChat.hasKey());
window.OpenAIChat.setKey('sk-proj-TESTKEY1234567890');
console.log('hasKey isi:', window.OpenAIChat.hasKey(), 'model:', window.OpenAIChat.getModel());
window.OpenAIChat.sendMessage('Suka curhat?', [{ who: 'user', text: 'Halo' }]).then((t) => {
  console.log('reply:', t);
  console.log('url ok:', lastUrl === 'https://api.openai.com/v1/chat/completions');
  console.log('auth ok:', String(lastHeaders.Authorization).indexOf('Bearer sk-proj-TEST') === 0);
  console.log('system ok:', lastBody.messages[0].role === 'system' && lastBody.messages[0].content.includes('Psikologi'));
  console.log('history ok:', lastBody.messages[1].role === 'user' && lastBody.messages[2].role === 'user');
  global.fetch = () => Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve('{"error":{"message":"Incorrect API key"}}') });
  return window.OpenAIChat.sendMessage('tes', []);
}).catch((e) => { console.log('401 OK:', e.message.slice(0, 50)); });
