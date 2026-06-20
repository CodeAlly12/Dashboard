// ── Mock Data ──────────────────────────────────────────────────────────────
const reservations = [
  { guest: 'Sarah Johnson',    initials: 'SJ', property: 'HH Villa',     checkIn: 'Jun 15', checkOut: 'Jun 20', nights: 5, total: '$2,125', status: 'Confirmed',   channel: 'Airbnb' },
  { guest: 'Michael Chen',     initials: 'MC', property: 'Giant House',   checkIn: 'Jun 18', checkOut: 'Jun 25', nights: 7, total: '$3,850', status: 'Checked In',  channel: 'Booking.com' },
  { guest: 'Emma Wilson',      initials: 'EW', property: 'HH Villa',     checkIn: 'Jun 22', checkOut: 'Jun 28', nights: 6, total: '$2,550', status: 'Pending',     channel: 'Direct' },
  { guest: 'James Brown',      initials: 'JB', property: 'Giant House',   checkIn: 'Jun 20', checkOut: 'Jun 22', nights: 2, total: '$1,100', status: 'Confirmed',   channel: 'Expedia' },
  { guest: 'Olivia Davis',     initials: 'OD', property: 'HH Villa',     checkIn: 'Jul 1',  checkOut: 'Jul 8',  nights: 7, total: '$2,975', status: 'Confirmed',   channel: 'Airbnb' },
  { guest: 'William Taylor',   initials: 'WT', property: 'Giant House',   checkIn: 'Jul 5',  checkOut: 'Jul 12', nights: 7, total: '$3,850', status: 'Pending',     channel: 'Vrbo' },
  { guest: 'Ava Martinez',     initials: 'AM', property: 'HH Villa',     checkIn: 'Jul 10', checkOut: 'Jul 14', nights: 4, total: '$1,700', status: 'Confirmed',   channel: 'Airbnb' },
  { guest: 'Noah Anderson',    initials: 'NA', property: 'Giant House',   checkIn: 'Jun 10', checkOut: 'Jun 15', nights: 5, total: '$2,750', status: 'Checked Out', channel: 'Booking.com' },
  { guest: 'Isabella Thomas',  initials: 'IT', property: 'HH Villa',     checkIn: 'Jul 15', checkOut: 'Jul 22', nights: 7, total: '$2,975', status: 'Confirmed',   channel: 'Direct' },
  { guest: 'Liam Jackson',     initials: 'LJ', property: 'Giant House',   checkIn: 'Jul 20', checkOut: 'Jul 27', nights: 7, total: '$3,850', status: 'Pending',     channel: 'Expedia' },
];

const guests = [
  { name: 'Sarah Johnson',   initials: 'SJ', stays: 4, spend: '$8,400',  last: 'Jun 2026', rating: 5 },
  { name: 'Michael Chen',    initials: 'MC', stays: 6, spend: '$19,250', last: 'Jun 2026', rating: 5 },
  { name: 'Olivia Davis',    initials: 'OD', stays: 3, spend: '$7,100',  last: 'May 2026', rating: 4 },
  { name: 'James Brown',     initials: 'JB', stays: 2, spend: '$4,200',  last: 'Jun 2026', rating: 4 },
  { name: 'Isabella Thomas', initials: 'IT', stays: 5, spend: '$13,800', last: 'Apr 2026', rating: 5 },
  { name: 'Emma Wilson',     initials: 'EW', stays: 1, spend: '$2,550',  last: 'Jun 2026', rating: 5 },
];

const housekeepingTasks = [
  { room: 'Villa Suite — Room 1', task: 'Deep Clean',    status: 'In Progress', staff: 'Maria Santos',  time: '10:00 AM' },
  { room: 'Giant House — Pool Villa', task: 'Inspection', status: 'Completed',  staff: 'James Okafor',  time: '9:00 AM' },
  { room: 'HH Villa — Master Suite', task: 'Turnover',   status: 'Pending',    staff: 'Ana Rodriguez', time: '2:00 PM' },
  { room: 'Giant House — Garden Room', task: 'Restock',  status: 'Pending',    staff: 'Tom Nguyen',    time: '11:30 AM' },
  { room: 'HH Villa — Guest Room 2',  task: 'Clean',     status: 'Completed',  staff: 'Maria Santos',  time: '8:00 AM' },
  { room: 'Giant House — Terrace Suite', task: 'Clean',  status: 'In Progress', staff: 'Ana Rodriguez', time: '1:00 PM' },
];

const maintenanceIssues = [
  { title: 'Pool pump noise',         property: 'HH Villa',   priority: 'High',   status: 'Open',        reported: 'Jun 14' },
  { title: 'AC thermostat fault',     property: 'Giant House', priority: 'High',   status: 'In Progress', reported: 'Jun 15' },
  { title: 'Guest bathroom tap drip', property: 'HH Villa',   priority: 'Medium', status: 'Scheduled',   reported: 'Jun 13' },
  { title: 'Deck light replacement',  property: 'Giant House', priority: 'Low',    status: 'Open',        reported: 'Jun 12' },
  { title: 'Kitchen extractor fan',   property: 'HH Villa',   priority: 'Medium', status: 'Completed',   reported: 'Jun 10' },
];

const channels = [
  { name: 'Airbnb',      property: 'HH Villa',   color: '#FF5A5F', connected: true,  calSync: 'Synced', rateSync: 'Synced',  invSync: 'Synced', lastSync: '2 min ago' },
  { name: 'Booking.com', property: 'HH Villa',   color: '#003580', connected: true,  calSync: 'Synced', rateSync: 'Syncing', invSync: 'Synced', lastSync: '5 min ago' },
  { name: 'Direct',      property: 'HH Villa',   color: '#D4AF37', connected: true,  calSync: 'Synced', rateSync: 'Synced',  invSync: 'Synced', lastSync: 'Just now' },
  { name: 'Airbnb',      property: 'Giant House', color: '#FF5A5F', connected: true,  calSync: 'Synced', rateSync: 'Synced',  invSync: 'Synced', lastSync: '3 min ago' },
  { name: 'Booking.com', property: 'Giant House', color: '#003580', connected: true,  calSync: 'Error',  rateSync: 'Synced',  invSync: 'Synced', lastSync: '1 hr ago' },
  { name: 'Expedia',     property: 'Giant House', color: '#FFC72C', connected: false, calSync: 'Synced', rateSync: 'Synced',  invSync: 'Error',  lastSync: '2 hr ago' },
  { name: 'Vrbo',        property: 'Giant House', color: '#1A5276', connected: true,  calSync: 'Synced', rateSync: 'Synced',  invSync: 'Synced', lastSync: '8 min ago' },
  { name: 'Direct',      property: 'Giant House', color: '#D4AF37', connected: true,  calSync: 'Synced', rateSync: 'Synced',  invSync: 'Synced', lastSync: 'Just now' },
];

const messages = [
  { name: 'Sarah Johnson',   initials: 'SJ', preview: 'What time is early check-in?', time: '10:32 AM', active: true },
  { name: 'Michael Chen',    initials: 'MC', preview: 'Thank you for the welcome!',    time: 'Yesterday' },
  { name: 'Olivia Davis',    initials: 'OD', preview: 'Is the pool heated in June?',   time: 'Jun 14' },
  { name: 'James Brown',     initials: 'JB', preview: 'Airport transfer needed.',       time: 'Jun 13' },
];

const chatHistory = [
  { from: 'guest', text: 'Hello! I just wanted to check — what time is early check-in available?', time: '10:20 AM' },
  { from: 'staff', text: 'Hi Sarah! Welcome. Early check-in is available from 11:00 AM, subject to availability. I\'ll check on your room now!', time: '10:25 AM' },
  { from: 'guest', text: 'That\'s perfect, thank you so much! We land at 10:45 AM so that timing works great.', time: '10:28 AM' },
  { from: 'staff', text: 'Great news — your room will be ready by 11:00 AM. I\'ll send a message when it\'s all set. See you soon! 🌟', time: '10:32 AM' },
];

// ── Navigation ───────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard',       icon: 'layout-dashboard', label: 'Dashboard' },
  { id: 'reservations',    icon: 'calendar-check',   label: 'Reservations' },
  { id: 'channel-manager', icon: 'radio',            label: 'Channel Manager' },
  { id: 'revenue',         icon: 'trending-up',      label: 'Revenue' },
  { id: 'housekeeping',    icon: 'sparkles',         label: 'Housekeeping' },
  { id: 'maintenance',     icon: 'wrench',           label: 'Maintenance' },
  { id: 'guests',          icon: 'users',            label: 'Guests' },
  { id: 'calendar',        icon: 'calendar',         label: 'Calendar' },
  { id: 'messages',        icon: 'message-square',   label: 'Messages' },
  { id: 'marketing',       icon: 'megaphone',        label: 'Marketing' },
  { id: 'settings',        icon: 'settings',         label: 'Settings' },
];

function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = navItems.map(item => `
    <div class="nav-item ${item.id === 'dashboard' ? 'active' : ''}" data-section="${item.id}" onclick="navigate('${item.id}')">
      <i data-lucide="${item.icon}"></i>
      ${item.label}
    </div>
  `).join('');
}

function navigate(id) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  // Update header title
  const item = navItems.find(n => n.id === id);
  document.getElementById('page-title').textContent = item?.label || '';
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
  // Re-init icons for new section
  lucide.createIcons();
}

// ── KPI Counter Animation ────────────────────────────────────────────────────
function animateCounter(el, target, prefix = '', suffix = '') {
  let start = 0;
  const duration = 1200;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── Badge Helper ─────────────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    'Confirmed':   'badge-confirmed',
    'Checked In':  'badge-checked-in',
    'Checked Out': 'badge-checked-out',
    'Pending':     'badge-pending',
    'High':        'badge-high',
    'Medium':      'badge-medium',
    'Low':         'badge-low',
    'Completed':   'badge-confirmed',
    'In Progress': 'badge-checked-in',
    'Scheduled':   'badge-pending',
    'Open':        'badge-pending',
    'Synced':      'badge-synced',
    'Syncing':     'badge-pending',
    'Error':       'badge-error',
  };
  return `<span class="badge ${map[status] || 'badge-gold'}">${status}</span>`;
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// ── Section Builders ─────────────────────────────────────────────────────────

function buildDashboard() {
  // KPI cards animated on next frame
  setTimeout(() => {
    animateCounter(document.getElementById('kpi-revenue'), 847, '$', 'K');
    animateCounter(document.getElementById('kpi-occupancy'), 78, '', '%');
    animateCounter(document.getElementById('kpi-reservations'), 12);
    animateCounter(document.getElementById('kpi-adr'), 425, '$');
  }, 100);

  // Revenue chart
  const rCtx = document.getElementById('revenueChart')?.getContext('2d');
  if (rCtx) {
    new Chart(rCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'HH Villa',
            data: [32, 35, 41, 48, 52, 44, 58, 62, 55, 49, 38, 42],
            borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.1)',
            tension: 0.4, fill: true, pointRadius: 3,
          },
          {
            label: 'Giant House',
            data: [26, 27, 30, 37, 40, 34, 45, 50, 43, 38, 30, 35],
            borderColor: '#818CF8', backgroundColor: 'rgba(129,140,248,0.1)',
            tension: 0.4, fill: true, pointRadius: 3,
          },
        ],
      },
      options: chartOptions('$', 'K'),
    });
  }

  // Occupancy chart
  const oCtx = document.getElementById('occupancyChart')?.getContext('2d');
  if (oCtx) {
    new Chart(oCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          { label: 'HH Villa',    data: [65, 70, 75, 82, 88, 78], backgroundColor: 'rgba(212,175,55,0.7)', borderRadius: 6 },
          { label: 'Giant House', data: [58, 64, 69, 76, 84, 72], backgroundColor: 'rgba(129,140,248,0.7)', borderRadius: 6 },
        ],
      },
      options: chartOptions('', '%'),
    });
  }

  // Recent reservations
  const tbody = document.getElementById('recent-reservations');
  if (tbody) {
    tbody.innerHTML = reservations.slice(0, 5).map(r => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:8px">
          <div class="guest-avatar" style="width:30px;height:30px;font-size:11px">${r.initials}</div>
          ${r.guest}
        </div></td>
        <td>${r.property}</td>
        <td>${r.checkIn} – ${r.checkOut}</td>
        <td style="color:var(--gold);font-weight:600">${r.total}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${r.channel}</td>
      </tr>
    `).join('');
  }
}

function buildReservations() {
  const tbody = document.getElementById('reservations-body');
  if (!tbody) return;
  tbody.innerHTML = reservations.map(r => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div class="guest-avatar" style="width:30px;height:30px;font-size:11px">${r.initials}</div>
        ${r.guest}
      </div></td>
      <td>${r.property}</td>
      <td>${r.checkIn}</td>
      <td>${r.checkOut}</td>
      <td>${r.nights}</td>
      <td style="color:var(--gold);font-weight:600">${r.total}</td>
      <td>${statusBadge(r.status)}</td>
      <td><span style="color:var(--muted)">${r.channel}</span></td>
    </tr>
  `).join('');
}

function buildChannelManager() {
  const grid = document.getElementById('channel-grid');
  if (!grid) return;
  grid.innerHTML = channels.map(c => `
    <div class="card channel-card">
      <div class="channel-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="channel-icon" style="background:${c.color}">${c.name.slice(0,2).toUpperCase()}</div>
          <div>
            <div class="channel-name">${c.name}</div>
            <div class="channel-prop">${c.property}</div>
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${c.connected ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      ${['Calendar Sync', 'Rate Sync', 'Inventory Sync'].map((label, i) => {
        const s = [c.calSync, c.rateSync, c.invSync][i];
        return `<div class="sync-row"><span class="sync-label">${label}</span>${statusBadge(s)}</div>`;
      }).join('')}
      <div style="font-size:11px;color:var(--muted);margin-top:8px;display:flex;justify-content:space-between">
        <span>Last sync</span><span>${c.lastSync}</span>
      </div>
    </div>
  `).join('');
}

function buildRevenue() {
  const byChannelCtx = document.getElementById('revenueByChannel')?.getContext('2d');
  if (byChannelCtx) {
    new Chart(byChannelCtx, {
      type: 'bar',
      data: {
        labels: ['Airbnb', 'Booking.com', 'Expedia', 'Vrbo', 'Direct'],
        datasets: [{
          label: 'Revenue ($K)',
          data: [312, 198, 87, 124, 126],
          backgroundColor: ['#FF5A5F','#003580','#FFC72C','#1A5276','#D4AF37'].map(c => c + 'CC'),
          borderRadius: 6,
        }],
      },
      options: chartOptions('$', 'K'),
    });
  }

  const trendCtx = document.getElementById('revenueTrend')?.getContext('2d');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Revenue',
          data: [58, 62, 71, 85, 92, 78],
          borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.15)',
          tension: 0.4, fill: true,
        }],
      },
      options: chartOptions('$', 'K'),
    });
  }
}

function buildHousekeeping() {
  const grid = document.getElementById('hk-grid');
  if (!grid) return;
  grid.innerHTML = housekeepingTasks.map(t => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div class="task-room">${t.room.split('—')[1]?.trim() || t.room}</div>
          <div class="task-type">${t.room.split('—')[0]?.trim()}</div>
        </div>
        ${statusBadge(t.status)}
      </div>
      <div class="task-meta">
        <span class="task-staff">👤 ${t.staff}</span>
        <span style="color:var(--gold)">${t.time}</span>
      </div>
      <div style="margin-top:10px">
        <span class="badge badge-gold">${t.task}</span>
      </div>
    </div>
  `).join('');
}

function buildMaintenance() {
  const list = document.getElementById('maintenance-list');
  if (!list) return;
  list.innerHTML = maintenanceIssues.map(m => `
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-size:15px;font-weight:600;margin-bottom:4px">${m.title}</div>
          <div style="font-size:12px;color:var(--muted)">${m.property} · Reported ${m.reported}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          ${statusBadge(m.priority)}
          ${statusBadge(m.status)}
        </div>
      </div>
    </div>
  `).join('');
}

function buildGuests() {
  const grid = document.getElementById('guests-grid');
  if (!grid) return;
  grid.innerHTML = guests.map(g => `
    <div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div class="guest-avatar">${g.initials}</div>
        <div>
          <div class="guest-name">${g.name}</div>
          <div style="color:#F59E0B;font-size:13px">${stars(g.rating)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
        <div><div style="color:var(--muted);font-size:11px">TOTAL STAYS</div><div style="font-weight:700;color:var(--gold)">${g.stays}</div></div>
        <div><div style="color:var(--muted);font-size:11px">TOTAL SPEND</div><div style="font-weight:700;color:var(--gold)">${g.spend}</div></div>
        <div style="grid-column:1/-1"><div style="color:var(--muted);font-size:11px">LAST STAY</div><div style="font-weight:600">${g.last}</div></div>
      </div>
    </div>
  `).join('');
}

function buildCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const headers = days.map(d => `<div class="cal-header-cell">${d}</div>`).join('');

  // June 2026: starts on Monday (index 1)
  const events = {
    15: [{ label: 'Sarah J — HH Villa', cls: 'hh' }],
    18: [{ label: 'M. Chen — Giant House', cls: 'gh' }],
    20: [{ label: 'James B — Giant', cls: 'gh' }],
    22: [{ label: 'Emma W — HH Villa', cls: 'hh' }],
  };

  let cells = '<div class="cal-header-cell"></div>'; // offset for June starting Mon
  for (let d = 1; d <= 30; d++) {
    const ev = events[d] || [];
    cells += `<div class="cal-day ${d === 20 ? 'today' : ''}">
      <div class="cal-day-num">${d}</div>
      ${ev.map(e => `<div class="cal-event ${e.cls}">${e.label}</div>`).join('')}
    </div>`;
  }

  grid.innerHTML = headers + cells;
}

function buildMessages() {
  const convList = document.getElementById('conv-list');
  if (convList) {
    convList.innerHTML = messages.map((m, i) => `
      <div class="conv-item ${i === 0 ? 'active' : ''}">
        <div class="conv-avatar">${m.initials}</div>
        <div style="flex:1;min-width:0">
          <div class="conv-name">${m.name}</div>
          <div class="conv-preview">${m.preview}</div>
        </div>
        <div class="conv-time">${m.time}</div>
      </div>
    `).join('');
  }

  const chatMsgs = document.getElementById('chat-messages');
  if (chatMsgs) {
    chatMsgs.innerHTML = chatHistory.map(m => `
      <div class="msg ${m.from}">
        <div class="msg-bubble">${m.text}</div>
        <div class="msg-time">${m.time}</div>
      </div>
    `).join('');
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }
}

function buildMarketing() {
  const trafficCtx = document.getElementById('trafficChart')?.getContext('2d');
  if (trafficCtx) {
    new Chart(trafficCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Website Visitors',
          data: [1240, 1580, 2100, 2850, 3200, 2760],
          borderColor: '#D4AF37', backgroundColor: 'rgba(212,175,55,0.1)',
          tension: 0.4, fill: true,
        }],
      },
      options: chartOptions('', ''),
    });
  }

  const pieCtx = document.getElementById('attributionChart')?.getContext('2d');
  if (pieCtx) {
    new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['Airbnb', 'Booking.com', 'Direct', 'Expedia', 'Vrbo'],
        datasets: [{
          data: [37, 24, 15, 10, 14],
          backgroundColor: ['#FF5A5F','#003580','#D4AF37','#FFC72C','#1A5276'],
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        plugins: {
          legend: { labels: { color: '#94A3B8', font: { size: 12 } } },
        },
        cutout: '65%',
      },
    });
  }
}

// ── Chart Default Options ─────────────────────────────────────────────────────
function chartOptions(prefix, suffix) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94A3B8', font: { size: 12 }, boxWidth: 10 } },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: ctx => ` ${prefix}${ctx.parsed.y?.toLocaleString() || ctx.parsed}${suffix}`,
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { size: 11 }, callback: v => prefix + v + suffix } },
    },
  };
}

// ── Mobile Sidebar ────────────────────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  lucide.createIcons();

  // Build all sections upfront
  buildDashboard();
  buildReservations();
  buildChannelManager();
  buildRevenue();
  buildHousekeeping();
  buildMaintenance();
  buildGuests();
  buildCalendar();
  buildMessages();
  buildMarketing();

  lucide.createIcons();
});
