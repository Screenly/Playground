function dynatraceLogin () {
  const email = 'oabah@screenly.io'
  const password = 'Abcdefghijkl$'

  const authLocation = '/action/signin'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    if (element.value === '') {
      element.value = value
      element.dispatchEvent(new Event('change'))
    }
  }

  function submitEmail () {
    const emailBtn = document.querySelector('button[data-id="email_submit"]')
    emailBtn.click()
  }

  function submitPassword () {
    const passwordBtn = document.querySelector('button[data-id="sign_in"]')
    passwordBtn.click()
  }

  function inputEmail () {
    try {
      setValue('input[name="email"]', email)
      submitEmail()
    } catch (error) {
      console.warn(error)
    }
  }

  function login () {
    try {
      setValue('input[type="password"]', password)
      submitPassword()
    } catch (error) {
      console.warn(error)
    }
  }

  if (window.location.pathname === authLocation) {
    inputEmail()
    login()
  }
}
setInterval(dynatraceLogin, 1000)
