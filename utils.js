function getHeight(element) {
  return +window.getComputedStyle(element).getPropertyValue('height');
}

export function getMaxSupportedCssHeight() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw Error('This function must be called from a browser environment only');
  }

  // Firefox reports the height back but still renders blank after ~6M px
  const testUpTo = window.navigator.userAgent.toLowerCase().match(/firefox/)
                    ? 6e6
                    : 1e9; // 1MM ! Chrome is at 35M so this limit is fine.

  const div = document.createElement('div');
  div.style.display = 'none';
  document.body.appendChild(div);

  let supportedHeight = 1e6;
  // TODO(sd) : refactor this condition
  while (true) { // eslint-disable-line no-constant-condition
    const testHeight = supportedHeight * 2;
    div.style.height = testHeight + 'px';

    // if we detect a difference, it means the browser reached its limit
    if (testHeight > testUpTo || getHeight(div) !== testHeight) {
      break;
    } else {
      supportedHeight = testHeight;
    }
  }

  document.body.removeChild(div);
  return supportedHeight;
}
