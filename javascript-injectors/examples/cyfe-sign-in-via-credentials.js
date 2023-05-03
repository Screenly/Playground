(function () {
  const password = '<PASSWORD>'

  function elExists (selector) {
    const el = document.querySelector(selector)
    return el !== undefined && el.getAttribute('aria-hidden') !== 'true'
  }

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function submitForm () {
    document.querySelector('input[type="submit"]').click()
  }

  function login () {
    try {
      setValue('input[name="password"]', password)
      submitForm()
    } catch (error) {
      console.warn(error)
      setTimeout(login, 3000)
    }
  }

  login()

})()
