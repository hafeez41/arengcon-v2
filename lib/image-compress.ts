const MAX_BYTES = 1024 * 1024;
const MAX_DIM = 2000;

export async function compressImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  const { width, height } = scaleDimensions(img.width, img.height, MAX_DIM);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.92;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (estimateBytes(out) > MAX_BYTES && quality > 0.4) {
    quality -= 0.08;
    out = canvas.toDataURL("image/jpeg", quality);
  }

  if (estimateBytes(out) > MAX_BYTES) {
    const shrunk = await shrinkAgain(img, MAX_DIM * 0.7);
    if (estimateBytes(shrunk) < estimateBytes(out)) out = shrunk;
  }

  return out;
}

async function shrinkAgain(img: HTMLImageElement, maxDim: number): Promise<string> {
  const { width, height } = scaleDimensions(img.width, img.height, maxDim);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, width, height);
  let quality = 0.85;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (estimateBytes(out) > MAX_BYTES && quality > 0.4) {
    quality -= 0.08;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return out;
}

function scaleDimensions(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w >= h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = () => rej(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Image load failed"));
    img.src = src;
  });
}

function estimateBytes(dataUrl: string): number {
  const idx = dataUrl.indexOf(",");
  const b64 = idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
  return Math.floor((b64.length * 3) / 4);
}
