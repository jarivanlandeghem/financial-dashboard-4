/**
 * Squircle DOM engine
 * Automatically applies superellipse clip-path to ALL matching elements.
 * Uses ResizeObserver (updates on resize) + MutationObserver (catches new elements + class changes).
 */

import { squirclePathUniform, squirclePath as squirclePathCorners } from '../ui/geometry/shapeSystem.js';

// Token values from shapes.css:
//   --shape-xs=4  --shape-sm=8  --shape-md=12  --shape-lg=16
//   --shape-xl=20  --shape-2xl=24  --shape-3xl=32
//   --radius-sm=8  --radius=20  --radius-xl=32  --radius-lg=24

const CLASS_RADIUS_MAP = {
  // ── Large containers ──────────────────────────────────────
  'card':                   20,
  'stat-card':              20,
  'finder-row':             20,
  'tx-card':                20,  // special: flat bottom when .open
  'widget-rgl-content':     20,
  'widget-picker-item':     20,
  'darwin-window':          24,
  'widget-modal':           24,
  'cpicker-window':         24,
  'modal':                  24,
  'sidebar':                24,
  'sw-sidebar-card':        20,
  'bg-upload-zone':         20,

  // ── Medium containers ─────────────────────────────────────
  'darwin-sel-wrap':        12,
  'darwin-theme-card':      12,
  'darwin-card-block':      12,
  'darwin-ctx-modal':       16,
  'widget-ctx-menu':        12,
  'effect-select-card':     12,
  'wps-widget-card':        16,
  'bg-preset-thumb':        12,
  'month-selector':         20,
  'chart-tooltip':           8,

  // ── Buttons ───────────────────────────────────────────────
  'btn':                    20,
  'btn-icon':               20,
  'badge':                  20,
  'darwin-ctx-badge':       20,
  'darwin-ctx-cancel':      12,
  'effect-replay-btn':      20,
  'wps-cat-btn':            20,

  // ── Inputs & selects ─────────────────────────────────────
  // NOTE: 'input' and 'darwin-sel' are intentionally EXCLUDED here.
  // clip-path: path() is not reliably applied by browsers to native replaced/form
  // elements (<input>, <select>). Let CSS border-radius handle them instead.
  'cpicker-num':            12,
  'cpicker-hex':            12,

  // ── Nav & list items ─────────────────────────────────────
  'nav-item':                8,
  'darwin-nav-item':         8,
  'darwin-ctx-opt':         12,
  'darwin-font-row':         8,

  // ── Icon & image containers ───────────────────────────────
  'cat-icon':                8,
  'sidebar-logo-icon':      12,
  'darwin-about-icon':      16,
  'wps-widget-icon':        12,

  // ── Color picker internals ────────────────────────────────
  'cpicker-tabs':           12,
  'cpicker-tab':             8,
  'cpicker-spectrum':       12,
  'cpicker-preview':        12,
  'cpicker-apply':          12,

  // ── Grid & drag targets ───────────────────────────────────
  'gsp-cell':                4,
  'react-grid-placeholder': 20,
  'react-grid-item':        20,
  'widget-rgl':             20,
  'widget-dnd':             20,
  'widget-add-placeholder': 20,
  'widget-edit-banner':     20,
  'widget-resize-label':    20,
  'widget-drag-grip':        8,
  'widget-drag-handle':      8,
  'widget-resize-handle':    4,

  // ── Widget picker ─────────────────────────────────────────
  'wps-search-wrap':        12,
  'widget-picker-icon':     12,
  'widget-ctx-item':         8,

  // ── Color picker ─────────────────────────────────────────
  'cpicker-grid':           12,

  // ── Background customizer ─────────────────────────────────
  'bg-preset-card':         20,
  'bg-reset-btn':            8,

  // ── Hub ──────────────────────────────────────────────────────
  'hub-card':               20,
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
    return squirclePathCorners(width, height, { topLeft:r, topRight:r, bottomRight:0, bottomLeft:0 });
  }

  return squirclePathUniform(width, height, r);
}

function applyPath(el, path, radius) {
  if (!path) return;
  el.style.clipPath = `path('${path}')`;
  el.style.webkitClipPath = `path('${path}')`;
  el.style.borderRadius = '0';
  el.setAttribute('data-squircle', radius);
}

// Apply squircle to an element driven by a recognized class
function applySquircle(el) {
  const matchedClass = Object.keys(CLASS_RADIUS_MAP).find(cls => el.classList.contains(cls));
  if (!matchedClass) {
    // Element may be driven by data-squircle-r instead
    if (el.hasAttribute('data-squircle-r')) {
      const r = parseInt(el.getAttribute('data-squircle-r'), 10);
      if (!isNaN(r) && r > 0) applySquircleRadius(el, r);
    }
    return;
  }

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(() => applySquircle(el));
    return;
  }

  const path = buildPath(el, rect.width, rect.height);
  applyPath(el, path, CLASS_RADIUS_MAP[matchedClass]);
}

// Apply squircle to an element using an explicit radius (for data-squircle-r)
function applySquircleRadius(el, radius) {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(() => applySquircleRadius(el, radius));
    return;
  }
  const path = squirclePathUniform(rect.width, rect.height, radius);
  applyPath(el, path, radius);
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

function scanAndObserveDataAttr(root = document) {
  root.querySelectorAll('[data-squircle-r]:not([data-squircle-observed])').forEach(el => {
    const r = parseInt(el.getAttribute('data-squircle-r'), 10);
    if (!isNaN(r) && r > 0) {
      el.setAttribute('data-squircle-observed', 'true');
      if (resizeObserver) resizeObserver.observe(el);
      applySquircleRadius(el, r);
    }
  });
}

export function initSquircles() {
  resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => applySquircle(entry.target));
  });

  scanAndObserve();

  // Also handle elements with explicit data-squircle-r attribute (inline-styled elements)
  scanAndObserveDataAttr();

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(SELECTOR)) observeElement(node);
          node.querySelectorAll?.(SELECTOR).forEach(observeElement);
          // data-squircle-r elements (self + descendants)
          if (node.hasAttribute?.('data-squircle-r') && !node.hasAttribute('data-squircle-observed')) {
            const r = parseInt(node.getAttribute('data-squircle-r'), 10);
            if (!isNaN(r) && r > 0) {
              node.setAttribute('data-squircle-observed', 'true');
              if (resizeObserver) resizeObserver.observe(node);
              applySquircleRadius(node, r);
            }
          }
          if (node.querySelectorAll) scanAndObserveDataAttr(node);
        });
      }
      // Re-apply when class changes (e.g. tx-card gains/loses .open)
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const el = mutation.target;
        if ([...CLASS_CHANGE_WATCH].some(cls => el.classList.contains(cls))) {
          applySquircle(el);
        }
      }
      // Re-apply when data-squircle-r changes
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-squircle-r') {
        const el = mutation.target;
        const r = parseInt(el.getAttribute('data-squircle-r'), 10);
        if (!isNaN(r) && r > 0) {
          if (!el.hasAttribute('data-squircle-observed')) {
            el.setAttribute('data-squircle-observed', 'true');
            if (resizeObserver) resizeObserver.observe(el);
          }
          applySquircleRadius(el, r);
        }
      }
    });
  });

  mutationObserver.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'data-squircle-r'],
  });
}

export function destroySquircles() {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
}
