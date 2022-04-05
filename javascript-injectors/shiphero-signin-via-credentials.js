(function () {
  const email = '<YOUR_EMAIL>'
  const password = '<YOUR_PASSWORD>'

  function changeValue (input, value) {
    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set

    nativeInputSetter.call(input, value)

    const inputEvent = new Event('input', { bubbles: true })
    input.dispatchEvent(inputEvent)
  }

  function login () {
    try {
      const emailEl = document.querySelector('input[name="email"]')
      const passwordEl = document.querySelector('input[name="password"]')

      changeValue(emailEl, email)
      changeValue(passwordEl, password)

      document.querySelector('button[name="submit"]').click()
    } catch (error) {
      console.log(error)
    }
  }

  setTimeout(login, 5000)
})()
