export function createRouter({ outlet, routes, notFound }) {
  let cleanup;

  function render() {
    cleanup?.();
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/home';
    const route = routes[pathname] || notFound;
    outlet.innerHTML = route.view();
    document.title = `${route.title} · Deadpool · Fuera de viñeta`;
    document.querySelectorAll('nav [data-link]').forEach((link) => {
      if (link.getAttribute('href') === pathname) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    cleanup = route.mount?.();
    outlet.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-link]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    if (url.href === window.location.href) return;
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    render();
  });
  window.addEventListener('popstate', render);
  if (window.location.pathname === '/') window.history.replaceState({}, '', '/home' + window.location.search + window.location.hash);
  render();
}
