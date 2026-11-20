/* LinuxLab — offline, local-only training app. */
import { checkAnswer, checkIncidentCommand } from './answers.js';
import { DAILY_GOALS, PROGRESS_KEY, loadProgress, newProgress, parseProgress } from './progress.js';
import { readRoute, routePath } from './routes.js';
import { needsPractice, planPractice, recordAnswer } from './learning.js';
import { readings } from './readings.js';
import { registerOffline } from './pwa.js';

(() => {
'use strict';
const DATA = window.LINUXLAB;
if (!DATA) { document.getElementById('app').textContent='Не удалось загрузить учебные материалы'; return; }
const I = {
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
 terminal:'<rect x="2" y="3" width="20" height="18" rx="2"/><path d="m6 8 4 4-4 4M12 16h6"/>',
 pulse:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
 refresh:'<path d="M3 11a9 9 0 0 1 16.5-4.5L22 9"/><path d="M22 3v6h-6M21 13a9 9 0 0 1-16.5 4.5L2 15"/><path d="M2 21v-6h6"/>',
 library:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h7"/>',
 settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.07-1.9 1.9-.07-.06A1.7 1.7 0 0 0 16 18.4a1.7 1.7 0 0 0-1 1.56V21h-3v-1.04a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.07.06-1.9-1.9.06-.07A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1H5v-3h1.04a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87L7.2 8.06l1.9-1.9.07.06A1.7 1.7 0 0 0 11 6.6a1.7 1.7 0 0 0 1-1.56V4h3v1.04a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.07-.06 1.9 1.9-.06.07A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1H22v3h-1.04A1.7 1.7 0 0 0 19.4 15Z"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
 activity:'<path d="M3 12h3l3-7 6 14 3-7h3"/>',
 server:'<rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h7M11 17h7"/>',
 network:'<circle cx="12" cy="12" r="3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/><path d="m6 6 4 4m4 0 4-4M6 18l4-4m4 0 4 4"/>',
 key:'<circle cx="7" cy="15" r="4"/><path d="m10 12 10-10 2 2-2 2-2-2-2 2 2 2-2 2"/>',
 'hard-drive':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 13h20M6 17h.01M10 17h.01"/>',
 package:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
 boxes:'<path d="m12 2 8 4v9l-8 4-8-4V6l8-4Z"/><path d="m4 6 8 4 8-4M12 10v9M4 15l8 4 8-4"/>',
 lock:'<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 back:'<path d="m14 18-6-6 6-6"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
 flame:'<path d="M12 22c4 0 7-3 7-7 0-4-2-6-4-8 0 4-2 4-2 4C13 6 10 4 9 2c0 6-4 8-4 13 0 4 3 7 7 7Z"/>',
 trophy:'<path d="M8 21h8M12 17v4M7 4h10v8a5 5 0 0 1-10 0V4ZM7 6H4v2a4 4 0 0 0 3 4m10-6h3v2a4 4 0 0 1-3 4"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4"/>',
 upload:'<path d="M12 17V5m-4 4 4-4 4 4M5 17v4h14v-4"/>',
 alert:'<path d="m12 3 10 18H2L12 3Zm0 7v4m0 3h.01"/>',
 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 light:'<path d="M9 18h6M10 21h4M9 14a6 6 0 1 1 6 0c-1 1-1 2-1 4h-4c0-2 0-3-1-4Z"/>'
};
const icon = (k, n=18) => `<svg aria-hidden="true" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">${I[k]||I.terminal}</svg>`;
const h = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => { const d=new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
let progress = loadProgress(() => localStorage);
function save(next = progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    return true;
  } catch {
    toast('Не удалось записать данные в хранилище браузера. Сохрани резервную копию.');
    return false;
  }
}
const studied = id => !!progress.drills[id]?.correct;
const due = d => d?.seen && (d.due||0)<=Date.now();
const completed = id => !!progress.incidents[id]?.done;
const knowledge = ()=>DATA.drills.filter(x=>studied(x.id)).length;
const dueCount = (level = 0) => DATA.drills.filter(drill =>
  (!level || drill.level === level) && due(progress.drills[drill.id])
).length;
const doneInc = ()=>DATA.incidents.filter(x=>completed(x.id)).length;
const dateDone = day=>progress.daily[day]?.drills||0;
const goal=()=>progress.settings.dailyGoal;
function getStreak(){let days=0;const d=new Date(); if(!dateDone(today()))d.setDate(d.getDate()-1); for(let i=0;i<400;i++){const k=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');if(!dateDone(k))break;days++;d.setDate(d.getDate()-1);}return days;}
function logActivity(kind){const day=today();const row=progress.daily[day]||(progress.daily[day]={drills:0,incidents:0});row[kind]=(row[kind]||0)+1;}
function markDrill(ex, correct, perfect = false, revealed = false, exam = false, hadMiss = false) {
  const row = recordAnswer(progress.drills[ex.id], { correct, independent: perfect, hadMiss });
  const earnsCredit = correct && row.lastCreditDay !== today();
  if (earnsCredit) {
    row.lastCreditDay = today();
    logActivity('drills');
  }
  progress.drills[ex.id] = row;
  const reward = earnsCredit ? (revealed ? 1 : perfect ? (exam ? 15 : 10) : 5) : 0;
  progress.xp += reward;
  save();
  return reward;
}
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const countByModule=m=>m.drills.filter(d=>studied(d.id)).length;
const app=document.getElementById('app');
const nav=[['home','Главная','home'],['courses','Курсы','book'],['practice','Практика','terminal'],['incidents','Инциденты','pulse'],['review','Повторение','refresh'],['handbook','Справочник','library'],['settings','Настройки','settings']];
let view={page:'home',module:null,level:0,incidentFilter:0,courseFilter:0,handbookQuery:'',handbookCat:'Все',session:null,incident:null,feedback:null,entry:'',incidentEntry:'',showHint:false,incidentHint:false,showSolution:false};
const badges=['','Новичок','Базовый','Продвинутый','Эксперт'];
let toastTimer=null;
function toast(msg){document.querySelector('.toast')?.remove();const div=document.createElement('div');div.className='toast';div.setAttribute('role','status');div.textContent=msg;document.body.appendChild(div);clearTimeout(toastTimer);toastTimer=setTimeout(()=>div.remove(),3400);}
function announce(message) {
  document.getElementById('announcement').textContent = message;
}

function focusTo(selector, preventScroll = false) {
  document.querySelector(selector)?.focus({ preventScroll });
}

function showRoute({ focus = true } = {}) {
  const { page, id } = readRoute(location.hash, DATA);
  if (page === 'incident' && (view.incident?.id !== id || (view.page !== 'incident' && view.incident.finished))) {
    openIncident(id);
  }
  view.page = page;
  view.module = page === 'module' ? id : null;
  if (page === 'training' && !view.session) {
    view.page = 'practice';
    history.replaceState(null, '', routePath('practice'));
  }
  render();
  if (focus) {
    window.scrollTo(0, 0);
    const heading = document.querySelector('main h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
}

function go(page, id) {
  const path = routePath(page, id);
  if (location.hash !== path) history.pushState(null, '', path);
  showRoute();
}
function stats(){return `<div class="stats-grid">
  ${stat('Изучено команд',knowledge(),`из ${DATA.drills.length} упражнений`,'terminal')}
  ${stat('Повторить сегодня',dueCount(),'по интервальному графику','refresh')}
  ${stat('Инцидентов решено',doneInc(),`из ${DATA.incidents.length} сценариев`,'pulse')}
  ${stat('Общий опыт',progress.xp.toLocaleString('ru-RU'),'XP за практику','bolt')}
 </div>`;}
function stat(title,note,sub,ic){return `<div class="stat"><span class="stat-icon">${icon(ic,17)}</span><div class="stat-title">${h(title)}</div><div class="stat-number">${h(note)}</div><div class="stat-sub">${h(sub)}</div></div>`;}
function cardModule(m){const n=countByModule(m),per=Math.round(100*n/m.drills.length);return `<article class="module-card"><div class="card-top"><span class="glyph ${m.level===1?'green':m.level===4?'purple':''}">${icon(m.icon)}</span><span class="tiny-badge">${h(badges[m.level])}</span></div><div><h3>${h(m.title)}</h3></div><p class="card-desc">${h(m.desc)}</p><div class="progress-track"><div class="progress-fill" style="width:${per}%"></div></div><div class="card-bottom"><span>${n}/${m.drills.length} упражнений</span><a class="text-link" href="${routePath('module', m.id)}">${n?'Продолжить':'Изучить'} ${icon('arrow',13)}</a></div></article>`;}
function cardIncident(s){const done=completed(s.id);return `<article class="incident-card"><div class="card-top"><span class="glyph ${s.level===1?'green':s.level===3?'orange':''}">${icon(s.icon)}</span><span class="tiny-badge ${done?'good':''}">${done?'Пройден':h(badges[s.level])}</span></div><h3>${h(s.title)}</h3><p class="card-desc">${h(s.summary)}</p><div class="card-bottom"><span>${s.steps.length} диагностических шага</span><a class="text-link" href="${routePath('incident', s.id)}">${done?'Пройти ещё':'Разобрать'} ${icon('arrow',13)}</a></div></article>`;}
function activityGraph(){const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');days.push({key:k,label:['вс','пн','вт','ср','чт','пт','сб'][d.getDay()],count:dateDone(k),current:i===0});}const max=Math.max(goal(),...days.map(d=>d.count));return `<div class="daily-bars">${days.map(d=>`<div class="daily-bar-column ${d.current?'active':''}" title="${h(d.key)}: ${d.count} упражнений"><b style="height:${Math.max(3,Math.round((d.count/max)*80))}px;${!d.count?'background:#26394a':''}"></b><span>${d.label}</span></div>`).join('')}</div><div class="small-note">Сегодня выполнено ${dateDone(today())} из ${goal()} упражнений</div><div class="progress-track" style="margin-top:10px"><div class="progress-fill" style="width:${Math.min(100,Math.round(dateDone(today())/goal()*100))}%"></div></div>`;}
function dailyPlan() {
  const remaining = goal() - dateDone(today());
  return planPractice(DATA.drills, progress.drills, remaining > 0 ? Math.min(5, remaining) : 5);
}

let readingIndex;
let readingChoice = null;
function readingLab() {
  if (readingIndex === undefined) {
    readingIndex = Math.max(0, readings.findIndex(item => !progress.readings?.[item.drill]));
  }
  const item = readings[readingIndex];
  const answered = readingChoice !== null;
  const correct = readingChoice === item.correct;
  const solved = readings.filter(r => progress.readings?.[r.drill]).length;
  const response = answered ? item.options[readingChoice][1] : '';
  return `<section class="reading-lab" aria-labelledby="reading-title">
    <div class="lab-heading"><div><div class="eyebrow">Чтение вывода</div><h2 id="reading-title">${h(item.title)}</h2></div>
      <span class="lab-count">Разобрано ${solved}/${readings.length}</span></div>
    <div class="lab-grid"><div class="sample-terminal"><div class="terminal-caption">${icon('terminal', 15)} Учебный терминал</div>
      <code><span aria-hidden="true">$ </span>${h(item.command)}</code>
      <pre tabindex="0" aria-label="Пример вывода команды">${h(item.output)}</pre></div>
    <div class="reading-choices"><h3>${h(item.question)}</h3>
      ${item.options.map(([label], index) => `<button class="reading-option ${index === readingChoice ? (correct ? 'right' : 'wrong') : ''}" data-action="reading-answer" data-index="${index}" ${correct ? 'disabled' : ''}>${h(label)}${index === readingChoice ? icon(correct ? 'check' : 'info', 16) : ''}</button>`).join('')}
      ${answered ? `<div class="reading-feedback ${correct ? 'right' : ''}"><strong>${correct ? 'Верно.' : 'Посмотри ещё раз.'}</strong> ${h(response)}</div>` : ''}
    </div></div>
    <div class="lab-footer"><span>Пример ${readingIndex + 1} из ${readings.length}</span><div class="actions">
      ${correct ? `<button class="btn btn-soft" data-action="start" data-mode="single" data-id="${item.drill}">Набрать команду</button>` : ''}
      <button class="btn btn-ghost" data-action="reading-next">Другой пример ${icon('arrow', 14)}</button></div></div>
    </section>`;
}

function dashboard() {
  const plan = dailyPlan();
  const first = DATA.drills.find(d => d.id === plan[0].id);
  const remaining = Math.max(0, goal() - dateDone(today()));
  return `<section class="plan-hero">
    <div><div class="eyebrow">${remaining ? 'План на сегодня' : 'Дневная цель достигнута'}</div>
      <h1>${remaining ? 'Твоя тренировка' : 'Ещё немного практики'}</h1>
      <p>${dueCount() ? 'Начни с команд, которые пора вспомнить.' : knowledge() ? 'Продолжай с ближайшего задания своего уровня.' : 'Начни с базовых команд Ubuntu.'} Заданий в подборке — ${plan.length}.</p>
      <button class="btn btn-primary btn-lg" data-action="quick-start">${icon('terminal')} Начать тренировку</button>
    </div>
    <div class="plan-preview"><div class="plan-preview-label">${icon('target', 17)} Первое задание</div>
      <strong>${h(first.prompt)}</strong><span>${h(plan[0].reason)} · ${h(badges[first.level])}</span>
      <div class="goal-line"><span>Цель на день</span><b>${dateDone(today())} / ${goal()}</b></div>
      <progress aria-label="Цель на день" value="${Math.min(goal(), dateDone(today()))}" max="${goal()}"></progress>
    </div></section>
 ${readingLab()}
 ${stats()}
 <div class="surface"><div class="section-title" style="margin:0"><h2>Ритм обучения</h2><span class="tiny-badge">7 ДНЕЙ</span></div>${activityGraph()}</div>
 <div class="section-title"><h2>Учебные направления</h2><a class="text-link" href="#/courses">Все ${DATA.modules.length} модулей ${icon('arrow',14)}</a></div>
 <div class="cards-3">${DATA.modules.slice(0,6).map(cardModule).join('')}</div>
 <div class="section-title"><h2>Разбор инцидентов</h2><a class="text-link" href="#/incidents">Все сценарии ${icon('arrow',14)}</a></div>
 <div class="cards-3">${DATA.incidents.slice(0,3).map(cardIncident).join('')}</div>
 ${foot()}`;}
function foot(){return `<div class="footer-note">LinuxLab • учебная симуляция • команды на реальных серверах не выполняются • прогресс хранится на этом устройстве</div>`;}
function courseList(){const arr=DATA.modules.filter(m=>view.courseFilter===0||m.level===view.courseFilter);return `<div class="page-head"><div><div class="eyebrow">КАТАЛОГ ЗНАНИЙ</div><h1 class="page-title">Учебные модули</h1><p class="page-sub">${DATA.modules.length} направлений, ${DATA.drills.length} практических заданий. Изучи логику команд — затем набери их самостоятельно, не выбирая готовый ответ.</p></div></div><div class="section-top">${[0,1,2,3,4].map(l=>`<button class="filter ${view.courseFilter===l?'active':''}" data-action="course-filter" data-level="${l}" aria-pressed="${view.courseFilter===l}">${l===0?'Все':badges[l]}</button>`).join('')}</div><div class="module-grid">${arr.map(cardModule).join('')}</div>${foot()}`;}
function moduleDetail(){const m=DATA.modules.find(x=>x.id===view.module);if(!m)return courseList();const done=countByModule(m);return `<a class="text-link" href="#/courses">${icon('back',15)} Все модули</a><div class="page-head" style="margin-top:12px"><div><div class="eyebrow">${h(m.tag)} • ${h(badges[m.level])}</div><h1 class="page-title">${h(m.title)}</h1><p class="page-sub">${h(m.desc)}</p></div><div class="page-head-right"><button class="btn btn-primary" data-action="start" data-mode="module" data-id="${m.id}">${icon('terminal')} Практика (${m.drills.length})</button></div></div><div class="h-stack"><div class="flex-1">${m.lessons.map((lesson,i)=>`<article class="lesson"><span class="eyebrow">РАЗДЕЛ ${i+1} / ${m.lessons.length}</span><h3>${h(lesson[0])}</h3><p>${h(lesson[1])}</p><div class="code-block">${h(lesson[2])}</div></article>`).join('')}<div class="surface"><div class="section-title" style="margin:0 0 12px"><h2>Задания для закрепления</h2><span class="tiny-badge">${done}/${m.drills.length}</span></div>${m.drills.map((d,i)=>`<div class="topic-row"><div class="stepnum ${studied(d.id)?'passed':''}">${studied(d.id)?icon('check',15):i+1}</div><div><strong>${h(d.prompt)}</strong><small>${studied(d.id)?(due(progress.drills[d.id])?'Пора повторить':'Пройдено'):'Ещё не изучено'}</small></div></div>`).join('')}<div class="actions" style="margin-top:20px"><button class="btn btn-primary" data-action="start" data-mode="module" data-id="${m.id}">Запустить задания ${icon('arrow')}</button></div></div></div><aside class="aside-panel"><div class="surface"><div class="eyebrow">ПРОГРЕСС МОДУЛЯ</div><div class="summary-score" style="font-size:34px;margin:10px 0">${Math.round(100*done/m.drills.length)}%</div><div class="progress-track"><div class="progress-fill" style="width:${Math.round(100*done/m.drills.length)}%"></div></div><p class="sidebar-tip">Каждую команду нужно набрать самостоятельно. Ошибка не блокирует обучение — команда вернётся в повторение.</p></div><div class="surface"><div class="eyebrow">КАК УЧИТЬ</div><div class="learning-outcome">${icon('check')} Прочитай принцип работы</div><div class="learning-outcome">${icon('check')} Набери команды без подсказок</div><div class="learning-outcome">${icon('check')} Повтори ошибки в другой день</div></div></aside></div>${foot()}`;}
function startPanel(){return `<div class="eyebrow">ПРАКТИЧЕСКИЙ ТРЕНАЖЁР</div><h1 class="page-title">Практика Linux</h1><p class="page-sub">Выбери формат и сложность. Тренажёр проверяет команду, показывает пояснение и планирует интервальное повторение. Никакого исполнения на сервере.</p><div class="surface" style="margin-bottom:18px"><div class="section-top" style="margin-bottom:0"><strong style="margin-right:10px;font-size:13px">Уровень сложности</strong>${[0,1,2,3,4].map(l=>`<button class="filter ${view.level===l?'active':''}" data-action="level" data-level="${l}" aria-pressed="${view.level===l}">${l===0?'Все уровни':badges[l]}</button>`).join('')}</div></div><div class="cards-2">${preset('Смешанная тренировка','До 15 команд. Сначала запланированные повторения, затем новые задания по возрастанию сложности.','mixed','bolt')}${preset('Интервальное повторение',`${dueCount(view.level)} упражнений готовы к повторению. Здесь появляются ранее изученные команды, когда пора освежить память.`,'review','refresh')}${preset('Экзамен без подсказок','20 случайных заданий. До проверки ответа подсказки недоступны, результаты идут в общую статистику.','exam','trophy')}${preset('Только сложные команды','Задания с ошибками или подсказками. Два самостоятельных ответа по расписанию закрепляют команду.','weak','target')}</div>${readingLab()}<div class="section-title"><h2>Или выбери отдельный модуль</h2><a class="text-link" href="#/courses">Сначала теория ${icon('arrow',14)}</a></div><div class="module-grid">${DATA.modules.slice(0,6).map(cardModule).join('')}</div>${foot()}`;}
function preset(title,desc,mode,ic){return `<article class="preset"><span class="glyph green">${icon(ic)}</span><h3>${h(title)}</h3><p>${h(desc)}</p><button class="btn btn-primary" data-action="start" data-mode="${mode}">Начать ${icon('arrow',15)}</button></article>`;}
function buildQueue(mode, module, level) {
  const drills = DATA.drills.filter(d => !level || d.level === level);
  const history = progress.drills;
  if (mode === 'daily') return dailyPlan().map(item => item.id);
  if (mode === 'mixed') return planPractice(drills, history, 15).map(item => item.id);
  if (mode === 'single') return DATA.drills.filter(d => d.id === module).map(d => d.id);
  if (mode === 'retry') return [...view.session.toPractice];
  if (mode === 'review') return drills.filter(d => due(history[d.id]))
    .sort((a, b) => history[a.id].due - history[b.id].due).slice(0, 40).map(d => d.id);
  if (mode === 'weak') return drills.filter(d => needsPractice(history[d.id]))
    .sort((a, b) => history[a.id].due - history[b.id].due).slice(0, 30).map(d => d.id);
  if (mode === 'module') return shuffle(DATA.modules.find(m => m.id === module)?.drills || []).map(d => d.id);
  return shuffle(drills).slice(0, 20).map(d => d.id);
}
function startTraining(mode, module) {
  const level = view.page === 'training' ? view.session.level : view.page === 'practice' ? view.level : 0;
  const queue = buildQueue(mode, module, level);
  if (!queue.length) {
    toast(mode === 'review' ? 'Для выбранного уровня пока нет повторений.' : 'Для выбранного уровня пока нет подходящих заданий.');
    return;
  }
  view.session = { mode, module, level, queue, index: 0, correct: 0, firstTry: 0, missed: 0, earned: 0, answered: [], toPractice: [], done: false };
  resetAnswer();
  go('training');
  if (matchMedia('(pointer: fine)').matches) focusTo('#cmd-input', true);
}

function resetAnswer() {
  Object.assign(view.session, { attempts: 0, usedHint: false, revealed: false });
  Object.assign(view, { feedback: null, entry: '', showHint: false, showSolution: false });
}

function currentExercise(){return DATA.drills.find(x=>x.id===view.session?.queue[view.session.index]);}

function checkTrainer() {
  const s = view.session;
  const ex = currentExercise();
  if (!ex || s.answered.length > s.index) return;
  if (!view.entry.trim()) {
    toast('Сначала напиши команду.');
    return;
  }

  const result = checkAnswer(view.entry, ex.answers);
  if (result.correct) {
    const perfect = s.attempts === 0 && !s.usedHint && !s.revealed;
    const reward = markDrill(ex, true, perfect, s.revealed, s.mode === 'exam', s.attempts > 0);
    s.earned += reward;
    s.correct++;
    if (perfect) s.firstTry++;
    else s.toPractice.push(ex.id);
    s.answered.push(true);
    view.feedback = { type: 'good', title: perfect ? 'Верно. Без подсказок!' : 'Верно, решение найдено.', message: reward ? ex.why : ex.why + ' Сегодня это задание уже зачтено в XP и дневную цель.' };
  } else {
    s.attempts++;
    s.missed++;
    if (s.mode === 'exam') {
      s.answered.push(false);
      s.toPractice.push(ex.id);
      markDrill(ex, false);
      view.feedback = { type: 'bad', title: 'Ответ не принят', message: `Эталонный вариант: ${ex.answers[0]}. ${ex.why}` };
    } else {
      view.feedback = { type: 'bad', title: 'Пока не совсем', message: result.message };
    }
  }

  render();
  announce(`${view.feedback.title} ${view.feedback.message}`);
  focusTo(s.answered.length > s.index ? '[data-action="trainer-next"]' : '#cmd-input');
}

function nextTrainer(skip = false) {
  const s = view.session;
  const ex = currentExercise();
  if (!ex) return;
  if (skip && s.answered.length === s.index) {
    markDrill(ex, false);
    s.missed++;
    s.answered.push(false);
    s.toPractice.push(ex.id);
  }
  s.index++;
  s.done = s.index >= s.queue.length;
  resetAnswer();
  render();
  if (s.done) focusTo('#training-summary');
  else focusTo('#cmd-input');
}
function trainer(){const s=view.session;if(!s)return startPanel();if(s.done)return summaryTraining();const ex=currentExercise(),m=DATA.modules.find(x=>x.id===ex.moduleId),n=s.queue.length;
 const accepted=view.feedback?.type==='good',finalAnswered=!!view.feedback&&(accepted||s.mode==='exam');return `<a class="text-link" href="#/practice">${icon('back',15)} Режимы тренировки</a><div class="page-head" style="margin-top:10px"><div><div class="eyebrow">${s.mode==='exam'?'ЭКЗАМЕН':s.mode==='review'?'ПОВТОРЕНИЕ':s.mode==='weak'?'РАБОТА НАД ОШИБКАМИ':'ПРАКТИКА UBUNTU'}</div><h1 class="page-title">Задание ${s.index+1} <span style="color:var(--muted)">/ ${n}</span></h1><p class="page-sub">${h(m.title)} • ${h(badges[ex.level])}. ${s.mode === 'daily' ? 'Из плана на сегодня.' : 'Введи команду для этой задачи.'}</p></div><div class="page-head-right"><span class="tiny-badge good">+${s.earned} XP за сессию</span></div></div><div class="training-layout"><div class="train-card"><div class="train-head"><span class="eyebrow">${h(m.tag)}</span><span class="tiny-badge">${h(badges[ex.level])}</span></div><div class="train-body"><p class="prompt-label">ЗАДАЧА</p><div class="train-question" id="training-question">${h(ex.prompt)}</div><label class="prompt-label" for="cmd-input">ТВОЯ КОМАНДА</label><div class="command-wrap"><span class="command-dollar">$</span><input ${finalAnswered?'disabled':''} id="cmd-input" class="command-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="Введи команду Linux..." value="${h(view.entry)}" aria-label="Команда Linux" aria-describedby="training-question" /></div><p class="train-helper">${s.mode==='exam'?'Экзамен: подсказки недоступны.':'Enter — проверить · команды не запускаются, ответы проверяются локально.'}</p>
 ${view.showHint&&!finalAnswered?`<div class="feedback hint"><strong>Подсказка</strong>${h(ex.hint)}</div>`:''}
 ${view.showSolution&&!finalAnswered?`<div class="feedback hint"><strong>Пример решения</strong><code>${h(ex.answers[0])}</code><div style="margin-top:6px">Набери его самостоятельно, чтобы закрепить.</div></div>`:''}
 ${view.feedback?`<div class="feedback ${view.feedback.type==='good'?'good':'bad'}"><strong>${h(view.feedback.title)}</strong>${h(view.feedback.message)}</div>`:''}
 <div class="train-actions"><div class="train-action-left">${!finalAnswered&&s.mode!=='exam'?`<button class="btn btn-ghost btn-sm" data-action="trainer-hint" aria-pressed="${view.showHint}">${icon('light',15)} Подсказка</button><button class="btn btn-ghost btn-sm" data-action="trainer-solution" aria-pressed="${view.showSolution}">Решение</button>`:''}</div><div class="train-action-right">${!finalAnswered?`<button class="btn btn-ghost btn-sm" data-action="trainer-next" data-skip="1">Пропустить</button><button class="btn btn-primary" data-action="trainer-check">Проверить ${icon('arrow',15)}</button>`:`<button class="btn btn-primary" data-action="trainer-next">${s.index===n-1?'Завершить':'Дальше'} ${icon('arrow',15)}</button>`}</div></div></div></div>
 <div class="surface"><div class="eyebrow">ТВОЯ СЕССИЯ</div><div class="side-stat"><span>Правильных ответов</span><b>${s.correct}</b></div><div class="side-stat"><span>Ошибок / пропусков</span><b>${s.missed}</b></div><div class="side-stat"><span>С первого раза</span><b>${s.firstTry}</b></div><div class="side-stat"><span>Текущий прогресс</span><b>${s.index+1}/${n}</b></div><div class="queue-list">${s.queue.map((x,i)=>`<div class="queue-dot ${i<s.index?(s.answered[i]?'done':'miss'):i===s.index?'current':''}" title="Задание ${i+1}"></div>`).join('')}</div><div class="rule"></div><p class="sidebar-tip">${s.mode==='exam'?'На экзамене виден только результат текущего ответа. В реальном терминале нет кнопки с готовым решением.':'Программа оценивает команды в симуляторе. Иногда допустимая Linux-альтернатива может не входить в набор проверяемых вариантов.'}</p></div></div>${foot()}`;}
function summaryTraining() {
  const s = view.session;
  const retry = s.toPractice.length;
  const repeatMode = !['single', 'daily', 'retry'].includes(s.mode) && buildQueue(s.mode, s.module, s.level).length ? s.mode : 'daily';
  return `<div class="page-head"><div><div class="eyebrow">Сессия завершена</div>
    <h1 class="page-title" id="training-summary" tabindex="-1">Результат тренировки</h1></div></div>
    <div class="result-box"><div class="check">${icon('trophy', 38)}</div>
    <h2>Верно ${s.correct} из ${s.queue.length}</h2><p>Самостоятельно с первой попытки — ${s.firstTry}. Заработано ${s.earned} XP.</p>
    ${retry ? `<div class="recap"><h3>Стоит закрепить · ${retry}</h3><ul>${s.toPractice.map(id => `<li>${h(DATA.drills.find(d => d.id === id).prompt)}</li>`).join('')}</ul></div>` : ''}
    <div class="actions result-actions">${retry ? `<button class="btn btn-primary" data-action="start" data-mode="retry">Повторить трудные задания</button>` : ''}
      <button class="btn ${retry ? 'btn-ghost' : 'btn-primary'}" data-action="start" data-mode="${repeatMode}" data-id="${h(s.module || '')}">${repeatMode === 'daily' ? 'Следующая подборка' : 'Ещё одна сессия'} ${icon('arrow', 15)}</button>
      <a class="btn" href="#/practice">Все режимы</a></div></div>${foot()}`;
}
function incidentList(){let filtered=DATA.incidents.filter(x=>view.incidentFilter===0||x.level===view.incidentFilter);return `<div class="page-head"><div><div class="eyebrow">ИНЖЕНЕРНАЯ ДИАГНОСТИКА</div><h1 class="page-title">Инциденты Linux</h1><p class="page-sub">${DATA.incidents.length} учебных расследований: от упавшего nginx до OOM, DNS, TCP ACL и Docker. Пиши команды — симулятор возвращает диагностический вывод. Никаких опасных действий на настоящих серверах.</p></div></div><div class="section-top">${[0,1,2,3].map(l=>`<button class="filter ${view.incidentFilter===l?'active':''}" data-action="incident-filter" data-level="${l}" aria-pressed="${view.incidentFilter===l}">${l===0?'Все кейсы':badges[l]}</button>`).join('')}</div><div class="module-grid">${filtered.map(cardIncident).join('')}</div>${foot()}`;}
function openIncident(id) {
  const scenario = DATA.incidents.find(item => item.id === id);
  const symptoms = scenario.symptoms.map(symptom => '! ' + symptom).join('\n');
  view.incident = {
    id, stage: 0, attempts: 0, finished: false,
    history: [{ type: 'system', text: `${scenario.title}\n\n${scenario.summary}\n${symptoms}\n\nНачни диагностику командой.` }],
  };
  view.incidentEntry = '';
  view.incidentHint = false;
}
function currentIncident(){return DATA.incidents.find(x=>x.id===view.incident?.id);}
function submitIncident(){const session=view.incident,s=currentIncident();if(!session||!s||session.finished)return;const entered=view.incidentEntry.trim();if(!entered){toast('Напиши команду для следующего шага.');return;}
 const stage = s.steps[session.stage];
 session.history.push({ type: 'input', text: entered });
 const { correct: ok, message } = checkIncidentCommand(entered, stage);
 if(ok){session.history.push({type:'output',text:stage.output});session.history.push({type:'good',text:'✓ '+stage.learning});session.stage++;session.attempts=0;view.incidentHint=false;
 if(session.stage>=s.steps.length){session.finished=true;const prev=progress.incidents[s.id];if(!prev?.done){progress.xp+=60;logActivity('incidents');}progress.incidents[s.id]={done:true,completedAt:Date.now()};save();session.history.push({type:'system',text:'ИНЦИДЕНТ ЗАВЕРШЁН · Первопричина локализована.'});}
 }else{session.attempts++;const msg=message || (session.attempts<2?'Команда не является ожидаемым шагом в этом сценарии. Подумай, какие данные нужны для текущей цели.':'В симуляторе поддержаны не все реальные команды. Проверь цель шага или открой подсказку.');session.history.push({type:'bad',text:'↳ '+msg});}
 view.incidentEntry = '';
 render();
 announce(ok && !session.finished ? `Шаг пройден. ${stage.learning} Следующий шаг. ${s.steps[session.stage].goal}` : session.history.at(-1).text);
 focusTo(session.finished ? '#incident-result' : '#incident-input');
}
function incidentDetail() {
  const session = view.incident;
  const scenario = currentIncident();
  const step = scenario.steps[session.stage];
  return `
    <a class="text-link" href="#/incidents">${icon('back', 15)} Все инциденты</a>
    <div class="incident-banner">
      <span class="eyebrow">${h(scenario.category)} · ${h(badges[scenario.level])}</span>
      <h1>${h(scenario.title)}</h1>
      <p>${h(scenario.summary)}</p>
      <div class="symptoms">${scenario.symptoms.map(text => `<span class="symptom">${icon('alert', 12)} ${h(text)}</span>`).join('')}</div>
    </div>
    <div class="incident-layout">
      <div class="incident-goal">
        <div class="incident-stepbar" aria-hidden="true">${scenario.steps.map((_, index) => `<i class="${index < session.stage ? 'done' : index === session.stage ? 'current' : ''}"></i>`).join('')}</div>
        ${step ? `<div class="incident-stage" id="incident-stage"><strong>ШАГ ${session.stage + 1} ИЗ ${scenario.steps.length}</strong><p>${h(step.goal)}</p></div>` : ''}
      </div>
      <div class="terminal" id="sim-terminal" role="region" aria-label="Вывод терминала" tabindex="0">${session.history.map(row => `<div class="terminal-line ${row.type}">${row.type === 'input' ? '<span class="prompt">$</span>' : ''}${h(row.text)}</div>`).join('')}</div>
      <div class="incident-controls">
        ${session.finished ? `
          <div class="result-box">
            <div class="check">${icon('check', 35)}</div>
            <h2 id="incident-result" tabindex="-1">Инцидент расследован</h2>
            <p>Ты прошёл ${scenario.steps.length} шагов диагностики.</p>
            <div class="root"><strong>Первопричина</strong><br>${h(scenario.rootCause)}<br><br><strong>Разбор</strong><br>${h(scenario.debrief)}</div>
            <div class="actions">
              <button class="btn btn-primary" data-action="incident-restart">Повторить кейс</button>
              <a class="btn" href="#/incidents">Другие инциденты ${icon('arrow', 15)}</a>
            </div>
          </div>` : `
          <div class="command-wrap">
            <span class="command-dollar" aria-hidden="true">$</span>
            <input id="incident-input" class="command-input" type="text" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="done" placeholder="Введи следующую команду…" value="${h(view.incidentEntry)}" aria-label="Команда для диагностики" aria-describedby="incident-stage">
          </div>
          <div class="train-actions">
            <button class="btn btn-ghost btn-sm" data-action="incident-hint" aria-pressed="${view.incidentHint}">${icon('light', 15)} Подсказка</button>
            <button class="btn btn-primary" data-action="incident-submit">Выполнить в симуляторе ${icon('arrow', 15)}</button>
          </div>
          ${view.incidentHint ? `<div class="feedback hint"><strong>Возможный следующий шаг</strong><code>${h(step.hint)}</code></div>` : ''}
        `}
      </div>
    </div>
    ${foot()}`;
}

function reviewPage(){const arr=DATA.drills.filter(x=>due(progress.drills[x.id]));const weak=DATA.drills.filter(x=>needsPractice(progress.drills[x.id])).sort((a,b)=>progress.drills[b.id].fails-progress.drills[a.id].fails);return `<div class="page-head"><div><div class="eyebrow">ЗАПОМИНАНИЕ С ПОВТОРЕНИЕМ</div><h1 class="page-title">Повторение команд</h1><p class="page-sub">После успешного ответа интервалы растут: 1 → 3 → 7 → 14 → 30 → 60 дней. Ошибка отправляет команду на ближайшее повторение, чтобы закрепить слабое место.</p></div></div><div class="cards-2"><div class="surface"><div class="stat-title">Команд пора повторить</div><div class="summary-score" style="font-size:50px;margin:8px 0">${arr.length}</div><p class="small-note">По плану интервального повторения</p><button class="btn btn-primary" data-action="start" data-mode="review" ${arr.length?'':'disabled'}>Начать повторение ${icon('arrow',15)}</button></div><div class="surface"><div class="stat-title">Стоит закрепить</div><div class="summary-score" style="font-size:50px;margin:8px 0">${weak.length}</div><p class="small-note">После ошибки или подсказки. Два самостоятельных ответа по расписанию убирают задание из списка.</p><button class="btn btn-soft" data-action="start" data-mode="weak" ${weak.length?'':'disabled'}>Работа над ошибками ${icon('arrow',15)}</button></div></div><div class="section-title"><h2>Очередь повторения</h2></div>${arr.length?`<div class="surface" style="padding:0">${arr.slice(0,15).map(x=>`<div class="review-item"><span class="glyph">${icon('refresh',17)}</span><div><strong>${h(x.prompt)}</strong><small>${h(DATA.modules.find(m=>m.id===x.moduleId).title)}</small></div><span class="review-pill">Пора</span></div>`).join('')}</div>`:`<div class="empty"><span class="glyph green">${icon('check')}</span><h3>На сегодня всё повторено</h3><p>Изучи новые команды — они появятся здесь по расписанию.</p><button class="btn btn-primary" data-action="start" data-mode="mixed">Новые упражнения</button></div>`}${foot()}`;}
function handbookRows(){const q=view.handbookQuery.toLocaleLowerCase('ru').trim();const items=DATA.handbook.filter(x=>(view.handbookCat==='Все'||x[0]===view.handbookCat)&&(!q||x.join(' ').toLocaleLowerCase('ru').includes(q)));return items.length?items.map((x,i)=>`<div class="handbook-row"><span class="tiny-badge">${h(x[0])}</span><code>${h(x[1])}</code><span class="desc">${h(x[2])}</span><button class="copy-btn" data-action="copy" data-copy="${h(x[1])}" title="Копировать команду" aria-label="Копировать команду">${icon('copy')}</button></div>`).join(''):`<div class="empty">Ничего не найдено. Попробуй другой запрос.</div>`;}
function handbookPage(){const cats=['Все',...new Set(DATA.handbook.map(x=>x[0]))];return `<div class="page-head"><div><div class="eyebrow">КАРМАННЫЙ СПРАВОЧНИК</div><h1 class="page-title">Linux cheat sheet</h1><p class="page-sub">${DATA.handbook.length} готовых примеров для проверки синтаксиса. Но для устойчивой памяти полезнее сначала попытаться вспомнить команду самому.</p></div></div><div class="search-row"><input id="handbook-search" class="search" aria-label="Поиск по справочнику" placeholder="Поиск: journalctl, сеть, диски..." value="${h(view.handbookQuery)}" autocomplete="off"><select id="handbook-cat" class="select" aria-label="Категория">${cats.map(x=>`<option value="${h(x)}" ${view.handbookCat===x?'selected':''}>${h(x)}</option>`).join('')}</select></div><div class="handbook-table" id="handbook-results">${handbookRows()}</div>${foot()}`;}
let offlineStatus = 'Проверяется';

function settingsPage() {
  return `
    <h1 class="page-title">Настройки</h1>
    <p class="page-sub">Прогресс хранится в браузере. Резервная копия позволяет перенести его на другое устройство.</p>
    <div class="surface">
      <div class="setting-row">
        <label for="goal-select"><strong>Цель на день</strong></label>
        <select id="goal-select" class="select">${DAILY_GOALS.map(n => `<option value="${n}" ${goal() === n ? 'selected' : ''}>${n} заданий</option>`).join('')}</select>
      </div>
      <div class="setting-row">
        <div><strong>Резервная копия</strong><p>Скачай файл JSON со своим прогрессом.</p></div>
        <button class="btn" data-action="export">${icon('download', 15)} Экспорт</button>
      </div>
      <div class="setting-row">
        <div><strong>Восстановление прогресса</strong><p>Сохранённый в файле прогресс заменит текущий.</p></div>
        <button class="btn" data-action="import">${icon('upload', 15)} Импорт</button>
        <input id="import-file" type="file" accept=".json,application/json" hidden>
      </div>
      <div class="setting-row">
        <div><strong>Сброс статистики</strong><p>Удаляет историю обучения и возвращает настройки к исходным.</p></div>
        <button class="btn btn-danger" data-action="reset">Сбросить</button>
      </div>
    </div>
    <section class="surface install-help">
      <h2>Установка приложения</h2>
      <ul>
        <li><strong>Компьютер</strong> — выбери установку LinuxLab в меню Chrome или Edge. В Safari на macOS выбери «Файл» → «Добавить в Dock».</li>
        <li><strong>Android</strong> — открой меню браузера и выбери установку приложения или добавление на главный экран.</li>
        <li><strong>iPhone и iPad</strong> — в Safari нажми «Поделиться» → «На экран Домой» → «Добавить».</li>
      </ul>
      <p class="small-note">LinuxLab также работает в обычной вкладке.</p>
      <div class="side-stat"><span>Подключение</span><b id="connection-status">${navigator.onLine ? 'В сети' : 'Офлайн'}</b></div>
      <div class="side-stat"><span>Офлайн-режим</span><b id="offline-status">${h(offlineStatus)}</b></div>
    </section>
    ${foot()}`;
}

function pageName(){return ({home:'Обзор',courses:'Курсы',module:'Теория',practice:'Практика',training:'Тренажёр',incidents:'Инциденты',incident:'Симулятор',review:'Повторение',handbook:'Справочник',settings:'Настройки'})[view.page]||'Обзор';}
function activeNav(){return ({module:'courses',training:'practice',incident:'incidents'})[view.page]||view.page;}
function render() {
  const content = ({
    home: dashboard, courses: courseList, module: moduleDetail, practice: startPanel, training: trainer,
    incidents: incidentList, incident: incidentDetail, review: reviewPage, handbook: handbookPage, settings: settingsPage,
  })[view.page]();
  const active = activeNav();
  const reviews = dueCount();
  const navItem = ([page, label, symbol], className = 'nav-item') => `
    <a class="${className}${active === page ? ' active' : ''}" href="${routePath(page)}" ${active === page ? 'aria-current="page"' : ''}>
      ${icon(symbol)}<span>${h(label)}</span>${page === 'review' && reviews ? `<span class="nav-count">${reviews}</span>` : ''}
    </a>`;
  const more = nav.slice(4);
  app.innerHTML = `
    <a class="skip-link" href="#main-content" data-action="skip-link">Перейти к содержимому</a>
    <div class="layout">
      <aside class="sidebar">
        <div class="brand"><div class="brand-icon">&gt;_</div><div><strong>LinuxLab</strong><span>SYSADMIN ACADEMY</span></div></div>
        <div class="nav-label">РАБОЧЕЕ МЕСТО</div>
        <nav class="nav" aria-label="Основная навигация">${nav.slice(0, 4).map(item => navItem(item)).join('')}</nav>
        <div class="nav-label" style="margin-top:15px">ТВОЯ БИБЛИОТЕКА</div>
        <nav class="nav" aria-label="Учебные материалы">${more.map(item => navItem(item)).join('')}</nav>
        <div class="side-bottom">
          <div class="side-profile"><div class="mini-avatar">${icon('terminal', 19)}</div><div><strong>Личный прогресс</strong><span>${getStreak()} дн. подряд · ${progress.xp} XP</span></div></div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div class="crumb"><span>LinuxLab</span><span class="sep">/</span><strong>${h(pageName())}</strong></div>
          <div class="top-meta"><span class="streak">${icon('flame', 16)} ${getStreak()} <span>дн. серия</span></span><span class="xp-pill">${icon('bolt', 15)} ${progress.xp} XP</span></div>
        </header>
        <main class="content" id="main-content" tabindex="-1">${content}</main>
      </div>
    </div>
    <nav class="mobile-nav" aria-label="Навигация">
      ${nav.slice(0, 4).map(item => navItem(item, 'item')).join('')}
      <details class="nav-more">
        <summary class="item${more.some(([page]) => page === active) ? ' active' : ''}">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
          <span>Ещё</span>
        </summary>
        <div class="more-panel">${more.map(item => navItem(item)).join('')}</div>
      </details>
    </nav>`;
  const terminal = document.getElementById('sim-terminal');
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

app.addEventListener('click', event => {
  const anchor = event.target.closest('.more-panel a');
  if (anchor && anchor.getAttribute('href') === location.hash) {
    document.querySelector('.nav-more').open = false;
    focusTo('.nav-more summary');
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id, level, mode, skip } = target.dataset;
  switch (action) {
    case 'skip-link':
      event.preventDefault();
      focusTo('#main-content');
      break;
    case 'course-filter':
    case 'incident-filter':
    case 'level': {
      const property = { 'course-filter': 'courseFilter', 'incident-filter': 'incidentFilter', level: 'level' }[action];
      view[property] = Number(level);
      render();
      focusTo(`[data-action="${action}"][data-level="${level}"]`, true);
      break;
    }
    case 'quick-start':
      startTraining('daily');
      break;
    case 'start':
      startTraining(mode, id);
      break;
    case 'reading-answer': {
      const item = readings[readingIndex];
      readingChoice = Number(target.dataset.index);
      const correct = readingChoice === item.correct;
      if (correct && !progress.readings?.[item.drill]) {
        progress.readings ??= {};
        progress.readings[item.drill] = Date.now();
        save();
      }
      render();
      announce(item.options[readingChoice][1]);
      focusTo(correct ? '[data-action="reading-next"]' : `[data-action="reading-answer"][data-index="${readingChoice}"]`, true);
      break;
    }
    case 'reading-next':
      readingIndex = (readingIndex + 1) % readings.length;
      readingChoice = null;
      render();
      document.querySelector('#reading-title').tabIndex = -1;
      focusTo('#reading-title');
      break;
    case 'trainer-check':
      checkTrainer();
      break;
    case 'trainer-next':
      nextTrainer(skip === '1');
      break;
    case 'trainer-hint':
    case 'trainer-solution':
      if (action === 'trainer-hint') {
        view.showHint = !view.showHint;
        view.session.usedHint ||= view.showHint;
        if (view.showHint) announce(currentExercise().hint);
      } else {
        view.showSolution = !view.showSolution;
        view.session.revealed ||= view.showSolution;
        if (view.showSolution) announce(currentExercise().answers[0]);
      }
      render();
      focusTo(`[data-action="${action}"]`, true);
      break;
    case 'incident-restart':
      openIncident(view.incident.id);
      showRoute();
      if (matchMedia('(pointer: fine)').matches) focusTo('#incident-input');
      break;
    case 'incident-submit':
      submitIncident();
      break;
    case 'incident-hint':
      view.incidentHint = !view.incidentHint;
      if (view.incidentHint) announce(currentIncident().steps[view.incident.stage].hint);
      render();
      focusTo('[data-action="incident-hint"]', true);
      break;
    case 'copy':
      if (navigator.clipboard) {
        navigator.clipboard.writeText(target.dataset.copy).then(
          () => toast('Команда скопирована'),
          () => toast('Не удалось скопировать.'),
        );
      } else {
        toast('Копирование недоступно в этом браузере.');
      }
      break;
    case 'export':
      exportData();
      break;
    case 'import':
      document.getElementById('import-file').click();
      break;
    case 'reset':
      if (confirm('Точно удалить всю статистику LinuxLab на этом устройстве?')) restoreProgress(newProgress(), 'Прогресс сброшен');
      break;
  }
});

app.addEventListener('input', ({ target }) => {
  if (target.id === 'cmd-input') view.entry = target.value;
  if (target.id === 'incident-input') view.incidentEntry = target.value;
  if (target.id === 'handbook-search') {
    view.handbookQuery = target.value;
    document.getElementById('handbook-results').innerHTML = handbookRows();
  }
});

app.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const menu = document.querySelector('.nav-more[open]');
    if (menu) {
      menu.open = false;
      focusTo('.nav-more summary');
    }
  }
  if (event.key !== 'Enter' || event.isComposing) return;
  if (event.target.id === 'cmd-input' || event.target.id === 'incident-input') {
    event.preventDefault();
    if (event.repeat) return;
    if (event.target.id === 'cmd-input') checkTrainer();
    else submitIncident();
  }
});

function restoreProgress(next, message) {
  if (!save(next)) return;
  progress = next;
  readingIndex = undefined;
  readingChoice = null;
  view.session = null;
  view.incident = null;
  go('home');
  toast(message);
}

app.addEventListener('change', async ({ target }) => {
  if (target.id === 'handbook-cat') {
    view.handbookCat = target.value;
    document.getElementById('handbook-results').innerHTML = handbookRows();
  }
  if (target.id === 'goal-select') {
    const next = { ...progress, settings: { ...progress.settings, dailyGoal: Number(target.value) } };
    if (save(next)) {
      progress = next;
      toast('Дневная цель сохранена.');
    } else {
      target.value = goal();
    }
  }
  if (target.id === 'import-file' && target.files[0]) {
    try {
      const next = parseProgress(await target.files[0].text());
      if (confirm('Заменить текущий прогресс данными из файла?')) restoreProgress(next, 'Прогресс восстановлен.');
    } catch (error) {
      toast(error instanceof SyntaxError ? 'Не удалось прочитать JSON.' : error.message);
    } finally {
      target.value = '';
    }
  }
});

function exportData() {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `linuxlab-progress-${today()}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Резервная копия подготовлена.');
}

function updateConnection() {
  const status = document.getElementById('connection-status');
  if (status) status.textContent = navigator.onLine ? 'В сети' : 'Офлайн';
}

window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
window.addEventListener('hashchange', () => showRoute());
showRoute({ focus: false });
registerOffline(status => {
  offlineStatus = status;
  const label = document.getElementById('offline-status');
  if (label) label.textContent = status;
});
})();
