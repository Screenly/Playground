 /* global screenly, Sentry */
/* eslint-disable-next-line no-unused-vars, no-useless-catch */

 const dashboardUrlRaw = screenly.settings.dashboard_url || 'Dashboard URL not set'
 const passcode = screenly.settings.dashboard_passcode || 'Passcode not set'

// Initialize when page loads
window.addEventListener('load', function() {
    // Wait a short time for screenly.js to load
    setTimeout(function() {
        // Get the dashboard iframe
        const dashboard = document.getElementById('dashboard')

        // Construct the URL after screenly.js has loaded
        let dashboardUrl
        try {
            // Try to use Screenly's CORS proxy
            dashboardUrl = screenly.cors_proxy_url + encodeURIComponent(dashboardUrlRaw)
        } catch (e) {
            // Fallback to direct URL if screenly is not available
            console.error("Error accessing screenly.cors_proxy_url, using direct URL", e)
            dashboardUrl = dashboardUrlRaw;
        }

        // Set dashboard URL
        dashboard.src = dashboardUrl

        // Attempt to inject passcode after iframe loads
        dashboard.onload = function() {
            setTimeout(injectPasscodeIntoIframe, 1000)
        };
    }, 500) // 500ms delay for screenly.js to load
});

// Function to inject passcode into iframe
function injectPasscodeIntoIframe() {
    try {
        const iframe = document.getElementById('dashboard')

        // Try to access the iframe document
        let iframeDoc;
        try {
            iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        } catch (e) {
            console.error("Cannot access iframe content due to cross-origin restrictions", e)
            return
        }

        // Get passcode input
        const input = iframeDoc.getElementById('passcode')

        // If passcode input exists, inject passcode and submit
        if (input) {
            console.log("Found passcode field, injecting code");
            input.value = passcode
            input.dispatchEvent(new Event('input', { bubbles: true }))

            // Get the submit button and click it
            const button = iframeDoc.getElementById('submit')
            button.click()
            console.log("Clicked submit button")
        } else {
            console.log("Passcode input field not found");
        }
    } catch (e) {
        console.error("Error in injectPasscodeIntoIframe:", e)
    }
}