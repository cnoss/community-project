(() => {
  const root = document.querySelector('[data-js-actions]');
  if (!root) return;

  /* ------------------------------------------------------------------ */
  /* State                                                                 */
  /* ------------------------------------------------------------------ */
  let allActions = [];
  let sortCol = 'updated_at';
  let sortDir = 'desc';
  let activeTags = new Set();
  let searchQuery = '';

  /* ------------------------------------------------------------------ */
  /* Helpers                                                               */
  /* ------------------------------------------------------------------ */
  const renderMessage = (html) => {
    root.innerHTML = `<div class="content">${html}</div>`;
  };

  const getApiUrl = () => String(root.dataset.actionsEndpoint ?? '').trim() || null;

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    for (const key of ['actions', 'items', 'data', 'results']) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    return [];
  };

  const normalizeTags = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).map((t) => t.trim()).filter(Boolean);
    if (typeof raw === 'string') return raw.split(',').map((t) => t.trim()).filter(Boolean);
    if (typeof raw === 'object') return Object.values(raw).flatMap(normalizeTags);
    return [];
  };

  const formatDate = (iso) => {
    if (!iso) return '–';
    try {
      return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const getValue = (action, col) => {
    switch (col) {
      case 'title':      return String(action.title ?? '').toLowerCase();
      case 'author':     return String(action.author?.name ?? '').toLowerCase();
      case 'state':      return String(action.state ?? '').toLowerCase();
      case 'updated_at': return action.updated_at ?? '';
      default:           return '';
    }
  };

  /* ------------------------------------------------------------------ */
  /* Filter + Sort                                                         */
  /* ------------------------------------------------------------------ */
  const getVisible = () => {
    let list = allActions.slice();

    if (activeTags.size > 0) {
      list = list.filter((a) => {
        const labels = normalizeTags(a.labels);
        return [...activeTags].every((t) => labels.includes(t));
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        String(a.title ?? '').toLowerCase().includes(q) ||
        String(a.author?.name ?? '').toLowerCase().includes(q) ||
        String(a.description ?? '').toLowerCase().includes(q) ||
        normalizeTags(a.labels).some((t) => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      const va = getValue(a, sortCol);
      const vb = getValue(b, sortCol);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                                */
  /* ------------------------------------------------------------------ */
  const COLS = [
    { key: 'title',      label: 'Titel',        sortable: true  },
    { key: 'labels',     label: 'Labels',       sortable: false },
    { key: 'state',      label: 'Status',       sortable: true  },
    { key: 'updated_at', label: 'Letztes Update', sortable: true },
    { key: 'link',       label: '',             sortable: false },
  ];

  const renderControls = (container) => {
    const bar = document.createElement('div');
    bar.className = 'actions-controls';

    const searchWrap = document.createElement('div');
    searchWrap.className = 'actions-search-wrap';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Suchen …';
    searchInput.className = 'actions-search';
    searchInput.value = searchQuery;
    searchInput.setAttribute('aria-label', 'Aktionen durchsuchen');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderTable(container);
    });
    searchWrap.appendChild(searchInput);

    const filterInfo = document.createElement('div');
    filterInfo.className = 'actions-filter-info';
    filterInfo.id = 'actions-filter-info';
    for (const tag of activeTags) {
      const chip = document.createElement('span');
      chip.className = 'action-tag is-active';
      chip.textContent = tag;

      const clear = document.createElement('button');
      clear.className = 'action-tag-clear';
      clear.setAttribute('aria-label', `Filter "${tag}" entfernen`);
      clear.textContent = '×';
      clear.addEventListener('click', () => {
        activeTags.delete(tag);
        render(container);
      });
      chip.appendChild(clear);
      filterInfo.appendChild(chip);
    }

    bar.appendChild(searchWrap);
    bar.appendChild(filterInfo);
    return bar;
  };

  const renderTable = (container) => {
    const existing = container.querySelector('.actions-table-wrap');
    if (existing) existing.remove();

    const visible = getVisible();
    const wrap = document.createElement('div');
    wrap.className = 'actions-table-wrap';

    if (visible.length === 0) {
      wrap.innerHTML = '<p class="actions-empty">Keine Aktionen gefunden.</p>';
      container.appendChild(wrap);
      return;
    }

    const table = document.createElement('table');
    table.className = 'actions-table';
    table.setAttribute('role', 'grid');

    /* thead */
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    for (const col of COLS) {
      const th = document.createElement('th');
      if (col.sortable) {
        th.textContent = col.label;
        th.className = 'is-sortable';
        th.setAttribute('aria-sort', sortCol === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
        th.setAttribute('tabindex', '0');
        const setSort = () => {
          if (sortCol === col.key) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            sortCol = col.key;
            sortDir = col.key === 'updated_at' ? 'desc' : 'asc';
          }
          renderTable(container);
        };
        th.addEventListener('click', setSort);
        th.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSort(); } });

        if (sortCol === col.key) {
          const indicator = document.createElement('span');
          indicator.className = 'sort-indicator';
          indicator.setAttribute('aria-hidden', 'true');
          indicator.textContent = sortDir === 'asc' ? ' ↑' : ' ↓';
          th.appendChild(indicator);
        }
      }
      /* nicht-sortierbare Spalten: kein Label, leeres th */
      headerRow.appendChild(th);
    }
    headerRow.appendChild(document.createElement('th')); /* toggle column – last */
    thead.appendChild(headerRow);
    table.appendChild(thead);

    /* tbody */
    const tbody = document.createElement('tbody');

    for (const action of visible) {
      const descId = `action-desc-${action.id ?? Math.random().toString(36).slice(2)}`;
      const hasDesc = Boolean(action.description?.trim());

      /* main row */
      const tr = document.createElement('tr');
      tr.className = 'action-row';

      /* title */
      const titleTd = document.createElement('td');
      titleTd.className = 'action-title';
      titleTd.textContent = action.title ?? '–';
      tr.appendChild(titleTd);

      /* labels */
      const labelsTd = document.createElement('td');
      labelsTd.className = 'action-labels';
      const tags = normalizeTags(action.labels);
      for (const tag of tags) {
        const btn = document.createElement('button');
        btn.className = `action-tag${activeTags.has(tag) ? ' is-active' : ''}`;
        btn.textContent = tag;
        btn.setAttribute('aria-pressed', String(activeTags.has(tag)));
        btn.setAttribute('aria-label', `Nach Label "${tag}" filtern`);
        btn.addEventListener('click', () => {
          if (activeTags.has(tag)) activeTags.delete(tag);
          else activeTags.add(tag);
          render(container);
        });
        labelsTd.appendChild(btn);
      }
      tr.appendChild(labelsTd);

      /* state */
      const stateTd = document.createElement('td');
      const stateBadge = document.createElement('span');
      const stateVal = String(action.state ?? '–');
      stateBadge.className = `action-state action-state--${stateVal.toLowerCase()}`;
      stateBadge.textContent = stateVal === 'opened' ? 'offen' : stateVal === 'closed' ? 'abgeschlossen' : stateVal;
      stateTd.appendChild(stateBadge);
      tr.appendChild(stateTd);

      /* updated_at */
      const dateTd = document.createElement('td');
      dateTd.className = 'action-date';
      dateTd.textContent = formatDate(action.updated_at);
      tr.appendChild(dateTd);

      /* link */
      const linkTd = document.createElement('td');
      linkTd.className = 'action-link-cell';
      if (action.web_url) {
        const a = document.createElement('a');
        a.href = action.web_url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'action-external-link';
        a.setAttribute('aria-label', `${esc(action.title)} in GitLab öffnen`);
        a.textContent = '↗';
        linkTd.appendChild(a);
      }
      tr.appendChild(linkTd);

      /* toggle cell – last */
      const toggleTd = document.createElement('td');
      toggleTd.className = 'action-toggle-cell';
      if (hasDesc) {
        const btn = document.createElement('button');
        btn.className = 'action-toggle-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', descId);
        btn.setAttribute('aria-label', 'Beschreibung anzeigen');
        btn.addEventListener('click', () => {
          const descRow = document.getElementById(descId);
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!expanded));
          btn.setAttribute('aria-label', expanded ? 'Beschreibung anzeigen' : 'Beschreibung ausblenden');
          btn.classList.toggle('is-open', !expanded);
          if (descRow) descRow.hidden = expanded;
        });
        toggleTd.appendChild(btn);
      }
      tr.appendChild(toggleTd);

      tbody.appendChild(tr);

      /* description row */
      if (hasDesc) {
        const descTr = document.createElement('tr');
        descTr.id = descId;
        descTr.className = 'action-desc-row';
        descTr.hidden = true;
        const descTd = document.createElement('td');
        descTd.colSpan = COLS.length + 1;
        descTd.className = 'action-desc-cell';
        const descDiv = document.createElement('div');
        descDiv.className = 'action-desc-content';
        descDiv.textContent = action.description;
        descTd.appendChild(descDiv);
        descTr.appendChild(descTd);
        tbody.appendChild(descTr);
      }
    }

    table.appendChild(tbody);
    wrap.appendChild(table);

    const count = document.createElement('p');
    count.className = 'actions-count';
    count.textContent = `${visible.length} Aktion${visible.length !== 1 ? 'en' : ''}`;
    wrap.appendChild(count);

    container.appendChild(wrap);
  };

  const render = (container) => {
    container.innerHTML = '';
    container.appendChild(renderControls(container));
    renderTable(container);
  };

  /* ------------------------------------------------------------------ */
  /* Main                                                                  */
  /* ------------------------------------------------------------------ */
  const main = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      renderMessage('<p><strong>Konfiguration fehlt.</strong> Kein <code>data-actions-endpoint</code> gesetzt.</p>');
      return;
    }

    renderMessage('<p>Aktionen werden geladen …</p>');

    try {
      const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        renderMessage(`<p><strong>API-Fehler:</strong> ${esc(String(res.status))} ${esc(res.statusText)}</p>`);
        return;
      }
      allActions = normalizeArray(await res.json());
    } catch (err) {
      renderMessage(`<p><strong>Fehler beim Laden:</strong> ${esc(String(err?.message ?? err))}</p>`);
      return;
    }

    const container = document.createElement('div');
    container.className = 'actions-container';
    root.innerHTML = '';
    root.appendChild(container);
    render(container);
  };

  main();
})();
