const fs = require('fs');
const path = require('path');
const root = process.cwd();
function check(p) {
  const f = path.join(root, p);
  const ok = fs.existsSync(f);
  console.log((ok ? 'OK   ' : 'MISS ') + p + (ok ? ' (' + fs.statSync(f).size + 'b)' : ''));
  return ok;
}
['index.html','assets/css/style.css','assets/js/script.js','views/kuis.html','views/kampus.html','views/dashboard.html','views/asisten.html','views/kontak.html','views/detail-kampus.html','data/ptn.json','data/pts.json','data/ptln.json','manifest.webmanifest','sw.js'].forEach(check);
const files = ['index.html','views/kuis.html','views/kampus.html','views/dashboard.html','views/asisten.html','views/kontak.html','views/detail-kampus.html'];
let broken = [];
files.forEach((f) => {
  const html = fs.readFileSync(path.join(root, f), 'utf8');
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const h = m[1];
    if (h.startsWith('http') || h.startsWith('#') || h.startsWith('?') || h.startsWith('mailto') || h === '') continue;
    const clean = h.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (clean.endsWith('.css') && clean.startsWith('http')) continue;
    const resolved = path.normalize(path.join(path.dirname(f), clean));
    if (!fs.existsSync(path.join(root, resolved))) broken.push(f + ' -> ' + h);
  }
});
console.log('--- broken internal links: ' + broken.length);
broken.slice(0, 20).forEach((b) => console.log('BROKEN ' + b));
// cek anchor internal index
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
['#artikel','#fitur','#tersimpan','#tentang','#kategori','#mulai'].forEach((a) => {
  const id = a.slice(1);
  const has = idx.includes('id="' + id + '"');
  console.log((has ? 'OK   ' : 'MISS ') + 'anchor ' + a + ' di index.html');
});
