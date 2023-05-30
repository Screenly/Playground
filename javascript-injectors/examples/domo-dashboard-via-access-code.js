(function () {
  const access_code = '<ACCESS_CODE>'

  function setValue (selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    element.dispatchEvent(new Event('change'))
  }

  function login () {
    try {
      setValue('input[type=text]', access_code)
    } catch (error) {
      console.warn(error)
    }
  }
  
  login()
  setInterval(login, 2000)
})()
