// Navigation injection script for all Stitch screens
// 1. Shared dark-mode system (persisted `seph-theme`, overrides the light-fixed Material palette)
// 2. Cross-page navigation (skipped on the login page)

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', href: '/screens/02-dashboard.html' },
  { label: 'Drug Catalogue', icon: 'medication', href: '/screens/03-drug-catalogue.html' },
  { label: 'Drug Detail', icon: 'medical_information', href: '/screens/04-drug-detail.html' },
  { label: 'OTC Inventory', icon: 'inventory_2', href: '/screens/05-otc-inventory.html' },
  { label: 'Edit Record', icon: 'edit_note', href: '/screens/06-inventory-edit.html' },
  { label: 'New Record', icon: 'add_circle', href: '/screens/07-new-inventory.html' },
  { label: 'Interaction KB', icon: 'library_books', href: '/screens/08-interaction-kb.html' },
  { label: 'Interaction Checker', icon: 'science', href: '/screens/09-interaction-checker.html' },
  { label: 'AI Analyzer', icon: 'auto_awesome', href: '/screens/10-ai-analyzer.html' },
  { label: 'PV Reports', icon: 'assessment', href: '/screens/11-pv-reports.html' },
  { label: 'Live Sensors', icon: 'sensors', href: '/screens/12-live-sensors.html' },
  { label: 'Alerts', icon: 'notifications_active', href: '/screens/13-alerts.html' },
  { label: 'Settings', icon: 'settings', href: '/screens/14-settings.html' },
];

(function injectNavigation() {
  const THEME_KEY = 'seph-theme';
  const IS_LOGIN = window.location.pathname.includes('01-login');

  // -------------------------------------------------------------------------
  // 1. Dark-mode system
  // -------------------------------------------------------------------------
  const DARK_PALETTE = {
    'surface-container-lowest': '#041310',
    surface: '#0a1a13',
    background: '#0a1a13',
    'surface-bright': '#14302c',
    'surface-dim': '#0a1a13',
    'surface-container': '#0f2019',
    'surface-container-low': '#0d1d16',
    'surface-container-high': '#15261f',
    'surface-container-highest': '#193027',
    'surface-variant': '#27362f',
    outline: '#8a9a93',
    'outline-variant': '#2a3a33',
    'on-background': '#dbe7e0',
    'on-surface': '#dbe7e0',
    'on-surface-variant': '#a7c0b4',
    primary: '#64dac4',
    'on-primary': '#00382e',
    'primary-container': '#005046',
    'on-primary-container': '#9ff0e2',
    'primary-fixed': '#c6fcf0',
    'primary-fixed-dim': '#64dac4',
    'on-primary-fixed': '#004a3b',
    'on-primary-fixed-variant': '#007060',
    secondary: '#b6cbc7',
    'on-secondary': '#2a3d34',
    'secondary-container': '#384b46',
    'on-secondary-container': '#d2e7e3',
    'secondary-fixed': '#b6cbc7',
    'secondary-fixed-dim': '#828f8a',
    'on-secondary-fixed': '#3d4f4a',
    'on-secondary-fixed-variant': '#576661',
    tertiary: '#b1c9e4',
    'on-tertiary': '#22384d',
    'tertiary-container': '#475e76',
    'on-tertiary-container': '#d4e3f8',
    'tertiary-fixed': '#b1c9e4',
    'tertiary-fixed-dim': '#94aac4',
    'on-tertiary-fixed': '#2b4259',
    'on-tertiary-fixed-variant': '#596f86',
    error: '#ffb4ab',
    'on-error': '#93000a',
    'error-container': '#93000a',
    'on-error-container': '#ffdad6',
    'inverse-surface': '#e7e9e8',
    'inverse-on-surface': '#2f3130',
    'inverse-primary': '#00685b',
    'surface-tint': '#64dac4',
  };

  function applyTheme(forceDark) {
    const stored = forceDark !== undefined ? forceDark : localStorage.getItem(THEME_KEY) === 'dark';
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(stored ? 'dark' : 'light');
    return stored;
  }

  let isDark = applyTheme();

  function setDark(dark) {
    isDark = dark;
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* storage unavailable */ }
    applyTheme(dark);
    if (window.styleNavLinks) window.styleNavLinks();
    document.dispatchEvent(new CustomEvent('seph-themechange', { detail: { dark } }));
  }

  window.sephTheme = {
    isDark: () => isDark,
    toggle: () => setDark(!isDark),
  };

  // Build the token override stylesheet. The screens use a light-fixed Material
  // palette, so under `html.dark` we re-map every token utility to a deep
  // emerald dark equivalent with higher specificity than Tailwind's.
  const DARK_STYLE = (function () {
    const rules = [
      'html.dark { color-scheme: dark; background-color: #0a1a13; }',
      'html.dark body { background-color: #0a1a13; color: #dbe7e0; }',
    ];
    Object.keys(DARK_PALETTE).forEach((token) => {
      const c = DARK_PALETTE[token];
      rules.push(`html.dark .bg-${token} { background-color: ${c}; }`);
      rules.push(`html.dark .text-${token} { color: ${c}; }`);
      rules.push(`html.dark .border-${token} { border-color: ${c}; }`);
      rules.push(`html.dark .ring-${token} { --tw-ring-color: ${c}; }`);
    });
    ['outline-variant', 'surface-variant'].forEach((token) => {
      rules.push(`html.dark .divide-${token} > :not([hidden]) ~ :not([hidden]) { border-color: ${DARK_PALETTE[token]}; }`);
    });
    rules.push(`html.dark input:not([type='checkbox']):not([type='radio']), html.dark textarea, html.dark select { background-color: #0d1d16; color: #dbe7e0; }`);
    rules.push('html.dark ::placeholder { color: #8a9a93; }');
    rules.push('html.dark table { color: #dbe7e0; }');
    rules.push('html.dark [class*="toggle"] { color-scheme: dark; }');
    return rules.join('\n');
  })();

  const styleEl = document.createElement('style');
  styleEl.id = 'seph-dark-overrides';
  styleEl.textContent = DARK_STYLE;
  document.head.appendChild(styleEl);

  // -------------------------------------------------------------------------
  // 2. Navigation (skipped on login — it has its own inline controls)
  // -------------------------------------------------------------------------
  if (IS_LOGIN) return;

  const currentPath = window.location.pathname;

  const PALETTES = {
    light: {
      panelBg: '#f3f4f2', panelBorder: '#bcc9c5', text: '#3d4946', hover: '#e2e3e1',
      active: '#00685b', activeBg: '#d2e7e3', logout: '#ba1a1a', logoutBg: '#ffdad6', divider: '#bcc9c5',
    },
    dark: {
      panelBg: '#0d1d16', panelBorder: '#2a3a33', text: '#a7c0b4', hover: '#193027',
      active: '#64dac4', activeBg: '#123a2c', logout: '#ffb4ab', logoutBg: '#6a2a22', divider: '#2a3a33',
    },
  };

  const navPanel = document.createElement('div');
  navPanel.id = 'stitch-nav-panel';
  const links = [];
  let loginLink, divider, navList, toggleBtn;

  function palette() { return isDark ? PALETTES.dark : PALETTES.light; }

  function styleNavLinks() {
    const p = palette();
    navPanel.style.background = p.panelBg;
    navPanel.style.borderColor = p.panelBorder;
    divider.style.background = p.divider;
    links.forEach((l) => {
      const active = l.classList.contains('seph-nav-active');
      l.style.color = active ? p.active : p.text;
      l.style.background = active ? p.activeBg : 'transparent';
    });
    loginLink.style.color = p.logout;
    loginLink.style.background = p.logoutBg;
    if (toggleBtn) toggleBtn.style.background = p.active;
  }
  window.styleNavLinks = styleNavLinks;

  navPanel.style.cssText = `
    position: fixed; top: 50%; right: 0; transform: translateY(-50%);
    z-index: 9999; border: 1px solid #bcc9c5;
    border-right: none; border-radius: 12px 0 0 12px;
    box-shadow: -4px 4px 20px rgba(0,0,0,0.12);
    max-height: 80vh; overflow-y: auto; transition: width 0.3s ease;
    width: 48px;
  `;

  toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">menu</span>';
  toggleBtn.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border: none; background: #00685b;
    color: white; cursor: pointer; border-radius: 12px 0 0 0;
  `;

  // Theme toggle button — always visible, even when the panel is collapsed.
  const themeBtn = document.createElement('button');
  themeBtn.id = 'seph-theme-btn';
  themeBtn.setAttribute('aria-label', 'Toggle dark mode');
  themeBtn.title = 'Toggle dark mode';
  themeBtn.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border: none; background: transparent;
    color: #00685b; cursor: pointer; transition: background 0.2s, color 0.2s;
  `;
  const themeIcon = () => (document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode');
  const syncThemeBtn = () => {
    themeBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;">${themeIcon()}</span>`;
    styleNavLinks();
  };
  themeBtn.addEventListener('click', () => setDark(!document.documentElement.classList.contains('dark')));
  themeBtn.addEventListener('mouseenter', () => themeBtn.style.background = palette().hover);
  themeBtn.addEventListener('mouseleave', () => themeBtn.style.background = 'transparent');
  syncThemeBtn();

  let expanded = false;
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    navPanel.style.width = expanded ? '220px' : '48px';
    navList.style.display = expanded ? 'block' : 'none';
    toggleBtn.innerHTML = expanded
      ? '<span class="material-symbols-outlined" style="font-size:20px;">close</span>'
      : '<span class="material-symbols-outlined" style="font-size:20px;">menu</span>';
  });

  navList = document.createElement('div');
  navList.style.cssText = 'display: none; padding: 8px;';

  // Login link at top
  loginLink = document.createElement('a');
  loginLink.href = '/screens/01-login.html';
  loginLink.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">logout</span><span style="margin-left:8px;">Logout</span>`;
  loginLink.style.cssText = `
    display: flex; align-items: center; padding: 8px 12px; margin-bottom: 4px;
    border-radius: 20px; text-decoration: none; font-size: 13px; font-family: Inter, sans-serif;
    color: #ba1a1a; background: #ffdad6; font-weight: 500;
  `;
  navList.appendChild(loginLink);

  // Divider
  divider = document.createElement('div');
  divider.style.cssText = 'height: 1px; background: #bcc9c5; margin: 8px 0;';
  navList.appendChild(divider);

  NAV_ITEMS.forEach(item => {
    const link = document.createElement('a');
    link.href = item.href;
    const isActive = currentPath.includes(item.href.split('/').pop());
    link.classList.toggle('seph-nav-active', isActive);
    link.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">${item.icon}</span><span style="margin-left:8px;">${item.label}</span>`;
    link.style.cssText = `
      display: flex; align-items: center; padding: 8px 12px; margin-bottom: 2px;
      border-radius: 20px; text-decoration: none; font-size: 13px; font-family: Inter, sans-serif;
      font-weight: ${isActive ? '600' : '400'}; transition: background 0.2s;
    `;
    const p = palette();
    link.style.color = isActive ? p.active : p.text;
    link.style.background = isActive ? p.activeBg : 'transparent';
    link.addEventListener('mouseenter', () => { if (!isActive) link.style.background = p.hover; });
    link.addEventListener('mouseleave', () => { if (!isActive) link.style.background = 'transparent'; });
    links.push(link);
    navList.appendChild(link);
  });

  navPanel.appendChild(toggleBtn);
  navPanel.appendChild(themeBtn);
  navPanel.appendChild(navList);
  document.body.appendChild(navPanel);
  styleNavLinks();
})();