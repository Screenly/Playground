(function () {
    if (typeof url !== 'undefined') {
        return
    }

    var url = "https://app.powerbi.com/home";
    const username = "<YOUR_USERNAME>";
    const password = "<YOUR_PASSWORD>";

    let isSingleSignOnPassed = false;
    let isOauthPassed = false;

    function callback() {
        try {
            if (window.location.pathname === '/singleSignOn' && !isSingleSignOnPassed) {
                document.querySelector("#email").value = username;
                submitEmail();
                isSingleSignOnPassed = true;
            }

            if (window.location.pathname === '/common/oauth2/authorize' && !isOauthPassed) {
                const passwordInput = document.querySelector('input[name="passwd"]');
                passwordInput.value = password;
                passwordInput.dispatchEvent(new Event('change'));
                document.querySelector('input[type="submit"]').click();
                isOauthPassed = true;
            }

            if (window.location.pathname === '/common/login') {
                window.location.replace(url)
            }
        } catch (error) {
            console.error(error)
        }
    }

    callback();
    setInterval(callback, 1000);
})();
