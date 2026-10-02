// Shared public landing and authenticated home; artifact transfers remain available.
import { post, get, key } from './api.js';
import { esc, $$, toast, fail, confirmBox, TYPE_NAME, MODULE_NAME } from './ui.js';
const arrow = '<svg viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 8h21M16 2l6 6-6 6"/></svg>';
const mark = '<svg viewBox="0 0 23 17" aria-hidden="true"><path d="M8.15 .9H4.55L.5 9.3h3.6Z M17 0h-3.6L6.15 16.4h3.6Z M22.9 0h-3.6L15 7.6h3.6Z M22.6 6.9H19l-4.95 9.5h3.6Z"/></svg>';
export function pageWelcome(root, { navigate } = {}) { return renderHero(root, null, navigate); }
export async function pageHome(root, { navigate }) {
  const home = await get('/api/home');
  const cleanup = renderHero(root, home, navigate);
  $$('.neural-transfer[data-from]', root).forEach((button) => button.addEventListener('click', () => doTransfer(button.dataset.from, home.current[button.dataset.from], () => navigate('/'))));
  return cleanup;
}
function renderHero(root, home, navigate) {
  document.body.classList.add('is-home');
  const signedIn = !!home;
  const transfer = (from, text) => `<button class="neural-transfer" data-from="${from}" ${home.current[from] ? '' : 'disabled'} title="${home.current[from] ? esc(home.current[from].title) : '暂无当前产物，创建后即可流转'}">${text}${arrow}</button>`;
  root.innerHTML = `<section class="neural-home" aria-labelledby="neural-title">
    ${signedIn ? '' : `<header class="neural-bar"><a class="neural-brand" href="/" data-link="/">${mark}<span>研思智境</span></a><input type="checkbox" class="neural-toggle" id="welcome-menu"><label class="neural-burger" for="welcome-menu" aria-label="打开导航菜单"><svg viewBox="0 0 22 14" fill="none" stroke="currentColor"><path d="M1 1h20M1 7h20M1 13h20"/></svg></label><nav class="neural-navigation" aria-label="首页导航"><a href="/seminar" data-link="/seminar">研课场</a><a href="/classroom" data-link="/classroom">演课场</a><a href="/research" data-link="/research">评价与科研</a><a href="/login" data-link="/login">登录 / 开始体验 ${arrow}</a><a class="neural-nav-pill" href="/manual" target="_blank" rel="noopener">操作手册</a></nav></header>`}
    <div class="neural-hero">
      <h1 id="neural-title"><span>让每一次国际中文教学构想</span><span>在真实课堂前，先被看见。</span></h1>
      <p class="neural-sub">多智能体协同研课与课堂预演<br>让教研有依据，让教学有准备。</p>
      <div class="neural-portals" data-active="seminar" role="group" aria-label="选择教研工作台">
        <span class="neural-choice-glass" aria-hidden="true"></span>
        <a id="portal-seminar" class="neural-portal neural-cta" href="/seminar" data-link="/seminar" data-choice="seminar"><span>${signedIn ? '进入研课场' : '开启你的教研之旅'}</span>${arrow}</a>
        <a id="portal-classroom" class="neural-portal neural-secondary" href="/classroom" data-link="/classroom" data-choice="classroom"><span>${signedIn ? '进入演课场' : '探索课堂预演'}</span>${arrow}</a>
      </div>
      <ul class="neural-features"><li>协同研课</li><li>课堂预演</li><li>循证评价</li><li>持续改进</li></ul>
      <span class="neural-rule" aria-hidden="true"></span>
    </div>
    <footer class="neural-footer"><span>“研—演—评—改”多智能体数字教研实验工坊</span>${signedIn ? `<div class="neural-flow">${transfer('seminar', '教案 → 课堂')}${transfer('classroom', '课堂 → 研讨')}</div>` : '<span>Research · Rehearse · Reflect</span>'}<small>学习者为智能体，模拟结果不代表真实学生表现</small></footer>
  </section>`;
  const toggle = root.querySelector('#welcome-menu');
  const cleanupNav = window.yzNeural?.mountNav(root.querySelector('.neural-navigation'));
  const closeMenu = (event) => { if (event.key === 'Escape' && toggle) toggle.checked = false; };
  document.addEventListener('keydown', closeMenu);
  const portals = root.querySelector('.neural-portals');
  let pressTimer = null;
  const choose = (event) => {
    const link = event.target.closest('.neural-portal');
    if (link) portals.dataset.active = link.dataset.choice;
  };
  portals.addEventListener('pointerover', choose);
  portals.addEventListener('focusin', choose);
  portals.addEventListener('pointerleave', () => {
    if (!portals.contains(document.activeElement)) portals.dataset.active = 'seminar';
  });
  portals.addEventListener('focusout', (event) => {
    if (!portals.contains(event.relatedTarget) && !portals.matches(':hover')) portals.dataset.active = 'seminar';
  });
  portals.addEventListener('click', (event) => {
    const link = event.target.closest('.neural-portal');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault(); event.stopPropagation();
    if (pressTimer !== null) return;
    portals.dataset.active = link.dataset.choice;
    link.classList.add('is-pressed');
    pressTimer = setTimeout(() => {
      pressTimer = null;
      if (navigate) navigate(link.dataset.link); else location.assign(link.href);
    }, 140);
  });
  return () => { clearTimeout(pressTimer); cleanupNav?.(); document.body.classList.remove('is-home'); document.removeEventListener('keydown', closeMenu); };
}
export async function doTransfer(from, src, redraw) {
  if (!src) return;
  const to = from === 'seminar' ? 'classroom' : 'seminar', draft = src.status === 'draft';
  const ok = await confirmBox('确认流转', `<p style="font-size:calc(18px * var(--fs));margin:0 0 10px;color:var(--gold)">${MODULE_NAME[from]} → ${MODULE_NAME[to]}</p><dl class="kv"><dt>源产物</dt><dd>${esc(src.title)}</dd><dt>版本</dt><dd>v${src.version}${draft ? '（未保存草稿）' : ''}</dd><dt>类型</dt><dd>${esc(TYPE_NAME[src.type] || src.type)}</dd><dt>摘要</dt><dd class="small">${esc(src.summary)}</dd></dl>`, draft ? '保存当前版本并导入' : '确认');
  if (!ok) return;
  try { const result = await post('/api/transfers', { from, idempotency_key: key('xfer'), save_draft: draft }); toast(`已导入${MODULE_NAME[to]}：${result.target.title} · v${result.target.version}`); redraw(); } catch (error) { fail(error); }
}
