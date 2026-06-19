/* Hides the OneTrust cookie consent banner via CSS rather than clicking,
 * since the banner loads asynchronously and click-based approaches are unreliable. */
const style = document.createElement('style');
style.textContent = '#onetrust-consent-sdk { display: none !important; }';
document.head.appendChild(style);
