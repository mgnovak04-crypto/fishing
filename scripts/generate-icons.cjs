const fs = require('fs');

function createIconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0f172a"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#1e293b"/>
  <text x="50%" y="55%" font-family="sans-serif" font-size="${size * 0.35}" text-anchor="middle" dominant-baseline="central" fill="#60a5fa">NF</text>
</svg>`;
}

fs.writeFileSync('public/icon-192.png', createIconSvg(192));
fs.writeFileSync('public/icon-512.png', createIconSvg(512));
console.log('Icons generated');
