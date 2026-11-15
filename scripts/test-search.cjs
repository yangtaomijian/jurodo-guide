// Run after `quarto render`: exercises the same functions used by the browser.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/guide-lookup.js'), 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('const normalize ='), source.indexOf('async function updateResults()')) + '\nthis.search=(rows,q)=>findMatches(prepareIndex(rows),normalize(q));', context);
const rows = JSON.parse(fs.readFileSync(path.join(root, '_site/guide-search.json')));
let count = 0;
function top(query, href) {
  assert.equal(context.search(rows, query)[0]?.entry.href, href, query); count++;
}
for (let day = 1; day <= 35; day++) {
  for (const query of [`D${day}`, `d${String(day).padStart(2,'0')}`, `第${day}天`]) top(query, `guide/d${day}.html`);
}
for (const [query,href] of [
  ['GP','mechanics/gp.html'],['gp','mechanics/gp.html'],['ＧＰ','mechanics/gp.html'],
  ['午休','guide/lunch-calendar.html'],['自由午休','guide/lunch-calendar.html'],
  ['文治','guide/d18.html#with-bunji'],['斗次郎','guide/d18.html#with-tojiro'],['熊手','guide/d18.html#with-kumade'],['笹吉','guide/d18.html#with-sasakichi'],
  ['CG','collectibles/gallery.html'],['画廊','collectibles/gallery.html'],['图库','collectibles/gallery.html'],
  ['全成就','collectibles/achievements.html'],['成就','collectibles/achievements.html'],
  ['结局','guide/endings.html'],['时间线','mechanics/timeline.html'],['精翻','index.html#guide-version'],
  ['D2 午休','guide/d2-lunch.html'],['D02午休','guide/d2-lunch.html'],['第2天 午休','guide/d2-lunch.html'],
  ['Ｄ１７','guide/d17.html'],
  ['友好地腕力','guide/d29-lunch.html#arm-wrestle-tojiro'],
  ['友好地扳手腕','guide/d29-lunch.html#arm-wrestle-tojiro'],
  ['D29 友好地腕力','guide/d29-lunch.html#arm-wrestle-tojiro'],
  ['你说吧','guide/d17.html#listen-to-mother'],
]) top(query,href);
for (const q of ['', '不存在的关键词xyz', 'D999', 'D17 午休']) { assert.equal(context.search(rows,q).length,0,q);count++; }
for (const q of ['D1','D2','D10','D35']) {
  assert(context.search(rows,q).every(x=>!x.entry.day || x.entry.day.toLowerCase()===q.toLowerCase()),q);count++;
}
for (const q of ['画廊 D7','图库 D7']) {assert(context.search(rows,q).every(x=>x.entry.gallery),q);count++;}
for (const row of rows.filter(x => x.achievement || x.gallery || x.ending || x.titleArt)) {
  assert(context.search(rows,row.name).slice(0,5).some(x=>x.entry.href===row.href), row.name);
  count++;
}
assert.equal(new Set(rows.map(x=>x.href)).size,rows.length,'duplicate targets');
assert(!JSON.stringify(rows).match(/\/Users\/|\.csv|\.rpy|\.save|\.persistent|\.\.\/research\//),'private material');
console.log(`PASS ${count} query assertions; ${rows.length} unique public targets; private-path scan`);
