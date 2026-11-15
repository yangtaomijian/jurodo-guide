import hashlib
"""Validate and sanitize only the generated publication directory."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'_site'
PRIVATE_PATH = re.compile(r'(?:/(?:Users|home|tmp)/|/private/var/|file://|[A-Za-z]:[\\/](?:Users|Documents and Settings|Temp)[\\/])', re.IGNORECASE)
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.ids=[]; self.links=[]; self.canonical=[]; self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        for key in ('href','src'):
            if a.get(key):self.links.append(a[key])
        if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
for f in OUT.rglob('.DS_Store'):f.unlink()
pages={p:Page(p.read_text()) for p in OUT.rglob('*.html')}
errors=[]
def check(source,link):
    u=urlsplit(link)
    if u.scheme or u.netloc:return
    target=OUT/u.path.lstrip('/') if u.path.startswith('/') else source.parent/unquote(u.path) if u.path else source
    target=target.resolve()
    if target.is_dir():target=target/'index.html'
    if not target.exists():errors.append(f'missing {source.relative_to(OUT)}: {link}');return
    if u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'anchor {link}')
for p,h in pages.items():
    for link in h.links:check(p,link)
    for k,n in Counter(h.ids).items():
        if n>1 and k not in ('quarto-text-highlighting-styles','quarto-bootstrap'):errors.append(f'duplicate {p.name} {k}')
    expected='https://jurodo.carambi.com/'+p.relative_to(OUT).as_posix()
    if h.canonical!=[expected]:errors.append(f'canonical {p.name} {h.canonical}')
    t=p.read_text()
    if t.count('class="jd-publication-footer"') != 1:errors.append(f'publication footer {p.name}')
    if 'class="jd-feedback-slot"' not in t or '__jdFeedbackDialog' not in t:errors.append(f'feedback entry/dialog {p.name}')

    for name in ('jd-discussion.css', 'jd-feedback.css'):
        css = OUT/'assets'/name
        version = hashlib.sha256(css.read_bytes()).hexdigest()[:12]
        expected_style = f"{css.stem}.{version}.css"
        if expected_style not in t or f'/assets/{name}"' in t:
            errors.append(f'unversioned discussion style {p.name}: {name}')
        if not (css.parent/expected_style).exists() or (css.parent/expected_style).read_bytes() != css.read_bytes():
            errors.append(f'discussion style content mismatch: {name}')
    if PRIVATE_PATH.search(t):errors.append(f'private local path {p.name}')
    for bad in ('chatgpt-conversation://','../research/','../reference/','__pwDiscussion','site: \'password\''):
        if bad in t:errors.append(f'private or wrong site marker {p.name}: {bad}')
for row in json.loads((OUT/'guide-search.json').read_text()):check(OUT/'index.html',row['href'])
if (OUT/'CNAME').read_text().strip()!='jurodo.carambi.com':errors.append('CNAME')
if any(p.name.endswith('fixtures.html') for p in OUT.rglob('*')):errors.append('fixtures in publication')
runtime=(ROOT/'assets/jd-discussion-runtime.html').read_text()
registry=json.loads(re.search(r"const pageKeys = Object.freeze\((\{.*?\})\);",runtime,re.S)[1])
for path,key in {'/background/construction.html':'background.construction','/collectibles/timeline-completion.html':'collectibles.timeline-completion'}.items():
    if registry.get(path)!=key:errors.append(f'missing independent discussion {path}')
for path,key in registry.items():
    day=re.fullmatch(r'/guide/d(\d+)(-lunch)?\.html',path)
    if day and key!=f'guide.week-{(int(day[1])-1)//7+1}':errors.append(f'weekly discussion changed {path}')
for path in ['/index.html','/','/guide/index.html','/guide/lunch-calendar.html','/discussions.html']:
    if path in registry:errors.append(f'unexpected discussion {path}')
if len(set(registry.values()))!=13:errors.append('expected five weekly + eight topical discussion groups')
if errors:raise SystemExit('\n'.join(errors[:30]))
print(f'Publication checks passed: {len(pages)} pages, all local links and search targets, canonical URLs, CNAME, source boundary.')
