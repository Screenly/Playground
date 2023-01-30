(function () {
  const email = '<YOUR_EMAIL>'
  const password = '<YOUR_PASSWORD>'

  const authLocation = '/auth/index'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function submitForm () {
    document.querySelector('.sign-in').click()
  }

  function login () {
    try {
      setValue('[name=username]', email)
      setValue('[name=password]', password)
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
