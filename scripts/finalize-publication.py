"""Add canonical links and page-specific sharing URLs to generated pages."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]/'_site'
for page in root.rglob('*.html'):
    text=page.read_text()
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
