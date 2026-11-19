/*
 * ============================================================
 *  Songlap Party Games Studio Pro — main app
 * ============================================================
 *  LICENSING CONFIG
 *  Each buyer has a UNIQUE code, registered to their name by
 *  the license server (Google Apps Script + Google Sheet).
 *  The app sends { name, code } to LICENSE_API_URL and unlocks
 *  only when the server says ok.
 *  >> After deploying the Apps Script web app, paste its URL
 *     in place of the placeholder below. That is the ONLY
 *     change needed to go live. <<
 * ============================================================
 */
const LICENSE_API_URL = "https://script.google.com/macros/s/AKfycbzpPYHEron1JbSFnqAaMpFwKjXaVqo1R35smNx_ru6P_VVd5zUBM3URJawVXLg5NrLPpQ/exec";

/* ---------- License response handling (pure, unit-tested) ---------- */

var LICENSE_ERROR_MESSAGES = {
  invalid_code: 'This code was not found. Please check the code from your purchase.',
  code_registered_to_another_name: 'This code is already registered to another buyer. If this is your code, please contact support.',
  missing_fields: 'Please enter both your name and your code.',
  network: 'Could not verify your code. Please check your internet connection and try again.'
};

function licenseErrorMessage(errorCode) {
  return LICENSE_ERROR_MESSAGES[errorCode] || LICENSE_ERROR_MESSAGES.network;
}

/* Turn a parsed license-server response into an app decision. */
function interpretLicenseResponse(data) {
  if (!data || typeof data !== 'object') {
    return { action: 'error', message: licenseErrorMessage('network') };
  }
  if (data.ok === true) {
    return { action: 'unlock', test: data.test === true };
  }
  return { action: 'error', message: licenseErrorMessage(data.error) };
}

/* Allow the Node test suite to exercise the pure logic above. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LICENSE_API_URL: LICENSE_API_URL,
    LICENSE_ERROR_MESSAGES: LICENSE_ERROR_MESSAGES,
    licenseErrorMessage: licenseErrorMessage,
    interpretLicenseResponse: interpretLicenseResponse
  };
}

(function () {
  'use strict';

  /* In the browser these come from the script tags; in Node
     (unit tests) they are required directly. */
  var C = typeof PTG_OCCASIONS !== 'undefined'
    ? { PTG_OCCASIONS: PTG_OCCASIONS, PTG_GAMES: PTG_GAMES, ptgOccasionById: ptgOccasionById, ptgGameById: ptgGameById, ptgLibrary: ptgLibrary }
    : require('./content.js');
  var D = typeof PTG_DESIGNS !== 'undefined' ? { PTG_DESIGNS: PTG_DESIGNS, ptgDesignById: ptgDesignById } : require('./designs.js');
  var E = typeof PartyEngine !== 'undefined' ? PartyEngine : require('./engine.js');
  var BK = typeof PartyBook !== 'undefined' ? PartyBook : require('./book.js');

  /* ================= License gate ================= */

  var NAME_KEY = 'party_license_name';
  var CODE_KEY = 'party_license_code';
  var PROJECTS_KEY = 'party_projects_v1';
  var appStarted = false;

  function unlock() {
    document.getElementById('lock-screen').hidden = true;
    document.getElementById('app').hidden = false;
    if (!appStarted) { appStarted = true; initApp(); }
  }

  function showLicenseBar(name, code) {
    document.getElementById('license-name').textContent = name;
    document.getElementById('license-code').textContent = code;
    document.getElementById('license-bar').hidden = false;
  }

  function storedLicense() {
    try {
      var name = localStorage.getItem(NAME_KEY);
      var code = localStorage.getItem(CODE_KEY);
      if (name && code) return { name: name, code: code };
    } catch (e) { /* private mode */ }
    return null;
  }

  function initGate() {
    var saved = storedLicense();
    if (saved) { showLicenseBar(saved.name, saved.code); unlock(); return; }

    var form = document.getElementById('lock-form');
    var nameInput = document.getElementById('lock-name');
    var codeInput = document.getElementById('lock-input');
    var button = document.getElementById('lock-submit');
    var errorEl = document.getElementById('lock-error');

    function showError(message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = nameInput.value.trim();
      var code = codeInput.value.trim();
      if (!name || !code) { showError(licenseErrorMessage('missing_fields')); return; }
      errorEl.hidden = true;
      button.disabled = true;
      button.textContent = 'Checking…';
      fetch(LICENSE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name: name, code: code })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var decision = interpretLicenseResponse(data);
          if (decision.action === 'unlock') {
            try {
              localStorage.setItem(NAME_KEY, name);
              localStorage.setItem(CODE_KEY, code.toUpperCase());
            } catch (e) { /* private mode */ }
            showLicenseBar(name, code.toUpperCase());
            unlock();
          } else {
            showError(decision.message);
          }
        })
        .catch(function () { showError(licenseErrorMessage('network')); })
        .finally(function () {
          button.disabled = false;
          button.textContent = 'Unlock';
        });
    });
  }

  /* ================= app ================= */

  function $(id) { return document.getElementById(id); }
  var current = null; // { pack, book, opts, design }

  function currentOccasion() { return C.ptgOccasionById($('occasion-select').value); }

  /* ----- games list + editors ----- */

  var ED_HINT = 'One item per line. For questions with answers: Question | Answer';

  function editorRawFor(occ, gid) {
    var lib = C.ptgLibrary(occ);
    if (gid === 'certificates') return { kind: 'list', key: 'awards', raw: lib.awards };
    if (gid === 'madlibs') return { kind: 'story', raw: lib.madlibs };
    if (gid === 'guess') return { kind: 'guess', raw: lib.guess };
    if (gid === 'tags' || gid === 'scorecard') return { kind: 'auto' };
    return { kind: 'list', key: gid, raw: lib[gid] };
  }

  function renderGames(preset) {
    var occ = currentOccasion();
    var lib = C.ptgLibrary(occ);
    var list = $('games-list');
    list.innerHTML = '';
    occ.games.forEach(function (gid) {
      var def = C.ptgGameById(gid);
      var row = document.createElement('div');
      row.className = 'game-row';
      row.dataset.game = gid;
      var checked = preset && preset.selected ? preset.selected.indexOf(gid) !== -1
        : occ.defaults.indexOf(gid) !== -1;
      var head = document.createElement('div');
      head.className = 'game-head';
      head.innerHTML = '<label class="check"><input type="checkbox" class="game-check" ' +
        (checked ? 'checked' : '') + '> ' + def.name + '</label>';
      var ed = editorRawFor(occ, gid);
      var editorHtml = '';
      if (ed.kind === 'list') {
        var savedText = preset && preset.editors ? preset.editors[gid] : null;
        editorHtml = '<div class="game-editor" hidden><textarea class="ed-text">' +
          escapeHtml(savedText != null ? savedText : E.formatForEditor(ed.key, ed.raw)) +
          '</textarea><div class="ed-row"><button type="button" class="btn btn-ghost btn-small ed-reset">Reset to built-in</button>' +
          '<span class="ed-note">' + ED_HINT + '</span></div></div>';
      } else if (ed.kind === 'story') {
        var st = preset && preset.editors ? preset.editors[gid] : null;
        editorHtml = '<div class="game-editor" hidden>' +
          '<input type="text" class="ed-title" value="' + escapeAttr(st ? st.title : ed.raw.title) + '">' +
          '<textarea class="ed-text">' + escapeHtml(st ? st.story : ed.raw.story) + '</textarea>' +
          '<div class="ed-row"><button type="button" class="btn btn-ghost btn-small ed-reset">Reset to built-in</button>' +
          '<span class="ed-note">Story text. Write blanks like [adjective], [noun], [number] — guests fill them in. Names like {honoree} are filled automatically.</span></div></div>';
      } else if (ed.kind === 'guess') {
        var gs = preset && preset.editors ? preset.editors[gid] : null;
        editorHtml = '<div class="game-editor" hidden>' +
          '<input type="text" class="ed-gtitle" value="' + escapeAttr(gs ? gs.title : ed.raw.title) + '">' +
          '<input type="text" class="ed-gunit" value="' + escapeAttr(gs ? gs.unit : ed.raw.unit) + '">' +
          '<input type="text" class="ed-gnote" value="' + escapeAttr(gs ? gs.note : ed.raw.note) + '">' +
          '<div class="ed-row"><span class="ed-note">Sign title, the jar’s unit (e.g. candies), and the note under the title.</span></div></div>';
      } else {
        editorHtml = '<div class="game-editor" hidden><span class="ed-note">Automatic — this is generated from your other choices (the pack’s games and your names). Nothing to edit.</span></div>';
      }
      if (ed.kind !== 'auto') {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-ghost btn-small ed-toggle';
        btn.textContent = 'Edit content';
        head.appendChild(btn);
      }
      row.appendChild(head);
      var blurb = document.createElement('p');
      blurb.className = 'game-blurb';
      blurb.textContent = def.blurb + (def.station ? ' (Prints once — a station piece.)' : '');
      row.appendChild(blurb);
      if (editorHtml) {
        var holder = document.createElement('div');
        holder.innerHTML = editorHtml;
        row.appendChild(holder.firstChild);
      }
      list.appendChild(row);
      syncRow(row);
    });
    list.querySelectorAll('.game-row').forEach(function (row) {
      var gid = row.dataset.game;
      row.querySelector('.game-check').addEventListener('change', function () { syncRow(row); });
      var toggle = row.querySelector('.ed-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          var ed2 = row.querySelector('.game-editor');
          ed2.hidden = !ed2.hidden;
          toggle.textContent = ed2.hidden ? 'Edit content' : 'Close editor';
        });
      }
      var reset = row.querySelector('.ed-reset');
      if (reset) {
        reset.addEventListener('click', function () { resetEditor(row, gid); });
      }
    });
  }

  function syncRow(row) {
    var on = row.querySelector('.game-check').checked;
    row.classList.toggle('on', on);
  }

  function resetEditor(row, gid) {
    var occ = currentOccasion();
    var ed = editorRawFor(occ, gid);
    if (ed.kind === 'list') row.querySelector('.ed-text').value = E.formatForEditor(ed.key, ed.raw);
    if (ed.kind === 'story') {
      row.querySelector('.ed-title').value = ed.raw.title;
      row.querySelector('.ed-text').value = ed.raw.story;
    }
    if (ed.kind === 'guess') {
      row.querySelector('.ed-gtitle').value = ed.raw.title;
      row.querySelector('.ed-gunit').value = ed.raw.unit;
      row.querySelector('.ed-gnote').value = ed.raw.note;
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  /* ----- state read / apply ----- */

  function readTokens() {
    return {
      honoree: $('in-honoree').value,
      honoree2: $('in-honoree2').value,
      date: $('in-date').value,
      host: $('in-host').value
    };
  }

  function readEditors() {
    var editors = {};
    document.querySelectorAll('#games-list .game-row').forEach(function (row) {
      var gid = row.dataset.game;
      var edEl = row.querySelector('.game-editor');
      if (!edEl) return;
      var text = row.querySelector('.ed-text');
      if (row.querySelector('.ed-gtitle')) {
        editors[gid] = {
          title: row.querySelector('.ed-gtitle').value,
          unit: row.querySelector('.ed-gunit').value,
          note: row.querySelector('.ed-gnote').value
        };
      } else if (row.querySelector('.ed-title')) {
        editors[gid] = { title: row.querySelector('.ed-title').value, story: text.value };
      } else if (text) {
        editors[gid] = text.value;
      }
    });
    return editors;
  }

  function collectEdits() {
    var editors = readEditors();
    var edits = {};
    Object.keys(editors).forEach(function (gid) {
      var v = editors[gid];
      if (typeof v === 'string') {
        var key = gid === 'certificates' ? 'awards' : gid;
        edits[gid] = E.parseEdited(key, v);
      } else {
        edits[gid] = v; // madlibs {title, story} / guess {title, unit, note}
      }
    });
    return edits;
  }

  function readState() {
    var selected = [];
    document.querySelectorAll('#games-list .game-row').forEach(function (row) {
      if (row.querySelector('.game-check').checked) selected.push(row.dataset.game);
    });
    return {
      occasionId: $('occasion-select').value,
      tokens: readTokens(),
      designId: $('design-select').value,
      size: $('size-select').value,
      paper: $('paper-select').value,
      copies: parseInt($('in-copies').value, 10) || 1,
      business: $('in-business').value,
      cover: $('cover-on').checked,
      backCover: $('backcover-on').checked,
      inkSaver: $('inksaver-on').checked,
      cutMarks: $('cutmarks-on').checked,
      selected: selected,
      editors: readEditors()
    };
  }

  function applyState(s) {
    $('occasion-select').value = s.occasionId;
    $('in-honoree').value = s.tokens.honoree || '';
    $('in-honoree2').value = s.tokens.honoree2 || '';
    $('in-date').value = s.tokens.date || '';
    $('in-host').value = s.tokens.host || '';
    $('design-select').value = s.designId;
    $('size-select').value = s.size;
    $('paper-select').value = s.paper;
    $('in-copies').value = s.copies;
    $('in-business').value = s.business || 'Songlap Deals';
    $('cover-on').checked = s.cover !== false;
    $('backcover-on').checked = s.backCover !== false;
    $('inksaver-on').checked = !!s.inkSaver;
    $('cutmarks-on').checked = s.cutMarks !== false;
    updateOccasionChrome();
    updateDesignChrome();
    renderGames({ selected: s.selected, editors: s.editors });
  }

  /* ----- build / print / png ----- */

  function buildOpts(state) {
    return {
      paper: state.paper, size: state.size, copies: state.copies,
      cover: state.cover, backCover: state.backCover,
      inkSaver: state.inkSaver, cutMarks: state.cutMarks,
      business: state.business || 'Songlap Deals',
      metaDate: (state.tokens.date || '').trim()
    };
  }

  function doBuild() {
    var state = readState();
    if (!state.selected.length) {
      $('build-status').textContent = 'Please tick at least one game first.';
      return;
    }
    var pack = E.buildPack({
      occasionId: state.occasionId,
      gameIds: state.selected,
      tokens: state.tokens,
      edits: collectEdits()
    }, C);
    var design = D.ptgDesignById(state.designId);
    var opts = buildOpts(state);
    var book = BK.buildBook(pack, opts);
    $('book-style').textContent = BK.bookCss(design, opts);
    $('book-preview').innerHTML = book.html;
    current = { pack: pack, book: book, opts: opts, design: design };
    $('print-btn').disabled = false;
    $('png-btn').disabled = false;
    $('build-status').textContent = '✅ Pack built: ' + book.pageCount + ' pages · ' +
      pack.games.length + ' games & extras · Pack ' + pack.id + '. Preview below — check it, then Print / Save PDF.';
  }

  function doPrint() {
    if (!current) return;
    var w = window.open('', '_blank');
    if (!w) {
      alert('Please allow pop-ups for this site so the print view can open.');
      return;
    }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Party Games Pack ' +
      current.pack.id + '</title><style>' + BK.bookCss(current.design, current.opts) +
      '</style></head><body>' + current.book.html + '</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 350);
  }

  /* Cover PNG: the cover drawn on canvas at 1500×2100 (5×7 @300dpi),
     following the same draw-it-yourself approach as our other tools. */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapLines(ctx, text, maxWidth) {
    var words = String(text).split(' ');
    var lines = [], line = '';
    words.forEach(function (word) {
      var test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }
  function doPng() {
    if (!current) return;
    var d = current.design, pack = current.pack, opts = current.opts;
    var canvas = document.createElement('canvas');
    canvas.width = 1500; canvas.height = 2100;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = d.pageBg; ctx.fillRect(0, 0, 1500, 2100);
    ctx.fillStyle = d.cardBg;
    roundRect(ctx, 70, 70, 1360, 1960, 26); ctx.fill();
    ctx.strokeStyle = d.accent; ctx.lineWidth = 10;
    roundRect(ctx, 70, 70, 1360, 1960, 26); ctx.stroke();
    ctx.lineWidth = 3;
    roundRect(ctx, 95, 95, 1310, 1910, 20); ctx.stroke();
    ctx.textAlign = 'center';
    /* badge */
    ctx.fillStyle = d.headerBg;
    var badge = '★ PRINTABLE PARTY GAME PACK ★';
    ctx.font = '600 34px Arial';
    var bw = ctx.measureText(badge).width + 90;
    roundRect(ctx, 750 - bw / 2, 170, bw, 74, 37); ctx.fill();
    ctx.fillStyle = d.headerText;
    ctx.fillText(badge, 750, 220);
    /* emoji + title */
    ctx.font = '150px "Segoe UI Emoji", sans-serif';
    ctx.fillText(pack.occasion.emoji, 750, 470);
    var titleColor = d.headerBg === '#ffffff' ? d.cellText : d.headerBg;
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 108px ' + d.headerFont;
    var lines = wrapLines(ctx, pack.occasion.name + ' Party Games', 1180);
    var y = 640;
    lines.forEach(function (ln) { ctx.fillText(ln, 750, y); y += 122; });
    ctx.font = 'italic 52px ' + d.cellFont;
    ctx.fillStyle = d.cellText;
    ctx.fillText(pack.occasion.tagline, 750, y + 30); y += 130;
    ctx.font = '56px ' + d.cellFont;
    ctx.fillText('For ' + pack.tokens.honoree, 750, y); y += 84;
    if (opts.metaDate) { ctx.fillText(opts.metaDate, 750, y); y += 84; }
    ctx.fillText('Hosted by ' + pack.tokens.host, 750, y); y += 130;
    ctx.font = 'bold 46px ' + d.cellFont;
    ctx.fillStyle = d.accent;
    ctx.fillText('INCLUDES: ' + pack.games.length + ' games & extras · host guide · answer keys', 750, y);
    /* band + business */
    ctx.fillStyle = d.headerBg;
    roundRect(ctx, 170, 1690, 1160, 120, 18); ctx.fill();
    ctx.fillStyle = d.headerText;
    ctx.font = '44px ' + d.cellFont;
    ctx.fillText('Print · cut · play — ready in minutes', 750, 1766);
    ctx.fillStyle = d.cellText;
    ctx.font = '40px ' + d.cellFont;
    ctx.fillText(opts.business || 'Songlap Deals', 750, 1930);
    canvas.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'party-games-cover-' + pack.id + '.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }, 'image/png');
  }

  /* ----- projects ----- */

  function loadProjects() {
    try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveProjects(list) {
    try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)); } catch (e) { /* full */ }
  }
  function renderProjects() {
    var list = loadProjects();
    var box = $('projects-list');
    box.innerHTML = list.length ? '' : '<p class="hint">No saved projects yet.</p>';
    list.forEach(function (p, idx) {
      var row = document.createElement('div');
      row.className = 'project-row';
      row.innerHTML = '<span class="p-name">' + escapeHtml(p.name) + '</span>' +
        '<span class="p-meta">' + escapeHtml(p.savedAt) + '</span>';
      var load = document.createElement('button');
      load.className = 'btn btn-ghost btn-small'; load.textContent = 'Load';
      load.addEventListener('click', function () { applyState(p.state); });
      var del = document.createElement('button');
      del.className = 'btn btn-ghost btn-small'; del.textContent = 'Delete';
      del.addEventListener('click', function () {
        var l = loadProjects(); l.splice(idx, 1); saveProjects(l); renderProjects();
      });
      row.appendChild(load); row.appendChild(del);
      box.appendChild(row);
    });
  }

  /* ----- chrome updaters ----- */

  function updateOccasionChrome() {
    var occ = currentOccasion();
    $('occasion-blurb').textContent = occ.emoji + ' ' + occ.tagline;
  }
  function updateDesignChrome() {
    var d = D.ptgDesignById($('design-select').value);
    $('design-blurb').textContent = d.blurb;
    $('design-swatches').innerHTML =
      '<span class="swatch" style="background:' + d.pageBg + '"></span>' +
      '<span class="swatch" style="background:' + d.headerBg + '"></span>' +
      '<span class="swatch" style="background:' + d.accent + '"></span>' +
      '<span class="swatch" style="background:' + d.cardBg + '"></span>';
  }

  function initApp() {
    var occSel = $('occasion-select');
    C.PTG_OCCASIONS.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.id; opt.textContent = o.emoji + ' ' + o.name;
      occSel.appendChild(opt);
    });
    var dSel = $('design-select');
    D.PTG_DESIGNS.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = d.id; opt.textContent = d.name;
      dSel.appendChild(opt);
    });
    dSel.value = 'boho';
    occSel.addEventListener('change', function () {
      updateOccasionChrome();
      renderGames(null);
      current = null;
      $('book-preview').innerHTML = '';
      $('print-btn').disabled = true;
      $('png-btn').disabled = true;
      $('build-status').textContent = 'Occasion changed — content edits were reset. Build again when ready.';
    });
    dSel.addEventListener('change', updateDesignChrome);
    $('build-btn').addEventListener('click', doBuild);
    $('print-btn').addEventListener('click', doPrint);
    $('png-btn').addEventListener('click', doPng);
    $('project-save').addEventListener('click', function () {
      var name = $('project-name').value.trim() || 'Untitled project';
      var list = loadProjects();
      list.unshift({ name: name, savedAt: new Date().toLocaleString(), state: readState() });
      saveProjects(list.slice(0, 24));
      renderProjects();
    });
    updateOccasionChrome();
    updateDesignChrome();
    renderGames(null);
    renderProjects();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initGate);
  }
})();
