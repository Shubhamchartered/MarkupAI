/* ══════════════════════════════════════════════════════════
   MARKUP GST Pro — App Logic
   Powered by 381 real records from GST DB.xlsx
   ══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── State ─────────────────────────── */
  const state = {
    allData: [],
    filtered: [],
    currentPage: 1,
    pageSize: 25,
    sortKey: null,
    sortAsc: true,
    searchQ: '',
    stateFilter: '',
  };

  /* ── GST State Code Map ─────────────── */
  const stateMap = {
    '01': 'J&K', '02': 'HP', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
    '09': 'UP', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
    '17': 'Meghalaya', '18': 'Assam', '19': 'WB', '20': 'Jharkhand',
    '21': 'Odisha', '22': 'Chhattisgarh', '23': 'MP', '24': 'Gujarat',
    '27': 'Maharashtra', '28': 'AP', '29': 'Karnataka', '30': 'Goa',
    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
    '35': 'A&N', '36': 'Telangana', '37': 'AP(New)', '38': 'Ladakh',
    '97': 'Other Territory', '99': 'Centre',
  };

  const AVATAR_COLORS = [
    '#4f46e5', '#2563eb', '#7c3aed', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#be185d', '#9333ea', '#0284c7',
  ];

  function getStateFromGSTN(gstn) {
    if (!gstn || gstn.length < 2) return 'N/A';
    const code = gstn.substring(0, 2);
    return stateMap[code] || code;
  }

  function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function initials(name) {
    return (name || 'U').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  /* ── Theme Toggle ───────────────────── */
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const saved = localStorage.getItem('markup-theme') || 'dark';
  applyTheme(saved);

  themeBtn.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme');
    applyTheme(curr === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('markup-theme', t);
    themeIcon.className = t === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
  }

  /* ── Sidebar Toggle (mobile) ────────── */
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  /* ── Navigation ─────────────────────── */
  const navLinks = document.querySelectorAll('.nav-link[id], .nav-sub[id]');
  const views    = document.querySelectorAll('.view');

  // Sub-view IDs that belong to the "Client" group
  const CLIENT_SUBVIEWS = new Set(['clients', 'notices', 'legal', 'comms']);

  function navigateTo(viewId) {
    views.forEach(v => v.classList.remove('active'));
    // Clear all nav-link active states (including .nav-sub items)
    document.querySelectorAll('.nav-link[id], .nav-sub[id]').forEach(l => l.classList.remove('active'));

    const targetView = document.getElementById('view-' + viewId);
    const targetLink = document.getElementById('nav-' + viewId);
    if (targetView) targetView.classList.add('active');
    if (targetLink) targetLink.classList.add('active');

    // Handle Client group toggle highlight
    const clientToggle  = document.getElementById('navClientToggle');
    const clientSubmenu = document.getElementById('navClientSubmenu');
    const clientCaret   = document.getElementById('navClientCaret');

    if (CLIENT_SUBVIEWS.has(viewId)) {
      // Open submenu and mark group-active
      clientToggle?.classList.add('group-active');
      clientSubmenu?.classList.add('open');
      clientCaret?.classList.add('open');
    } else {
      clientToggle?.classList.remove('group-active');
      // Don't close submenu automatically — let toggle handle it
    }

    if (viewId === 'clients') renderClientTable();
  }

  // Wire up all nav links with IDs
  document.querySelectorAll('.nav-link[id], .nav-sub[id]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const vid = link.id.replace('nav-', '');
      navigateTo(vid);
    });
  });

  // Client group toggle (open/close submenu)
  const clientToggle  = document.getElementById('navClientToggle');
  const clientSubmenu = document.getElementById('navClientSubmenu');
  const clientCaret   = document.getElementById('navClientCaret');

  if (clientToggle) {
    clientToggle.addEventListener('click', () => {
      const isOpen = clientSubmenu.classList.toggle('open');
      clientCaret.classList.toggle('open', isOpen);
      // Navigate to clients view on first open
      if (isOpen && !CLIENT_SUBVIEWS.has(getCurrentView())) {
        navigateTo('clients');
      }
    });
  }

  function getCurrentView() {
    const active = document.querySelector('.view.active');
    return active ? active.id.replace('view-', '') : 'dashboard';
  }

  document.getElementById('viewAllLink')?.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('clients');
  });

  /* ── Date Label ─────────────────────── */
  const dateLabel = document.getElementById('dateLabel');
  dateLabel.textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });

  /* ── Data Initialisation ────────────── */
  function init() {
    // CLIENT_DATA is loaded from client_data.js (381 records from GST DB.xlsx)
    state.allData = (typeof CLIENT_DATA !== 'undefined' ? CLIENT_DATA : []).map((r, i) => ({
      ...r,
      id: i + 1,
      state: getStateFromGSTN(r.gstn),
    }));
    state.filtered = [...state.allData];
    populateStateFilter();
    computeKPIs();
    renderDashboardTable();
    renderClientTable();
  }

  /* ── KPI Computation ────────────────── */
  function computeKPIs() {
    const total = state.allData.length;
    const withGSTN = state.allData.filter(r => r.gstn && r.gstn.length > 5).length;
    const withPass = state.allData.filter(r => r.password && r.password.length > 2).length;
    const missing  = total - withGSTN;

    document.getElementById('kpiClients').textContent = total.toLocaleString();
    document.getElementById('kpiGstins').textContent  = withGSTN.toLocaleString();
    document.getElementById('qsActive').textContent   = withGSTN.toLocaleString();
    document.getElementById('qsMissing').textContent  = missing.toLocaleString();
    document.getElementById('qsWithPass').textContent = withPass.toLocaleString();
    document.getElementById('clientTotalLabel').textContent = total.toLocaleString();
    document.getElementById('dashRecentCount').textContent  = '(last 10)';
  }

  /* ── State Filter Dropdown ──────────── */
  function populateStateFilter() {
    const stateSet = new Set(state.allData.map(r => r.state).filter(Boolean).sort());
    const sel = document.getElementById('stateFilter');
    stateSet.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      state.stateFilter = sel.value;
      state.currentPage = 1;
      applyFilters();
    });
  }

  /* ── Dashboard Table (10 most recent) ── */
  function renderDashboardTable() {
    const slice = state.allData.slice(0, 10);
    const tbody = document.getElementById('dashTableBody');
    tbody.innerHTML = slice.map((r, i) => buildRow(r, i + 1, true)).join('');
    bindEyeBtns(tbody);
  }

  /* ── Filters & Sorting ──────────────── */
  document.getElementById('tableSearch').addEventListener('input', e => {
    state.searchQ = e.target.value.toLowerCase().trim();
    state.currentPage = 1;
    applyFilters();
  });

  document.getElementById('globalSearch').addEventListener('input', e => {
    document.getElementById('tableSearch').value = e.target.value;
    state.searchQ = e.target.value.toLowerCase().trim();
    navigateTo('clients');
    state.currentPage = 1;
    applyFilters();
  });

  document.getElementById('pageSizeSelect').addEventListener('change', e => {
    state.pageSize = e.target.value === 'all' ? Infinity : parseInt(e.target.value);
    state.currentPage = 1;
    renderClientTable();
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortKey = key;
        state.sortAsc = true;
      }
      state.currentPage = 1;
      applyFilters();
    });
  });

  function applyFilters() {
    let data = state.allData;

    if (state.searchQ) {
      data = data.filter(r =>
        r.userName.toLowerCase().includes(state.searchQ) ||
        r.userId.toLowerCase().includes(state.searchQ) ||
        r.gstn.toLowerCase().includes(state.searchQ)
      );
    }

    if (state.stateFilter) {
      data = data.filter(r => r.state === state.stateFilter);
    }

    if (state.sortKey) {
      data = [...data].sort((a, b) => {
        const va = (a[state.sortKey] || '').toLowerCase();
        const vb = (b[state.sortKey] || '').toLowerCase();
        return state.sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    state.filtered = data;
    renderClientTable();
  }

  /* ── Client Table Rendering ─────────── */
  function renderClientTable() {
    const data = state.filtered;
    const ps = state.pageSize === Infinity ? data.length : state.pageSize;
    const totalPages = Math.max(1, Math.ceil(data.length / ps));
    if (state.currentPage > totalPages) state.currentPage = totalPages;

    const start = (state.currentPage - 1) * ps;
    const slice = data.slice(start, start + ps);

    const tbody = document.getElementById('clientTableBody');
    tbody.innerHTML = slice.length
      ? slice.map((r, i) => buildRow(r, start + i + 1, false)).join('')
      : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">No matching records found</td></tr>`;

    bindEyeBtns(tbody);

    // Info
    document.getElementById('tableInfo').textContent =
      `Showing ${start + 1}–${Math.min(start + ps, data.length)} of ${data.length} entries`;

    // Pagination
    renderPagination(totalPages);
  }

  /* ── Build Table Row ────────────────── */
  function buildRow(r, rowNum, isDash) {
    const col = avatarColor(r.userName);
    const ini = initials(r.userName);

    return `
      <tr>
        <td style="text-align:center;color:var(--text-soft);font-size:.8rem;width:50px">${rowNum}</td>
        <td>
          <div class="td-user">
            <div class="avatar" style="background:${col}">${ini}</div>
            <span class="td-user-name" title="${escHtml(r.userName)}">${escHtml(r.userName)}</span>
          </div>
        </td>
        <td><span class="uid-badge">${escHtml(r.userId)}</span></td>
        <td>
          <div class="pwd-cell">
            <span class="pwd-dots" data-revealed="false">••••••••</span>
            <button class="eye-btn" data-pwd="${escHtml(r.password)}" title="Reveal password">
              <i class="ph ph-eye"></i>
            </button>
          </div>
        </td>
        <td><span class="gstn-code">${escHtml(r.gstn)}</span></td>
        <td><span class="state-chip">${escHtml(r.state)}</span></td>
        <td>
          <div class="action-row">
            <button class="act-btn" title="Edit"><i class="ph ph-pencil-simple"></i></button>
            <button class="act-btn copy-gstn" title="Copy GSTN" data-gstn="${escHtml(r.gstn)}"><i class="ph ph-copy"></i></button>
            <button class="act-btn" title="More"><i class="ph ph-dots-three-vertical"></i></button>
          </div>
        </td>
      </tr>`;
  }

  function escHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Eye Button Logic ───────────────── */
  function bindEyeBtns(container) {
    container.querySelectorAll('.eye-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const cell = this.closest('.pwd-cell');
        const dotsEl = cell.querySelector('.pwd-dots');
        const isHidden = dotsEl.dataset.revealed === 'false';
        const pwd = this.dataset.pwd;

        if (isHidden) {
          dotsEl.textContent = pwd;
          dotsEl.classList.remove('pwd-dots');
          dotsEl.classList.add('pwd-text');
          dotsEl.dataset.revealed = 'true';
          this.querySelector('i').className = 'ph ph-eye-slash';
          showToast(`Password revealed: ${pwd}`);
        } else {
          dotsEl.textContent = '••••••••';
          dotsEl.classList.remove('pwd-text');
          dotsEl.classList.add('pwd-dots');
          dotsEl.dataset.revealed = 'false';
          this.querySelector('i').className = 'ph ph-eye';
        }
      });
    });

    container.querySelectorAll('.copy-gstn').forEach(btn => {
      btn.addEventListener('click', function () {
        const gstn = this.dataset.gstn;
        navigator.clipboard.writeText(gstn).then(() => showToast(`GSTN copied: ${gstn}`));
      });
    });
  }

  /* ── Pagination ─────────────────────── */
  function renderPagination(totalPages) {
    const pg = document.getElementById('pagination');
    pg.innerHTML = '';
    if (totalPages <= 1) return;

    const curr = state.currentPage;

    const mkBtn = (label, page, disabled = false, active = false) => {
      const b = document.createElement('button');
      b.className = 'pg-btn' + (active ? ' active' : '');
      b.innerHTML = label;
      b.disabled = disabled;
      b.addEventListener('click', () => { state.currentPage = page; renderClientTable(); });
      return b;
    };

    pg.appendChild(mkBtn('<i class="ph ph-caret-left"></i>', curr - 1, curr === 1));

    const pages = getPageRange(curr, totalPages);
    let prev = null;
    pages.forEach(p => {
      if (prev !== null && p - prev > 1) {
        const dots = document.createElement('span');
        dots.textContent = '…';
        dots.style.cssText = 'padding:0 .35rem;color:var(--text-soft);line-height:32px';
        pg.appendChild(dots);
      }
      pg.appendChild(mkBtn(p, p, false, p === curr));
      prev = p;
    });

    pg.appendChild(mkBtn('<i class="ph ph-caret-right"></i>', curr + 1, curr === totalPages));
  }

  function getPageRange(curr, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, curr]);
    for (let d = -2; d <= 2; d++) {
      const p = curr + d;
      if (p >= 1 && p <= total) pages.add(p);
    }
    return [...pages].sort((a, b) => a - b);
  }

  /* ── Export CSV ─────────────────────── */
  document.getElementById('exportBtn').addEventListener('click', () => {
    const headers = ['#', 'User Name', 'User ID', 'Password', 'GSTN', 'State'];
    const rows = state.filtered.map((r, i) =>
      [i + 1, `"${(r.userName || '').replace(/"/g, '""')}"`, r.userId, r.password, r.gstn, r.state].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MARKUP_GST_Pro_Clients.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${state.filtered.length} records to CSV`);
  });

  /* ── Toast ──────────────────────────── */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  /* ── Boot ───────────────────────────── */
  init();

  /* ═══════════════════════════════════════════════════════════════
     GST LITIGATION MODULE — Notices & Drafting
     ═══════════════════════════════════════════════════════════════ */

  /* ── Notice State ───────────────────── */
  const nState = {
    all: [],
    filtered: [],
    typeFilter: '',
    statusFilter: '',
  };

  /* ── Initialise Notices ─────────────── */
  function initNotices() {
    if (typeof NOTICES_DB === 'undefined') return;
    nState.all = NOTICES_DB.notices || [];
    nState.filtered = [...nState.all];
    updateNoticeKPIs(nState.all);
    renderNoticesTable(nState.filtered);
    renderDraftCards(nState.all);
  }

  /* ── KPIs for Notices view ──────────── */
  function updateNoticeKPIs(data) {
    const critical = data.filter(n => n.status === 'Critical').length;
    const open     = data.filter(n => n.status === 'Open').length;
    const replied  = data.filter(n => n.status === 'Replied').length;
    const demand   = data.reduce((s, n) => s + (n.amount || 0), 0);

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('nKpiCritical', critical);
    set('nKpiOpen', open);
    set('nKpiReplied', replied);
    set('nKpiDemand', demand ? '₹' + (demand / 100000).toFixed(1) + 'L' : '—');
    set('noticeCount', data.length);
    // Update sidebar badge to show active (non-replied) count
    const badgeEl = document.getElementById('noticeBadge');
    if (badgeEl) badgeEl.textContent = critical + open;
  }

  /* ── Notice Filters ─────────────────── */
  const noticeTypeFilter   = document.getElementById('noticeTypeFilter');
  const noticeStatusFilter = document.getElementById('noticeStatusFilter');
  if (noticeTypeFilter) {
    noticeTypeFilter.addEventListener('change', e => {
      nState.typeFilter = e.target.value;
      applyNoticeFilters();
    });
  }
  if (noticeStatusFilter) {
    noticeStatusFilter.addEventListener('change', e => {
      nState.statusFilter = e.target.value;
      applyNoticeFilters();
    });
  }

  function applyNoticeFilters() {
    let d = nState.all;
    if (nState.typeFilter)   d = d.filter(n => n.type === nState.typeFilter);
    if (nState.statusFilter) d = d.filter(n => n.status === nState.statusFilter);
    nState.filtered = d;
    updateNoticeKPIs(d);
    renderNoticesTable(d);
  }

  /* ── Due-date urgency class ─────────── */
  function dueCls(dateStr) {
    const now  = new Date();
    const due  = new Date(dateStr);
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (days < 0)   return 'due-urgent';
    if (days <= 30) return 'due-urgent';
    if (days <= 60) return 'due-warning';
    return 'due-ok';
  }

  function fmtDate(d) { return DraftingEngine.formatDate(d); }
  function fmtAmt(n)  { return DraftingEngine.formatAmount(n); }

  /* ── Render Notices Table ───────────── */
  function renderNoticesTable(data) {
    const tbody = document.getElementById('noticesTableBody');
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-muted)">No notices found</td></tr>`;
      return;
    }

    const statusClsMap  = { Critical: 'ns-critical', Open: 'ns-open', Replied: 'ns-replied' };
    const statusIconMap = { Critical: 'ph-warning-octagon', Open: 'ph-envelope-open', Replied: 'ph-check-square' };

    tbody.innerHTML = data.map(n => {
      const dCls = dueCls(n.due_date);
      const sCls = statusClsMap[n.status] || 'ns-open';
      const sIco = statusIconMap[n.status] || 'ph-circle';
      const amt  = n.amount ? fmtAmt(n.amount) : 'NIL';

      return `<tr>
        <td>
          <div style="font-family:monospace;font-size:.78rem;font-weight:700;color:var(--indigo-400)">${escHtml(n.number)}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:.88rem;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(n.client_name)}">${escHtml(n.trade_name)}</div>
          <div style="font-family:monospace;font-size:.72rem;color:var(--text-muted)">${escHtml(n.gstin)}</div>
        </td>
        <td>
          <span class="notice-type-chip">${escHtml(n.form)}</span>
        </td>
        <td>
          <span class="section-badge">§${escHtml(n.section)}</span>
        </td>
        <td style="white-space:nowrap;font-size:.85rem">${fmtDate(n.issue_date)}</td>
        <td>
          <span class="${dCls}" style="font-size:.85rem;white-space:nowrap">${fmtDate(n.due_date)}</span>
        </td>
        <td>
          <span class="demand-amt">${escHtml(amt)}</span>
        </td>
        <td>
          <span class="notice-status ${sCls}"><i class="ph ${sIco}"></i> ${escHtml(n.status)}</span>
        </td>
        <td>
          <div style="display:flex;gap:.4rem;align-items:center">
            <button class="draft-btn generate-draft-btn"
              data-id="${n.notice_id}"
              title="Generate Draft Reply">
              <i class="ph ph-file-code"></i> Draft
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');

    // Bind draft buttons in table
    tbody.querySelectorAll('.generate-draft-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        openDraftModal(this.dataset.id);
      });
    });
  }

  /* ── Render Draft Cards (Legal View) ─── */
  function renderDraftCards(data) {
    const grid = document.getElementById('draftsGrid');
    if (!grid) return;

    grid.innerHTML = data.map(n => {
      const statusCls = { Critical: 'dc-critical', Open: 'dc-open', Replied: 'dc-replied' }[n.status] || 'dc-open';
      const dCls = dueCls(n.due_date);
      const amt  = n.amount ? fmtAmt(n.amount) : 'NIL';

      return `
        <div class="draft-card ${statusCls}">
          <div class="dc-header">
            <div>
              <div class="dc-notice-no">${escHtml(n.form)} · ${escHtml(n.number)}</div>
              <div class="dc-client" title="${escHtml(n.client_name)}">${escHtml(n.trade_name)}</div>
            </div>
            <span class="notice-status ${({ Critical:'ns-critical',Open:'ns-open',Replied:'ns-replied' })[n.status] || 'ns-open'}">${n.status}</span>
          </div>
          <div class="dc-meta">
            <span class="section-badge">§${n.section}</span>
            <span class="state-chip">${n.state}</span>
            <span class="dc-due"><i class="ph ph-calendar"></i> Due: <span class="${dCls}">${fmtDate(n.due_date)}</span></span>
          </div>
          <div class="dc-demand">${escHtml(amt)}</div>
          <div class="dc-desc">${escHtml(n.description)}</div>
          <div class="dc-footer">
            <button class="draft-btn generate-draft-btn" data-id="${n.notice_id}">
              <i class="ph ph-file-code"></i> Generate Draft Reply
            </button>
          </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.generate-draft-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        openDraftModal(this.dataset.id);
      });
    });
  }

  /* ── Draft Modal ─────────────────────── */
  const modalOverlay = document.getElementById('draftModalOverlay');
  const closeDraftBtn = document.getElementById('closeDraftModal');
  const copyDraftBtn  = document.getElementById('copyDraftBtn');
  const printDraftBtn = document.getElementById('printDraftBtn');

  if (closeDraftBtn) {
    closeDraftBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });
  }

  function openDraftModal(noticeId) {
    const notice = (NOTICES_DB.notices || []).find(n => n.notice_id === noticeId);
    if (!notice) return;

    const docs   = NOTICES_DB.documents || [];
    const draft  = DraftingEngine.generate(notice, docs);

    // Fill header
    document.getElementById('modalTitle').textContent =
      `Draft Reply — ${notice.form} / ${notice.number}`;
    document.getElementById('modalSub').textContent =
      `${notice.trade_name} | GSTIN: ${notice.gstin} | §${notice.section} | Due: ${fmtDate(notice.due_date)}`;

    // Strategy
    document.getElementById('draftStrategy').textContent =
      `STRATEGY: ${draft.strategy}`;

    // Documents panel
    const noticeDocs = docs.filter(d => d.notice_id === noticeId);
    const docPanel   = document.getElementById('docPanel');
    if (docPanel) {
      if (noticeDocs.length) {
        docPanel.innerHTML =
          '<span style="font-size:.75rem;font-weight:700;color:var(--text-muted);margin-right:.5rem">DOCS:</span>' +
          noticeDocs.map(d =>
            `<span class="doc-chip ${d.status === 'available' ? 'doc-available' : 'doc-pending'}">
              <i class="ph ${d.status === 'available' ? 'ph-check-circle' : 'ph-clock'}"></i>
              ${escHtml(d.type)}
            </span>`
          ).join('');
      } else {
        docPanel.innerHTML = '<span style="font-size:.8rem;color:var(--text-muted)">[DOCUMENT PENDING] No documents linked yet</span>';
      }
    }

    // Draft content with highlighted markers
    const draftEl = document.getElementById('draftContent');
    if (draftEl) {
      const highlighted = draft.content
        .replace(/\[REQUIRES LEGAL VERIFICATION\]/g,
          '<span class="marker-legal">[REQUIRES LEGAL VERIFICATION]</span>')
        .replace(/\[DOCUMENT PENDING\]/g,
          '<span class="marker-doc">[DOCUMENT PENDING]</span>');
      draftEl.innerHTML = highlighted;
    }

    // Copy button
    if (copyDraftBtn) {
      copyDraftBtn.onclick = () => {
        navigator.clipboard.writeText(draft.content)
          .then(() => showToast('Draft copied to clipboard'));
      };
    }

    // Print button
    if (printDraftBtn) {
      printDraftBtn.onclick = () => {
        const w = window.open('', '_blank');
        w.document.write(`<html><head><title>Draft — ${notice.number}</title>
          <style>body{font-family:'Courier New',monospace;font-size:11pt;line-height:1.8;color:#000;padding:40px;max-width:800px;margin:auto}
          h1{font-size:14pt}@media print{body{padding:0}}</style></head>
          <body><pre>${draft.content}</pre></body></html>`);
        w.document.close();
        w.print();
      };
    }

    modalOverlay.classList.add('open');
  }

  // Override navigateTo to also init notices on first visit
  const _origNavigate = navigateTo;
  (function patchNav() {
    const origNavLinks = document.querySelectorAll('.nav-link[id]');
    origNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        const vid = link.id.replace('nav-', '');
        if ((vid === 'notices' || vid === 'legal') && !nState.all.length) {
          initNotices();
        }
      });
    });
  })();

  // Also init on load for dashboard notice count
  if (typeof NOTICES_DB !== 'undefined') initNotices();

})();

/* ═══════════════════════════════════════════════════════════════
   MATTER RECORD MODULE — 10-Section Intake Form Logic
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Guard: MatterEngine must be loaded ─ */
  if (typeof MatterEngine === 'undefined') return;

  /* ── Tab System ─────────────────────────── */
  document.querySelectorAll('.mtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.matter-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Client Name Autocomplete ────────────── */
  const clientList = document.getElementById('clientNameList');
  const legalNameInput = document.getElementById('mf-legalName');
  const gstinInput     = document.getElementById('mf-gstin');

  if (clientList && typeof CLIENT_DATA !== 'undefined') {
    CLIENT_DATA.slice(0, 100).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.userName;
      clientList.appendChild(opt);
    });
  }

  if (legalNameInput) {
    legalNameInput.addEventListener('input', () => {
      const match = (typeof CLIENT_DATA !== 'undefined')
        ? CLIENT_DATA.find(c => c.userName.toLowerCase() === legalNameInput.value.toLowerCase())
        : null;
      if (match && gstinInput && !gstinInput.value) {
        gstinInput.value = match.gstn || '';
        const stateEl = document.getElementById('mf-state');
        if (stateEl && match.gstn) {
          const code = match.gstn.substring(0, 2);
          const MAP = { '27': 'Maharashtra', '07': 'Delhi', '29': 'Karnataka',
                        '24': 'Gujarat', '33': 'Tamil Nadu', '36': 'Telangana' };
          if (MAP[code]) stateEl.value = MAP[code];
        }
      }
    });
  }

  /* ── Auto-compute Total Exposure ────────── */
  ['mf-taxDemand','mf-interest','mf-penalty'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', computeTotal);
  });
  function computeTotal() {
    const tax  = parseFloat(document.getElementById('mf-taxDemand')?.value) || 0;
    const int  = parseFloat(document.getElementById('mf-interest')?.value) || 0;
    const pen  = parseFloat(document.getElementById('mf-penalty')?.value) || 0;
    const tot  = document.getElementById('mf-totalExposure');
    if (tot) tot.value = (tax + int + pen).toFixed(2);
  }

  /* ── Issues (Allegations) ────────────────── */
  let issueCount = 0;
  const issuesList = document.getElementById('issuesList');
  const addIssueBtn = document.getElementById('addIssueBtn');

  function addIssue(data = {}) {
    issueCount++;
    const n = issueCount;
    const card = document.createElement('div');
    card.className = 'issue-card';
    card.dataset.issue = n;
    card.innerHTML = `
      <div class="issue-card-header">
        <span class="issue-num">Issue ${n}</span>
        <button class="remove-issue-btn" data-n="${n}"><i class="ph ph-trash"></i> Remove</button>
      </div>
      <div class="issue-grid">
        <div class="mf-group span2" style="grid-column:1/-1">
          <label class="mf-label">Issue Title / Short Description</label>
          <input type="text" class="mf-input issue-title" placeholder="e.g. Excess ITC claimed on cancelled supplier GSTIN" value="${data.title || ''}">
        </div>
        <div class="mf-group span2" style="grid-column:1/-1">
          <label class="mf-label">Allegation (as extracted from notice)</label>
          <textarea class="mf-input mf-textarea issue-desc" rows="2" placeholder="Copy or summarise the exact allegation from the notice text">${data.description || ''}</textarea>
        </div>
        <div class="mf-group">
          <label class="mf-label">Amount Alleged (₹)</label>
          <input type="number" class="mf-input issue-amount" placeholder="0.00" min="0" value="${data.amount || ''}">
        </div>
        <div class="mf-group">
          <label class="mf-label">Relief Sought (Prayer for this issue)</label>
          <input type="text" class="mf-input issue-relief" placeholder="e.g. Drop demand of ₹X,XX,XXX" value="${data.relief || ''}">
        </div>
        <div class="mf-group" style="grid-column:1/-1">
          <label class="mf-label">Submission / Counter-argument <span style="color:var(--text-soft)">(optional — engine will flag if blank)</span></label>
          <textarea class="mf-input mf-textarea issue-submission" rows="3" placeholder="Your factual and legal response to this allegation">${data.submission || ''}</textarea>
        </div>
        <div class="mf-group" style="grid-column:1/-1">
          <label class="mf-label">Reconciliation Note for this issue <span style="color:var(--text-soft)">(optional)</span></label>
          <textarea class="mf-input mf-textarea issue-recon" rows="2" placeholder="e.g. ITC of ₹XXXX was availed based on GSTR-2B — supplier later cancelled">${data.reconciliation || ''}</textarea>
        </div>
      </div>`;

    issuesList.appendChild(card);
    card.querySelector('.remove-issue-btn').addEventListener('click', () => card.remove());
  }

  if (addIssueBtn) addIssueBtn.addEventListener('click', () => addIssue());
  // Add one issue by default
  addIssue();

  /* ── Document Checklist ──────────────────── */
  const DOC_LIST = [
    { key: 'gstr1',       label: 'GSTR-1 data',               icon: 'ph-file-text' },
    { key: 'gstr3b',      label: 'GSTR-3B data',              icon: 'ph-file-text' },
    { key: 'gstr2b',      label: 'GSTR-2B / GSTR-2A',         icon: 'ph-file-text' },
    { key: 'purchaseReg', label: 'Purchase Invoice Register',  icon: 'ph-shopping-cart' },
    { key: 'salesReg',    label: 'Sales Invoice Register',     icon: 'ph-receipt' },
    { key: 'ewayBills',   label: 'E-Way Bill Records',         icon: 'ph-truck' },
    { key: 'challans',    label: 'GST Payment Challans',       icon: 'ph-currency-inr' },
    { key: 'bankStmts',   label: 'Bank Statements',            icon: 'ph-bank' },
    { key: 'books',       label: 'Books of Accounts / Ledger', icon: 'ph-books' },
    { key: 'supplierGstn',label: 'Supplier GSTIN Certificates',icon: 'ph-certificate' },
    { key: 'priorReply',  label: 'Prior Notice Replies/Orders',icon: 'ph-chat-text' },
  ];

  const docChecklist = document.getElementById('docChecklist');
  const docState = {};

  if (docChecklist) {
    DOC_LIST.forEach(d => {
      docState[d.key] = 'NA';
      const item = document.createElement('div');
      item.className = 'doc-check-item';
      item.innerHTML = `
        <div class="doc-check-name"><i class="ph ${d.icon}"></i> ${d.label}</div>
        <div class="doc-status-btns">
          <button class="dsb sel-na" data-key="${d.key}" data-val="NA">N/A</button>
          <button class="dsb" data-key="${d.key}" data-val="Available">✓ Available</button>
          <button class="dsb" data-key="${d.key}" data-val="Pending">⏱ Pending</button>
        </div>`;
      item.querySelectorAll('.dsb').forEach(btn => {
        btn.addEventListener('click', () => {
          docState[d.key] = btn.dataset.val;
          item.querySelectorAll('.dsb').forEach(b => {
            b.classList.remove('sel-available','sel-pending','sel-na');
          });
          btn.classList.add(
            btn.dataset.val === 'Available' ? 'sel-available' :
            btn.dataset.val === 'Pending'   ? 'sel-pending'   : 'sel-na'
          );
        });
      });
      docChecklist.appendChild(item);
    });
  }

  /* ── Strategy Cards ──────────────────────── */
  const STRATEGIES = {
    FACTUAL: {
      tag: 'Factual', tagClass: 'sc-tag-factual',
      title: 'Factual',
      desc: 'Documents & reconciliation fully negate the allegation. Priority: evidence over law.',
    },
    LEGAL: {
      tag: 'Legal', tagClass: 'sc-tag-legal',
      title: 'Legal',
      desc: "Department's interpretation is untenable. Priority: statutes, circulars, case law.",
    },
    RECONCILIATION: {
      tag: 'Reconciliation', tagClass: 'sc-tag-recon',
      title: 'Reconciliation',
      desc: 'Discrepancy is a timing/accounting difference. Priority: reconciliation table.',
    },
    'LITIGATION-DEFENSIVE': {
      tag: 'Litigation', tagClass: 'sc-tag-litig',
      title: 'Litigation-Defensive',
      desc: 'High-risk contested matter. Priority: preserve rights, appellate grounds.',
    },
  };

  let selectedStrategy = 'RECONCILIATION';
  const strategyCards = document.getElementById('strategyCards');

  if (strategyCards) {
    Object.entries(STRATEGIES).forEach(([key, s]) => {
      const card = document.createElement('div');
      card.className = 'strategy-card' + (key === selectedStrategy ? ' selected' : '');
      card.dataset.strategy = key;
      card.innerHTML = `
        <span class="sc-tag ${s.tagClass}">${s.tag}</span>
        <div class="sc-title">${s.title}</div>
        <div class="sc-desc">${s.desc}</div>`;
      card.addEventListener('click', () => {
        selectedStrategy = key;
        strategyCards.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      strategyCards.appendChild(card);
    });
  }

  /* ── Collect Matter Data from form ──────── */
  function collectMatter() {
    const v = (id) => (document.getElementById(id)?.value || '').trim();
    const issues = [];
    document.querySelectorAll('.issue-card').forEach(card => {
      issues.push({
        title:          card.querySelector('.issue-title')?.value || '',
        description:    card.querySelector('.issue-desc')?.value  || '',
        amount:         card.querySelector('.issue-amount')?.value || 0,
        relief:         card.querySelector('.issue-relief')?.value || '',
        submission:     card.querySelector('.issue-submission')?.value || '',
        reconciliation: card.querySelector('.issue-recon')?.value || '',
      });
    });

    return {
      matterId:              v('mf-matterId'),
      legalName:             v('mf-legalName'),
      gstin:                 v('mf-gstin'),
      tradeName:             v('mf-tradeName'),
      businessDesc:          v('mf-businessDesc'),
      state:                 v('mf-state'),
      regType:               v('mf-regType'),
      noticeType:            v('mf-noticeType'),
      noticeNumber:          v('mf-noticeNumber'),
      issueDate:             v('mf-issueDate'),
      dueDate:               v('mf-dueDate'),
      issuingAuthority:      v('mf-issuingAuthority'),
      periodFrom:            v('mf-periodFrom'),
      periodTo:              v('mf-periodTo'),
      sectionInvoked:        v('mf-sectionInvoked'),
      taxDemand:             v('mf-taxDemand'),
      interest:              v('mf-interest'),
      penalty:               v('mf-penalty'),
      totalExposure:         v('mf-totalExposure'),
      gstr1Status:           v('mf-gstr1Status'),
      gstr3bStatus:          v('mf-gstr3bStatus'),
      gstr9Status:           v('mf-gstr9Status'),
      paymentDetails:        v('mf-paymentDetails'),
      itcPosition:           v('mf-itcPosition'),
      priorCorrespondence:   v('mf-priorCorrespondence'),
      reconciliationStatus:  v('mf-reconciliationStatus'),
      additionalInstructions:v('mf-additionalInstructions'),
      draftType:             v('mf-draftType'),
      tone:                  v('mf-tone'),
      strategy:              selectedStrategy,
      strategyReason:        v('mf-strategyReason'),
      documents:             { ...docState },
      issues,
    };
  }

  /* ── Validate ────────────────────────────── */
  function validate(m) {
    if (!m.legalName) return 'Please enter the Legal Name of the client.';
    if (!m.gstin)     return 'Please enter the GSTIN.';
    if (!m.noticeType) return 'Please select a Notice Type in the Notice Details tab.';
    if (!m.noticeNumber) return 'Please enter the Notice Number.';
    return null;
  }

  /* ── Generate & Open Modal ───────────────── */
  function generateAndShow() {
    const matter = collectMatter();
    const err = validate(matter);
    if (err) {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = '⚠ ' + err;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
      return;
    }

    const result = MatterEngine.generate(matter);

    // Reuse the existing draft modal
    const overlay = document.getElementById('draftModalOverlay');
    document.getElementById('modalTitle').textContent =
      `${matter.draftType || 'Draft Reply'} — ${matter.noticeType} · ${matter.noticeNumber || '[NOTICE NO.]'}`;
    document.getElementById('modalSub').textContent =
      `${matter.legalName} · GSTIN: ${matter.gstin} · §${matter.sectionInvoked || '?'} · Strategy: ${matter.strategy}`;

    document.getElementById('draftStrategy').textContent =
      `STRATEGY: ${matter.strategy} | TONE: ${matter.tone || 'Standard'} | SECTIONS: CUSTOM`;

    // Doc chip panel
    const docPanel = document.getElementById('docPanel');
    if (docPanel) {
      const avl = DOC_LIST.filter(d => docState[d.key] === 'Available');
      const pnd = DOC_LIST.filter(d => docState[d.key] === 'Pending');
      docPanel.innerHTML = avl.map(d =>
        `<span class="doc-chip doc-available"><i class="ph ph-check-circle"></i> ${d.label}</span>`
      ).join('') + pnd.map(d =>
        `<span class="doc-chip doc-pending"><i class="ph ph-clock"></i> ${d.label}</span>`
      ).join('');
      if (!avl.length && !pnd.length) docPanel.innerHTML = '<span style="font-size:.8rem;color:var(--text-muted)">No document status marked</span>';
    }

    // Draft content with highlighted markers
    const draftEl = document.getElementById('draftContent');
    if (draftEl) {
      const highlighted = result.full
        .replace(/\[REQUIRES LEGAL VERIFICATION\]/g,
          '<span class="marker-legal">[REQUIRES LEGAL VERIFICATION]</span>')
        .replace(/\[DOCUMENT PENDING\]/g,
          '<span class="marker-doc">[DOCUMENT PENDING]</span>');
      draftEl.innerHTML = highlighted;
    }

    // Copy
    document.getElementById('copyDraftBtn').onclick = () => {
      navigator.clipboard.writeText(result.full)
        .then(() => {
          const t = document.getElementById('toast');
          t.textContent = 'Draft copied to clipboard';
          t.classList.add('show');
          setTimeout(() => t.classList.remove('show'), 3000);
        });
    };

    // Print
    document.getElementById('printDraftBtn').onclick = () => {
      const w = window.open('', '_blank');
      w.document.write(`<html><head><title>${matter.noticeNumber || 'Draft'}</title>
        <style>body{font-family:'Courier New',monospace;font-size:10pt;line-height:1.8;padding:40px;max-width:820px;margin:auto}
        @media print{body{padding:0}}</style></head>
        <body><pre>${result.full}</pre></body></html>`);
      w.document.close(); w.print();
    };

    overlay.classList.add('open');
  }

  const genBtn1 = document.getElementById('generateMatterBtn');
  const genBtn2 = document.getElementById('generateMatterBtn2');
  if (genBtn1) genBtn1.addEventListener('click', generateAndShow);
  if (genBtn2) genBtn2.addEventListener('click', generateAndShow);

  /* ── Clear form ──────────────────────────── */
  document.getElementById('clearMatterBtn')?.addEventListener('click', () => {
    document.querySelectorAll('#view-matter .mf-input, #view-matter .mf-select, #view-matter .mf-textarea')
      .forEach(el => { el.value = ''; });
    if (issuesList) { issuesList.innerHTML = ''; issueCount = 0; addIssue(); }
    Object.keys(docState).forEach(k => { docState[k] = 'NA'; });
    docChecklist?.querySelectorAll('.dsb').forEach(b => {
      b.classList.remove('sel-available','sel-pending');
      if (b.dataset.val === 'NA') b.classList.add('sel-na');
    });
    selectedStrategy = 'RECONCILIATION';
    strategyCards?.querySelectorAll('.strategy-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.strategy === 'RECONCILIATION');
    });
  });

})();

/* ═══════════════════════════════════════════════════════════════
   CLIENT ALERTS MODULE — WhatsApp + Email Generator
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (typeof CommsEngine === 'undefined') return;

  /* ── Trigger definitions ─────────────────── */
  const TRIGGERS = [
    { key: 'NEW_NOTICE',       label: 'New Notice',     icon: 'ph-envelope-open',        level: 'info'     },
    { key: 'DUE_DATE_7DAYS',   label: '7-Day Reminder', icon: 'ph-clock',                level: 'medium'   },
    { key: 'DUE_DATE_3DAYS',   label: '3-Day Urgent',   icon: 'ph-alarm',                level: 'high'     },
    { key: 'DUE_DATE_1DAY',    label: 'Due TOMORROW',   icon: 'ph-warning',              level: 'critical' },
    { key: 'DOCUMENT_PENDING', label: 'Docs Pending',   icon: 'ph-folder-simple-dashed', level: 'medium'   },
    { key: 'DRAFT_APPROVED',   label: 'Draft Ready',    icon: 'ph-check-circle',         level: 'info'     },
  ];

  /* ── Render trigger buttons ─────────────── */
  let selectedTrigger = 'NEW_NOTICE';
  const triggerGrid = document.getElementById('triggerGrid');

  if (triggerGrid) {
    TRIGGERS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `trigger-btn${t.key === selectedTrigger ? ' sel-' + t.level : ''}`;
      btn.dataset.key   = t.key;
      btn.dataset.level = t.level;
      btn.innerHTML = `<i class="ph ${t.icon}"></i>${t.label}`;
      btn.addEventListener('click', () => {
        selectedTrigger = t.key;
        triggerGrid.querySelectorAll('.trigger-btn').forEach(b => b.className = 'trigger-btn');
        btn.classList.add('sel-' + t.level);
        const extras = document.getElementById('draftApprovedExtras');
        if (extras) extras.style.display = t.key === 'DRAFT_APPROVED' ? 'block' : 'none';
      });
      triggerGrid.appendChild(btn);
    });
  }

  /* ── Client name autocomplete ────────────── */
  const commsClientList = document.getElementById('commsClientList');
  if (commsClientList && typeof CLIENT_DATA !== 'undefined') {
    CLIENT_DATA.slice(0, 150).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.userName;
      commsClientList.appendChild(opt);
    });
  }

  /* ── Document list add / remove ─────────── */
  const commsDocList = document.getElementById('commsDocList');

  function addDocRow(val = '') {
    const row = document.createElement('div');
    row.className = 'comms-doc-row';
    row.innerHTML = `
      <i class="ph ph-file-text" style="color:var(--text-soft);font-size:1rem;flex-shrink:0"></i>
      <input type="text" placeholder="e.g. GSTR-2B for Q3 FY 2021-22" value="${escHtml ? escHtml(val) : val}">
      <button class="comms-doc-remove" title="Remove"><i class="ph ph-trash"></i></button>`;
    row.querySelector('.comms-doc-remove').addEventListener('click', () => row.remove());
    if (commsDocList) commsDocList.appendChild(row);
  }

  document.getElementById('addCommsDoc')?.addEventListener('click', () => addDocRow());

  /* ── Collect docs ────────────────────────── */
  function collectDocs() {
    return Array.from(commsDocList?.querySelectorAll('input') || [])
      .map(i => i.value.trim()).filter(Boolean);
  }

  /* ── Collect form data ───────────────────── */
  function collectComms() {
    const v = id => (document.getElementById(id)?.value || '').trim();
    return {
      trigger:       selectedTrigger,
      clientName:    v('cm-clientName'),
      matterId:      v('cm-matterId'),
      noticeType:    v('cm-noticeType'),
      dueDate:       v('cm-dueDate'),
      executive:     v('cm-executive'),
      partner:       v('cm-partner'),
      demandContext: v('cm-demandContext'),
      docs:          collectDocs(),
    };
  }

  /* ── Validate ────────────────────────────── */
  function validate(d) {
    if (!d.clientName) return 'Please enter the Client Name.';
    return null;
  }

  /* ── Toast ───────────────────────────────── */
  function toastMsg(msg, dur = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  /* ── Urgency banner config ───────────────── */
  const URGENCY_CFG = {
    info:     { cls: 'ub-info',     icon: 'ph-info',            text: 'INFORMATIONAL ALERT' },
    medium:   { cls: 'ub-medium',   icon: 'ph-clock',           text: 'REMINDER — ACTION REQUIRED' },
    high:     { cls: 'ub-high',     icon: 'ph-alarm',           text: 'URGENT — 3 DAYS TO DEADLINE' },
    critical: { cls: 'ub-critical', icon: 'ph-warning-octagon', text: 'CRITICAL — DUE TOMORROW'     },
  };

  /* ── Main generate function ──────────────── */
  function generate() {
    const data = collectComms();
    const err  = validate(data);
    if (err) { toastMsg('⚠ ' + err, 3500); return; }

    const result = CommsEngine.generate(data);

    // Show output cards, hide placeholder
    const placeholder = document.getElementById('commsPlaceholder');
    if (placeholder) placeholder.style.display = 'none';

    // Fill outputs
    const waOut    = document.getElementById('waOutput');
    const emailOut = document.getElementById('emailOutput');
    if (waOut)    waOut.value    = result.whatsapp;
    if (emailOut) emailOut.value = result.email;

    // Character / word counts
    const waCount    = document.getElementById('waCharCount');
    const emailCount = document.getElementById('emailWordCount');
    if (waCount)    waCount.textContent = `${result.whatsapp.length} chars · ${result.whatsapp.split('\n').length} lines`;
    if (emailCount) emailCount.textContent = `${result.email.split(/\s+/).length} words`;

    // Urgency banner
    const banner = document.getElementById('urgencyBanner');
    const u      = URGENCY_CFG[result.urgencyLevel] || URGENCY_CFG.info;
    const dl     = result.daysLeft;
    const dlStr  = dl !== null
      ? (dl < 0 ? `OVERDUE by ${Math.abs(dl)} day(s)` : dl === 0 ? 'Due TODAY' : `${dl} day(s) remaining`)
      : '';
    if (banner) {
      banner.className     = `urgency-banner ${u.cls}`;
      banner.style.display = 'flex';
      banner.innerHTML     = `<i class="ph ${u.icon}"></i> ${u.text}${dlStr ? ' — ' + dlStr + ' |' : ' |'} <strong>${data.clientName}</strong>`;
    }

    toastMsg('✅ WhatsApp + Email alerts generated');
    if (waOut) waOut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Button bindings ─────────────────────── */
  document.getElementById('generateCommsBtn')?.addEventListener('click', generate);

  // Copy WhatsApp
  document.getElementById('copyWaBtn')?.addEventListener('click', () => {
    const t = document.getElementById('waOutput');
    if (!t?.value) { toastMsg('Generate an alert first'); return; }
    navigator.clipboard.writeText(t.value).then(() => toastMsg('📋 WhatsApp message copied!'));
  });

  // Open WhatsApp (wa.me)
  document.getElementById('openWaBtn')?.addEventListener('click', () => {
    const t = document.getElementById('waOutput');
    if (!t?.value) { toastMsg('Generate an alert first'); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(t.value)}`, '_blank');
  });

  // Copy Email
  document.getElementById('copyEmailBtn')?.addEventListener('click', () => {
    const t = document.getElementById('emailOutput');
    if (!t?.value) { toastMsg('Generate an alert first'); return; }
    navigator.clipboard.writeText(t.value).then(() => toastMsg('📧 Email content copied!'));
  });

  // Open mailto
  document.getElementById('openEmailBtn')?.addEventListener('click', () => {
    const emailText = document.getElementById('emailOutput')?.value;
    if (!emailText) { toastMsg('Generate an alert first'); return; }
    const subMatch = emailText.match(/^Subject:\s*(.+)/m);
    const subject  = subMatch ? subMatch[1].trim() : 'GST Notice Alert';
    const bodyStart = emailText.indexOf('\n\n');
    const body = bodyStart > -1 ? emailText.slice(bodyStart + 2) : emailText;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  });

  /* ── Clear form ──────────────────────────── */
  document.getElementById('clearCommsBtn')?.addEventListener('click', () => {
    ['cm-clientName','cm-matterId','cm-noticeType','cm-dueDate',
     'cm-executive','cm-partner','cm-demandContext'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    if (commsDocList) commsDocList.innerHTML = '';
    const waOut    = document.getElementById('waOutput');
    const emailOut = document.getElementById('emailOutput');
    if (waOut)    waOut.value    = '';
    if (emailOut) emailOut.value = '';
    const banner  = document.getElementById('urgencyBanner');
    if (banner)   banner.style.display = 'none';
    const ph = document.getElementById('commsPlaceholder');
    if (ph) ph.style.display = 'flex';
    // Reset trigger
    selectedTrigger = 'NEW_NOTICE';
    triggerGrid?.querySelectorAll('.trigger-btn').forEach((b, i) => {
      b.className = 'trigger-btn' + (i === 0 ? ' sel-info' : '');
    });
    document.getElementById('draftApprovedExtras')?.setAttribute('style', 'display:none');
  });

})();
