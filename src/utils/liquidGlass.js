function buildDisplacementSvg(scale = 60) {
  const s = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000"/>
      <stop offset="40%" stop-color="#888"/>
      <stop offset="60%" stop-color="#888"/>
      <stop offset="100%" stop-color="#fff"/>
    </linearGradient>
    <linearGradient id="gg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000"/>
      <stop offset="40%" stop-color="#888"/>
      <stop offset="60%" stop-color="#888"/>
      <stop offset="100%" stop-color="#fff"/>
    </linearGradient>
    <filter id="gb">
      <feGaussianBlur stdDeviation="${scale * 0.28}"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#rg)"/>
  <rect width="512" height="512" fill="url(#gg)" style="mix-blend-mode:multiply"/>
  <rect x="80" y="80" width="352" height="352" fill="#888" filter="url(#gb)" opacity="0.9"/>
</svg>`;
  return 'data:image/svg+xml;base64,' + btoa(s);
}

export function buildDisplacementFilter(id = 'lg-displace', scale = 60) {
  const map = buildDisplacementSvg(scale);
  return `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" id="lg-svg-defs">
  <defs>
    <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feImage href="${map}" result="disp-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
      <feDisplacementMap in="SourceGraphic" in2="disp-map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
      <feComposite in="displaced" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
</svg>`;
}

export function injectLiquidGlassSvg() {
  if (document.getElementById('lg-svg-defs')) return;
  const div = document.createElement('div');
  div.innerHTML = buildDisplacementFilter();
  document.body.insertBefore(div.firstElementChild, document.body.firstChild);
}
