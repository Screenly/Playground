(function () {
  const username = '<USERNAME>'
  const password = '<PASSWORD>'

  const authLocation = '/login'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function submitForm () {
    document.querySelector('button[name="Submit"]').click()
  }

  function login () {
    try {
      setValue('input[name="j_username"]', username)
      setValue('input[name="j_password"]', password)
      submitForm()
    } catch (error) {
      console.warn(error)
      setTimeout(login, 3000)
    }
  }

  if (window.location.pathname === authLocation) {
    login()
  }
})()
