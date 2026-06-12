// Injected by the player into the dashboard page on every load.
// `screenly_settings` is provided by the player — no import needed.
// This script runs AFTER the page has fully loaded; DOMContentLoaded has
// already fired. Manipulate the DOM directly.

// Set an input's value and notify change listeners.
function setValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return false;
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

// Set an input's value through the native setter so React-based dashboards
// pick it up. Use this when setValue doesn't take effect.
function setReactValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

// Run fn only when the current path matches path.
function onPath(path, fn) {
  if (location.pathname === path) fn();
}

// ---- Puzzle (Auth0 Universal Login) ----------------------------------------
// Selectors confirmed against https://auth.puzzle.io/u/login

onPath('/u/login', () => {
  if (!setValue('#username', screenly_settings.username) ||
      !setValue('#password', screenly_settings.password)) {
    console.log('[screenly_inject] Login fields not found.');
    return;
  }

  const submitBtn = document.querySelector('button[data-action-button-primary="true"]');
  if (submitBtn) {
    submitBtn.click();
  } else {
    console.log('[screenly_inject] Submit button not found.');
  }
});
