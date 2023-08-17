const initApp = () => {
  // TODO: Find alternatives that support SVG.
  const generateQrCode = (url, enable_ga = false) => {
    const qrCode = new QRious({
      element: document.getElementById('qr-code'),
      value: url,
      size: 300,
    });
  };

  // TODO: Get URL from settings instead.
  generateQrCode('https://react.gg/');
};

window.onload = function() {
  initApp();
};
