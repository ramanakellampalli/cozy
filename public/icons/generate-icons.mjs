/**
 * Icon generator script (run once with: node public/icons/generate-icons.mjs)
 * Generates placeholder PNG icons using the Canvas API via a simple SVG.
 *
 * For production, replace the PNG files in this directory with real icons from:
 *   https://realfavicongenerator.net  or  https://maskable.app
 *
 * The SVGs below are used as placeholder icons during development.
 */

const svgTemplate = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#3b82f6"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${size * 0.5}"
    font-weight="bold"
    fill="white"
  >C</text>
</svg>`;

// Write SVG files that browsers can use as fallbacks
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const size of [192, 512]) {
  writeFileSync(join(__dirname, `icon-${size}x${size}.svg`), svgTemplate(size));
  console.log(`✓ Generated icon-${size}x${size}.svg`);
}

console.log("\nNote: For real PWA icons, generate PNG files and replace the SVGs.");
console.log("Use: https://realfavicongenerator.net\n");
