"""Add canonical links and page-specific sharing URLs to generated pages."""
from pathlib import Path
import re
import hashlib
root=Path(__file__).resolve().parents[1]/'_site'
# Content-address changed discussion styles so cached older files cannot mix
# with newly published HTML. Keep original source filenames unchanged.
style_versions = {}
for name in ('jd-discussion.css', 'jd-feedback.css'):
    source = root/'assets'/name
    data = source.read_bytes()
    versioned = f"{source.stem}.{hashlib.sha256(data).hexdigest()[:12]}.css"
    (source.parent/versioned).write_bytes(data)
    style_versions[name] = versioned
for page in root.rglob('*.html'):
    text=page.read_text()
    for name, versioned in style_versions.items():
        text = re.sub(r'(href=["\'][^"\']*assets/)' + re.escape(name) + r'(["\'])',
                      lambda match: match[1] + versioned + match[2], text)
    canonical='https://jurodo.carambi.com/'+page.relative_to(root).as_posix()
    text=re.sub(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*>\s*','',text)
    text=re.sub(r'<meta\s+[^>]*property=["\']og:(?:url|type)["\'][^>]*>\s*','',text)
    metadata = (
        f'<link rel="canonical" href="{canonical}">\n'
        f'<meta property="og:url" content="{canonical}">\n'
        '<meta property="og:type" content="website">\n'
    )
    text=text.replace('</head>',metadata+'</head>',1)
    page.write_text(text)
(root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://jurodo.carambi.com/sitemap.xml\n')
