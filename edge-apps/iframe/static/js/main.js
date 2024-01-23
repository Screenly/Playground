/* global  screenly */

function extractUrlFromIframeSetting (settingValue) {
  if (settingValue.includes('<iframe')) {
    const match = settingValue.match(/<iframe.*?src=["'](.*?)["']/)
    if (match && match[1]) {
      return match[1]
    }
  } else {
    return settingValue
  }
}
document.addEventListener('DOMContentLoaded', function () {
  const iframeSettingValue = screenly.settings.iframe || 'iframe URL not set'
  const iframeUrl = extractUrlFromIframeSetting(iframeSettingValue)
  const iframeElement = document.getElementById('iframe')
  iframeElement.src = iframeUrl
})
