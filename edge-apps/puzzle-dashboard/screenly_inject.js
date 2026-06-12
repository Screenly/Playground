(function (settings) {
  var username = settings.username;
  var password = settings.password;

  function fillAndSubmit() {
    var usernameField =
      document.querySelector('input[name="username"]') ||
      document.querySelector('input[type="text"]') ||
      document.querySelector('input[name="email"]') ||
      document.querySelector('input[type="email"]');

    var passwordField =
      document.querySelector('input[name="password"]') ||
      document.querySelector('input[type="password"]');

    if (!usernameField || !passwordField) {
      return false;
    }

    usernameField.value = username;
    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
    usernameField.dispatchEvent(new Event('change', { bubbles: true }));

    passwordField.value = password;
    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
    passwordField.dispatchEvent(new Event('change', { bubbles: true }));

    var form = passwordField.closest('form') || usernameField.closest('form');
    if (form) {
      form.submit();
    } else {
      var submitButton =
        document.querySelector('button[type="submit"]') ||
        document.querySelector('input[type="submit"]') ||
        document.querySelector('button');
      if (submitButton) {
        submitButton.click();
      } else {
        console.log('[screenly_inject] No submit button found, cannot submit form.');
      }
    }

    return true;
  }

  function tryFill() {
    if (fillAndSubmit()) {
      return;
    }

    var observer = new MutationObserver(function () {
      if (fillAndSubmit()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryFill);
  } else {
    tryFill();
  }
})(screenly_settings);
