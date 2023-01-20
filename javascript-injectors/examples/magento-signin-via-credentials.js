(function () {
  const email = '<YOUR_EMAIL>'
  const password = '<YOUR_PASSWORD>'

  const authLocation = '/v2/session/create'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function submitForm () {
    document.querySelector('#mbi-login-button').click()
  }

  function login () {
    try {
      setValue('#email-address', email)
      setValue('#password-field', password)
      submitForm()
    } catch (error) {
      console.warn(error)
      setTimeout(login, 1000)
    }
  }

  if (window.location.pathname === authLocation) {
    login()
  }
})()
