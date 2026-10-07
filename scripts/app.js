(function(){
'use strict';
const D=window.MOMO_DATA;
const KEY='momo.diary.v1', PREF='momo.preferences.v1', DRAFT='momo.draft.v1';
const qs=new URLSearchParams(location.search);const isolated=qs.get('embed')==='1';
if(isolated)document.body.classList.add('embed');
const app=window.createIosFrame(document.getElementById('device-mount'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh',{granularity:'grapheme'}):null;
const length=s=>segmenter?[...segmenter.segment(s)].length:Array.from(s).length;
let storageOK=true;
function load(key,fallback){if(isolated)return fallback;try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){storageOK=false;return fallback;}}
function save(key,value){if(isolated)return true;try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){storageOK=false;return false;}}
const stored=load(KEY,[]),prefs=load(PREF,{}),draft=load(DRAFT,{});
let ownNotes=Array.isArray(stored)?stored.filter(n=>n&&typeof n.id==='string'&&typeof n.text==='string'&&length(n.text)<=50&&!isNaN(Date.parse(n.date))).map(n=>({id:n.id,date:n.date,text:n.text,mood:D.moods.some(m=>m.name===n.mood)?n.mood:'',sample:false,color:'#efeddf'})):[];
let state={index:ownNotes.length?0:-1,view:'home',recordOnly:prefs?.recordOnly===true,hint:prefs?.hint!==false,draft:typeof draft?.text==='string'?draft.text:'',mood:D.moods.some(m=>m.name===draft?.mood)?draft.mood:'',chatStep:0,reviewTab:ownNotes.length?'mine':'examples'};
let modalReturnFocus=null,toastTimer=null;
const paths={back:'m14 6-6 6 6 6',left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',plus:'M12 5v14M5 12h14',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3',history:'M4 11a8 8 0 1 1 2 6M4 4v7h7M12 7v5l3 2',more:'M5 12h.01M12 12h.01M19 12h.01',leaf:'M19 4C9 3 4 7 5 14s11 8 14-10ZM5 19 15 9',help:'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01',close:'m6 6 12 12M6 18 18 6',arrow:'M5 12h14m-6-6 6 6-6 6',check:'m5 12 4 4L19 6'};
function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.spark)+'"/></svg>';}
const notes=()=>[...ownNotes.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)),...D.notes];
const current=()=>notes()[Math.min(state.index,notes().length-1)];
const moodColor=name=>D.moods.find(m=>m.name===name)?.color||'#b9c3a8';
function dateLabel(date,short=false){const t=new Date(date);return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:short?'2-digit':'long',day:'2-digit'}).format(t);}
function header(title,end=''){return '<div class="view-topbar"><button class="back-button" data-action="home" aria-label="回到我的留白">'+icon('back')+' 返回</button><strong>'+title+'</strong><span class="end-label">'+end+'</span></div>';}
function announce(message){clearTimeout(toastTimer);app.querySelector('.app-toast')?.remove();const toast=document.createElement('div');toast.className='app-toast';toast.setAttribute('role','status');toast.textContent=message;app.append(toast);toastTimer=setTimeout(()=>toast.remove(),3300);}
function setView(view){window.MomoCare?.dispose();state.view=view;render();const heading=app.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
function persistPrefs(){save(PREF,{recordOnly:state.recordOnly,hint:state.hint});}
function render(){
 app.innerHTML='';
 if(state.view==='home')renderHome();
 if(state.view==='write')renderWrite();
 if(state.view==='chat')renderChat();
 if(state.view==='review')renderReview();
 if(state.view==='care')window.MomoCare.mount(app,{onBack:()=>setView('home'),onComplete:({kind,feeling})=>{setView('home');announce(feeling==='skipped'?'这一小段时间，留给自己就好。':'这段练习已经结束，按你舒服的节奏来。');}});
}
function blankCard(){
 const cardBacks='<div class="diary-card blank-stack-card blank-stack-far" aria-hidden="true" inert></div><div class="diary-card blank-stack-card blank-stack-near" aria-hidden="true" inert></div>';
 return cardBacks+'<article class="diary-card current-card blank-card" aria-label="空白想法卡片" style="z-index:10;transform:translateX(-50%)"><div class="card-top"><span>此刻 · 留给自己</span><span class="card-example">新的留白</span></div><label class="sr-only" for="thought-input">此刻的想法</label><textarea id="thought-input" class="blank-input" placeholder="此刻，想写点什么…" aria-describedby="thought-count" spellcheck="false">'+esc(state.draft)+'</textarea><div class="card-bottom"><button class="blank-mood" data-action="choose-mood" aria-label="选择情绪，可选"><i class="mood-dot" style="background:'+moodColor(state.mood)+'"></i><span id="blank-mood-label">'+esc(state.mood||'心情，想选再选')+'</span></button><span id="thought-count" class="char-count" aria-live="polite">'+length(state.draft)+' / 50 字</span></div></article>';
}
function bindDraftInput(){
 const input=app.querySelector('#thought-input');
 if(!input)return;
 input.addEventListener('input',()=>{state.draft=input.value;save(DRAFT,{text:state.draft,mood:state.mood});updateCounter();});
 updateCounter();
}
function renderHome(){
 const all=notes();state.index=Math.max(-1,Math.min(state.index,all.length-1));
 const isBlank=state.index===-1;
 // Two decorative card backs hint at history without exposing example text or moods.
 const visible=isBlank?[]:all.map((note,index)=>({note,index})).filter(({index})=>Math.abs(index-state.index)<=2);
 const cards=isBlank?blankCard():visible.map(({note,index})=>{const offset=index-state.index,active=offset===0;return '<article class="diary-card '+(active?'current-card':'back-card')+'" '+(!active?'aria-hidden="true" inert':'aria-label="当前想法"')+' style="background:'+note.color+';z-index:'+(10-Math.abs(offset))+';transform:translateX(calc(-50% + '+(-offset*13)+'px)) translateY('+(Math.abs(offset)*7)+'px) rotate('+(-offset*4)+'deg);opacity:'+(active?1:.7)+'"><div class="card-top"><time datetime="'+note.date+'">'+dateLabel(note.date)+' · '+(new Intl.DateTimeFormat('zh-CN',{weekday:'short',timeZone:'Asia/Shanghai'}).format(new Date(note.date)))+'</time>'+(note.sample?'<span class="card-example">示例想法</span>':'<span class="card-example">我的想法</span>')+'</div><p class="diary-text">'+esc(note.text)+'</p><div class="card-bottom"><span class="mood-tag"><i class="mood-dot" style="background:'+moodColor(note.mood)+'"></i>'+esc(note.mood||'只想记下来')+'</span>'+(!state.recordOnly?'<button class="ask-ai" data-action="ask" '+(!active?'tabindex="-1"':'')+' aria-label="问 AI，聊聊这张卡片">问 AI '+icon('spark')+'</button>':'<span class="mood-tag">安静地留在这里</span>')+'</div></article>';}).join('');
 const hint=isBlank?'点卡片，写下此刻 · 左滑再看历史<br>也可以先空着，不用马上写。':'左滑看过去 · 右滑回到现在，再右滑新建<br>也可以点下方「写一个新想法」。';
 const meta=isBlank?'一张空白，先留给你。':current().sample?'预设的求职片段 · 可自由体验':storageOK?'仅保存在当前浏览器':'浏览器无法持久保存，本次记录仅在当前页面';
 app.innerHTML='<section class="app-view home-view '+(isBlank?'blank-home':'')+'"><div class="app-header"><div class="app-wordmark">momo.<span>默默</span></div><div class="app-header-actions"><button class="icon-button" data-action="review" aria-label="回看记录">'+icon('history')+'</button><button class="icon-button" data-action="settings" aria-label="记录偏好与使用说明">'+icon('more')+'</button></div></div><div class="home-intro"><p class="app-eyebrow">给此刻的自己</p><h2>什么念头，都放这里。</h2><p>不用整理好，也不用立刻想通。</p></div>'+(state.hint?'<div class="hint-banner"><span>'+hint+'</span><button data-action="dismiss-hint" aria-label="收起操作提示">×</button></div>':'')+'<div class="cards-stage" tabindex="0" role="group" aria-label="日记卡片；左方向键查看更早，右方向键返回较新或空白卡片">'+cards+'</div><p class="card-meta">'+meta+'</p><div class="deck-navigation"><button data-action="older" '+(state.index>=all.length-1?'disabled':'')+'>'+icon('left')+' 更早的想法</button><span class="deck-position" aria-hidden="true">· · ·</span><button data-action="newer">'+(state.index<=0?'新的留白':'回到后来')+icon('right')+'</button></div>'+(isBlank?'<button class="new-thought save-thought" data-action="save" disabled>就先放这里 '+icon('check')+'</button>':'<button class="new-thought" data-action="write">'+icon('plus')+' 写一个新想法</button>')+'<div class="home-bottom"><span>先不想这些也可以</span><span>·</span><button data-action="care">'+icon('leaf')+' 照顾自己</button></div></section>';
 bindDraftInput();
 const deck=app.querySelector('.cards-stage');let start=null;
 deck.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,textarea'))return;start={x:e.clientX,y:e.clientY};deck.setPointerCapture(e.pointerId);});
 deck.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?'older':'newer');});
 deck.addEventListener('pointercancel',()=>start=null);
 deck.addEventListener('keydown',e=>{if(e.target!==deck)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?'older':'newer');app.querySelector('.cards-stage')?.focus({preventScroll:true});}});
}
function move(direction){
 if(direction==='older'){if(state.index>=notes().length-1){announce('已经是最早的一张了。');return;}state.index++;}
 else {if(state.index===-1){app.querySelector('#thought-input')?.focus({preventScroll:true});return;}state.index--;}
 renderHome();
}
function renderWrite(){
 app.innerHTML='<section class="app-view write-view">'+header('新的留白','只给自己看')+'<div class="view-heading"><p class="app-eyebrow">A THOUGHT, NOT AN ESSAY</p><h2>现在，想说些什么？</h2><p>一句吐槽、半个念头，都可以。</p></div><div class="write-paper"><label for="thought-input">把这一刻，轻轻放下</label><textarea id="thought-input" placeholder="今天发生了什么……" aria-describedby="thought-count" spellcheck="false">'+esc(state.draft)+'</textarea><p id="thought-count" class="char-count" aria-live="polite">'+length(state.draft)+' / 50 字</p></div><p class="field-title">此刻的情绪<span>可选，不选也能保存</span></p><div class="mood-options">'+D.moods.map(m=>'<button class="mood-option '+(state.mood===m.name?'selected':'')+'" aria-pressed="'+(state.mood===m.name)+'" data-action="mood" data-mood="'+m.name+'">'+m.name+'</button>').join('')+'</div><div class="write-bottom"><button class="primary" data-action="save">就先放这里 '+icon('check')+'</button><p>不公开，不评分。记录留在当前浏览器。</p></div></section>';
 bindDraftInput();
}
function updateCounter(){const n=length(state.draft),count=app.querySelector('#thought-count');if(count){count.textContent=n+' / 50 字'+(n>50?' · 再少写 '+(n-50)+' 字就好':'');count.classList.toggle('limit',n>50);app.querySelector('[data-action="save"]').disabled=!state.draft.trim()||n>50;}}
function saveNote(){
 const text=state.draft.trim();if(!text||length(text)>50)return;
 ownNotes.unshift({id:'own-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),date:new Date().toISOString(),text,mood:state.mood,color:'#efeddf',sample:false});
 const ok=save(KEY,ownNotes);state.draft='';state.mood='';save(DRAFT,{text:'',mood:''});state.index=0;state.reviewTab='mine';setView('home');announce(ok?'记下了。今天就到这里，也可以。':'记下了，但浏览器不能持久保存。建议从回看中导出。');
}
function showModal(title,body,buttons){
 modalReturnFocus=document.activeElement;
 const layer=document.createElement('div');layer.className='dialog-layer';layer.innerHTML='<section class="app-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-handle"></div><h3 id="dialog-title">'+title+'</h3>'+body+'<div class="dialog-actions">'+buttons+'</div></section>';
 app.append(layer);layer.querySelector('button,a')?.focus({preventScroll:true});
 layer.addEventListener('click',e=>{if(e.target===layer)closeModal();});
 layer.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusables=[...layer.querySelectorAll('button,a,input')],first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
}
function closeModal(){app.querySelector('.dialog-layer')?.remove();if(modalReturnFocus?.isConnected)modalReturnFocus.focus({preventScroll:true});}
function ask(){const note=current();if(!note){app.querySelector('#thought-input')?.focus({preventScroll:true});return;}if(state.recordOnly){showModal('现在只想记一记','<p>你选择了只记录模式，AI 入口已经收起。想聊的时候，再把它打开就好。</p>','<button class="primary" data-action="enable-ai">打开问 AI</button><button class="ghost" data-action="close-modal">继续安静记录</button>');return;}if(note.sample){state.chatStep=0;setView('chat');}else showModal('这个念头，已经留好了。','<p>这是静态原型，暂时不会为新想法生成 AI 回复。你可以看看预设案例，体验从追问到下一小步的对话。</p>','<button class="primary" data-action="examples">看看示例对话</button><button class="secondary" data-action="care">先照顾一下自己</button><button class="ghost" data-action="close-modal">回到我的想法</button>');}
function examples(){closeModal();showModal('从一个熟悉的处境开始','<p>以下都是编写的演示案例，不是你的分析结果。</p>'+['interview','unfair','compare','silence'].map(id=>'<button class="example-choice" data-action="sample" data-id="'+id+'"><strong>'+D.conversations[id].title+'</strong><small>'+esc(D.notes.find(n=>n.id===id).trigger)+' · 预设对话 →</small></button>').join(''),'<button class="ghost" data-action="close-modal">暂时不看</button>');}
function openSample(id){state.index=notes().findIndex(n=>n.id===id);state.chatStep=0;setView('chat');}
function renderChat(){
 const note=current();if(!note){setView('home');return;}const c=D.conversations[note.id];if(!c){setView('home');ask();return;}
 app.innerHTML='<section class="app-view chat-view">'+header('和 AI 理一理','预设对话')+'<p class="chat-subtitle">'+esc(c.title)+' · 由你决定聊到哪里</p><div class="chat-messages"><div class="chat-origin"><span>从这张想法开始 · '+dateLabel(note.date)+'</span>'+esc(note.text).replace(/\n/g,'<br>')+'</div><div class="chat-label">MOMO · 先问清楚</div><p class="chat-bubble">'+esc(c.intro)+'</p><p class="chat-bubble user">'+esc(c.reply)+'</p><div class="chat-label">MOMO · 把事情分开看</div><div class="analysis-block"><h4>发生了什么 / 可能的触发点</h4><p>'+esc(c.analysis)+'</p></div><p class="chat-bubble" style="margin-top:16px">'+esc(c.follow)+'</p>'+(state.chatStep?'<div class="analysis-block action-block" id="chat-action"><h4>'+esc(c.actionTitle)+'</h4><p>'+esc(c.action)+'</p></div><div class="analysis-block"><h4>'+(note.id==='unfair'?'事实参考的边界':'不全是你一个人的责任')+'</h4><p>'+esc(c.external)+'</p></div>':'')+'</div><div class="chat-bottom"><div class="chat-choices"><button data-action="chat-next">'+(state.chatStep?'重新看看追问':esc(c.choices[0]))+'</button><button data-action="care">先缓一缓</button></div><button class="chat-faux-input" data-action="chat-input">想说点别的… '+icon('arrow')+'</button><p class="chat-footer-note">演示内容 · 未接入模型与联网检索 · 不作心理诊断</p></div></section>';
 if(state.chatStep){const feed=app.querySelector('.chat-messages');feed.scrollTop=feed.scrollHeight;}
}
function renderReview(){
 const isMine=state.reviewTab==='mine',list=isMine?ownNotes.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)):D.notes;
 app.innerHTML='<section class="app-view review-view">'+header('回看','按需打开')+'<div class="view-heading"><p class="app-eyebrow">YOUR OWN PACE</p><h2>这些天，都在这里。</h2><p>情绪没有好坏，也不需要连成上升的曲线。</p></div><div class="scroll-content"><div class="review-toggle"><button class="'+(isMine?'active':'')+'" data-action="review-mine">我的记录</button><button class="'+(!isMine?'active':'')+'" data-action="review-examples">示例记录</button></div><p class="review-caption">'+(isMine?'只呈现你自己选过的情绪；未选情绪的想法也会保留。':'以下是预设案例，用来演示情绪随时间的变化。<br>触发因素来自示例对话，并非对你的自动分析。')+'</p>'+(list.length?'<div class="mood-timeline" aria-label="最近的情绪记录，按日期从早到晚排列">'+list.slice(0,7).reverse().map(n=>'<div class="mood-point"><i style="background:'+moodColor(n.mood)+'"></i><strong>'+esc(n.mood||'未标记')+'</strong><span>'+dateLabel(n.date,true)+'</span></div>').join('')+'</div><h3 class="review-subtitle">'+(isMine?'我留下的片段':'情绪与当时发生的事')+'</h3>'+list.map(n=>'<button class="review-item" data-action="open-note" data-id="'+esc(n.id)+'"><span class="date">'+dateLabel(n.date,true)+'</span><span><strong>'+esc(n.text.replace(/\n/g,''))+'</strong><small>'+esc(n.sample?n.trigger+' · 示例关联':n.mood||'未标记情绪')+'</small></span><span class="arrow">›</span></button>').join(''):'<div class="review-empty">还没有自己的记录。<br>不需要补写，从此刻开始就好。<br><button class="text-link" data-action="write">写下第一个想法 →</button></div>')+'<div class="privacy-options"><button data-action="export" '+(!ownNotes.length?'disabled':'')+'>导出我的记录</button><button data-action="clear" '+(!ownNotes.length?'disabled':'')+'>清除我的记录</button></div><p class="review-caption" style="margin-top:15px">记录保存在当前浏览器，不会自动同步。共用设备时，请留意他人也可能看到。</p></div></section>';
}
function settings(){showModal('按你舒服的方式来','<p>现在是「'+(state.recordOnly?'只记录':'记录与主动问 AI')+'」模式。只想写一写时，可以把问 AI 的入口收起来。</p>','<button class="primary" data-action="toggle-mode">'+(state.recordOnly?'显示问 AI 入口':'切换为只记录')+'</button><button class="secondary" data-action="help">查看操作提示</button><button class="ghost" data-action="close-modal">保持现在这样</button>');}
function help(){closeModal();showModal('慢慢来，很简单。','<p>① 初次来到这里是一张空白卡，点卡片直接写下 50 字以内的念头。情绪可选。<br>② 左滑看更早的记录；右滑回到较新，最新一张再右滑就能新建。也可点击左右箭头。<br>③ 点「问 AI」查看预设分析；新想法会提示查看示例。<br>④ 「回看」和「照顾自己」都可以随时打开，不需要打卡。</p>','<button class="primary" data-action="close-modal">知道了，自己试试</button>');}
function exportNotes(){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify({product:'Momo 默默',exportedAt:new Date().toISOString(),notes:ownNotes},null,2)],{type:'application/json'}));a.href=url;a.download='momo-我的情绪记录.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('已生成记录文件，请留意浏览器下载。');}
app.addEventListener('click',e=>{
 const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
 if(action==='home'){setView('home');return;}
 if(action==='write'){setView('write');return;}
 if(action==='older'||action==='newer'){move(action);return;}
 if(action==='dismiss-hint'){state.hint=false;persistPrefs();renderHome();return;}
 if(action==='choose-mood'){showModal('此刻是什么感觉？','<p>想选就选，也可以不标记。</p><div class="blank-mood-options">'+D.moods.map(m=>'<button class="mood-option '+(state.mood===m.name?'selected':'')+'" aria-pressed="'+(state.mood===m.name)+'" data-action="mood" data-mood="'+m.name+'">'+m.name+'</button>').join('')+'</div>','<button class="primary" data-action="close-modal">就这样</button>');return;}
 if(action==='mood'){state.mood=state.mood===button.dataset.mood?'':button.dataset.mood;save(DRAFT,{text:state.draft,mood:state.mood});app.querySelectorAll('.mood-option').forEach(b=>{const on=b.dataset.mood===state.mood;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});const label=app.querySelector('#blank-mood-label');if(label){label.textContent=state.mood||'心情，想选再选';label.previousElementSibling.style.background=moodColor(state.mood);}return;}
 if(action==='save'){saveNote();return;}
 if(action==='ask'){ask();return;}
 if(action==='care'){setView('care');return;}
 if(action==='review'){setView('review');return;}
 if(action==='review-mine'||action==='review-examples'){state.reviewTab=action==='review-mine'?'mine':'examples';renderReview();return;}
 if(action==='open-note'){state.index=notes().findIndex(n=>n.id===button.dataset.id);setView('home');return;}
 if(action==='sample'){openSample(button.dataset.id);return;}
 if(action==='examples'){examples();return;}
 if(action==='close-modal'){closeModal();return;}
 if(action==='settings'){settings();return;}
 if(action==='help'){help();return;}
 if(action==='toggle-mode'){state.recordOnly=!state.recordOnly;persistPrefs();setView('home');announce(state.recordOnly?'问 AI 已收起。只记录，也很好。':'问 AI 已打开。想聊时再点它。');return;}
 if(action==='enable-ai'){state.recordOnly=false;persistPrefs();closeModal();ask();return;}
 if(action==='chat-next'){state.chatStep=state.chatStep?0:1;renderChat();return;}
 if(action==='chat-input'){showModal('这段对话是预设演示。','<p>当前没有连接 AI 模型，所以不会发送你的文字。你可以继续查看示例中的建议，或把新的念头写回日记。</p>','<button class="primary" data-action="close-modal">继续看示例</button><button class="secondary" data-action="write">写一个新想法</button>');return;}
 if(action==='export'){exportNotes();return;}
 if(action==='clear'){showModal('清除自己的记录？','<p>会删除当前浏览器中你保存的想法和草稿，预设案例仍保留。清除后无法恢复；需要保留的话，请先导出。</p>','<button class="secondary" data-action="export">先导出记录</button><button class="primary" data-action="confirm-clear">确认清除我的记录</button><button class="ghost" data-action="close-modal">暂时保留</button>');return;}
 if(action==='confirm-clear'){try{if(!isolated){localStorage.removeItem(KEY);localStorage.removeItem(DRAFT);}}catch(error){closeModal();announce('浏览器未能完整清除数据。请从浏览器的站点设置中清除本地数据。');return;}ownNotes=[];state.draft='';state.mood='';state.index=-1;state.reviewTab='mine';setView('review');announce('你的记录与草稿已从当前浏览器清除。');}
});
app.addEventListener('keydown',e=>{if(e.key==='Escape'&&app.querySelector('.dialog-layer')){e.preventDefault();closeModal();}});
document.querySelectorAll('[data-site-action]').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.siteAction;if(action==='write')setView('write');if(action==='home')setView('home');if(action==='history'){state.index=Math.min(2,notes().length-1);setView('home');}if(action==='chat'){state.index=notes().findIndex(n=>n.id==='interview');ask();}document.querySelectorAll('.experience-step').forEach(s=>s.classList.toggle('selected',s===b));}));
document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>{document.body.dataset.theme=b.dataset.theme;document.querySelectorAll('[data-theme]').forEach(s=>{s.classList.toggle('selected',s===b);s.setAttribute('aria-pressed',s===b);});}));
window.addEventListener('pagehide',()=>window.MomoCare?.dispose());
window.addEventListener('pageshow',e=>{if(e.persisted&&state.view==='care')render();});
const screen=qs.get('screen');if(['write','review','care'].includes(screen))state.view=screen;
if(screen==='chat'){state.view='chat';state.index=notes().findIndex(n=>n.id==='interview');state.chatStep=qs.get('detail')==='1'?1:0;}
if(qs.get('card')){const n=notes().findIndex(n=>n.id===qs.get('card'));if(n>=0)state.index=n;}
render();
})();
