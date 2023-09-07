(function () {
  const username = '<YOUR_USERNAME>'
  const password = '<YOUR PASSWORD>'

  const authLocation = '/index.php'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function submitForm () {
    document.querySelector('button[value="Sign in"]').click()
  }

  function login () {
    try {
      setValue('input[name="name"]', username)
      setValue('input[name="password"]', password)
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
