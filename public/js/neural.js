// The reference skin belongs only to the landing and login pages.
(function () {
  const video = document.querySelector('.neural-art');
  const veil = document.querySelector('.neural-veil');
  const stylesheet = document.getElementById('neural-style');
  const interiorStylesheet = document.getElementById('neural-blue-style');
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.app-header');
  const nav = header?.querySelector('.nav');
  let active = false;
  let menuButton = null;
  function syncVideo() {
    if (!video) return;
    if (!active || query.matches) { video.pause(); if (query.matches) video.currentTime = 0; }
    else { const play = video.play(); if (play) play.catch(() => {}); }
  }
  function closeMenu() {
    header?.classList.remove('neural-menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
  // A single glass highlight follows the hovered/focused link, then returns to the current page.
  function mountNav(element) {
    if (!element) return () => {};
    element.classList.add('neural-sliding-nav');
    const glass = document.createElement('span');
    glass.className = 'neural-nav-glass';
    glass.setAttribute('aria-hidden', 'true');
    element.prepend(glass);
    let hovered = null;
    let frame = null;
    const links = () => [...element.querySelectorAll('a')];
    function update() {
      const focused = element.contains(document.activeElement) ? document.activeElement.closest('a') : null;
      const target = hovered || focused || element.querySelector('a.active');
      links().forEach(link => link.classList.toggle('is-nav-target', link === target));
      if (!target || !element.getClientRects().length) { glass.classList.remove('is-visible'); return; }
      const box = target.getBoundingClientRect(), bounds = element.getBoundingClientRect();
      glass.style.width = `${box.width}px`; glass.style.height = `${box.height}px`;
      glass.style.transform = `translate(${box.left - bounds.left + element.scrollLeft}px, ${box.top - bounds.top + element.scrollTop}px)`;
      glass.classList.add('is-visible');
    }
    function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }
    const over = event => { const link = event.target.closest('a'); if (link && element.contains(link)) { hovered = link; update(); } };
    const leave = () => { hovered = null; update(); };
    const focus = () => { hovered = null; update(); };
    element.addEventListener('pointerover', over);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('focusin', focus);
    element.addEventListener('focusout', schedule);
    const resize = new ResizeObserver(schedule); resize.observe(element);
    const changes = new MutationObserver(records => {
      if (records.some(record => record.target.tagName === 'A' &&
        (record.oldValue || '').split(/\s+/).includes('active') !== record.target.classList.contains('active'))) schedule();
    });
    changes.observe(element, { attributes:true, attributeFilter:['class'], attributeOldValue:true, subtree:true });
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); changes.disconnect();
      element.removeEventListener('pointerover', over); element.removeEventListener('pointerleave', leave);
      element.removeEventListener('focusin', focus); element.removeEventListener('focusout', schedule);
      glass.remove(); element.classList.remove('neural-sliding-nav');
    };
  }
  function setPage(path) {
    active = path === '/' || path === '/login' || path === '/admin/login';
    if (stylesheet) stylesheet.media = active ? 'all' : 'not all';
    if (interiorStylesheet) interiorStylesheet.media = active ? 'not all' : 'all';
    document.documentElement.toggleAttribute('data-neural-interior', !active);
    if (video) video.hidden = !active;
    if (veil) veil.hidden = !active;
    if (menuButton) menuButton.hidden = !active;
    closeMenu();
    if (active) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else window.yzTheme?.refresh();
    syncVideo();
  }
  if (nav) {
    mountNav(nav);
    nav.id = 'workspace-navigation';
    menuButton = document.createElement('button');
    menuButton.className = 'neural-workspace-menu';
    menuButton.type = 'button'; menuButton.setAttribute('aria-label', '打开主导航');
    menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-controls', nav.id);
    menuButton.innerHTML = '<svg viewBox="0 0 22 14" fill="none" stroke="currentColor" aria-hidden="true"><path d="M1 1h20M1 7h20M1 13h20"/></svg>';
    header.insertBefore(menuButton, nav);
    menuButton.addEventListener('click', () => {
      const open = header.classList.toggle('neural-menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (event) => {
      if (active && event.key === 'Escape' && header.classList.contains('neural-menu-open')) { closeMenu(); menuButton.focus(); }
    });
  }
  query.addEventListener ? query.addEventListener('change', syncVideo) : query.addListener(syncVideo);
  window.yzNeural = { setPage, mountNav };
  setPage(location.pathname);
})();
