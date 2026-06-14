// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════

const STATE = {
  bewerbungen: [],
  formeln: [],
  selected: { einstieg: null, kompetenz: [], verbindung: null, abschluss: null },
  firma: '',
  editId: null,
  formelEditId: null,
  pendingAttachments: [],
  pendingDuplicate: null,
  pendingScanFields: null
};

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════

function init() {
  loadFromStorage();
  renderTracker();
  renderBaukasten();
  renderFormeln();
  setTodayDate();
}

function setTodayDate() {
  const d = document.getElementById('m-datum');
  if (d) d.value = new Date().toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════

function loadFromStorage() {
  const b = localStorage.getItem('mz-bewerbungen');
  STATE.bewerbungen = b ? JSON.parse(b) : [];

  const f = localStorage.getItem('mz-formeln');
  if (f) {
    STATE.formeln = JSON.parse(f);
  } else {
    STATE.formeln = JSON.parse(JSON.stringify(DEFAULT_FORMELN));
    saveFormeln();
  }
}

function saveBewerbungenStorage() {
  try {
    localStorage.setItem('mz-bewerbungen', JSON.stringify(STATE.bewerbungen));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showToast('Speicher voll! Dateien zu groß. Versuche kleinere PDFs.');
    } else { throw e; }
  }
}

function saveFormeln() {
  localStorage.setItem('mz-formeln', JSON.stringify(STATE.formeln));
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const tabs = document.querySelectorAll('.nav-tab');
  const map = { tracker: 0, baukasten: 1, formeln: 2, analyse: 3 };
  if (map[id] !== undefined) tabs[map[id]].classList.add('active');
  if (id === 'analyse') renderAnalyse();
}

// ═══════════════════════════════════════════════
// TRACKER
// ═══════════════════════════════════════════════

function renderTracker() {
  renderStats();
  const search = document.getElementById('search-input').value.toLowerCase();
  const filterStatus = document.getElementById('filter-status').value;
  const sortBy = document.getElementById('sort-by').value;

  let list = STATE.bewerbungen.filter(b => {
    const matchSearch = !search || b.firma.toLowerCase().includes(search) || b.stelle.toLowerCase().includes(search);
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  list.sort((a, b) => {
    if (sortBy === 'datum-desc') return new Date(b.datum) - new Date(a.datum);
    if (sortBy === 'datum-asc') return new Date(a.datum) - new Date(b.datum);
    if (sortBy === 'firma') return a.firma.localeCompare(b.firma);
    return 0;
  });

  const el = document.getElementById('tracker-list');

  if (list.length === 0) {
    const empty = STATE.bewerbungen.length === 0;
    el.innerHTML = `<div class="tracker-empty">
      <span class="tracker-empty-icon">${empty ? '📬' : '🔍'}</span>
      <div class="tracker-empty-title">${empty ? 'Noch keine Bewerbungen' : 'Keine Treffer'}</div>
      <div class="tracker-empty-sub">${empty ? 'Klicke auf "+ Bewerbung hinzufügen" um zu starten.' : 'Passe die Filter an oder suche nach einem anderen Begriff.'}</div>
    </div>`;
    return;
  }

  el.innerHTML = list.map(b => `
    <div class="tracker-card status-${b.status}" onclick="openModal('edit', '${b.id}')">
      <div>
        <div class="tracker-firma">${escHtml(b.firma)}</div>
        ${b.stelle && b.stelle !== '–' ? `<div class="tracker-stelle">${escHtml(b.stelle)}</div>` : ''}
      </div>
      <div class="tracker-meta">
        ${b.datum ? `<span class="tracker-datum">${formatDate(b.datum)}</span>` : ''}
        ${b.datum ? `<span class="tracker-age">${daysAgo(b.datum)}</span>` : ''}
        ${b.plattform ? `<span class="tracker-plattform">${escHtml(b.plattform)}</span>` : ''}
        ${b.kontakt ? `<span class="tracker-datum">↳ ${escHtml(b.kontakt)}</span>` : ''}
        ${deadlineChip(b.frist)}
        ${b.attachments && b.attachments.length > 0 ? `<span class="tracker-att" onclick="openFirstAttachment('${b.id}', event)" title="PDF öffnen">📎 ${b.attachments.length}</span>` : ''}
      </div>
      <span class="status-badge status-${b.status}" onclick="cycleStatus('${b.id}', event)" title="Klicken zum Status wechseln" style="cursor:pointer;">
        ${statusLabel(b.status)}
      </span>
      <div class="tracker-actions" onclick="event.stopPropagation()">
        ${b.link ? `<button class="btn-icon" onclick="openExternalLink('${b.id}')" title="Stellenanzeige öffnen">↗</button>` : ''}
        <button class="btn-icon" onclick="deleteBewerbung('${b.id}')" title="Löschen">✕</button>
      </div>
    </div>
  `).join('');
}

function renderStats() {
  const total = STATE.bewerbungen.length;
  const offen = STATE.bewerbungen.filter(b => b.status === 'offen').length;
  const eingeladen = STATE.bewerbungen.filter(b => b.status === 'eingeladen').length;
  const absagen = STATE.bewerbungen.filter(b => b.status === 'absage').length;

  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">Gesamt</div><span class="stat-dot"></span></div>
      <div class="stat-num">${total}</div>
      <div class="stat-sub">Bewerbungen</div>
    </div>
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">Offen</div><span class="stat-dot"></span></div>
      <div class="stat-num">${offen}</div>
      <div class="stat-sub">Ausstehend</div>
    </div>
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">Eingeladen</div><span class="stat-dot green"></span></div>
      <div class="stat-num green">${eingeladen}</div>
      <div class="stat-sub">Interviews</div>
    </div>
    <div class="stat-card">
      <div class="stat-header"><div class="stat-label">Absagen</div><span class="stat-dot red"></span></div>
      <div class="stat-num red">${absagen}</div>
      <div class="stat-sub">Rückmeldungen</div>
    </div>
  `;
}

function statusLabel(s) {
  return { offen: 'Offen', eingeladen: 'Eingeladen', absage: 'Absage', angebot: 'Angebot' }[s] || s;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function openExternalLink(id) {
  const b = STATE.bewerbungen.find(x => x.id === id);
  if (b && b.link) window.open(b.link, '_blank');
}

// ═══════════════════════════════════════════════
// MODAL BEWERBUNG
// ═══════════════════════════════════════════════

function openModal(mode, id) {
  STATE.editId = id || null;
  STATE.pendingAttachments = [];

  document.getElementById('modal-title').textContent = mode === 'add' ? 'Bewerbung hinzufügen' : 'Bewerbung bearbeiten';

  if (mode === 'edit' && id) {
    const b = STATE.bewerbungen.find(x => x.id === id);
    if (b) {
      document.getElementById('m-firma').value = b.firma || '';
      document.getElementById('m-stelle').value = (b.stelle === '–' ? '' : b.stelle) || '';
      document.getElementById('m-datum').value = b.datum || '';
      document.getElementById('m-status').value = b.status || 'offen';
      document.getElementById('m-frist').value = b.frist || '';
      document.getElementById('m-plattform').value = b.plattform || '';
      document.getElementById('m-kontakt').value = b.kontakt || '';
      document.getElementById('m-link').value = b.link || '';
      document.getElementById('m-notizen').value = b.notizen || '';

      if (b.attachments && b.attachments.length > 0) {
        STATE.pendingAttachments = b.attachments.map(a => ({ ...a }));
      }
    }
  } else {
    document.getElementById('m-firma').value = '';
    document.getElementById('m-stelle').value = '';
    document.getElementById('m-status').value = 'offen';
    document.getElementById('m-frist').value = '';
    document.getElementById('m-plattform').value = '';
    document.getElementById('m-kontakt').value = '';
    document.getElementById('m-link').value = '';
    document.getElementById('m-notizen').value = '';
    setTodayDate();
  }

  renderModalAttachments();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('m-firma').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  STATE.editId = null;
  STATE.pendingAttachments = [];
  STATE.pendingScanFields = null;
  document.getElementById('modal-file').value = '';
  document.getElementById('m-frist').value = '';
  document.getElementById('pdf-scan-result').classList.add('js-hidden');
}

function saveBewerbung() {
  let firma = document.getElementById('m-firma').value.trim();
  let stelle = document.getElementById('m-stelle').value.trim();

  // Allow saving with just a PDF — use filename as Firma fallback
  if (!firma) {
    if (STATE.pendingAttachments.length > 0) {
      firma = STATE.pendingAttachments[0].name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ').trim();
    } else {
      showToast('Bitte mindestens einen Firmennamen oder eine PDF-Datei hinzufügen.');
      return;
    }
  }
  if (!stelle) stelle = '–';

  const data = {
    firma,
    stelle,
    datum: document.getElementById('m-datum').value,
    status: document.getElementById('m-status').value,
    frist: document.getElementById('m-frist').value,
    plattform: document.getElementById('m-plattform').value.trim(),
    kontakt: document.getElementById('m-kontakt').value.trim(),
    link: document.getElementById('m-link').value.trim(),
    notizen: document.getElementById('m-notizen').value.trim(),
    attachments: STATE.pendingAttachments.map(a => ({ name: a.name, size: a.size, base64: a.base64 }))
  };

  if (STATE.editId) {
    const idx = STATE.bewerbungen.findIndex(b => b.id === STATE.editId);
    if (idx !== -1) STATE.bewerbungen[idx] = { ...STATE.bewerbungen[idx], ...data };
    saveBewerbungenStorage();
    closeModal();
    renderTracker();
    showToast('Bewerbung aktualisiert.');
    return;
  }

  // Duplicate check only for new entries
  const dup = checkDuplicate(firma, stelle);
  if (dup) {
    STATE.pendingDuplicate = { newData: data };
    showDuplicateWarning(dup);
    return;
  }

  data.id = 'b-' + Date.now();
  STATE.bewerbungen.unshift(data);
  saveBewerbungenStorage();
  closeModal();
  renderTracker();
  showToast('Bewerbung gespeichert.');
}

function deleteBewerbung(id) {
  if (!confirm('Bewerbung löschen?')) return;
  STATE.bewerbungen = STATE.bewerbungen.filter(b => b.id !== id);
  saveBewerbungenStorage();
  renderTracker();
  showToast('Gelöscht.');
}

// ═══════════════════════════════════════════════
// FILE UPLOAD – DRAG & DROP
// ═══════════════════════════════════════════════

function dzOver(e, id) {
  e.preventDefault();
  document.getElementById(id).classList.add('active');
}

function dzLeave(e, id) {
  document.getElementById(id).classList.remove('active');
}

async function dzDrop(e, id) {
  e.preventDefault();
  document.getElementById(id).classList.remove('active');
  const files = [...e.dataTransfer.files].filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  );
  if (files.length === 0) { showToast('Nur PDF-Dateien werden unterstützt.'); return; }
  await addModalFiles(files);
}

async function modalFilesSelected(event) {
  const files = [...event.target.files];
  await addModalFiles(files);
  event.target.value = '';
}

async function addModalFiles(files) {
  const isFirst = STATE.pendingAttachments.length === 0;
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) { showToast(file.name + ' ist zu groß (max 5 MB).'); continue; }
    try {
      const base64 = await fileToBase64(file);
      STATE.pendingAttachments.push({ name: file.name, size: file.size, base64 });
    } catch (e) { showToast('Fehler beim Lesen: ' + file.name); }
  }
  if (isFirst && STATE.pendingAttachments.length > 0) {
    // Scan first PDF for fields (only when adding new Bewerbung)
    if (!STATE.editId) {
      runPDFScan(STATE.pendingAttachments[0]);
    } else {
      // In edit mode: just auto-fill Firma if empty
      const firmaField = document.getElementById('m-firma');
      if (firmaField && !firmaField.value.trim()) {
        const name = STATE.pendingAttachments[0].name;
        firmaField.value = name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ').trim();
      }
    }
  }
  renderModalAttachments();
}

function renderModalAttachments() {
  const el = document.getElementById('modal-attachment-list');
  el.innerHTML = STATE.pendingAttachments.map((a, i) => `
    <div class="att-item">
      <span class="att-icon">📄</span>
      <div class="att-info">
        <div class="att-name">${escHtml(a.name)}</div>
        <div class="att-size">${formatFileSize(a.size)}</div>
      </div>
      <div class="att-actions">
        <button class="att-open" onclick="openAttachment(${i})">Öffnen</button>
        <button class="att-del" onclick="removeModalAttachment(${i})">✕</button>
      </div>
    </div>
  `).join('');
}

function removeModalAttachment(idx) {
  STATE.pendingAttachments.splice(idx, 1);
  renderModalAttachments();
}

function openAttachment(idx) {
  const a = STATE.pendingAttachments[idx];
  if (!a) return;
  const raw = a.base64.includes(',') ? a.base64.split(',')[1] : a.base64;
  const byteStr = atob(raw);
  const bytes = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob), '_blank');
}

// ═══════════════════════════════════════════════
// PDF SCAN (text extraction + regex field detection)
// ═══════════════════════════════════════════════

async function extractPDFText(base64) {
  if (typeof pdfjsLib === 'undefined') return '';
  try {
    const raw = base64.includes(',') ? base64.split(',')[1] : base64;
    const binStr = atob(raw);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    let text = '';
    const maxPages = Math.min(pdf.numPages, 3);
    for (let p = 1; p <= maxPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str).join(' ') + '\n';
    }
    return text.trim().slice(0, 6000);
  } catch (e) {
    return '';
  }
}

function scanPDFForFields(text) {
  const result = {};
  const t = text.replace(/[ \t]+/g, ' ');

  // Stelle
  const stellePatterns = [
    // "Betreff: Bewerbung als [Stelle]"
    /Betreff\s*[:\-]\s*(?:Ihre\s+)?(?:Bewerbung\s+(?:als\s+|um\s+(?:die\s+)?(?:Stelle\s+(?:als?\s+)|Position\s+(?:als?\s+))?)?)([^,\n\r]{5,80}?)(?=\s*(?:bei\s|–|-|\n|$))/i,
    // "Bewerbung als [Stelle] bei"
    /Bewerbung\s+(?:um\s+(?:die\s+)?(?:Stelle\s+)?)?als\s+([^,\n\r\-–]{5,80}?)(?=\s*(?:bei\s|–\s|-\s|\n|,|$))/i,
    // "Stelle als [X]" or "Position: [X]"
    /(?:Stelle\s+als|Position)\s*:?\s+([^,\n\r]{5,70})/i,
    // Job title before "(m/w/d)"
    /([A-ZÄÖÜ][^\n\r(]{8,60}?)\s*\(m[\s/]?w[\s/]?d\)/i,
  ];

  for (const pat of stellePatterns) {
    const m = t.match(pat);
    if (m && m[1] && m[1].trim().length > 2) {
      result.stelle = m[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // Ansprechperson
  const kontaktPatterns = [
    // "Sehr geehrte Frau Müller"
    /Sehr\s+geehrte[rs]?\s+(Frau|Herr)\s+(?:Dr\.?\s+|Prof\.?\s+)?([A-ZÄÖÜ][a-zäöüß]+-?[A-ZÄÖÜa-zäöüß]*(?:\s+[A-ZÄÖÜ][a-zäöüß]+-?[a-zäöüß]*)?)/i,
    // "Ansprechpartner(in): [Name]"
    /Ansprechpartner(?:in)?\s*:\s*(?:Frau\s+|Herr\s+)?(?:Dr\.?\s+)?([A-ZÄÖÜ][^\n\r,]{3,40})/i,
  ];

  for (const pat of kontaktPatterns) {
    const m = t.match(pat);
    if (m) {
      if (pat.source.includes('geehrte')) {
        result.kontakt = (m[1] + ' ' + m[2]).trim();
      } else {
        result.kontakt = m[1].trim().replace(/\s+/g, ' ');
      }
      break;
    }
  }

  // Firma: "bei [Firma]" in Bewerbung context
  const firmaPatterns = [
    /Bewerbung[^.\n]{0,80}?\s+bei\s+(?:der\s+|dem\s+|einem\s+|einer\s+)?([A-ZÄÖÜ][^\n\r,.(]{3,60}?)(?=\s*[,.\n–\-]|$)/i,
    /An\s+(?:die\s+|das\s+|den\s+)?([A-ZÄÖÜ][A-ZÄÖÜa-zäöüß\s&\-]{5,60}?)(?=\n|z\.?\s*Hd|Frau|Herr)/i,
  ];

  for (const pat of firmaPatterns) {
    const m = t.match(pat);
    if (m && m[1] && m[1].trim().length > 2) {
      result.firma = m[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // Datum: DD.MM.YYYY
  const datumMatch = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (datumMatch) {
    const [, day, month, year] = datumMatch;
    const d = new Date(+year, +month - 1, +day);
    if (!isNaN(d.getTime()) && +year >= 2020) {
      result.datum = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  return result;
}

const SCAN_FIELD_LABELS = { stelle: 'Stelle', kontakt: 'Ansprechperson', firma: 'Firma', datum: 'Datum' };
const SCAN_FIELD_IDS   = { stelle: 'm-stelle', kontakt: 'm-kontakt', firma: 'm-firma', datum: 'm-datum' };

async function runPDFScan(attachment) {
  const panel = document.getElementById('pdf-scan-result');
  const fieldsEl = document.getElementById('pdf-scan-fields');

  panel.classList.remove('js-hidden');
  fieldsEl.innerHTML = '<div class="pdf-scan-scanning">Scanne PDF…</div>';
  document.querySelector('#pdf-scan-result .pdf-scan-apply-all').style.display = 'none';

  const text = await extractPDFText(attachment.base64);

  if (!text) {
    fieldsEl.innerHTML = '<div class="pdf-scan-scanning">Kein Text gefunden (gescannte PDF?).</div>';
    return;
  }

  const fields = scanPDFForFields(text);
  STATE.pendingScanFields = fields;

  // Auto-fill Firma if still empty
  const firmaField = document.getElementById('m-firma');
  if (firmaField && !firmaField.value.trim()) {
    if (fields.firma) {
      firmaField.value = fields.firma;
    } else {
      firmaField.value = attachment.name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ').trim();
    }
  }

  const entries = Object.entries(fields).filter(([k]) => k !== 'firma'); // Firma already applied above
  if (entries.length === 0 && !fields.firma) {
    fieldsEl.innerHTML = '<div class="pdf-scan-scanning">Keine weiteren Felder erkannt.</div>';
    return;
  }

  // Show only fields that aren't already filled
  const toShow = Object.entries(fields).filter(([key]) => {
    const el = document.getElementById(SCAN_FIELD_IDS[key]);
    return el && !el.value.trim();
  });

  if (toShow.length === 0) {
    panel.classList.add('js-hidden');
    return;
  }

  document.querySelector('#pdf-scan-result .pdf-scan-apply-all').style.display = '';
  fieldsEl.innerHTML = toShow.map(([key, val]) => `
    <div class="pdf-scan-field" id="scan-row-${key}">
      <span class="pdf-scan-label">${SCAN_FIELD_LABELS[key]}</span>
      <span class="pdf-scan-val" title="${escHtml(val)}">${escHtml(val)}</span>
      <button class="pdf-scan-btn" onclick="applyScanField('${key}')">Übernehmen</button>
    </div>
  `).join('');
}

function applyScanField(key) {
  const val = STATE.pendingScanFields && STATE.pendingScanFields[key];
  if (!val) return;
  const el = document.getElementById(SCAN_FIELD_IDS[key]);
  if (el) el.value = val;
  const row = document.getElementById('scan-row-' + key);
  if (row) row.querySelector('.pdf-scan-btn').outerHTML = '<span class="pdf-scan-applied">✓</span>';
}

function applyAllScanFields() {
  if (!STATE.pendingScanFields) return;
  Object.keys(STATE.pendingScanFields).forEach(key => {
    const el = document.getElementById(SCAN_FIELD_IDS[key]);
    if (el && !el.value.trim()) el.value = STATE.pendingScanFields[key];
  });
  document.getElementById('pdf-scan-result').classList.add('js-hidden');
  document.querySelector('.modal-body').scrollTop = 0;
}

// ═══════════════════════════════════════════════
// BULK PDF IMPORT
// ═══════════════════════════════════════════════

async function bulkPDFSelected(event) {
  const files = [...event.target.files].filter(f =>
    f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
  );
  event.target.value = '';
  if (files.length === 0) return;

  const today = new Date().toISOString().split('T')[0];
  let added = 0;

  for (const file of files) {
    const firma = file.name.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ').trim();
    let attachments = [];
    if (file.size <= 5 * 1024 * 1024) {
      try {
        const base64 = await fileToBase64(file);
        attachments = [{ name: file.name, size: file.size, base64 }];
      } catch (e) {}
    } else {
      showToast(file.name + ' ist zu groß (max 5 MB) – ohne Anhang gespeichert.');
    }

    const dup = STATE.bewerbungen.find(b =>
      b.firma.toLowerCase() === firma.toLowerCase() && b.attachments && b.attachments.some(a => a.name === file.name)
    );
    if (dup) continue;

    STATE.bewerbungen.unshift({
      id: 'b-' + Date.now() + '-' + added,
      firma,
      stelle: '–',
      datum: today,
      status: 'offen',
      plattform: '',
      kontakt: '',
      link: '',
      notizen: '',
      attachments
    });
    added++;
  }

  saveBewerbungenStorage();
  renderTracker();
  showToast(added + ' Bewerbung' + (added === 1 ? '' : 'en') + ' aus PDF importiert.');
}

// ═══════════════════════════════════════════════
// DUPLICATE DETECTION
// ═══════════════════════════════════════════════

function checkDuplicate(firma, stelle) {
  const fLow = firma.toLowerCase().trim();
  const sLow = stelle.toLowerCase().trim();

  return STATE.bewerbungen.find(b => {
    if (STATE.editId && b.id === STATE.editId) return false;
    const bfLow = b.firma.toLowerCase().trim();
    const firmaMatch = bfLow.includes(fLow) || fLow.includes(bfLow);
    if (!firmaMatch) return false;
    if (!sLow || sLow === '–' || !b.stelle || b.stelle === '–') return true;
    const bsLow = b.stelle.toLowerCase().trim();
    return bsLow.includes(sLow) || sLow.includes(bsLow) || strSimilarity(bsLow, sLow) > 0.6;
  }) || null;
}

function strSimilarity(a, b) {
  if (a === b) return 1;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (longer.length === 0) return 1;
  return (longer.length - levenshtein(longer, shorter)) / longer.length;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function showDuplicateWarning(existing) {
  document.getElementById('duplicate-existing').innerHTML = `
    <div class="duplicate-firma">${escHtml(existing.firma)}</div>
    <div class="duplicate-meta">
      <span>${escHtml(existing.stelle)}</span>
      <span>·</span>
      <span>${formatDate(existing.datum)}</span>
      <span>·</span>
      <span class="status-badge status-${existing.status}">${statusLabel(existing.status)}</span>
    </div>
  `;
  document.getElementById('duplicate-overlay').classList.remove('hidden');
}

function closeDuplicate() {
  document.getElementById('duplicate-overlay').classList.add('hidden');
  STATE.pendingDuplicate = null;
}

function duplicateCreate() {
  const data = STATE.pendingDuplicate.newData;
  data.id = 'b-' + Date.now();
  STATE.bewerbungen.unshift(data);
  saveBewerbungenStorage();
  closeDuplicate();
  closeModal();
  renderTracker();
  showToast('Neue Bewerbung angelegt.');
}

function duplicateUpdate() {
  const data = STATE.pendingDuplicate.newData;
  const fLow = data.firma.toLowerCase();
  const existing = STATE.bewerbungen.find(b =>
    b.firma.toLowerCase().includes(fLow) || fLow.includes(b.firma.toLowerCase())
  );
  if (existing) {
    const idx = STATE.bewerbungen.findIndex(b => b.id === existing.id);
    STATE.bewerbungen[idx] = { ...existing, ...data, id: existing.id };
    saveBewerbungenStorage();
    showToast('Bestehende Bewerbung aktualisiert.');
  }
  closeDuplicate();
  closeModal();
  renderTracker();
}

// ═══════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════

function exportJSON() {
  const payload = { version: 1, exported: new Date().toISOString(), bewerbungen: STATE.bewerbungen };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bewerbungen-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Export erfolgreich!');
}

function exportPDF() {
  const rows = STATE.bewerbungen.map(b => `
    <tr>
      <td>${escHtml(b.firma)}</td>
      <td>${escHtml(b.stelle)}</td>
      <td>${formatDate(b.datum)}</td>
      <td>${statusLabel(b.status)}</td>
      <td>${escHtml(b.plattform || '–')}</td>
      <td>${escHtml(b.notizen || '–')}</td>
    </tr>
  `).join('');

  document.getElementById('print-table').innerHTML = `
    <h1>Bewerbungsübersicht</h1>
    <p class="print-meta">Stand: ${new Date().toLocaleDateString('de-DE')} · ${STATE.bewerbungen.length} Einträge</p>
    <table class="print-table">
      <thead><tr>
        <th>Firma</th><th>Stelle</th><th>Datum</th>
        <th>Status</th><th>Plattform</th><th>Notizen</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  window.print();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      const list = Array.isArray(parsed) ? parsed : (parsed.bewerbungen || []);
      if (!Array.isArray(list)) throw new Error('Ungültiges Format');
      const existing = new Set(STATE.bewerbungen.map(b => b.id));
      let added = 0;
      for (const b of list) {
        if (b.id && !existing.has(b.id)) { STATE.bewerbungen.push(b); added++; }
      }
      saveBewerbungenStorage();
      renderTracker();
      showToast(added + ' Bewerbung(en) importiert.');
    } catch (e) {
      showToast('Fehler beim Import: ' + e.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ═══════════════════════════════════════════════
// ANALYSE / STATISTIKEN
// ═══════════════════════════════════════════════

function renderAnalyse() {
  renderAnalyseStats();
  renderTimeline();
}

function renderAnalyseStats() {
  const el = document.getElementById('analyse-stats');
  const b = STATE.bewerbungen;

  if (b.length === 0) {
    el.innerHTML = '<p style="font-size:13px;color:var(--hint);text-align:center;padding:20px 0;">Noch keine Bewerbungen vorhanden.</p>';
    document.getElementById('analyse-timeline').innerHTML = '';
    return;
  }

  const total = b.length;
  const eingeladen = b.filter(x => x.status === 'eingeladen' || x.status === 'angebot').length;
  const absagen = b.filter(x => x.status === 'absage').length;
  const rate = Math.round((eingeladen / total) * 100);

  const platforms = {};
  b.forEach(x => { if (x.plattform) platforms[x.plattform] = (platforms[x.plattform] || 0) + 1; });
  const topPlatforms = Object.entries(platforms).sort((a, c) => c[1] - a[1]).slice(0, 5);

  const platSuccess = {};
  b.filter(x => x.plattform && (x.status === 'eingeladen' || x.status === 'angebot'))
    .forEach(x => { platSuccess[x.plattform] = (platSuccess[x.plattform] || 0) + 1; });
  const bestPlat = Object.entries(platSuccess).sort((a, c) => c[1] - a[1])[0];

  el.innerHTML = `
    <div class="analytics-row">
      <div class="analytics-item">
        <span class="analytics-label">Einladungsrate</span>
        <span class="analytics-val" style="color:var(--accent);">${rate}%</span>
      </div>
      <div class="analytics-item">
        <span class="analytics-label">Bewerbungen gesamt</span>
        <span class="analytics-val">${total}</span>
      </div>
      <div class="analytics-item">
        <span class="analytics-label">Einladungen / Angebote</span>
        <span class="analytics-val" style="color:var(--accent);">${eingeladen}</span>
      </div>
      <div class="analytics-item">
        <span class="analytics-label">Absagen erhalten</span>
        <span class="analytics-val" style="color:var(--danger);">${absagen}</span>
      </div>
      ${bestPlat ? `<div class="analytics-item">
        <span class="analytics-label">Beste Plattform</span>
        <span class="analytics-val" style="color:var(--accent);">${escHtml(bestPlat[0])}</span>
      </div>` : ''}
    </div>
    ${topPlatforms.length > 0 ? `
    <div class="analytics-bars">
      <div class="analytics-bars-title">Plattformen</div>
      ${topPlatforms.map(([name, count]) => `
        <div class="analytics-bar-item">
          <div class="analytics-bar-label">
            <span>${escHtml(name)}</span><span>${count}</span>
          </div>
          <div class="analytics-bar-track">
            <div class="analytics-bar-fill" style="width:${Math.round((count / total) * 100)}%"></div>
          </div>
        </div>
      `).join('')}
    </div>` : ''}
  `;
}

function renderTimeline() {
  const el = document.getElementById('analyse-timeline');
  const sorted = [...STATE.bewerbungen]
    .filter(b => b.datum)
    .sort((a, b) => new Date(b.datum) - new Date(a.datum))
    .slice(0, 20);

  if (sorted.length === 0) {
    el.innerHTML = '<p style="font-size:13px;color:var(--hint);text-align:center;padding:20px 0;">Keine Einträge.</p>';
    return;
  }

  el.innerHTML = `<div class="timeline">
    ${sorted.map(b => `
      <div class="timeline-item">
        <div class="timeline-dot ${b.status}"></div>
        <div class="timeline-info">
          <div class="timeline-firma">${escHtml(b.firma)}</div>
          <div class="timeline-stelle">${escHtml(b.stelle)}</div>
          <div class="timeline-date">${formatDate(b.datum)} · <span class="status-badge status-${b.status}">${statusLabel(b.status)}</span></div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ═══════════════════════════════════════════════
// BAUKASTEN
// ═══════════════════════════════════════════════

function updateBaukastenFirma() {
  STATE.firma = document.getElementById('b-firma').value;
  renderBaukasten();
  updatePreview();
}

function replaceFirma(text) {
  return text.replace(/\[FIRMA\]/g, STATE.firma || '[FIRMA]');
}

function renderBaukasten() {
  renderBaukastenSection('einstieg', 'b-einstieg', true);
  renderBaukastenSection('kompetenz', 'b-kompetenz', false);
  renderBaukastenSection('verbindung', 'b-verbindung', true);
  renderBaukastenSection('abschluss', 'b-abschluss', true);
}

function renderBaukastenSection(kat, elId, single) {
  const items = STATE.formeln.filter(f => f.kat === kat);
  const el = document.getElementById(elId);
  el.innerHTML = items.map(f => {
    const isSelected = single
      ? STATE.selected[kat] === f.id
      : STATE.selected[kat].includes(f.id);
    return `<button class="chip${isSelected ? ' selected' : ''}" onclick="toggleChip('${kat}', '${f.id}', ${single})">
      <span class="chip-tag">${f.tag}</span>
      ${replaceFirma(f.text)}
    </button>`;
  }).join('') || '<p style="font-size:12px;color:var(--hint);padding:6px 0;">Noch keine Formulierungen. Gehe zu "Formulierungen" um welche hinzuzufügen.</p>';
}

function toggleChip(kat, id, single) {
  if (single) {
    STATE.selected[kat] = STATE.selected[kat] === id ? null : id;
  } else {
    const arr = STATE.selected[kat];
    const pos = arr.indexOf(id);
    if (pos === -1) arr.push(id); else arr.splice(pos, 1);
  }
  renderBaukasten();
  updatePreview();
}

function getSelectedText(kat, single) {
  if (single) {
    if (STATE.selected[kat] === null) return '';
    const f = STATE.formeln.find(x => x.id === STATE.selected[kat]);
    return f ? replaceFirma(f.text) : '';
  }
  return STATE.selected[kat]
    .map(id => STATE.formeln.find(x => x.id === id))
    .filter(Boolean)
    .map(f => replaceFirma(f.text))
    .join(' ');
}

function updatePreview() {
  const parts = [
    getSelectedText('einstieg', true),
    getSelectedText('kompetenz', false),
    getSelectedText('verbindung', true),
    getSelectedText('abschluss', true)
  ].filter(Boolean);

  const el = document.getElementById('preview-letter');
  if (parts.length === 0) {
    el.innerHTML = '<p class="preview-placeholder">Wähle links Formulierungen aus, um das Anschreiben aufzubauen.</p>';
    document.getElementById('b-wordcount').textContent = '0 Wörter';
    return;
  }
  const fullText = parts.join('\n\n');
  el.textContent = fullText;
  document.getElementById('b-wordcount').textContent = fullText.trim().split(/\s+/).length + ' Wörter';
}

function clearBaukasten() {
  STATE.selected = { einstieg: null, kompetenz: [], verbindung: null, abschluss: null };
  renderBaukasten();
  updatePreview();
}

function copyLetter() {
  const el = document.getElementById('preview-letter');
  const text = el.textContent;
  if (!text || text.trim() === '') { showToast('Nichts zum Kopieren.'); return; }
  const full = 'Sehr geehrte Damen und Herren,\n\n' + text + '\n\nMit freundlichen Grüßen\n\nMona Zaqqa';
  navigator.clipboard.writeText(full).then(() => showToast('Anschreiben kopiert!'));
}

function usePreviewForCheck() {
  document.getElementById('check-text').value = document.getElementById('preview-letter').textContent;
}

function saveToTracker() {
  showPage('tracker');
  openModal('add');
  if (STATE.firma) {
    document.getElementById('m-firma').value = STATE.firma;
    document.getElementById('m-firma').focus();
  }
  document.getElementById('m-notizen').value = 'Anschreiben über Baukasten erstellt.';
}

// ═══════════════════════════════════════════════
// QUALITÄTS-CHECK
// ═══════════════════════════════════════════════

function runCheck() {
  const text = document.getElementById('check-text').value.toLowerCase();
  const el = document.getElementById('check-results');
  if (!text.trim()) { el.innerHTML = '<p style="font-size:12px;color:var(--hint);">Bitte Text eingeben.</p>'; return; }
  const found = VERBOTEN.filter(v => text.includes(v.phrase));
  if (found.length === 0) {
    el.innerHTML = '<div class="check-ok">✓ Keine verbotenen Formulierungen gefunden.</div>';
  } else {
    el.innerHTML = found.map(v => `
      <div class="check-err">
        <strong>"${v.phrase}"</strong>
        ${v.reason}
      </div>
    `).join('');
  }
}

// ═══════════════════════════════════════════════
// FORMULIERUNGEN VERWALTEN
// ═══════════════════════════════════════════════

function renderFormeln() {
  const grid = document.getElementById('formeln-grid');
  const kats = ['einstieg', 'kompetenz', 'verbindung', 'abschluss'];
  grid.innerHTML = kats.map(kat => {
    const items = STATE.formeln.filter(f => f.kat === kat);
    return `
      <div class="formel-section">
        <div class="formel-section-title">${KAT_LABELS[kat]} (${items.length})</div>
        <div class="formel-items">
          ${items.map(f => `
            <div class="formel-item">
              <div>
                <span class="formel-badge f-${kat}">${f.tag}</span>
                ${f.custom ? '<span class="formel-badge f-custom">Eigene</span>' : ''}
                <div class="formel-text">${f.text}</div>
              </div>
              <div class="formel-actions">
                <button class="btn-ghost" style="font-size:12px;padding:5px 10px;" onclick="openFormelModal('${f.id}')">Bearbeiten</button>
                ${f.custom ? `<button class="btn-danger" onclick="deleteFormel('${f.id}')">✕</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function openFormelModal(editId) {
  STATE.formelEditId = editId || null;
  if (editId) {
    const f = STATE.formeln.find(x => x.id === editId);
    if (f) {
      document.getElementById('formel-modal-title').textContent = 'Formulierung bearbeiten';
      document.getElementById('f-roh').value = '';
      document.getElementById('f-text').value = f.text;
      document.getElementById('f-kat').value = f.kat;
      document.getElementById('f-tag').value = f.tag;
    }
  } else {
    document.getElementById('formel-modal-title').textContent = 'Neue Formulierung';
    document.getElementById('f-roh').value = '';
    document.getElementById('f-text').value = '';
    document.getElementById('f-kat').value = 'einstieg';
    document.getElementById('f-tag').value = '';
  }
  document.getElementById('formel-overlay').classList.remove('hidden');
}

function closeFormelModal() {
  document.getElementById('formel-overlay').classList.add('hidden');
  STATE.formelEditId = null;
}

function previewAdapt() {
  const roh = document.getElementById('f-roh').value;
  if (!roh.trim()) return;
  document.getElementById('f-text').value = roh;
}

function saveFormel() {
  const text = document.getElementById('f-text').value.trim();
  const kat  = document.getElementById('f-kat').value;
  const tag  = document.getElementById('f-tag').value.trim() || 'Eigene';
  if (!text) { showToast('Bitte Text eingeben.'); return; }

  if (STATE.formelEditId) {
    const idx = STATE.formeln.findIndex(f => f.id === STATE.formelEditId);
    if (idx !== -1) STATE.formeln[idx] = { ...STATE.formeln[idx], text, kat, tag };
    showToast('Formulierung aktualisiert.');
  } else {
    STATE.formeln.push({ id: 'f-' + Date.now(), kat, tag, text, custom: true });
    showToast('Formulierung hinzugefügt!');
  }

  saveFormeln();
  closeFormelModal();
  renderFormeln();
  renderBaukasten();
}

function deleteFormel(id) {
  if (!confirm('Formulierung löschen?')) return;
  STATE.formeln = STATE.formeln.filter(f => f.id !== id);
  saveFormeln();
  renderFormeln();
  renderBaukasten();
  showToast('Gelöscht.');
}

// ═══════════════════════════════════════════════
// TRACKER HELPERS
// ═══════════════════════════════════════════════

function cycleStatus(id, event) {
  event.stopPropagation();
  const b = STATE.bewerbungen.find(x => x.id === id);
  if (!b) return;
  const order = ['offen', 'eingeladen', 'angebot', 'absage'];
  b.status = order[(order.indexOf(b.status) + 1) % order.length];
  saveBewerbungenStorage();
  renderTracker();
  showToast('Status: ' + statusLabel(b.status));
}

function daysAgo(datum) {
  if (!datum) return '';
  const days = Math.floor((Date.now() - new Date(datum)) / 86400000);
  if (days < 0) return '';
  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Wo.`;
  return `vor ${Math.floor(days / 30)} Mon.`;
}

function deadlineChip(frist) {
  if (!frist) return '';
  const days = Math.floor((new Date(frist) - Date.now()) / 86400000);
  if (days < 0) return `<span class="tracker-frist frist-over">‼ Frist abgelaufen</span>`;
  if (days === 0) return `<span class="tracker-frist frist-urgent">‼ Frist heute</span>`;
  if (days <= 3) return `<span class="tracker-frist frist-urgent">⚠ Frist in ${days} Tag${days === 1 ? '' : 'en'}</span>`;
  if (days <= 7) return `<span class="tracker-frist frist-warn">⚠ Frist in ${days} Tagen</span>`;
  return `<span class="tracker-frist">Frist: ${formatDate(frist)}</span>`;
}

function openFirstAttachment(id, event) {
  event.stopPropagation();
  const b = STATE.bewerbungen.find(x => x.id === id);
  if (!b || !b.attachments || !b.attachments.length) return;
  const a = b.attachments[0];
  const raw = a.base64.includes(',') ? a.base64.split(',')[1] : a.base64;
  const byteStr = atob(raw);
  const bytes = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob), '_blank');
}

// ═══════════════════════════════════════════════
// TOOLS DROPDOWN
// ═══════════════════════════════════════════════

function toggleToolsMenu(event) {
  event.stopPropagation();
  document.getElementById('tools-menu').classList.toggle('js-hidden');
}

function closeToolsMenu() {
  const m = document.getElementById('tools-menu');
  if (m) m.classList.add('js-hidden');
}

document.addEventListener('click', closeToolsMenu);

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 2400);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeFormelModal();
    closeDuplicate();
  }
});

// START
init();
