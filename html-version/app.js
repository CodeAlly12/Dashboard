'use strict';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const reservations = [
  { guest: 'Sarah Johnson',    initials: 'SJ', property: 'HH Villa',    checkIn: '2026-06-15', checkOut: '2026-06-20', nights: 5, total: 2125, status: 'Confirmed',   channel: 'Airbnb' },
  { guest: 'Michael Chen',     initials: 'MC', property: 'Giant House', checkIn: '2026-06-18', checkOut: '2026-06-25', nights: 7, total: 3850, status: 'Checked In',  channel: 'Booking.com' },
  { guest: 'Emma Wilson',      initials: 'EW', property: 'HH Villa',    checkIn: '2026-06-22', checkOut: '2026-06-28', nights: 6, total: 2550, status: 'Pending',     channel: 'Direct' },
  { guest: 'James Brown',      initials: 'JB', property: 'Giant House', checkIn: '2026-06-20', checkOut: '2026-06-22', nights: 2, total: 1100, status: 'Confirmed',   channel: 'Expedia' },
  { guest: 'Olivia Davis',     initials: 'OD', property: 'HH Villa',    checkIn: '2026-07-01', checkOut: '2026-07-08', nights: 7, total: 2975, status: 'Confirmed',   channel: 'Airbnb' },
  { guest: 'William Taylor',   initials: 'WT', property: 'Giant House', checkIn: '2026-07-05', checkOut: '2026-07-12', nights: 7, total: 3850, status: 'Pending',     channel: 'Vrbo' },
  { guest: 'Ava Martinez',     initials: 'AM', property: 'HH Villa',    checkIn: '2026-07-10', checkOut: '2026-07-14', nights: 4, total: 1700, status: 'Confirmed',   channel: 'Airbnb' },
  { guest: 'Noah Anderson',    initials: 'NA', property: 'Giant House', checkIn: '2026-06-10', checkOut: '2026-06-15', nights: 5, total: 2750, status: 'Checked Out', channel: 'Booking.com' },
  { guest: 'Isabella Thomas',  initials: 'IT', property: 'HH Villa',    checkIn: '2026-07-15', checkOut: '2026-07-22', nights: 7, total: 2975, status: 'Confirmed',   channel: 'Direct' },
  { guest: 'Liam Jackson',     initials: 'LJ', property: 'Giant House', checkIn: '2026-07-20', checkOut: '2026-07-27', nights: 7, total: 3850, status: 'Pending',     channel: 'Expedia' }
];

const guests = [
  { name: 'Sarah Johnson',  initials: 'SJ', stays: 3, spend: 6800,  lastStay: '2026-06-20', rating: 5, property: 'HH Villa' },
  { name: 'Michael Chen',   initials: 'MC', stays: 2, spend: 7700,  lastStay: '2026-06-25', rating: 5, property: 'Giant House' },
  { name: 'Emma Wilson',    initials: 'EW', stays: 1, spend: 2550,  lastStay: '2026-06-28', rating: 4, property: 'HH Villa' },
  { name: 'James Brown',    initials: 'JB', stays: 4, spend: 5200,  lastStay: '2026-06-22', rating: 4, property: 'Giant House' },
  { name: 'Olivia Davis',   initials: 'OD', stays: 2, spend: 5950,  lastStay: '2026-07-08', rating: 5, property: 'HH Villa' },
  { name: 'Noah Anderson',  initials: 'NA', stays: 5, spend: 12500, lastStay: '2026-06-15', rating: 5, property: 'Giant House' }
];

// ─── State ────────────────────────────────────────────────────────────────────

let currentSection = 'dashboard';
let currentFilter = 'all';
let calendarYear = 2026;
let calendarMonth = 5;
let currentProperty = 'all';
const initializedCharts = new Set();

// ─── Navigation ───────────────────────────────────────────────────────────────

function navigateTo(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById('section-' + section);
  if (target) target.classList.add('active');

  const navItem = document.querySelector('[data-section="' + section + '"]');
  if (navItem) navItem.classList.add('active');

  currentSection = section;

  if (!initializedCharts.has(section)) {
    initChartsForSection(section);
    initializedCharts.add(section);
  }

  closeSidebar();
}

// ─── Chart Defaults ───────────────────────────────────────────────────────────

const CHART_DEFAULTS = {
  color: {
    gold: '#D4AF37',
    goldLight: '#E8C84A',
    goldFill: 'rgba(212,175,55,0.15)',
    blue: '#3B82F6',
    blueFill: 'rgba(59,130,246,0.15)',
    green: '#22C55E',
    purple: '#A855F7',
    red: '#EF4444',
    amber: '#F59E0B',
  },
  font: { family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", size: 11 },
  gridColor: 'rgba(255,255,255,0.06)',
  tickColor: '#64748B',
};

function baseChartOptions(hasLegend) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!hasLegend,
        labels: {
          color: CHART_DEFAULTS.tickColor,
          font: CHART_DEFAULTS.font,
          usePointStyle: true,
          pointStyleWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(212,175,55,0.3)',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: CHART_DEFAULTS.gridColor },
        ticks: { color: CHART_DEFAULTS.tickColor, font: CHART_DEFAULTS.font }
      },
      y: {
        grid: { color: CHART_DEFAULTS.gridColor },
        ticks: { color: CHART_DEFAULTS.tickColor, font: CHART_DEFAULTS.font }
      }
    }
  };
}

function initChartsForSection(section) {
  if (section === 'dashboard') {
    initRevenueChart();
    initOccupancyChart();
  } else if (section === 'revenue') {
    initMonthlyTrendChart();
    initRevenueByChannelChart();
  } else if (section === 'marketing') {
    initTrafficChart();
    initAttributionChart();
  }
}

function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  const opts = baseChartOptions(false);
  opts.plugins.legend.display = false;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'HH Villa',
          data: [8200, 9100, 10500, 11200, 12800, 14100],
          borderColor: CHART_DEFAULTS.color.gold,
          backgroundColor: CHART_DEFAULTS.color.goldFill,
          borderWidth: 2.5,
          pointBackgroundColor: CHART_DEFAULTS.color.gold,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Giant House',
          data: [11000, 12400, 13100, 14800, 15600, 17200],
          borderColor: CHART_DEFAULTS.color.blue,
          backgroundColor: CHART_DEFAULTS.color.blueFill,
          borderWidth: 2.5,
          pointBackgroundColor: CHART_DEFAULTS.color.blue,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.4,
        }
      ]
    },
    options: opts
  });
}

function initOccupancyChart() {
  const ctx = document.getElementById('occupancyChart');
  if (!ctx) return;
  const opts = baseChartOptions(true);
  opts.scales.y.max = 100;
  opts.scales.y.ticks.callback = function(v) { return v + '%'; };
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'HH Villa',
          data: [72, 68, 81, 85, 90, 88],
          backgroundColor: CHART_DEFAULTS.color.goldFill,
          borderColor: CHART_DEFAULTS.color.gold,
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'Giant House',
          data: [78, 74, 86, 91, 94, 92],
          backgroundColor: CHART_DEFAULTS.color.blueFill,
          borderColor: CHART_DEFAULTS.color.blue,
          borderWidth: 1.5,
          borderRadius: 4,
        }
      ]
    },
    options: opts
  });
}

function initMonthlyTrendChart() {
  const ctx = document.getElementById('monthlyTrendChart');
  if (!ctx) return;
  const opts = baseChartOptions(false);
  opts.plugins.legend.display = false;
  opts.scales.y.ticks.callback = function(v) { return '$' + (v / 1000).toFixed(0) + 'k'; };
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Total Revenue',
        data: [19200, 21500, 23600, 26000, 28400, 31300],
        borderColor: CHART_DEFAULTS.color.gold,
        backgroundColor: CHART_DEFAULTS.color.goldFill,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_DEFAULTS.color.gold,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: opts
  });
}

function initRevenueByChannelChart() {
  const ctx = document.getElementById('revenueByChannelChart');
  if (!ctx) return;
  const opts = baseChartOptions(false);
  opts.plugins.legend.display = false;
  opts.scales.y.ticks.callback = function(v) { return '$' + (v / 1000).toFixed(0) + 'k'; };
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Airbnb', 'Booking.com', 'Direct', 'Expedia', 'Vrbo'],
      datasets: [{
        label: 'Revenue',
        data: [9600, 6600, 5525, 4950, 3850],
        backgroundColor: [
          'rgba(255,90,96,0.3)',
          'rgba(0,115,230,0.3)',
          CHART_DEFAULTS.color.goldFill,
          'rgba(253,200,0,0.3)',
          CHART_DEFAULTS.color.blueFill,
        ],
        borderColor: ['#FF5A60', '#0073E6', CHART_DEFAULTS.color.gold, '#FDC800', CHART_DEFAULTS.color.blue],
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: opts
  });
}

function initTrafficChart() {
  const ctx = document.getElementById('trafficChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Organic',
          data: [1200, 1450, 1800, 2100, 2400, 2750],
          borderColor: CHART_DEFAULTS.color.green,
          backgroundColor: 'rgba(34,197,94,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
        {
          label: 'Paid',
          data: [600, 750, 980, 1100, 1300, 1450],
          borderColor: CHART_DEFAULTS.color.blue,
          backgroundColor: CHART_DEFAULTS.color.blueFill,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
        {
          label: 'Social',
          data: [300, 420, 510, 680, 790, 920],
          borderColor: CHART_DEFAULTS.color.purple,
          backgroundColor: 'rgba(168,85,247,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }
      ]
    },
    options: baseChartOptions(true)
  });
}

function initAttributionChart() {
  const ctx = document.getElementById('attributionChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Airbnb', 'Booking.com', 'Direct', 'Expedia', 'Vrbo'],
      datasets: [{
        data: [32, 22, 18, 16, 12],
        backgroundColor: [
          'rgba(255,90,96,0.8)',
          'rgba(0,115,230,0.8)',
          'rgba(212,175,55,0.8)',
          'rgba(253,200,0,0.8)',
          'rgba(59,130,246,0.7)',
        ],
        borderColor: 'rgba(15,23,42,0.5)',
        borderWidth: 2,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: CHART_DEFAULTS.tickColor,
            font: CHART_DEFAULTS.font,
            usePointStyle: true,
            pointStyleWidth: 8,
            padding: 12,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          borderColor: 'rgba(212,175,55,0.3)',
          borderWidth: 1,
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(ctx) { return ' ' + ctx.label + ': ' + ctx.parsed + '%'; }
          }
        }
      }
    }
  });
}

// ─── Animated Counters ────────────────────────────────────────────────────────

function animateCounter(element, target, duration) {
  if (!element) return;
  duration = duration || 1400;
  const start = performance.now();
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = target * easeOut(progress);
    element.textContent = Math.round(value).toLocaleString('en-US');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  animateCounter(document.getElementById('counter-revenue'), 30525);
  animateCounter(document.getElementById('counter-occupancy'), 88);
  animateCounter(document.getElementById('counter-reservations'), 10);
  animateCounter(document.getElementById('counter-adr'), 547);
}

// ─── Reservations ─────────────────────────────────────────────────────────────

function statusBadgeClass(status) {
  var map = {
    'Confirmed': 'badge-confirmed',
    'Pending': 'badge-pending',
    'Checked In': 'badge-checked-in',
    'Checked Out': 'badge-checked-out',
  };
  return map[status] || 'badge-confirmed';
}

function formatDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderReservations(filter) {
  if (filter !== undefined) currentFilter = filter;
  var tbody = document.getElementById('reservationsBody');
  if (!tbody) return;

  var filtered = currentFilter === 'all'
    ? reservations
    : reservations.filter(function(r) { return r.status === currentFilter; });

  var propertyFiltered = currentProperty === 'all'
    ? filtered
    : filtered.filter(function(r) {
        if (currentProperty === 'hh-villa') return r.property === 'HH Villa';
        if (currentProperty === 'giant-house') return r.property === 'Giant House';
        return true;
      });

  tbody.innerHTML = propertyFiltered.map(function(r) {
    return '<tr>' +
      '<td><div class="guest-cell"><div class="guest-initials">' + r.initials + '</div>' + r.guest + '</div></td>' +
      '<td>' + r.property + '</td>' +
      '<td>' + formatDate(r.checkIn) + '</td>' +
      '<td>' + formatDate(r.checkOut) + '</td>' +
      '<td>' + r.nights + '</td>' +
      '<td>$' + r.total.toLocaleString('en-US') + '</td>' +
      '<td><span class="channel-tag">' + r.channel + '</span></td>' +
      '<td><span class="badge ' + statusBadgeClass(r.status) + '">' + r.status + '</span></td>' +
      '<td><div style="display:flex;gap:6px">' +
        '<button class="btn btn-sm btn-secondary">View</button>' +
        '<button class="btn btn-sm btn-primary">Edit</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

// ─── Guests ───────────────────────────────────────────────────────────────────

function renderGuests(query) {
  var grid = document.getElementById('guestsGrid');
  if (!grid) return;

  var q = (query || '').toLowerCase().trim();
  var filtered = q
    ? guests.filter(function(g) { return g.name.toLowerCase().includes(q) || g.property.toLowerCase().includes(q); })
    : guests;

  var propertyFiltered = currentProperty === 'all'
    ? filtered
    : filtered.filter(function(g) {
        if (currentProperty === 'hh-villa') return g.property === 'HH Villa';
        if (currentProperty === 'giant-house') return g.property === 'Giant House';
        return true;
      });

  grid.innerHTML = propertyFiltered.map(function(g) {
    var stars = '★'.repeat(g.rating) + '☆'.repeat(5 - g.rating);
    return '<div class="guest-card">' +
      '<div class="guest-card-header">' +
        '<div class="guest-avatar">' + g.initials + '</div>' +
        '<div>' +
          '<div class="guest-name">' + g.name + '</div>' +
          '<div class="guest-sub">' + g.property + '</div>' +
          '<div class="guest-stars">' + stars + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="guest-stats">' +
        '<div class="guest-stat"><span class="stat-value">' + g.stays + '</span><span class="stat-label">Stays</span></div>' +
        '<div class="guest-stat"><span class="stat-value">$' + (g.spend / 1000).toFixed(1) + 'k</span><span class="stat-label">Total Spend</span></div>' +
        '<div class="guest-stat"><span class="stat-value">' + formatDate(g.lastStay) + '</span><span class="stat-label">Last Stay</span></div>' +
      '</div>' +
      '<div class="guest-card-actions">' +
        '<button class="btn btn-sm btn-secondary" style="flex:1">View Profile</button>' +
        '<button class="btn btn-sm btn-primary" style="flex:1">Message</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function getBookedDates() {
  var map = {};
  function addRange(checkIn, checkOut, property) {
    var cur = new Date(checkIn + 'T00:00:00');
    var end = new Date(checkOut + 'T00:00:00');
    while (cur < end) {
      var key = cur.toISOString().slice(0, 10);
      if (!map[key]) map[key] = { villa: false, house: false };
      if (property === 'HH Villa') map[key].villa = true;
      if (property === 'Giant House') map[key].house = true;
      cur.setDate(cur.getDate() + 1);
    }
  }
  reservations.forEach(function(r) { addRange(r.checkIn, r.checkOut, r.property); });
  return map;
}

function renderCalendar(year, month) {
  var grid = document.getElementById('calendarGrid');
  var titleEl = document.getElementById('calMonthTitle');
  if (!grid) return;

  calendarYear = year;
  calendarMonth = month;

  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  if (titleEl) titleEl.textContent = monthNames[month] + ' ' + year;

  var bookedDates = getBookedDates();
  var today = new Date();
  var todayStr = today.toISOString().slice(0, 10);

  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var daysInPrev = new Date(year, month, 0).getDate();

  var dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var html = dayHeaders.map(function(d) { return '<div class="cal-day-header">' + d + '</div>'; }).join('');

  for (var i = firstDay - 1; i >= 0; i--) {
    html += '<div class="cal-day other-month">' + (daysInPrev - i) + '</div>';
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var mm = String(month + 1).padStart(2, '0');
    var dd = String(d).padStart(2, '0');
    var dateStr = year + '-' + mm + '-' + dd;
    var booked = bookedDates[dateStr];
    var classes = 'cal-day';
    if (dateStr === todayStr) {
      classes += ' today';
    } else if (booked) {
      if (booked.villa && booked.house) classes += ' booked-both';
      else if (booked.villa) classes += ' booked-villa';
      else if (booked.house) classes += ' booked-house';
    }
    html += '<div class="' + classes + '">' + d + '</div>';
  }

  var totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  var nextDays = totalCells - firstDay - daysInMonth;
  for (var n = 1; n <= nextDays; n++) {
    html += '<div class="cal-day other-month">' + n + '</div>';
  }

  grid.innerHTML = html;
}

// ─── Channel Toggles ─────────────────────────────────────────────────────────

function initChannelToggles() {
  document.querySelectorAll('.channel-toggle').forEach(function(toggle) {
    toggle.addEventListener('change', function() {
      var card = this.closest('.channel-card');
      if (!card) return;
      var statusEl = card.querySelector('.channel-sync-status');
      if (!statusEl) return;
      if (this.checked) {
        statusEl.className = 'channel-sync-status synced';
        statusEl.innerHTML = '<i data-lucide="check-circle"></i> Synced';
      } else {
        statusEl.className = 'channel-sync-status warning';
        statusEl.innerHTML = '<i data-lucide="alert-circle"></i> Disabled';
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
}

// ─── Property Switcher ────────────────────────────────────────────────────────

function initPropertySwitcher() {
  var switcher = document.getElementById('propertySwitcher');
  if (!switcher) return;
  switcher.addEventListener('change', function() {
    currentProperty = this.value;
    renderReservations();
    renderGuests();
  });
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

function initMobileSidebar() {
  var hamburger = document.getElementById('hamburger');
  var overlay = document.getElementById('sidebarOverlay');
  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────

function initDarkModeToggle() {
  var btn = document.getElementById('darkModeToggle');
  var icon = document.getElementById('darkModeIcon');
  if (!btn) return;
  var isDark = true;
  btn.addEventListener('click', function() {
    isDark = !isDark;
    document.body.classList.toggle('light', !isDark);
    if (icon) {
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });
}

// ─── Navigation Init ─────────────────────────────────────────────────────────

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var section = this.getAttribute('data-section');
      if (section) navigateTo(section);
    });
  });

  document.querySelectorAll('.card-link[data-section]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var section = this.getAttribute('data-section');
      if (section) navigateTo(section);
    });
  });
}

function initReservationFilters() {
  var tabs = document.getElementById('reservationFilters');
  if (!tabs) return;
  tabs.addEventListener('click', function(e) {
    var tab = e.target.closest('.filter-tab');
    if (!tab) return;
    tabs.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    renderReservations(tab.getAttribute('data-filter'));
  });
}

function initGuestSearch() {
  var input = document.getElementById('guestSearch');
  if (!input) return;
  input.addEventListener('input', function() { renderGuests(this.value); });
}

function initCalendarNav() {
  var prev = document.getElementById('calPrev');
  var next = document.getElementById('calNext');
  if (prev) {
    prev.addEventListener('click', function() {
      calendarMonth--;
      if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
      renderCalendar(calendarYear, calendarMonth);
    });
  }
  if (next) {
    next.addEventListener('click', function() {
      calendarMonth++;
      if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
      renderCalendar(calendarYear, calendarMonth);
    });
  }
}

function initConversationList() {
  document.querySelectorAll('.conversation-item').forEach(function(item) {
    item.addEventListener('click', function() {
      document.querySelectorAll('.conversation-item').forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
    });
  });
}

function initHousekeepingFilters() {
  var section = document.getElementById('section-housekeeping');
  if (!section) return;
  var tabs = section.querySelectorAll('.filter-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  initNavigation();
  initMobileSidebar();
  initDarkModeToggle();
  initPropertySwitcher();

  initCounters();
  initChartsForSection('dashboard');
  initializedCharts.add('dashboard');

  renderReservations('all');
  initReservationFilters();

  renderGuests();
  initGuestSearch();

  renderCalendar(2026, 5);
  initCalendarNav();

  initChannelToggles();
  initConversationList();
  initHousekeepingFilters();

  if (typeof lucide !== 'undefined') lucide.createIcons();
});
