// Injected by the player into the dashboard page on every load.
// `screenly_settings` is provided by the player — no import needed.
// This script runs AFTER the page has fully loaded; DOMContentLoaded has
// already fired. Manipulate the DOM directly.

// Set an input's value and notify change listeners.
function setValue(selector, value) {
  const el = document.querySelector(selector)
  if (!el) return false
  el.value = value
  el.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

// ---- Puzzel (app.puzzel.com) ------------------------------------------------
// Selectors confirmed against https://app.puzzel.com/id/Account/Login
// Two-step login: username first, then password on the next page load.

// Step 1 — username/Puzzel ID field
if (document.querySelector('#Input_Username')) {
  if (!setValue('#Input_Username', screenly_settings.username)) {
    console.log('[screenly_inject] Username field not found.')
  } else {
    const submitBtn = document.querySelector(
      'button.submit-button[type="submit"]:not(.hidden)',
    )
    if (submitBtn) {
      submitBtn.click()
    } else {
      console.log('[screenly_inject] Submit button not found.')
    }
  }
}

// Step 2 — password field
if (document.querySelector('#Input_Password')) {
  if (!setValue('#Input_Password', screenly_settings.password)) {
    console.log('[screenly_inject] Password field not found.')
  } else {
    const submitBtn = document.querySelector(
      'button.submit-button[type="submit"]:not(.hidden)',
    )
    if (submitBtn) {
      submitBtn.click()
    } else {
      console.log('[screenly_inject] Submit button not found.')
    }
  }
}
