function getHeight(element) {
  return +window.getComputedStyle(element).getPropertyValue('height');
}

export function getMaxSupportedCssHeight() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // fallback to Infinity, just meant to be used in a test environment
    // throw Error('This function must be called from a browser environment');
    return Infinity;
  }

  // Firefox reports the height back but still renders blank after ~6M px
  const testUpTo = window.navigator.userAgent.toLowerCase().match(/firefox/)
                    ? 6e6
                    : 1e9;

  const div = document.createElement('div');
  div.style.display = 'none';
  document.body.appendChild(div);

  let supportedHeight = 1e6;
  while (true) { // eslint-disable-line no-constant-condition
    const testHeight = supportedHeight * 2;
    div.style.height = testHeight + 'px';

    // we need to use jQuery because getting the height properly depends
    // on some much stuff. Under the hood, it's using window.getComputedStyle()
    if (testHeight > testUpTo || getHeight(div) !== testHeight) {
      break;
    } else {
      supportedHeight = testHeight;
    }
  }

  document.body.removeChild(div);
  return supportedHeight;
}
