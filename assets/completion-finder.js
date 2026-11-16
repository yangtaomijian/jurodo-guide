(()=>{
 const form=document.querySelector('#completion-find-form'),select=document.querySelector('#completion-find-day'),input=document.querySelector('#completion-find-query'),list=document.querySelector('#completion-find-results'),status=document.querySelector('#completion-find-status');
 const week=document.querySelector('#completion-find-week');
 const norm=s=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
 const days=Array.from(document.querySelectorAll('details.completion-day')).map(el=>{
  const title=el.querySelector(':scope > summary').textContent.replace(/\s+/g,' ').trim();
  const paragraphs=Array.from(el.querySelectorAll('.day-route-content p, .day-route-content li')).filter(p=>!p.closest('.guide-jumps')).map(p=>({text:p.textContent.trim(),target:p.closest('details').id}));
  const day=el.dataset.day;
  return {el,day,title,paragraphs,text:norm(title+' '+el.dataset.lookup+' '+paragraphs.map(p=>p.text).join(' '))};
 });
 function dayOptions(){select.replaceChildren(new Option('全部日期',''));select.disabled=!week.value;if(week.value){const lo=(Number(week.value)-1)*7+1;for(let n=lo;n<lo+7;n++)select.append(new Option('D'+n,'D'+n));}}
 dayOptions();
 const matches=(d,t)=>/^d\d+$/.test(t)?d.day.toLowerCase()===t:d.text.includes(t);
 let mounted=null;
 function restore(){
  if(mounted){const {body,placeholder,states}=mounted;placeholder.replaceWith(body);states.forEach(([el,open])=>el.open=open);mounted=null;}
  list.querySelectorAll('.finder-inline-detail').forEach(el=>el.remove());
  list.querySelectorAll('.finder-result-toggle').forEach(el=>{el.setAttribute('aria-expanded','false');el.querySelector('.finder-toggle-hint').textContent='展开清单 ▾'});
  list.querySelectorAll('.finder-expanded').forEach(el=>el.classList.remove('finder-expanded'));
  list.classList.remove('has-expanded');
 }
 // Restore original nodes before the shared deep-link handler resolves their ancestors.
 window.addEventListener('hashchange',restore);
 document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(link&&mounted)restore()},true);
 function search(){
  restore();
  const q=norm(input.value),tokens=q.split(' ').filter(Boolean),day=select.value;
  list.replaceChildren();
  if(!q&&!day&&!week.value){list.hidden=true;status.textContent='选周次后可细选日期，也可直接输入关键词。';return;}
  const hits=days.filter(d=>(!week.value||Math.ceil(Number(d.day.slice(1))/7)===Number(week.value))&&(!day||d.day===day)&&tokens.every(t=>matches(d,t)));
  status.textContent=hits.length?'找到 '+hits.length+' 个日期，点击查看对应清单。':'没有匹配条目。可换用角色名、地点或较短的关键词。';
  list.hidden=!hits.length;
  for(const d of hits){
   const words=tokens.filter(t=>!/^d\d+$/.test(t));
   const p=d.paragraphs.find(p=>words.length&&words.some(t=>norm(p.text).includes(t)))||d.paragraphs[0];
   const li=document.createElement('li'),a=document.createElement('button'),strong=document.createElement('strong'),small=document.createElement('span');
   const target=words.length?p.target:d.el.id;a.type='button';a.className='finder-result-toggle';a.setAttribute('aria-expanded','false');strong.textContent=d.title;
   let text=p.text,at=words.length?Math.max(0,...words.map(t=>norm(text).indexOf(t))):0;
   let start=Math.max(0,at-24);small.textContent=(start?'…':'')+text.slice(start,start+95)+(text.length>start+95?'…':'');
   const hint=document.createElement('span');hint.className='finder-toggle-hint';hint.textContent='展开清单 ▾';a.append(strong,small,hint);li.append(a);list.append(li);
   a.onclick=()=>{
    const wasOpen=a.getAttribute('aria-expanded')==='true';
    restore();
    if(wasOpen)return;
    const panel=document.createElement('div');panel.className='finder-inline-detail';
    const body=d.el.querySelector(':scope > .day-route-content');
    const placeholder=document.createComment('completion finder original position');
    const states=Array.from(body.querySelectorAll('details')).map(el=>[el,el.open]);
    body.before(placeholder);mounted={body,placeholder,states};
    states.forEach(([el])=>el.open=true);
    const nav=document.createElement('div');nav.className='finder-detail-actions';
    const original=document.createElement('a');original.href='#'+target;original.textContent='前往原日期位置';
    const close=document.createElement('button');close.type='button';close.textContent='收起清单';close.onclick=()=>{a.click();a.focus()};
    nav.append(original,close);panel.append(body,nav);li.append(panel);
    a.setAttribute('aria-expanded','true');hint.textContent='收起清单 ▴';li.classList.add('finder-expanded');list.classList.add('has-expanded');
   };
  }
 }
 form.addEventListener('submit',e=>{e.preventDefault();search()});
 select.addEventListener('change',search);
 week.addEventListener('change',()=>{dayOptions();search()});
 input.addEventListener('input',e=>{if(!e.isComposing)search()});input.addEventListener('compositionend',search);
 document.querySelector('#completion-find-reset').onclick=()=>{input.value='';week.value='';dayOptions();search();input.focus()};
 document.querySelectorAll('[data-find]').forEach(b=>b.onclick=()=>{week.value='';dayOptions();input.value=b.dataset.find;search()});
})();
