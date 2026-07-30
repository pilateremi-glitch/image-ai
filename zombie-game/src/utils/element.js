/**
 * DOM element helper utilities
 */

/**
 * Get element by ID, throw if not found
 */
export function getEl(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id "${id}" not found`);
  return el;
}

/**
 * Try to get element by ID, return null if not found
 */
export function tryGetEl(id) {
  return document.getElementById(id);
}

/**
 * Query selector with error checking
 */
export function querySelector(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Element with selector "${selector}" not found`);
  return el;
}

/**
 * Query all elements matching selector
 */
export function querySelectorAll(selector) {
  return Array.from(document.querySelectorAll(selector));
}

/**
 * Set element text content
 */
export function setText(el, text) {
  el.textContent = text;
}

/**
 * Set element HTML content
 */
export function setHtml(el, html) {
  el.innerHTML = html;
}

/**
 * Add class to element
 */
export function addClass(el, className) {
  el.classList.add(className);
}

/**
 * Remove class from element
 */
export function removeClass(el, className) {
  el.classList.remove(className);
}

/**
 * Toggle class on element
 */
export function toggleClass(el, className) {
  el.classList.toggle(className);
}

/**
 * Check if element has class
 */
export function hasClass(el, className) {
  return el.classList.contains(className);
}

/**
 * Set element visibility (display: none)
 */
export function setVisible(el, visible) {
  el.style.display = visible ? '' : 'none';
}

/**
 * Show element
 */
export function show(el) {
  setVisible(el, true);
}

/**
 * Hide element
 */
export function hide(el) {
  setVisible(el, false);
}

/**
 * Set element disabled state
 */
export function setDisabled(el, disabled) {
  el.disabled = disabled;
}

/**
 * Set element data attribute
 */
export function setData(el, key, value) {
  el.dataset[key] = value;
}

/**
 * Get element data attribute
 */
export function getData(el, key) {
  return el.dataset[key];
}

/**
 * Clear all children from element
 */
export function clearChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * Create element with optional class and attributes
 */
export function createElement(tag, className = '', attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') {
      el.textContent = value;
    } else if (key === 'html') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  }
  return el;
}

/**
 * Check if event target matches selector
 */
export function eventMatches(event, selector) {
  return event.target.closest(selector) !== null;
}
