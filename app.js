'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const projects = {
 koppiku: {type:'gallery', title:'Koppiku', subtitle:'咖啡的三种情绪 / 3 POSTERS', description:'蓝与橙的高对比、深夜的霓虹色彩、奶咖的柔和质感。以不同的色彩与字体语言，探索同一个咖啡主题的三种表达。', images:[['koppiku-orange','No Nods. Just Koppiku.'],['koppiku-midnight','Midnight Kopi Mode.'],['koppiku-latte','Just Koppiku — 奶咖视觉']]},
 spider: {type:'gallery', title:'Spider-Man', subtitle:'角色主题海报 / 3 VISUAL EXPERIMENTS', description:'以 Spider-Man 为主题，尝试影像拼贴、城市纹理与立体字体的组合。在熟悉的角色形象中，寻找不同的构图与叙事角度。', images:[['spider-future','The Old Past, The New Future'],['spider-blue','Brand New Day — 蓝色视角'],['spider-collage','More Than a Mask — 角色拼贴']]},
 monday: {type:'film', title:'周一的猫', subtitle:'SHORT FILM / 00:51', description:'通勤、办公、回家。一只穿上衬衫的猫，在熟悉的日常里，为忙碌的周一留下一点幽默与温柔。', video:'monday-cat'},
 countdown: {type:'film', title:'倒数', subtitle:'CONCEPT FILM / 00:59', description:'雾气、锁链、悬空的道路与孤独的人物。通过光影和空间的变化，营造紧张、未知的影像氛围。', video:'countdown'},
 series: {type:'series',title:'系列短剧',subtitle:'SERIAL STORYTELLING / 26 EPISODES',description:'26 集竖屏故事，完整收录。选择任意一集开始观看，也可以在播放结束后继续下一集。'}
};
const dialog = $('#project-dialog');
const body = $('#dialog-body');
let currentProject = null, galleryIndex = 0, activeEpisode = 1, previousFocus = null;
let episodeDurations = [];
fetch('episodes.json').then(r => { if(r.ok)return r.json(); return []; }).then(data => episodeDurations = data).catch(() => {});
function detailIntro(project){
 const wrap=document.createElement('div');wrap.className='detail-intro';
 const left=document.createElement('div'), title=document.createElement('h2'), subtitle=document.createElement('p'), description=document.createElement('p');
 title.id='dialog-title';title.textContent=project.title;subtitle.className='detail-subtitle';subtitle.textContent=project.subtitle;description.textContent=project.description;
 left.append(title,subtitle);wrap.append(left,description);return wrap;
}
function openProject(key, index=0){
 const project=projects[key];if(!project)return;
 currentProject=key;previousFocus=document.activeElement;galleryIndex=Number(index)||0;
 body.replaceChildren(detailIntro(project));
 $('#dialog-kicker').textContent='YAO JIAHAO / '+(project.type==='gallery'?'VISUAL DESIGN':'SCREENING ROOM');
 if(project.type==='gallery') renderGallery(project);
 else renderVideo(project);
 if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}
 dialog.scrollTop=0;$('#close-dialog').focus();
}
function renderGallery(project){
 const stage=document.createElement('div');stage.className='gallery-stage';stage.innerHTML='<img id="gallery-image" alt="">';
 const controls=document.createElement('div');controls.className='gallery-controls';controls.innerHTML='<button id="gallery-prev" aria-label="上一张海报">← 上一张</button><p id="gallery-label" aria-live="polite"></p><button id="gallery-next" aria-label="下一张海报">下一张 →</button>';
 const thumbs=document.createElement('div');thumbs.className='gallery-thumbs';
 project.images.forEach(([file,label],i)=>{const button=document.createElement('button');button.setAttribute('aria-label','查看 '+label);button.innerHTML=`<img src="assets/posters/${file}-thumb.webp" alt="">`;button.onclick=()=>{galleryIndex=i;updateGallery();};thumbs.append(button);});
 body.append(stage,controls,thumbs);
 $('#gallery-prev').onclick=()=>changeSlide(-1);$('#gallery-next').onclick=()=>changeSlide(1);updateGallery();
}
function changeSlide(delta){const p=projects[currentProject];galleryIndex=(galleryIndex+delta+p.images.length)%p.images.length;updateGallery();}
function updateGallery(){
 const p=projects[currentProject], [file,label]=p.images[galleryIndex];const img=$('#gallery-image');img.src=`assets/posters/${file}.webp`;img.alt=label;
 $('#gallery-label').replaceChildren(document.createTextNode(label));const small=document.createElement('small');small.textContent=`0${galleryIndex+1} / 0${p.images.length}`;$('#gallery-label').append(small);
 $$('.gallery-thumbs button').forEach((b,i)=>{b.classList.toggle('selected',i===galleryIndex);b.setAttribute('aria-pressed',String(i===galleryIndex));});
}
function renderVideo(project){
 const stage=document.createElement('div');stage.className='video-stage';
 const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label',project.title+' 视频播放器');
 const error=document.createElement('div');error.className='video-message';error.setAttribute('role','status');error.textContent='视频暂时无法加载，请检查网络后重新打开作品。';
 video.addEventListener('error',()=>error.style.display='block');video.addEventListener('loadeddata',()=>error.style.display='none');stage.append(video,error);
 if(project.type==='series'){
  const layout=document.createElement('div');layout.className='series-layout';const panel=document.createElement('div');panel.className='episode-panel';
  panel.innerHTML='<h3>全部剧集 <span>01—26</span></h3><p>点击选集 · 保留完整片长</p><div class="episode-grid" role="group" aria-label="选择剧集"></div><div class="episode-title"><span id="episode-current" aria-live="polite"></span><button class="next-episode">下一集 →</button></div>';
  for(let i=1;i<=26;i++){const b=document.createElement('button');b.className='episode';b.textContent=String(i).padStart(2,'0');b.setAttribute('aria-label',`播放第 ${i} 集`);b.onclick=()=>selectEpisode(i,true);$('.episode-grid',panel).append(b);}
  layout.append(stage,panel);body.append(layout);$('.next-episode').onclick=()=>selectEpisode(activeEpisode+1,true);
  video.addEventListener('ended',()=>{if(activeEpisode<26){$('.next-episode').textContent='继续下一集 →';$('.next-episode').focus();}});
  selectEpisode(1,false);
 }else{body.append(stage);video.poster=`assets/stills/${project.video}.jpg`;video.src=`assets/videos/${project.video}.mp4`;}
 const note=document.createElement('p');note.className='video-note';note.textContent=project.type==='series'?'竖屏作品建议使用全屏模式观看。播放完毕后可点击「下一集」继续。':'点击播放器开始观看 · 支持声音、进度调整与全屏播放';body.append(note);
}
function selectEpisode(number,autoplay){
 if(number<1||number>26)return;activeEpisode=number;
 const code=String(number).padStart(2,'0'), video=$('video',body);video.pause();video.poster=`assets/stills/episode-${code}.jpg`;video.src=`assets/videos/episode-${code}.mp4`;video.setAttribute('aria-label',`短剧第 ${number} 集视频播放器`);
 $$('.episode',body).forEach((b,i)=>{b.classList.toggle('active',i+1===number);b.setAttribute('aria-pressed',String(i+1===number));});
 const seconds=episodeDurations[number-1];const duration=seconds ? ` · ${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`:'';
 $('#episode-current').textContent=`第 ${number} 集${duration}`;$('.next-episode').disabled=number===26;$('.next-episode').textContent=number===26?'已到最后一集':'下一集 →';
 if(autoplay)video.play().catch(()=>{});
}
function closeProject(){if(dialog.open)dialog.close();}
$('#close-dialog').onclick=closeProject;
dialog.addEventListener('close',()=>{const v=$('video',body);if(v){v.pause();v.removeAttribute('src');v.load();}body.replaceChildren();document.body.style.overflow='';currentProject=null;previousFocus?.focus();});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeProject();});
dialog.addEventListener('keydown',event=>{if(projects[currentProject]?.type==='gallery'&&(event.key==='ArrowRight'||event.key==='ArrowLeft')){event.preventDefault();changeSlide(event.key==='ArrowRight'?1:-1);}});
$$('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(b.dataset.project,b.dataset.slide)));
$$('.filter').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;$$('.filter').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 let count=0;$$('.project-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden){count++;card.classList.add('visible');}});$('#filter-status').textContent=`展示 ${count} 个项目`;
}));
$('#copy-email').addEventListener('click',async()=>{
 const status=$('#copy-status');try{await navigator.clipboard.writeText('yjiah99@qq.com');status.textContent='邮箱已复制';}catch{status.textContent='邮箱：yjiah99@qq.com（可长按或选中复制）';}
});
if('IntersectionObserver' in window){document.documentElement.classList.add('js');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.07});$$('.project-card, .about-grid, .section-heading').forEach(el=>{el.classList.add('reveal');observer.observe(el);});}
