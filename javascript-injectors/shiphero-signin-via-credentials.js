(function () {
  
    const email = "<YOUR_EMAIL>";
    const password = "<YOUR_PASSWORD>";

    function changeValue(input,value){
        var nativeInputSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
        ).set;

        nativeInputSetter.call(input, value);

        var inputEvent = new Event("input", { bubbles: true });
        input.dispatchEvent(inputEvent);
    }

    function login() {
        try {
            const emailEl = document.querySelector('input[name="email"]');
            const passwordEl = document.querySelector('input[name="password"]');

            changeValue(emailEl, email);
            changeValue(passwordEl, password);

            document.querySelector('button[name="submit"]').click();
        } catch (error) {
            console.log(error);
        }
    }

    setTimeout(login, 5000);
})();


