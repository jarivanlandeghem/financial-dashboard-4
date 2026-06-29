/**
 * Squircle DOM engine
 * Automatically applies superellipse clip-path to ALL matching elements.
 * Uses ResizeObserver (updates on resize) + MutationObserver (catches new elements + class changes).
 */

import { getSquirclePath, getSquirclePathCorners } from './squircle';

// Token values from shapes.css:
//   --shape-xs=4  --shape-sm=8  --shape-md=12  --shape-lg=16
//   --shape-xl=20  --shape-2xl=24  --shape-3xl=32
//   --radius-sm=8  --radius=20  --radius-xl=32  --radius-lg=24

const CLASS_RADIUS_MAP = {
  // ── Large containers ──────────────────────────────────────
  'card':               20,
  'stat-card':          20,
  'finder-row':         20,
  'tx-card':            20,  // special: flat bottom when .open
  'widget-rgl-content': 20,
  'widget-picker-item': 20,
  'darwin-window':      24,
  'widget-modal':       24,
  'cpicker-window':     24,
  'modal':              24,
  'sidebar':            24,
  'sw-sidebar-card':    20,

  // ── Medium components ─────────────────────────────────────
  'darwin-sel-wrap':    12,
  'darwin-theme-card':  12,
  'darwin-card-block':  12,
  'month-selector':     20,
  'chart-tooltip':       8,

  // ── Buttons ───────────────────────────────────────────────
  'btn':                20,
  'btn-icon':           20,

  // ── Inputs ───────────────────────────────────────────────
  'input':               8,

  // ── Nav & sidebar items ───────────────────────────────────
  'nav-item':            8,
  'darwin-nav-item':     8,

  // ── Icon containers ───────────────────────────────────────
  'cat-icon':            8,
  'sidebar-logo-icon':  12,
};

// Classes that should get squircle re-applied when their class attribute changes
const CLASS_CHANGE_WATCH = new Set(['tx-card', 'tx-accordion']);

let resizeObserver = null;
let mutationObserver = null;

function buildPath(el, width, height) {
  const matchedClass = Object.keys(CLASS_RADIUS_MAP).find(cls => el.classList.contains(cls));
  if (!matchedClass) return null;
  const r = CLASS_RADIUS_MAP[matchedClass];

  // tx-card open: flat bottom corners (connects visually to accordion below)
  if (el.classList.contains('tx-card') && el.classList.contains('open')) {
    return getSquirclePathCorners(width, height, r, r, 0, 0);
  }

  return getSquirclePath(width, height, r);
}

function applySquircle(el) {
  const matchedClass = Object.keys(CLASS_RADIUS_MAP).find(cls => el.classList.contains(cls));
  if (!matchedClass) return;

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(() => applySquircle(el));
    return;
  }

  const path = buildPath(el, rect.width, rect.height);
  if (!path) return;

  el.style.clipPath = `path('${path}')`;
  el.style.webkitClipPath = `path('${path}')`;
  el.style.borderRadius = '0';
  el.setAttribute('data-squircle', CLASS_RADIUS_MAP[matchedClass]);
}

function observeElement(el) {
  if (el.hasAttribute('data-squircle-observed')) return;
  el.setAttribute('data-squircle-observed', 'true');
  if (resizeObserver) resizeObserver.observe(el);
  applySquircle(el);
}

const SELECTOR = Object.keys(CLASS_RADIUS_MAP).map(c => `.${c}`).join(', ');

function scanAndObserve(root = document) {
  root.querySelectorAll(SELECTOR).forEach(observeElement);
}

export function initSquircles() {
  resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => applySquircle(entry.target));
  });

  scanAndObserve();

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(SELECTOR)) observeElement(node);
          node.querySelectorAll?.(SELECTOR).forEach(observeElement);
        });
      }
      // Re-apply when class changes (e.g. tx-card gains/loses .open)
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const el = mutation.target;
        if ([...CLASS_CHANGE_WATCH].some(cls => el.classList.contains(cls))) {
          applySquircle(el);
        }
      }
    });
  });

  mutationObserver.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

export function destroySquircles() {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
}
