/*
 * ============================================================
 *  Party Games Studio Pro — pack engine
 * ============================================================
 *  Pure logic (browser + Node): seeded RNG, word scrambling,
 *  personalization-token substitution, and pack assembly.
 *  A "pack" is the fully-resolved, print-ready data the book
 *  builder renders: every content string already has the
 *  buyer's names/date/host substituted, scramble items carry
 *  both the scrambled display word and the answer, and the
 *  answer keys are derived from the SAME item objects the
 *  game pages print — so a key can never disagree with a card.
 * ============================================================
 */
'use strict';

/* ---------- seeded RNG (mulberry32, same family as our tools) ---------- */

function hashSeedString(str) {
  var h = 2166136261 >>> 0;
  str = String(str == null ? '' : str);
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seedString) { return mulberry32(hashSeedString(seedString)); }

function shuffle(arr, rng) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ---------- word scramble ----------
   Scrambles each word of a phrase separately. The result is
   always a true anagram of the original letters and — for any
   word with at least two distinct letters — never equal to
   the original (we retry, then fall back to a rotation, which
   cannot equal the original unless all letters are identical). */

function scrambleWord(word, rng) {
  var letters = String(word).split('');
  if (letters.length < 2) return word;
  var original = letters.join('');
  var distinct = {};
  letters.forEach(function (ch) { distinct[ch] = 1; });
  if (Object.keys(distinct).length < 2) return word; // e.g. "AAA" — nothing to do
  for (var attempt = 0; attempt < 24; attempt++) {
    var s = shuffle(letters, rng).join('');
    if (s !== original) return s;
  }
  // Deterministic fallback: rotate by one (differs when >= 2 distinct letters).
  for (var r = 1; r < letters.length; r++) {
    var rot = letters.slice(r).concat(letters.slice(0, r)).join('');
    if (rot !== original) return rot;
  }
  return original;
}

function scramblePhrase(phrase, rng) {
  return String(phrase).split(' ').map(function (w) { return scrambleWord(w, rng); }).join(' ');
}

/* ---------- personalization ---------- */

/* Build the effective token map: buyer values win; occasion
   defaults fill anything left blank. {host} defaults to
   "your host"; {date} to "the big day". */
function resolveTokens(occ, input) {
  input = input || {};
  function pick(v, dflt) { v = String(v == null ? '' : v).trim(); return v || dflt; }
  return {
    honoree: pick(input.honoree, occ.defaultHonoree),
    honoree2: pick(input.honoree2, occ.defaultHonoree2),
    host: pick(input.host, 'your host'),
    date: pick(input.date, 'the big day')
  };
}

function substitute(text, tokens) {
  return String(text == null ? '' : text)
    .replace(/\{honoree2\}/g, tokens.honoree2)
    .replace(/\{honoree\}/g, tokens.honoree)
    .replace(/\{host\}/g, tokens.host)
    .replace(/\{date\}/g, tokens.date);
}

function hasLeftoverToken(text) {
  return /\{(honoree2?|host|date)\}/.test(String(text == null ? '' : text));
}

/* ---------- content normalisation ----------
   Libraries store terse arrays; the pack uses rich objects. */

function normItems(gameId, raw) {
  if (!raw) return [];
  switch (gameId) {
    case 'trivia': case 'overunder': case 'priceright':
      return raw.map(function (p) { return { q: p[0], a: p[1] }; });
    case 'truefalse':
      return raw.map(function (p) { return { q: p[0], a: p[1] }; });
    case 'finishphrase':
      return raw.map(function (p) { return { q: p[0], a: p[1] }; });
    case 'whosaid':
      return raw.map(function (p) { return { q: p[0], a: p[1] }; });
    case 'pictionary':
      return raw.map(function (p) { return { emoji: p[0], a: p[1] }; });
    case 'rather': case 'thisorthat':
      return raw.map(function (p) { return { a: p[0], b: p[1] }; });
    case 'phone': case 'purse':
      return raw.map(function (p) { return { item: p[0], pts: p[1] }; });
    case 'awards':
      return raw.map(function (p) { return { title: p[0], reason: p[1] }; });
    default: // plain string lists: know, predictions, advice, memorylane,
             // scavenger, photochallenge, icebreaker, scramble(words)
      return raw.map(function (s) { return { text: s }; });
  }
}

/* Parse one game's edited text (from the app's list editor)
   back into raw library format. Formats per line:
     qa / tf / finish / whosaid / priceright : Question | Answer
     pictionary                              : EMOJI | Answer
     pairs                                   : Option A | Option B
     points                                  : Item | Points
     awards                                  : Title | Reason
     everything else                         : one item per line */
function parseEdited(gameId, text) {
  var lines = String(text || '').split('\n').map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 0; });
  function pair(line) {
    var idx = line.lastIndexOf('|');
    if (idx === -1) return [line, ''];
    return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
  }
  switch (gameId) {
    case 'trivia': case 'overunder': case 'truefalse': case 'finishphrase':
    case 'whosaid': case 'priceright': case 'pictionary': case 'awards':
    case 'rather': case 'thisorthat':
      return lines.map(pair);
    case 'phone': case 'purse':
      return lines.map(function (line) {
        var p = pair(line);
        var pts = parseInt(p[1], 10);
        return [p[0], isNaN(pts) ? 10 : pts];
      });
    default:
      return lines;
  }
}

/* Render raw library items into the editor's text format
   (the exact inverse of parseEdited). */
function formatForEditor(gameId, raw) {
  if (!raw) return '';
  switch (gameId) {
    case 'trivia': case 'overunder': case 'truefalse': case 'finishphrase':
    case 'whosaid': case 'priceright': case 'pictionary': case 'awards':
    case 'rather': case 'thisorthat': case 'phone': case 'purse':
      return raw.map(function (p) { return p[0] + ' | ' + p[1]; }).join('\n');
    default:
      return raw.map(function (s) { return String(s); }).join('\n');
  }
}

/* ---------- pack assembly ---------- */

/*
 * buildPack(cfg) -> pack
 * cfg: {
 *   occasionId, gameIds: [ids in print order],
 *   tokens: { honoree, honoree2, host, date }  (raw buyer input ok —
 *           resolveTokens is applied here),
 *   edits: { gameId: rawLibraryArray }  (optional buyer-edited content),
 *   seed: string (defaults to occasion+names+date)
 * }
 * pack: { id, occasion, tokens, games: [ { def, items, story?, guess? } ] }
 * Every string in items/story/guess is token-substituted.
 * Scramble items are { text: ANSWER, shown: SCRAMBLED }.
 */
function buildPack(cfg, C) {
  var occ = C.ptgOccasionById(cfg.occasionId);
  var lib = C.ptgLibrary(occ);
  var tokens = resolveTokens(occ, cfg.tokens);
  var edits = cfg.edits || {};
  var seed = cfg.seed || (occ.id + '|' + tokens.honoree + '|' + tokens.date);
  var rng = makeRng(seed);
  var packId = 'PACK-' + hashSeedString(seed).toString(36).toUpperCase().slice(0, 6);

  function sub(s) { return substitute(s, tokens); }
  function subItems(gameId, items) {
    return items.map(function (it) {
      var out = {};
      Object.keys(it).forEach(function (k) {
        out[k] = typeof it[k] === 'string' ? sub(it[k]) : it[k];
      });
      return out;
    });
  }

  var games = [];
  (cfg.gameIds || []).forEach(function (gid) {
    var def = C.ptgGameById(gid);
    if (!def) return;
    var entry = { def: def, items: [] };
    if (gid === 'madlibs') {
      var story = edits.madlibs && typeof edits.madlibs === 'object' ? edits.madlibs : lib.madlibs;
      entry.story = { title: sub(story.title), story: sub(story.story) };
    } else if (gid === 'guess') {
      var g = edits.guess && typeof edits.guess === 'object' ? edits.guess : lib.guess;
      entry.guess = { title: sub(g.title), unit: sub(g.unit), note: sub(g.note) };
    } else if (gid === 'tags' || gid === 'scorecard') {
      entry.items = []; // rendered from pack-level data by the book builder
    } else {
      var raw = edits[gid] || lib[gid === 'certificates' ? 'awards' : gid];
      var items = normItems(gid === 'certificates' ? 'awards' : gid, raw);
      items = subItems(gid, items);
      if (gid === 'scramble') {
        items = items.map(function (it) {
          return { text: it.text, shown: scramblePhrase(it.text, rng) };
        });
      }
      entry.items = items;
    }
    games.push(entry);
  });

  /* The pack carries occasion METADATA only — never the raw
     content library (whose strings still hold tokens). */
  var occMeta = {};
  Object.keys(occ).forEach(function (k) {
    if (k !== 'content' && k !== 'games' && k !== 'defaults') occMeta[k] = occ[k];
  });

  return { id: packId, occasion: occMeta, tokens: tokens, games: games, seed: seed };
}

/* Answer keys derived from a built pack: { gameId: [answer strings] }.
   Only games whose def.answers is true appear. */
function answerKeys(pack) {
  var keys = {};
  pack.games.forEach(function (g) {
    if (!g.def.answers) return;
    if (g.def.id === 'scramble') {
      keys[g.def.id] = g.items.map(function (it) { return it.text; });
    } else if (g.def.id === 'pictionary') {
      keys[g.def.id] = g.items.map(function (it) { return it.a; });
    } else {
      keys[g.def.id] = g.items.map(function (it) { return it.a; });
    }
  });
  return keys;
}

var PartyEngine = {
  hashSeedString: hashSeedString,
  mulberry32: mulberry32,
  makeRng: makeRng,
  shuffle: shuffle,
  scrambleWord: scrambleWord,
  scramblePhrase: scramblePhrase,
  resolveTokens: resolveTokens,
  substitute: substitute,
  hasLeftoverToken: hasLeftoverToken,
  normItems: normItems,
  parseEdited: parseEdited,
  formatForEditor: formatForEditor,
  buildPack: buildPack,
  answerKeys: answerKeys
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PartyEngine;
}
