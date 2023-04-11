(function () {
  if (window.location.pathname !== '/nagiosxi/login.php' && window.location.pathname !== '/nagiosxi/mobile/views/login.php') {
    return
  }

  const username = '<USERNAME>'
  const password = '<PASSWORD>'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function submitForm () {
    document.querySelector('button[type="submit"]').click()
  }

  function login () {
    try {
      if (window.location.pathname === '/nagiosxi/login.php' || window.location.pathname === '/nagiosxi/mobile/views/login.php') {
        setValue('input[name=username]', username)
        setValue('input[name=password]', password)
        submitForm()
      }
    } catch (error) {
      console.error(error)
    }
  }

  login()
  setInterval(login, 1000)
})()
