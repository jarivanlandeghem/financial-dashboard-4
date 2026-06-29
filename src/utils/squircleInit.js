/**
 * Squircle DOM engine
 * Automatically applies superellipse clip-path to all matching elements.
 * Uses ResizeObserver (updates on size change) + MutationObserver (catches new elements).
 *
 * Elements are matched by their existing CSS classes — no JSX changes needed.
 */

import { getSquirclePath } from './squircle';

// Map existing CSS class → corner radius in px
// Matches the shape token system already in place
const CLASS_RADIUS_MAP = {
  // Cards and containers
  'card':               20,
  'stat-card':          20,
  // Widgets
  'widget-rgl-content': 20,
  // Darwin settings window
  'darwin-window':      24,
  // Color picker
  'cpicker-window':     24,
  // Modals
  'modal':              24,
  // Buttons (larger ones only — small btns use border-radius)
  // Sidebar
  'sidebar':            24,
  // Nav dropdown
  'darwin-sel-wrap':    12,
  // Splitwise sidebar cards
  'sw-sidebar-card':    20,
};

let resizeObserver = null;
let mutationObserver = null;

function applySquircle(el) {
  // Find which class from our map this element has
  const matchedClass = Object.keys(CLASS_RADIUS_MAP).find(cls => el.classList.contains(cls));
  if (!matchedClass) return;

  const radius = CLASS_RADIUS_MAP[matchedClass];
  const rect = el.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    // Element not visible yet — retry after a frame
    requestAnimationFrame(() => applySquircle(el));
    return;
  }

  const path = getSquirclePath(rect.width, rect.height, radius);
  el.style.clipPath = `path('${path}')`;
  el.style.webkitClipPath = `path('${path}')`;
  // Remove border-radius since clip-path now handles the shape
  el.style.borderRadius = '0';
  el.setAttribute('data-squircle', radius);
}

function observeElement(el) {
  if (el.hasAttribute('data-squircle-observed')) return;
  el.setAttribute('data-squircle-observed', 'true');
  if (resizeObserver) resizeObserver.observe(el);
  applySquircle(el);
}

function scanAndObserve(root = document) {
  const selector = Object.keys(CLASS_RADIUS_MAP).map(c => `.${c}`).join(', ');
  root.querySelectorAll(selector).forEach(observeElement);
}

export function initSquircles() {
  // ResizeObserver: re-apply when element resizes
  resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(entry => applySquircle(entry.target));
  });

  // Initial scan
  scanAndObserve();

  // MutationObserver: catch dynamically added elements (modals, overlays, etc.)
  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return; // elements only
        const selector = Object.keys(CLASS_RADIUS_MAP).map(c => `.${c}`).join(', ');
        if (node.matches?.(selector)) observeElement(node);
        node.querySelectorAll?.(selector).forEach(observeElement);
      });
    });
  });

  mutationObserver.observe(document.body, {
    subtree: true,
    childList: true,
  });
}

export function destroySquircles() {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
}
