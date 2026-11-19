/*
 * ============================================================
 *  Party Games Studio Pro — design presets
 * ============================================================
 *  Each preset is a complete coordinated look: palette, border
 *  style and font pairing. One preset applies across the whole
 *  pack — front cover, every game card, host guide, award
 *  certificates and back cover ("one-click theme sync").
 *  Field shape intentionally matches the Songlap design-system
 *  convention used across our tools.
 * ============================================================
 */
'use strict';

var PTG_DESIGNS = [
  {
    id: 'boho', name: 'Boho Chic',
    blurb: 'Terracotta, sand & sage — showers, Galentine’s, garden parties',
    pageBg: '#f7efe4', cardBg: '#fffaf1', headerBg: '#b4622d', headerText: '#fdf3e3',
    cellBg: '#ffffff', cellAlt: '#f5ead8', cellText: '#5a4030', cellBorder: '#d3ab84',
    accent: '#a3a380', freeBg: '#f0dfc2', borderStyle: 'double', radius: 12,
    headerFont: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    cellFont: 'Georgia, "Times New Roman", serif'
  },
  {
    id: 'goldluxe', name: 'Gold Luxe',
    blurb: 'Black, ivory & gold — bridal, milestone birthdays, New Year',
    pageBg: '#f5efe2', cardBg: '#fffdf6', headerBg: '#191919', headerText: '#f3d27a',
    cellBg: '#ffffff', cellAlt: '#f7efdb', cellText: '#2b2b2b', cellBorder: '#c9a227',
    accent: '#b98a1d', freeBg: '#f7e7bd', borderStyle: 'double', radius: 6,
    headerFont: 'Georgia, "Times New Roman", serif',
    cellFont: 'Georgia, "Times New Roman", serif'
  },
  {
    id: 'minimal', name: 'Minimal Modern',
    blurb: 'White, charcoal & one clean accent — modern hosts, office parties',
    pageBg: '#f4f4f5', cardBg: '#ffffff', headerBg: '#23272e', headerText: '#ffffff',
    cellBg: '#ffffff', cellAlt: '#f1f2f4', cellText: '#23272e', cellBorder: '#c8ccd2',
    accent: '#e4572e', freeBg: '#fdeee7', borderStyle: 'solid', radius: 4,
    headerFont: '"Segoe UI", Arial, sans-serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  },
  {
    id: 'retro', name: 'Retro Party',
    blurb: 'Warm cream, rust & teal — Christmas, reunions, 70s nights',
    pageBg: '#f6e8d4', cardBg: '#fff8ea', headerBg: '#8c3b1d', headerText: '#ffe9c9',
    cellBg: '#fffdf4', cellAlt: '#fbeed3', cellText: '#5e2c14', cellBorder: '#c98d5f',
    accent: '#1f6f6b', freeBg: '#ffd98a', borderStyle: 'double', radius: 8,
    headerFont: '"Courier New", ui-monospace, monospace',
    cellFont: 'Georgia, serif'
  },
  {
    id: 'floral', name: 'Floral Garden',
    blurb: 'Sage & muted gold with delicate frames — showers, spring weddings',
    pageBg: '#f4f1ea', cardBg: '#fffefb', headerBg: '#5d7052', headerText: '#f7efdc',
    cellBg: '#ffffff', cellAlt: '#f3efe4', cellText: '#44503e', cellBorder: '#b3bfa5',
    accent: '#a8873a', freeBg: '#efe6cd', borderStyle: 'floral', radius: 10,
    headerFont: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    cellFont: '"Palatino Linotype", "Book Antiqua", Georgia, serif'
  },
  {
    id: 'rustic', name: 'Rustic Kraft',
    blurb: 'Kraft paper, twine browns — barn weddings, Thanksgiving, reunions',
    pageBg: '#efe3cd', cardBg: '#f8efdb', headerBg: '#6d4c2f', headerText: '#f8efdb',
    cellBg: '#fdf6e3', cellAlt: '#f1e2c4', cellText: '#4c3320', cellBorder: '#b08c5a',
    accent: '#8a3324', freeBg: '#ecd9ae', borderStyle: 'dashed', radius: 4,
    headerFont: 'Georgia, "Times New Roman", serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  },
  {
    id: 'pastelbaby', name: 'Pastel Baby',
    blurb: 'Soft rainbow pastels, rounded & gentle — baby showers, kids’ birthdays',
    pageBg: '#fdf3f8', cardBg: '#ffffff', headerBg: '#7d9dbd', headerText: '#ffffff',
    cellBg: '#fff7fb', cellAlt: '#eef7ff', cellText: '#5b4a5e', cellBorder: '#f2b8d0',
    accent: '#e56aa0', freeBg: '#ffe98a', borderStyle: 'rounded', radius: 14,
    headerFont: '"Comic Sans MS", "Segoe UI Rounded", "Trebuchet MS", sans-serif',
    cellFont: '"Comic Sans MS", "Trebuchet MS", sans-serif'
  },
  {
    id: 'royalnavy', name: 'Royal Navy',
    blurb: 'Navy, white & silver — graduations, formal dinners, corporate',
    pageBg: '#edf1f7', cardBg: '#ffffff', headerBg: '#16283f', headerText: '#e8eef7',
    cellBg: '#ffffff', cellAlt: '#e8eef7', cellText: '#16283f', cellBorder: '#7f9cc4',
    accent: '#b08d2f', freeBg: '#d7e9ff', borderStyle: 'solid', radius: 4,
    headerFont: '"Segoe UI", Arial, sans-serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  },
  {
    id: 'tropical', name: 'Tropical',
    blurb: 'Palm greens & sunset coral — summer birthdays, bachelorettes',
    pageBg: '#e9f6ef', cardBg: '#fffef7', headerBg: '#0e7a5f', headerText: '#eafff5',
    cellBg: '#ffffff', cellAlt: '#e2f2e4', cellText: '#173f35', cellBorder: '#8fc9a8',
    accent: '#ff6f59', freeBg: '#ffe3a3', borderStyle: 'solid', radius: 12,
    headerFont: '"Trebuchet MS", "Segoe UI", sans-serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  },
  {
    id: 'circus', name: 'Vintage Circus',
    blurb: 'Big-top red & cream, poster type — kids’ birthdays, carnivals, fairs',
    pageBg: '#f9efdc', cardBg: '#fffaf0', headerBg: '#a31621', headerText: '#ffedb8',
    cellBg: '#fffdf6', cellAlt: '#fbeed3', cellText: '#4a1f1f', cellBorder: '#c98d5f',
    accent: '#1d5c99', freeBg: '#ffd23e', borderStyle: 'double', radius: 8,
    headerFont: 'Georgia, "Times New Roman", serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  },
  {
    id: 'roseblush', name: 'Rose Blush',
    blurb: 'Blush pink & rose gold — bridal showers, Valentine’s, Galentine’s',
    pageBg: '#fdf0f3', cardBg: '#fffafd', headerBg: '#b0526b', headerText: '#fff3f6',
    cellBg: '#ffffff', cellAlt: '#fbe9ee', cellText: '#5e2a38', cellBorder: '#e3a8b8',
    accent: '#c48b3a', freeBg: '#ffe3ec', borderStyle: 'double', radius: 14,
    headerFont: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    cellFont: 'Georgia, "Times New Roman", serif'
  },
  {
    id: 'inksaver', name: 'Ink Saver',
    blurb: 'White background, crisp outlines — bulk printing, classrooms, churches',
    pageBg: '#ffffff', cardBg: '#ffffff', headerBg: '#ffffff', headerText: '#111111',
    cellBg: '#ffffff', cellAlt: '#ffffff', cellText: '#111111', cellBorder: '#555555',
    accent: '#111111', freeBg: '#eeeeee', borderStyle: 'solid', radius: 2,
    headerFont: 'Arial, Helvetica, sans-serif',
    cellFont: 'Arial, Helvetica, sans-serif'
  },
  {
    id: 'halloween', name: 'Halloween Spooktacular',
    blurb: 'Cute-spooky pumpkins & ghosts — Halloween parties & get-togethers',
    pageBg: '#fff8ec', cardBg: '#fffdf6', headerBg: '#e88932', headerText: '#fff8ec',
    cellBg: '#ffffff', cellAlt: '#fdeeda', cellText: '#2b2b2b', cellBorder: '#d9b48f',
    accent: '#9b7ede', freeBg: '#dcebd9', borderStyle: 'dotted', radius: 12,
    headerFont: '"Trebuchet MS", "Segoe UI", sans-serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  },
  {
    id: 'valentine', name: 'Valentine\u2019s Sweetheart',
    blurb: 'Cherry red & blush hearts — Valentine\u2019s & Galentine\u2019s parties, showers',
    pageBg: '#fff9f4', cardBg: '#fffdfb', headerBg: '#c94b59', headerText: '#fff5f6',
    cellBg: '#ffffff', cellAlt: '#fdeef1', cellText: '#57222b', cellBorder: '#d99ba8',
    accent: '#c94b59', freeBg: '#f6d6dc', borderStyle: 'double', radius: 12,
    headerFont: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    cellFont: 'Georgia, "Times New Roman", serif'
  },
  {
    id: 'coquette', name: 'Coquette Pink Bow',
    blurb: 'Satin bows & ballet pink — bridal & baby showers, birthdays',
    pageBg: '#ffffff', cardBg: '#ffffff', headerBg: '#f4c2d7', headerText: '#3a3537',
    cellBg: '#ffffff', cellAlt: '#fdf0f5', cellText: '#3a3537', cellBorder: '#e89eb8',
    accent: '#d87a9e', freeBg: '#fbe3ee', borderStyle: 'double', radius: 14,
    headerFont: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
    cellFont: 'Georgia, "Times New Roman", serif'
  },
  {
    id: 'holidayplaid', name: 'Holiday Plaid Christmas',
    blurb: 'Cranberry, pine & gold plaid cheer — Christmas & holiday parties',
    pageBg: '#ffffff', cardBg: '#ffffff', headerBg: '#c83e3b', headerText: '#fff7ea',
    cellBg: '#ffffff', cellAlt: '#f2f6f1', cellText: '#2e4438', cellBorder: '#b9cdbd',
    accent: '#2e5a44', freeBg: '#f3e3b3', borderStyle: 'double', radius: 8,
    headerFont: 'Georgia, "Times New Roman", serif',
    cellFont: '"Segoe UI", Arial, sans-serif'
  }
];

function ptgDesignById(id) {
  for (var i = 0; i < PTG_DESIGNS.length; i++) {
    if (PTG_DESIGNS[i].id === id) return PTG_DESIGNS[i];
  }
  return PTG_DESIGNS[0];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PTG_DESIGNS: PTG_DESIGNS, ptgDesignById: ptgDesignById };
}
