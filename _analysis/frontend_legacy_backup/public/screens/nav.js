// Navigation injection script for all Stitch screens
// This script is injected at the bottom of each HTML file to add cross-page navigation

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
  // Don't inject on login page
  if (window.location.pathname.includes('01-login')) return;

  const currentPath = window.location.pathname;

  // Create the floating navigation panel
  const navPanel = document.createElement('div');
  navPanel.id = 'stitch-nav-panel';
  navPanel.style.cssText = `
    position: fixed; top: 50%; right: 0; transform: translateY(-50%);
    z-index: 9999; background: #f3f4f2; border: 1px solid #bcc9c5;
    border-right: none; border-radius: 12px 0 0 12px;
    box-shadow: -4px 4px 20px rgba(0,0,0,0.08);
    max-height: 80vh; overflow-y: auto; transition: width 0.3s ease;
    width: 48px;
  `;

  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;">menu</span>';
  toggleBtn.style.cssText = `
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border: none; background: #00685b;
    color: white; cursor: pointer; border-radius: 12px 0 0 0;
  `;

  let expanded = false;
  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    navPanel.style.width = expanded ? '220px' : '48px';
    navList.style.display = expanded ? 'block' : 'none';
    toggleBtn.innerHTML = expanded
      ? '<span class="material-symbols-outlined" style="font-size:20px;">close</span>'
      : '<span class="material-symbols-outlined" style="font-size:20px;">menu</span>';
  });

  const navList = document.createElement('div');
  navList.style.cssText = 'display: none; padding: 8px;';

  // Login link at top
  const loginLink = document.createElement('a');
  loginLink.href = '/screens/01-login.html';
  loginLink.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">logout</span><span style="margin-left:8px;">Logout</span>`;
  loginLink.style.cssText = `
    display: flex; align-items: center; padding: 8px 12px; margin-bottom: 4px;
    border-radius: 20px; text-decoration: none; font-size: 13px; font-family: Inter, sans-serif;
    color: #ba1a1a; background: #ffdad6; font-weight: 500;
  `;
  navList.appendChild(loginLink);

  // Divider
  const divider = document.createElement('div');
  divider.style.cssText = 'height: 1px; background: #bcc9c5; margin: 8px 0;';
  navList.appendChild(divider);

  NAV_ITEMS.forEach(item => {
    const link = document.createElement('a');
    link.href = item.href;
    const isActive = currentPath.includes(item.href.split('/').pop());
    link.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">${item.icon}</span><span style="margin-left:8px;">${item.label}</span>`;
    link.style.cssText = `
      display: flex; align-items: center; padding: 8px 12px; margin-bottom: 2px;
      border-radius: 20px; text-decoration: none; font-size: 13px; font-family: Inter, sans-serif;
      color: ${isActive ? '#00685b' : '#3d4946'};
      background: ${isActive ? '#d2e7e3' : 'transparent'};
      font-weight: ${isActive ? '600' : '400'};
      transition: background 0.2s;
    `;
    link.addEventListener('mouseenter', () => { if (!isActive) link.style.background = '#e2e3e1'; });
    link.addEventListener('mouseleave', () => { if (!isActive) link.style.background = 'transparent'; });
    navList.appendChild(link);
  });

  navPanel.appendChild(toggleBtn);
  navPanel.appendChild(navList);
  document.body.appendChild(navPanel);
})();
