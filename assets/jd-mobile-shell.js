/* Chinese mobile navigation. Desktop navigation/TOC and article content stay in place. */
(() => {
  'use strict';
  const header = document.getElementById('quarto-header');
  const container = header?.querySelector('.navbar-container');
  const home = header?.querySelector('.navbar-brand');
  if (!container || !home) return;
  const narrow = matchMedia('(max-width: 991.98px)');
  const root = document.documentElement;
  const base = new URL('./', home.href);
  const create = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls;if(text)n.textContent=text;return n; };
  const row=create('div','jd-mobile-header-row');row.id='jd-mobile-header-row';
  const trigger=create('button','jd-mobile-trigger');trigger.type='button';trigger.id='jd-mobile-nav-trigger';trigger.innerHTML='<i class="bi bi-journal-text" aria-hidden="true"></i>';trigger.setAttribute('aria-label','打开导航');trigger.setAttribute('aria-controls','jd-mobile-nav');trigger.setAttribute('aria-expanded','false');
  const context=create('span','jd-mobile-context');context.textContent=location.pathname.replace(/index\.html$/, '')===base.pathname?'首页':document.querySelector('h1.title')?.textContent.trim()||'攻略';context.title=context.textContent;
  row.append(trigger,context);container.append(row);
  const backdrop=create('div','jd-mobile-backdrop');backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');
  const nav=create('nav','jd-mobile-panel');nav.id='jd-mobile-nav';nav.setAttribute('aria-label','全站导航');nav.hidden=true;
  // Derive the mobile tree from Quarto's desktop navbar. One source of truth
  // preserves labels, order, grouping and links without a separate mobile IA.
  const desktopNav=container.querySelector('.navbar-nav');
  let saved={};try{saved=JSON.parse(localStorage.getItem('jurodo-mobile-nav-groups')||'{}');}catch{}
  function copyLink(source){const a=create('a','',source.textContent.trim());a.href=source.href;if(source.getAttribute('aria-current')==='page'||(!a.hash&&a.pathname.replace(/index\.html$/, '')===location.pathname.replace(/index\.html$/, '')))a.setAttribute('aria-current','page');return a;}
  for(const item of desktopNav?.children||[]){
    const source=item.querySelector(':scope > a');if(!source)continue;
    const submenu=item.querySelector(':scope > .dropdown-menu');
    if(!submenu){nav.append(copyLink(source));continue;}
    const name=source.textContent.trim();const d=create('details','jd-mobile-group');d.append(create('summary','',name));
    const list=create('div','jd-mobile-group-links');for(const a of submenu.querySelectorAll('a[href]'))list.append(copyLink(a));d.append(list);
    d.open=saved[name]??!!list.querySelector('[aria-current="page"]');
    d.addEventListener('toggle',()=>{saved[name]=d.open;try{localStorage.setItem('jurodo-mobile-nav-groups',JSON.stringify(saved));}catch{}});nav.append(d);
  }
  const tocSource=document.querySelector('#TOC > ul');
  let tocPanel=null,tocTrigger=null;
  if(tocSource){tocTrigger=create('button','jd-mobile-toc-trigger','本页目录');tocTrigger.type='button';tocTrigger.setAttribute('aria-controls','jd-mobile-toc');tocTrigger.setAttribute('aria-expanded','false');row.append(tocTrigger);
    tocPanel=create('nav','jd-mobile-panel jd-mobile-toc');tocPanel.id='jd-mobile-toc';tocPanel.setAttribute('aria-label','本页目录');tocPanel.hidden=true;
    const title=create('div','jd-mobile-panel-title','本页目录');tocPanel.append(title);const list=tocSource.cloneNode(true);list.classList.remove('collapse');list.querySelectorAll('.collapse').forEach(n=>n.classList.remove('collapse'));list.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));tocPanel.append(list);
  }
  document.body.append(backdrop,nav);if(tocPanel)document.body.append(tocPanel);
  let active=null,lastTrigger=null,scrollBefore=0;const inertBefore=new Map();
  function offsets(){const rect=header.getBoundingClientRect();root.style.setProperty('--jd-mobile-panel-top',`${Math.max(0,rect.bottom)}px`);root.style.setProperty('--jd-mobile-header-height',`${header.offsetHeight}px`);}
  function close(restore=true){if(!active)return;active.hidden=true;active=null;backdrop.hidden=true;root.classList.remove('jd-mobile-panel-open');document.body.classList.remove('jd-mobile-panel-open');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','打开导航');tocTrigger?.setAttribute('aria-expanded','false');for(const [el,v]of inertBefore)el.inert=v;inertBefore.clear();if(restore&&narrow.matches)lastTrigger?.focus({preventScroll:true});if(scrollY!==scrollBefore)scrollTo(0,scrollBefore);}
  function open(panel,button){if(!narrow.matches)return;if(active===panel){close();return;}close(false);document.querySelector('#kt-search-dialog[open]')?.close();scrollBefore=scrollY;lastTrigger=button;active=panel;panel.hidden=false;backdrop.hidden=false;root.classList.add('jd-mobile-panel-open');document.body.classList.add('jd-mobile-panel-open');root.style.setProperty('--jd-mobile-panel-top',`${header.offsetHeight}px`);button.setAttribute('aria-expanded','true');if(panel===nav)trigger.setAttribute('aria-label','关闭导航');for(const node of [...document.body.children]){if([header,backdrop,nav,tocPanel].includes(node)||['SCRIPT','STYLE','DIALOG'].includes(node.tagName))continue;inertBefore.set(node,node.inert);node.inert=true;}if(panel===tocPanel){for(const a of panel.querySelectorAll('a[href]')){const source=[...tocSource.querySelectorAll('a[href]')].find(n=>n.hash===a.hash);a.classList.toggle('active',source?.classList.contains('active')||false);}}const current=panel.querySelector('[aria-current=page],a.active');(current||panel.querySelector('a,summary'))?.focus({preventScroll:true});}
  trigger.addEventListener('click',()=>open(nav,trigger));tocTrigger?.addEventListener('click',()=>open(tocPanel,tocTrigger));backdrop.addEventListener('click',()=>close());
  for(const panel of [nav,tocPanel].filter(Boolean))panel.addEventListener('click',e=>{if(e.target.closest('a[href]'))close(false);});
  header.querySelector('#kt-search-launcher')?.addEventListener('click',()=>close(false),true);
  document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const choices=[...header.querySelectorAll('.quarto-navbar-tools a,.quarto-navbar-tools button'),trigger,tocTrigger,...active.querySelectorAll('a,summary,button')].filter(n=>n&&n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden');if(!choices.length)return;e.preventDefault();const i=choices.indexOf(document.activeElement);choices[(i+(e.shiftKey?-1:1)+choices.length)%choices.length].focus();}});
  function mode(){if(!narrow.matches)close(false);root.classList.toggle('jd-mobile-shell',narrow.matches);offsets();}
  narrow.addEventListener('change',mode);new ResizeObserver(offsets).observe(header);window.addEventListener('resize',offsets);window.addEventListener('scroll',()=>{if(!active)offsets();},{passive:true});window.addEventListener('pagehide',()=>close(false));mode();
})();
