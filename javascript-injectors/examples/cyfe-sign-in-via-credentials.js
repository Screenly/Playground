(function () {
  const password = '<PASSWORD>'

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
