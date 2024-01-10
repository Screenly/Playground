function extractUrlFromIframeSetting(settingValue) {
    if (settingValue.includes('<iframe')) {
        const match = settingValue.match(/<iframe.*?src=["'](.*?)["']/);
        if (match && match[1]) {
            return match[1];
        }
    } else {
        return settingValue;
    }
    return null;
}
document.addEventListener("DOMContentLoaded", function () {
    var iframeSettingValue = screenly.settings.iframe || "iframe URL not set";
    var iframeUrl = extractUrlFromIframeSetting(iframeSettingValue);
    var iframeElement = document.getElementById("iframe");
    iframeElement.src = iframeUrl;
    iframeElement.innerText = iframeUrl;
});

