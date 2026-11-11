const MIN_CONTRAST = 4.5;

function channel(value: number) {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(r: number, g: number, b: number) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: number, b: number) {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  const hue = ((h % 1) + 1) % 1;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v] as const;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const mix = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [
    Math.round(mix(hue + 1 / 3) * 255),
    Math.round(mix(hue) * 255),
    Math.round(mix(hue - 1 / 3) * 255),
  ] as const;
}

function overlayAlpha(fromBottom: number) {
  if (fromBottom <= 0.132) return 1;
  if (fromBottom >= 0.698) return 0;
  return 1 - (fromBottom - 0.132) / (0.698 - 0.132);
}

function hex([r, g, b]: readonly [number, number, number]) {
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

export type ImageAccent = {
  color: string;
  contrast: number;
};

/** Vivid color from the visible photo, shifted until the title clears WCAG AA on the dark gradient. */
export function accentFromImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageAccent {
  const buckets = 18;
  const sumX = new Array<number>(buckets).fill(0);
  const sumY = new Array<number>(buckets).fill(0);
  const sumS = new Array<number>(buckets).fill(0);
  const counts = new Array<number>(buckets).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const { h, s, l } = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < 0.08 || l < 0.05 || l > 0.94) continue;
    const bucket = Math.min(buckets - 1, Math.floor(h * buckets));
    const angle = h * Math.PI * 2;
    sumX[bucket] += Math.cos(angle) * s;
    sumY[bucket] += Math.sin(angle) * s;
    sumS[bucket] += s;
    counts[bucket] += 1;
  }

  let best = -1;
  let bestScore = 0;
  for (let bucket = 0; bucket < buckets; bucket += 1) {
    const prev = (bucket + buckets - 1) % buckets;
    const next = (bucket + 1) % buckets;
    const score = sumS[prev] + sumS[bucket] + sumS[next];
    if (score > bestScore) {
      bestScore = score;
      best = bucket;
    }
  }
  if (best < 0) return { color: "#ffd8a8", contrast: 12 };

  const prev = (best + buckets - 1) % buckets;
  const next = (best + 1) % buckets;
  const hueX = sumX[prev] + sumX[best] + sumX[next];
  const hueY = sumY[prev] + sumY[best] + sumY[next];
  const samples = counts[prev] + counts[best] + counts[next];
  if (samples === 0) return { color: "#ffd8a8", contrast: 12 };
  const hue = (Math.atan2(hueY, hueX) / (Math.PI * 2) + 1) % 1;
  const saturation = Math.min(
    0.78,
    Math.max(0.58, (sumS[prev] + sumS[best] + sumS[next]) / samples),
  );

  const backgrounds: number[] = [];
  const bandTop = Math.floor(height * 0.45);
  for (let y = bandTop; y < height; y += 1) {
    const fromBottom = (height - 1 - y) / Math.max(1, height - 1);
    const alpha = overlayAlpha(fromBottom);
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const lit = luminance(data[index], data[index + 1], data[index + 2]);
      backgrounds.push(lit * (1 - alpha));
    }
  }
  backgrounds.sort((a, b) => a - b);
  const background =
    backgrounds[Math.min(backgrounds.length - 1, Math.floor(backgrounds.length * 0.75))] ?? 0;

  let passing: { rgb: readonly [number, number, number]; distance: number; ratio: number } | null =
    null;
  let strongest = {
    rgb: hslToRgb(hue, saturation, 0.74),
    ratio: 0,
  };
  for (let step = 0; step <= 24; step += 1) {
    const lightness = 0.68 + (0.8 - 0.68) * (step / 24);
    const rgb = hslToRgb(hue, saturation, lightness);
    const ratio = contrast(luminance(rgb[0], rgb[1], rgb[2]), background);
    const distance = Math.abs(lightness - 0.74);
    if (ratio > strongest.ratio) strongest = { rgb, ratio };
    if (ratio >= MIN_CONTRAST && (passing === null || distance < passing.distance)) {
      passing = { rgb, distance, ratio };
    }
  }

  const picked = passing ?? strongest;
  return { color: hex(picked.rgb), contrast: picked.ratio };
}

export function accentFromImage(image: CanvasImageSource & { width: number; height: number }) {
  const viewRatio = 375 / 812;
  const imageRatio = image.width / image.height;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;
  if (imageRatio > viewRatio) {
    sw = image.height * viewRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / viewRatio;
    sy = (image.height - sh) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 36;
  canvas.height = 78;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { color: "#ffffff", contrast: 21 };
  context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  try {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return accentFromImageData(pixels.data, canvas.width, canvas.height);
  } catch {
    return { color: "#ffffff", contrast: 21 };
  }
}
