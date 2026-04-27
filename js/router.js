// Hash 기반 SPA 라우터

export class Router {
  constructor(routes) {
    this._routes = routes; // { path: string, viewId: string, init, destroy }[]
    this._current = null;

    window.addEventListener('hashchange', () => this._navigate());
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => this._navigate());
    } else {
      this._navigate();
    }
  }

  _getPath() {
    const hash = location.hash || '#/';
    return hash.replace(/^#/, '') || '/';
  }

  _navigate() {
    const path = this._getPath();
    const route = this._routes.find(r => r.path === path) || this._routes[0];

    // 현재 뷰 비활성화
    if (this._current) {
      this._current.destroy?.();
      document.getElementById(this._current.viewId)?.classList.remove('active');
    }

    // 새 뷰 활성화
    const viewEl = document.getElementById(route.viewId);
    if (viewEl) {
      viewEl.classList.add('active');
      route.init?.(viewEl);
    }

    this._current = route;

    // 네비게이션 활성 링크 표시
    document.querySelectorAll('#main-nav .nav-item').forEach(a => {
      const href = a.getAttribute('href').replace(/^#/, '');
      a.classList.toggle('active', href === path);
    });
  }

  go(path) {
    location.hash = '#' + path;
  }
}
