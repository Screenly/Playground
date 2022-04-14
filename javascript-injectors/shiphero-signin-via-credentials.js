(function() {
  const email = '<YOUR_EMAIL>'
  const password = '<YOUR_PASSWORD>'

  const authLocation = '/login'

  function setValue(selector, value) {
    const element = document.querySelector(selector)
    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set

    nativeInputSetter.call(element, value)

    const inputEvent = new Event('input', { bubbles: true })
    element.dispatchEvent(inputEvent)
  }

  function submitForm() {
    document.querySelector('button[name="submit"]').click()
  }

  function login() {
    try {
      setValue('input[name="email"]', email)
      setValue('input[name="password"]', password)
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
