(function () {
  const username = '<YOUR_USERNAME>'
  const password = '<YOUR_PASSWORD>'

  const authLocation = '/idp/profile/SAML2/Unsolicited/SSO'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value;
  }

  function submitForm () {
    document.querySelector('#buttonLogin').click()
  }

  function login () {
    try {
      setValue('#login', username)
      setValue('#password', password)
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