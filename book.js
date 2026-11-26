/*
 * ============================================================
 *  Party Games Studio Pro — print pack renderer
 * ============================================================
 *  Pure string building (no DOM): renders a built pack into
 *  print-ready pages — front cover, host guide + answer keys,
 *  game cards in the chosen size, station pages (certificates,
 *  favor tags, scorecard, guess-the-number sign) and a back
 *  cover. Used by the browser app (preview / print) AND by the
 *  offline sample builder (WeasyPrint), so samples look exactly
 *  like the tool's output.
 *
 *  Pagination is deterministic: pages are assembled in JS and
 *  counted as they are built (pageCount === number of page
 *  divs). Card capacities per size are conservative so a card
 *  never overflows its fixed frame in print.
 * ============================================================
 */
'use strict';

/* ---------- small helpers ---------- */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var PAPER = {
  letter: { w: '8.5in', h: '11in', label: 'US Letter', wmm: 215.9, hmm: 279.4 },
  a4: { w: '210mm', h: '297mm', label: 'A4', wmm: 210, hmm: 297 }
};
var PAGE_MARGIN_MM = 10;

/* items-per-card capacities by game type and card size */
var CAPACITY = {
  qa:         { '5x7': 6,  half: 9,  full: 16 },
  tf:         { '5x7': 6,  half: 9,  full: 16 },
  whosaid:    { '5x7': 6,  half: 9,  full: 16 },
  finish:     { '5x7': 6,  half: 9,  full: 14 },
  pairs:      { '5x7': 6,  half: 9,  full: 14 },
  questions:  { '5x7': 6,  half: 9,  full: 16 },
  prompts:    { '5x7': 5,  half: 7,  full: 12 },
  scramble:   { '5x7': 8,  half: 12, full: 20 },
  pictionary: { '5x7': 6,  half: 9,  full: 15 },
  points:     { '5x7': 30, half: 30, full: 30 },
  checklist:  { '5x7': 12, half: 16, full: 24 },
  story:      { '5x7': 1,  half: 1,  full: 1 }
};
function capacityFor(type, size) {
  var c = CAPACITY[type] || CAPACITY.qa;
  return c[size] || c['5x7'];
}
function perSheet(size) { return size === 'full' ? 1 : 2; }

/* ---------- CSS (single source of truth for pack styling) ---------- */

function effectiveDesign(design, opts) {
  if (!opts.inkSaver) return design;
  var d = {};
  Object.keys(design).forEach(function (k) { d[k] = design[k]; });
  d.pageBg = '#ffffff'; d.cardBg = '#ffffff'; d.headerBg = '#ffffff';
  d.headerText = '#111111'; d.cellBg = '#ffffff'; d.cellAlt = '#ffffff';
  d.cellText = '#111111'; d.cellBorder = '#555555'; d.accent = '#111111';
  d.freeBg = '#eeeeee'; d.borderStyle = 'solid';
  return d;
}

function bookCss(design, opts) {
  var d = effectiveDesign(design, opts);
  var P = PAPER[opts.paper] || PAPER.letter;
  var cw = P.wmm - PAGE_MARGIN_MM * 2;          // portrait content width
  var ch = P.hmm - PAGE_MARGIN_MM * 2;          // portrait content height
  /* Card sheets are inset 3mm from the page's content-box top (see the
     .bk-cards margin below), so half/full card heights shrink to keep
     each outlined card + its cut-mark outline inside the page box. */
  var halfH = Math.floor((ch - 5) / 2) - 3;     // half-sheet card height
  return '' +
  '@page { size: ' + P.w + ' ' + P.h + '; margin: ' + PAGE_MARGIN_MM + 'mm; }' +
  '@page land { size: ' + P.h + ' ' + P.w + '; margin: ' + PAGE_MARGIN_MM + 'mm; }' +
  '.bk-page { page-break-after: always; break-after: page; font-family: ' + d.cellFont + '; color: ' + d.cellText + '; }' +
  '.bk-page:last-child { page-break-after: auto; break-after: auto; }' +
  '.bk-page.land { page: land; }' +
  /* ---- covers ---- */
  '.bk-cover { text-align: center; padding: 10mm 6mm 12mm; background: ' + d.pageBg + '; }' +
  '.cov-frame { border: 3px ' + d.borderStyle + ' ' + d.accent + '; border-radius: ' + d.radius + 'px; padding: 12mm 8mm; background: ' + d.cardBg + '; }' +
  '.cov-badge { display: inline-block; background: ' + d.headerBg + '; color: ' + d.headerText + '; font-size: 9.5pt; letter-spacing: 2.5px; padding: 1.8mm 6mm; border-radius: 999px; margin-bottom: 7mm; }' +
  '.bk-cover h1 { font-family: ' + d.headerFont + '; font-size: 32pt; margin: 0 0 3mm; color: ' + d.headerBg + '; }' +
  '.bk-cover h2 { font-family: ' + d.headerFont + '; font-size: 15pt; font-weight: normal; margin: 0 0 6mm; }' +
  '.cov-emoji { font-size: 30pt; margin-bottom: 4mm; }' +
  '.cov-meta { font-size: 12pt; line-height: 1.9; }' +
  '.cov-inc { margin-top: 6mm; font-size: 11pt; color: ' + d.accent + '; }' +
  '.cov-mini { width: 76mm; margin: 6mm auto 0; }' +
  /* the miniature is a real card element with fixed print dims;
     these higher-specificity rules shrink it to a thumbnail —
     without them it renders full-size and bursts the cover page */
  '.bk-cover .cov-mini .gcard { width: 76mm; height: 58mm; padding: 2.5mm; }' +
  '.bk-cover .cov-mini .gc-head { padding: 1.2mm; margin-bottom: 1.8mm; }' +
  '.bk-cover .cov-mini .gc-title { font-size: 9pt; }' +
  '.bk-cover .cov-mini .gc-sub { font-size: 6.5pt; }' +
  '.bk-cover .cov-mini .gi { font-size: 7.5pt; margin-bottom: 1.4mm; }' +
  '.bk-cover .cov-mini .gi-line { height: 3.5mm; }' +
  '.bk-cover .cov-mini .gi-emoji { font-size: 11pt; }' +
  '.bk-cover .cov-mini .gi-scr { font-size: 9pt; letter-spacing: 1.5px; }' +
  '.bk-cover .cov-mini .gc-foot { font-size: 5.5pt; margin-top: 1.5mm; }' +
  '.cov-band { margin-top: 9mm; background: ' + d.headerBg + '; color: ' + d.headerText + '; font-size: 10.5pt; padding: 3.2mm 5mm; border-radius: ' + d.radius + 'px; }' +
  '.cov-biz { margin-top: 8mm; font-size: 10pt; letter-spacing: 1px; }' +
  /* ---- back cover ---- */
  '.bk-back { text-align: center; padding: 10mm 6mm 12mm; background: ' + d.pageBg + '; }' +
  '.bk-back h2 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 20pt; margin: 0 0 4mm; }' +
  '.bk-back h3 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 13pt; margin: 6mm 0 2mm; }' +
  '.back-games { display: inline-block; text-align: left; font-size: 11.5pt; line-height: 1.9; margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 12mm; }' +
  '.back-how { font-size: 11.5pt; line-height: 1.65; margin: 0; }' +
  '.back-thanks { margin-top: 8mm; font-size: 14pt; font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; }' +
  '.back-biz { margin-top: 1.5mm; font-size: 10pt; letter-spacing: 1px; }' +
  '.bk-barcode { margin-top: 7mm; }' +
  '.bk-barcode .bars { display: flex; justify-content: center; align-items: stretch; height: 12mm; }' +
  '.bk-barcode .bar { background: #1a1a1a; margin-right: 0.55mm; }' +
  '.bk-barcode .bc-label { font-size: 8.5pt; letter-spacing: 2.5px; margin-top: 1.6mm; }' +
  /* ---- host guide ---- */
  '.bk-guide h2 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 19pt; margin: 0 0 3mm; }' +
  '.bk-guide h3 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 13pt; margin: 5mm 0 2mm; }' +
  '.bk-guide p, .bk-guide li { font-size: 11pt; line-height: 1.55; }' +
  '.bk-guide .g-how { margin: 0 0 3.5mm; }' +
  '.bk-guide .g-how b { font-family: ' + d.headerFont + '; }' +
  '.bk-keys h2 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 17pt; margin: 0 0 4mm; }' +
  '.bk-keys ol { margin: 0 0 0 6mm; padding: 0; columns: 2; column-gap: 10mm; }' +
  '.bk-keys li { font-size: 10.5pt; line-height: 1.5; margin-bottom: 1.6mm; break-inside: avoid; }' +
  '.bk-keys .k-q { opacity: .75; font-size: 9.5pt; }' +
  /* ---- game cards ---- */
  /* The 3mm top inset keeps the first cards' dashed cut-mark outlines
     (outline-offset 2.2mm) inside the page box: Chromium otherwise
     paints the strip of outline that falls above the content box onto
     the BOTTOM of the previous printed page (stray dashed fragments). */
  '.bk-cards { display: flex; gap: 5mm; justify-content: center; align-content: flex-start; margin-top: 3mm; }' +
  '.bk-cards.stack { flex-direction: column; align-items: stretch; }' +
  '.bk-cards.row { flex-direction: row; }' +
  '.gcard { background: ' + d.cardBg + '; border: 2.5px solid ' + d.cellBorder + '; border-radius: ' + d.radius + 'px; padding: 4mm; box-sizing: border-box; overflow: hidden; ' + (opts.cutMarks === false ? '' : 'outline: 1px dashed #999; outline-offset: 2.2mm;') + ' }' +
  '.gcard.sz-5x7 { width: 127mm; height: 177.8mm; }' +
  '.gcard.sz-half { width: 100%; height: ' + halfH + 'mm; }' +
  '.gcard.sz-full { width: 100%; height: ' + (ch - 6) + 'mm; }' +
  '.gc-head { background: ' + d.headerBg + '; color: ' + d.headerText + '; font-family: ' + d.headerFont + '; text-align: center; border-radius: ' + Math.max(2, d.radius - 3) + 'px; padding: 2mm; margin-bottom: 3mm; }' +
  '.gc-title { font-size: 13.5pt; font-weight: bold; line-height: 1.2; }' +
  '.gc-sub { font-size: 8.5pt; opacity: .85; }' +
  '.sz-full .gc-title { font-size: 17pt; }' +
  '.gc-foot { display: flex; justify-content: space-between; font-size: 7.5pt; margin-top: 2.5mm; opacity: .75; }' +
  '.gi { margin-bottom: 2.6mm; font-size: 10.5pt; line-height: 1.35; }' +
  '.sz-half .gi { font-size: 11pt; } .sz-full .gi { font-size: 12.5pt; margin-bottom: 3.6mm; }' +
  '.gi-n { font-weight: bold; color: ' + d.accent + '; }' +
  '.gi-line { border-bottom: 1.2px dotted ' + d.cellBorder + '; height: 5.5mm; }' +
  '.gi-line.tall { height: 9mm; }' +
  '.gi-opts { display: flex; gap: 6mm; margin-top: 1mm; }' +
  '.gi-opt { flex: 1; border: 1.4px solid ' + d.cellBorder + '; border-radius: ' + d.radius + 'px; padding: 1.6mm 2mm; background: ' + d.cellAlt + '; }' +
  '.gi-check { margin-right: 1.6mm; }' +
  '.gi-scr { font-size: 13pt; font-weight: bold; letter-spacing: 2.5px; font-family: ' + d.headerFont + '; }' +
  '.sz-full .gi-scr { font-size: 16pt; }' +
  '.gi-emoji { font-size: 17pt; letter-spacing: 2px; }' +
  '.sz-full .gi-emoji { font-size: 21pt; }' +
  '.gi-pts { float: right; font-weight: bold; color: ' + d.accent + '; }' +
  '.gi-total { margin-top: 3mm; font-weight: bold; font-size: 11.5pt; }' +
  '.ml-story { font-size: 11.5pt; line-height: 2.05; }' +
  '.sz-5x7 .ml-story { font-size: 10.5pt; line-height: 1.95; }' +
  '.ml-blank { border-bottom: 1.6px solid ' + d.accent + '; padding: 0 6mm; font-size: 8.5pt; color: ' + d.accent + '; white-space: nowrap; }' +
  /* ---- certificates ---- */
  '.bk-cert { background: ' + d.pageBg + '; padding: 8mm 4mm; }' +
  '.cert-frame { border: 4px ' + d.borderStyle + ' ' + d.accent + '; border-radius: ' + d.radius + 'px; background: ' + d.cardBg + '; height: ' + (ch - 16) + 'mm; text-align: center; padding: 14mm 10mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }' +
  '.cert-badge { font-size: 10pt; letter-spacing: 3px; color: ' + d.accent + '; }' +
  '.cert-frame h2 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 26pt; margin: 5mm 0 2mm; }' +
  '.cert-title { font-family: ' + d.headerFont + '; font-size: 21pt; color: ' + d.accent + '; margin: 6mm 0 3mm; }' +
  '.cert-reason { font-size: 12.5pt; font-style: italic; margin-bottom: 8mm; }' +
  '.cert-name { border-bottom: 1.8px solid ' + d.cellText + '; height: 12mm; margin: 0 18mm; }' +
  '.cert-namelabel { font-size: 9.5pt; opacity: .7; margin-top: 1.5mm; }' +
  '.cert-cols { display: flex; gap: 14mm; margin: 10mm 10mm 0; }' +
  '.cert-col { flex: 1; border-top: 1.4px solid ' + d.cellText + '; padding-top: 1.5mm; font-size: 9.5pt; opacity: .8; }' +
  /* ---- tags ---- */
  /* Tag size is capped so the 8-tag sheet (3 per row x 3 rows, 5mm gaps,
     3mm top inset, 2mm cut-mark outlines) fits ONE printed page in
     Chromium on both papers: 3x58 + 2x5 = 184mm <= 190mm (A4 content
     width); 3 + 3x80 + 2x5 = 253mm <= 259.4mm (Letter content height).
     At the old 62x92mm the sheet fragmented onto a 2nd page in Chromium
     while the tool counted it as 1 page. */
  '.bk-tags { display: flex; flex-wrap: wrap; gap: 5mm; justify-content: center; margin-top: 3mm; }' +
  '.gtag { width: 58mm; height: 80mm; border: 2px solid ' + d.cellBorder + '; border-radius: ' + d.radius + 'px; background: ' + d.cardBg + '; text-align: center; padding: 6mm 4mm; box-sizing: border-box; ' + (opts.cutMarks === false ? '' : 'outline: 1px dashed #999; outline-offset: 2mm;') + ' }' +
  '.gtag .tg-emoji { font-size: 20pt; }' +
  '.gtag h3 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 15pt; margin: 3mm 0 2mm; }' +
  '.gtag p { font-size: 10pt; line-height: 1.5; }' +
  '.gtag .tg-hole { width: 5mm; height: 5mm; border: 1.4px solid ' + d.cellBorder + '; border-radius: 50%; margin: 0 auto; }' +
  /* ---- scorecard & guess ---- */
  '.bk-sheet h2 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 18pt; margin: 0 0 4mm; }' +
  '.bk-sheet table { border-collapse: collapse; width: 100%; }' +
  '.bk-sheet td, .bk-sheet th { border: 1.2px solid ' + d.cellBorder + '; font-size: 11pt; padding: 2.2mm 2.6mm; }' +
  '.bk-sheet th { background: ' + d.headerBg + '; color: ' + d.headerText + '; font-family: ' + d.headerFont + '; text-align: left; }' +
  '.bk-sheet .sc-name { border-bottom: 1.6px dotted ' + d.cellBorder + '; height: 8mm; margin-bottom: 5mm; font-size: 11pt; }' +
  '.guess-sign { text-align: center; border: 3px ' + d.borderStyle + ' ' + d.accent + '; border-radius: ' + d.radius + 'px; background: ' + d.cardBg + '; padding: 8mm 6mm; }' +
  '.guess-sign h2 { font-family: ' + d.headerFont + '; color: ' + d.headerBg + '; font-size: 20pt; margin: 2mm 0; }' +
  '.guess-slips { display: flex; flex-wrap: wrap; gap: 4mm; margin-top: 6mm; }' +
  '.guess-slip { width: 48%; border: 1.2px dashed #888; padding: 3mm; font-size: 10pt; box-sizing: border-box; }' +
  '.guess-slip .gs-line { border-bottom: 1.2px dotted ' + d.cellBorder + '; height: 6mm; }' +
  '';
}

/* ---------- item renderers ---------- */

function itemHtml(game, it, n, pack) {
  var num = '<span class="gi-n">' + n + '.</span> ';
  switch (game.def.type) {
    case 'qa':
      return '<div class="gi">' + num + esc(it.q) + '<div class="gi-line"></div></div>';
    case 'tf':
      return '<div class="gi">' + num + esc(it.q) +
        '<div class="gi-opts"><span class="gi-opt"><span class="gi-check">☐</span>True</span>' +
        '<span class="gi-opt"><span class="gi-check">☐</span>False</span></div></div>';
    case 'whosaid': {
      var who = pack.occasion.saidBy || ['Person 1', 'Person 2'];
      return '<div class="gi">' + num + '“' + esc(it.q) + '”' +
        '<div class="gi-opts"><span class="gi-opt"><span class="gi-check">☐</span>' + esc(who[0]) + '</span>' +
        '<span class="gi-opt"><span class="gi-check">☐</span>' + esc(who[1]) + '</span></div></div>';
    }
    case 'finish':
      return '<div class="gi">' + num + esc(it.q) + '<div class="gi-line"></div></div>';
    case 'pairs':
      return '<div class="gi">' + num +
        '<span class="gi-opts"><span class="gi-opt"><span class="gi-check">☐</span>' + esc(it.a) + '</span>' +
        '<span class="gi-opt"><span class="gi-check">☐</span>' + esc(it.b) + '</span></span></div>';
    case 'questions':
      return '<div class="gi">' + num + esc(it.text) + '<div class="gi-line"></div></div>';
    case 'prompts':
      return '<div class="gi">' + num + esc(it.text) + '<div class="gi-line tall"></div><div class="gi-line tall"></div></div>';
    case 'scramble':
      return '<div class="gi">' + num + '<span class="gi-scr">' + esc(it.shown) + '</span><div class="gi-line"></div></div>';
    case 'pictionary':
      return '<div class="gi">' + num + '<span class="gi-emoji">' + esc(it.emoji) + '</span><div class="gi-line"></div></div>';
    case 'points':
      return '<div class="gi"><span class="gi-check">☐</span>' + esc(it.item) +
        '<span class="gi-pts">' + esc(it.pts) + ' pts</span></div>';
    case 'checklist':
      return '<div class="gi"><span class="gi-check">☐</span>' + esc(it.text) + '</div>';
    default:
      return '<div class="gi">' + num + esc(it.text || it.q || '') + '</div>';
  }
}

function storyHtml(game) {
  var body = esc(game.story.story).replace(/\[([^\]]+)\]/g, '<span class="ml-blank">$1</span>');
  return '<p class="ml-story">' + body + '</p>';
}

/* one game card containing a chunk of items */
function cardHtml(game, items, pack, opts, startIdx) {
  var head = '<div class="gc-head"><div class="gc-title">' + esc(game.def.name) + '</div>' +
    '<div class="gc-sub">' + esc(pack.occasion.name) + ' · ' + esc(pack.tokens.honoree) + '</div></div>';
  var body;
  if (game.def.type === 'story') {
    body = storyHtml(game);
  } else if (game.def.type === 'points') {
    body = items.map(function (it, i) { return itemHtml(game, it, startIdx + i + 1, pack); }).join('') +
      '<div class="gi-total">TOTAL:&nbsp;&nbsp;______ points</div>';
  } else {
    body = items.map(function (it, i) { return itemHtml(game, it, startIdx + i + 1, pack); }).join('');
  }
  var foot = '<div class="gc-foot"><span>' + esc(opts.business || 'Songlap Deals') + '</span><span>' +
    esc(pack.id) + '</span></div>';
  return '<div class="gcard sz-' + opts.size + '">' + head + body + foot + '</div>';
}

/* all card pages for one per-guest game */
function gamePages(game, pack, opts) {
  var pages = [];
  var cap = capacityFor(game.def.type, opts.size);
  var per = perSheet(opts.size);
  var copies = Math.max(1, opts.copies || 1);
  var cards = [];
  for (var c = 0; c < copies; c++) {
    if (game.def.type === 'story') {
      cards.push(cardHtml(game, [], pack, opts, 0));
    } else {
      for (var i = 0; i < game.items.length; i += cap) {
        cards.push(cardHtml(game, game.items.slice(i, i + cap), pack, opts, i));
      }
    }
  }
  for (var p = 0; p < cards.length; p += per) {
    var chunk = cards.slice(p, p + per).join('');
    var land = opts.size === '5x7';
    pages.push('<div class="bk-page' + (land ? ' land' : '') + '"><div class="bk-cards ' +
      (land ? 'row' : 'stack') + '">' + chunk + '</div></div>');
  }
  return pages;
}

/* ---------- station pages ---------- */

function certificatePage(award, pack, opts) {
  return '<div class="bk-page bk-cert"><div class="cert-frame">' +
    '<div class="cert-badge">★ CERTIFICATE OF ACHIEVEMENT ★</div>' +
    '<h2>' + esc(pack.occasion.name) + ' Awards</h2>' +
    '<div class="cert-title">' + esc(award.title) + '</div>' +
    '<div class="cert-reason">' + esc(award.reason) + '</div>' +
    '<div class="cert-name"></div><div class="cert-namelabel">PRESENTED TO</div>' +
    '<div class="cert-cols"><div class="cert-col">Presented by: ' + esc(pack.tokens.host) + '</div>' +
    '<div class="cert-col">Date: ' + esc(pack.tokens.date) + '</div></div>' +
    '<div class="cov-biz" style="margin-top:8mm">' + esc(opts.business || 'Songlap Deals') + '</div>' +
    '</div></div>';
}

function tagsPage(pack, opts) {
  var tags = '';
  for (var i = 0; i < 8; i++) {
    tags += '<div class="gtag"><div class="tg-hole"></div><div class="tg-emoji">' + esc(pack.occasion.emoji) + '</div>' +
      '<h3>Thank You!</h3><p>For celebrating with us<br>at the ' + esc(pack.occasion.name) + '<br>for ' +
      esc(pack.tokens.honoree) + '</p><p style="margin-top:4mm">' + esc(pack.tokens.date) + '</p></div>';
  }
  return '<div class="bk-page"><div class="bk-tags">' + tags + '</div></div>';
}

function scorecardPage(pack, opts) {
  /* Only scored games get a row (keepsake activities like Predictions
     & Wishes, Advice Cards and Mad-Libs have no points to track);
     Guess the Number IS scored — it has a winner. */
  var rows = pack.games.filter(function (g) {
    return !!g.def.scored;
  }).map(function (g) {
    return '<tr><td>' + esc(g.def.name) + '</td><td></td><td></td><td></td></tr>';
  }).join('');
  return '<div class="bk-page bk-sheet"><h2>Scorecard — ' + esc(pack.occasion.name) + '</h2>' +
    '<div class="sc-name">Player / Team name:</div>' +
    '<table><tr><th style="width:46%">Game</th><th>Score</th><th>Bonus</th><th>Total</th></tr>' +
    rows +
    '<tr><td><b>GRAND TOTAL</b></td><td></td><td></td><td></td></tr></table>' +
    '<p style="margin-top:5mm;font-size:11pt">Winner: ______________________________&nbsp;&nbsp; Prize: ______________________________</p></div>';
}

function guessPage(game, pack, opts) {
  var g = game.guess;
  var slips = '';
  for (var i = 0; i < 8; i++) {
    slips += '<div class="guess-slip">Name:<div class="gs-line"></div>My guess (' +
      esc(g.unit) + '):<div class="gs-line"></div></div>';
  }
  return '<div class="bk-page bk-sheet"><div class="guess-sign"><div style="font-size:26pt">🫙</div>' +
    '<h2>' + esc(g.title) + '</h2>' +
    '<p style="font-size:11.5pt">' + esc(g.note) + '</p>' +
    '<p style="font-size:10.5pt">Write your name and your guess on a slip below and drop it in the box. One guess per guest!</p></div>' +
    '<div class="guess-slips">' + slips + '</div></div>';
}

/* ---------- covers ---------- */

function barcodeHtml(pack) {
  var seedStr = String(pack.id || 'PARTY');
  var widths = [0.5, 0.9, 1.4];
  var bars = '';
  for (var i = 0; i < 34; i++) {
    var code = seedStr.charCodeAt(i % seedStr.length) + i * 7;
    bars += '<span class="bar" style="width:' + widths[code % 3] + 'mm"></span>';
  }
  return '<div class="bk-barcode"><div class="bars">' + bars + '</div>' +
    '<div class="bc-label">' + esc(pack.id) + '</div></div>';
}

/* Games-only count for the cover: station extras that are not games
   (Award Certificates, Favor Tags, Scorecard) are excluded — they are
   the "& extras" the cover line refers to. */
function gameCount(pack) {
  return pack.games.filter(function (g) { return !g.def.extra; }).length;
}

function coverPage(pack, opts) {
  var gameNames = pack.games.map(function (g) { return g.def.name; });
  var mini = '';
  var firstCardGame = null;
  for (var i = 0; i < pack.games.length; i++) {
    if (!pack.games[i].def.station && pack.games[i].def.type !== 'story') { firstCardGame = pack.games[i]; break; }
  }
  if (firstCardGame) {
    var cap = capacityFor(firstCardGame.def.type, '5x7');
    mini = '<div class="cov-mini">' + cardHtml(firstCardGame, firstCardGame.items.slice(0, Math.min(4, cap)), pack,
      Object.assign({}, opts, { size: '5x7' }), 0) + '</div>';
  }
  var dateLine = opts.metaDate ? '<br>' + esc(opts.metaDate) : '';
  return '<div class="bk-page bk-cover"><div class="cov-frame">' +
    '<div><span class="cov-badge">★ PRINTABLE PARTY GAME PACK ★</span></div>' +
    '<div class="cov-emoji">' + esc(pack.occasion.emoji) + '</div>' +
    '<h1>' + esc(pack.occasion.name) + ' Party Games</h1>' +
    '<h2>' + esc(pack.occasion.tagline) + '</h2>' +
    '<div class="cov-meta">For ' + esc(pack.tokens.honoree) + dateLine + '<br>' +
    'Hosted by ' + esc(pack.tokens.host) + '</div>' +
    '<div class="cov-inc">INCLUDES: ' + gameCount(pack) + ' games &amp; extras · host guide · answer keys</div>' +
    mini +
    '<div class="cov-band">Print · cut · play — everything in this pack matches, ready in minutes</div>' +
    '<div class="cov-biz">' + esc(opts.business || 'Songlap Deals') + '</div>' +
    '</div></div>';
}

function backCoverPage(pack, opts) {
  var list = pack.games.map(function (g) { return '<li>✓ ' + esc(g.def.name) + '</li>'; }).join('');
  return '<div class="bk-page bk-back"><div class="cov-frame">' +
    '<h2>What’s inside this pack</h2>' +
    '<ul class="back-games">' + list + '</ul>' +
    '<h3>How it works</h3>' +
    '<p class="back-how">Print the pack, cut the cards along the marks,<br>' +
    'hand one card to each guest — and let the games begin.<br>' +
    'The host guide explains every game, with answer keys and prep sheets inside.</p>' +
    '<div class="back-thanks">Thank you for celebrating with us!</div>' +
    '<div class="back-biz">' + esc(opts.business || 'Songlap Deals') + '</div>' +
    barcodeHtml(pack) +
    '</div></div>';
}

/* ---------- host guide ---------- */

function guidePages(pack, opts) {
  var pages = [];
  var games = pack.games;
  var perFirst = 10, perRest = 14;
  function howBlock(g) {
    return '<div class="g-how"><b>' + esc(g.def.name) + '.</b> ' + esc(g.def.how) + '</div>';
  }
  var first = games.slice(0, perFirst).map(howBlock).join('');
  pages.push('<div class="bk-page bk-guide"><h2>Host Guide — ' + esc(pack.occasion.name) + '</h2>' +
    '<p>Welcome, host! This pack was made for <b>' + esc(pack.tokens.honoree) + '</b> (' +
    esc(pack.tokens.date) + '), hosted by <b>' + esc(pack.tokens.host) + '</b>. ' +
    'Everything matches and is ready to print: hand one card to each guest, keep this guide (and its answer keys) for yourself.</p>' +
    '<h3>Before the party</h3>' +
    '<p>Print one card per guest for each game (the pack already includes your chosen copies), cut along the dashed marks, ' +
    'and set out pens. For Guess the Number, fill a clear jar and place the sign and slips beside it. ' +
    'Fill in the "How Well Do You Know…" answer sheet with the guest of honor before guests arrive — or make revealing the answers part of the fun.</p>' +
    '<h3>How to run each game</h3>' + first + '</div>');
  for (var i = perFirst; i < games.length; i += perRest) {
    pages.push('<div class="bk-page bk-guide"><h2>Host Guide (continued)</h2>' +
      games.slice(i, i + perRest).map(howBlock).join('') + '</div>');
  }
  /* fill-in answer sheet for How Well Do You Know… */
  var know = null;
  games.forEach(function (g) { if (g.def.id === 'know') know = g; });
  if (know) {
    for (var k = 0; k < know.items.length; k += 10) {
      var chunk = know.items.slice(k, k + 10).map(function (it, j) {
        return '<div class="gi"><span class="gi-n">' + (k + j + 1) + '.</span> ' + esc(it.text) +
          '<div class="gi-line"></div></div>';
      }).join('');
      pages.push('<div class="bk-page bk-guide"><h2>Answer Sheet — ' + esc(know.def.name) + '</h2>' +
        '<p>Fill this in with the guest of honor, then use it to score the guests’ cards.</p>' + chunk + '</div>');
    }
  }
  /* fill-in answer sheet for Would You Rather — the guest of honor's
     own choices, which the guests' cards are scored against */
  var rather = null;
  games.forEach(function (g) { if (g.def.id === 'rather') rather = g; });
  if (rather) {
    for (var r = 0; r < rather.items.length; r += 10) {
      var rchunk = rather.items.slice(r, r + 10).map(function (it, j) {
        return itemHtml(rather, it, r + j + 1, pack);
      }).join('');
      pages.push('<div class="bk-page bk-guide"><h2>Answer Sheet — ' + esc(rather.def.name) + '</h2>' +
        '<p>Ask the guest of honor to pick one from each pair before the party — or reveal the choices live. ' +
        'Guests score one point whenever their pick matches.</p>' + rchunk + '</div>');
    }
  }
  /* Mad-Libs word-collection sheet — the host collects one word per
     blank (in story order) without showing guests the story */
  var madlibs = null;
  games.forEach(function (g) { if (g.def.id === 'madlibs') madlibs = g; });
  if (madlibs && madlibs.story) {
    var labels = (String(madlibs.story.story).match(/\[([^\]]+)\]/g) || []).map(function (m) {
      return m.slice(1, -1);
    });
    for (var w = 0; w < labels.length; w += 12) {
      var wchunk = labels.slice(w, w + 12).map(function (label, j) {
        return '<div class="gi"><span class="gi-n">' + (w + j + 1) + '.</span> ' + esc(label) +
          '<div class="gi-line"></div></div>';
      }).join('');
      pages.push('<div class="bk-page bk-guide"><h2>Word Collection Sheet — ' + esc(madlibs.def.name) + '</h2>' +
        '<p>Collect one word for each blank from the guests — without showing them the story! ' +
        'Write the words in order, then fill them into the story card and read it aloud.</p>' + wchunk + '</div>');
    }
  }
  /* answer keys — derived from the same items the cards print */
  games.forEach(function (g) {
    if (!g.def.answers) return;
    var answers = g.items.map(function (it, idx) {
      if (g.def.id === 'scramble') return { q: it.shown, a: it.text };
      if (g.def.id === 'pictionary') return { q: it.emoji, a: it.a };
      return { q: it.q, a: it.a };
    });
    for (var a = 0; a < answers.length; a += 30) {
      var part = answers.slice(a, a + 30).map(function (x, j) {
        return '<li><span class="k-q">' + esc(x.q) + '</span><br><b>' + esc(x.a) + '</b></li>';
      }).join('');
      pages.push('<div class="bk-page bk-keys"><h2>Answer Key — ' + esc(g.def.name) + '</h2><ol start="' +
        (a + 1) + '">' + part + '</ol></div>');
    }
  });
  return pages;
}

/* ---------- whole pack ---------- */

/*
 * buildBook(pack, opts) -> { html, pageCount }
 * opts: { paper ('letter'|'a4'), size ('5x7'|'half'|'full'),
 *   copies, cover (bool, default on), backCover (bool, default on),
 *   inkSaver, cutMarks, business, metaDate }
 */
function buildBook(pack, opts) {
  opts = opts || {};
  opts.paper = opts.paper || 'letter';
  opts.size = opts.size || '5x7';
  opts.copies = opts.copies || 1;
  var pages = [];
  if (opts.cover !== false) pages.push(coverPage(pack, opts));
  guidePages(pack, opts).forEach(function (p) { pages.push(p); });
  pack.games.forEach(function (g) {
    if (g.def.id === 'certificates') {
      g.items.forEach(function (award) { pages.push(certificatePage(award, pack, opts)); });
    } else if (g.def.id === 'tags') {
      pages.push(tagsPage(pack, opts));
    } else if (g.def.id === 'scorecard') {
      pages.push(scorecardPage(pack, opts));
    } else if (g.def.id === 'guess') {
      pages.push(guessPage(g, pack, opts));
    } else {
      gamePages(g, pack, opts).forEach(function (p) { pages.push(p); });
    }
  });
  if (opts.backCover !== false) pages.push(backCoverPage(pack, opts));
  return { html: pages.join('\n'), pageCount: pages.length };
}

var PartyBook = {
  esc: esc,
  PAPER: PAPER,
  bookCss: bookCss,
  buildBook: buildBook,
  capacityFor: capacityFor,
  perSheet: perSheet,
  cardHtml: cardHtml,
  gameCount: gameCount
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PartyBook;
}
