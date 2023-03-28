(function () {
  if (window.location.pathname !== '/lookup' && window.location.pathname !== '/login') {
    return
  }

  const email = '<EMAIL>'
  const password = '<PASSWORD>'

function setValue (selector, value) {
  const element = document.getElementById(selector)
  element.value = value
  element.dispatchEvent(new Event('change'))
}

function submitForm () {
  document.querySelector('button[name="commit"]').click()
}

function login () {
  try {
    if (window.location.pathname === '/lookup') {
      setValue('account_email', email)
      submitForm()
    }

    if (window.location.pathname === '/login') {
      setValue('account_password', password)
      submitForm()
    }
  } catch (error) {
    console.error(error)
  }
}

login()
setInterval(login, 1000)
})()
