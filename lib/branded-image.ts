/*
 * Draws a Fresh2Cook style product picture in the browser (canvas):
 * soft blurred background, logo top-left, "Freshness You Can Trust",
 * three ticks on the left, the product photo in a white frame, and a dark green
 * name ribbon at the bottom. Returns a JPEG Blob (1080 x 1080).
 */

const GREEN = "#0f3d2e";
const LEAF = "#3f9b2f";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image could not be loaded"));
    img.src = src;
  });
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, color = LEAF) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.55, -size * 0.45, size, 0);
  ctx.quadraticCurveTo(size * 0.55, size * 0.45, 0, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = Math.max(1.5, size / 22);
  ctx.beginPath();
  ctx.moveTo(size * 0.08, 0);
  ctx.lineTo(size * 0.85, 0);
  ctx.stroke();
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, weight = "900", family = "Arial, Helvetica, sans-serif") {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  } while (s > 20);
  return s;
}

export async function makeBrandedImage(opts: { photo: string; name: string; subtitle?: string; logo?: string }): Promise<Blob> {
  const W = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext("2d")!;
  const photo = await loadImage(opts.photo);

  // 1. soft background from the same photo
  ctx.save();
  ctx.filter = "blur(28px) saturate(1.15)";
  cover(ctx, photo, -60, -60, W + 120, W + 120);
  ctx.restore();
  const wash = ctx.createLinearGradient(0, 0, W, 0);
  wash.addColorStop(0, "rgba(255,255,255,0.88)");
  wash.addColorStop(0.45, "rgba(255,255,255,0.6)");
  wash.addColorStop(1, "rgba(240,250,238,0.35)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, W);

  // wooden board under the photo
  const wood = ctx.createLinearGradient(0, 820, 0, W);
  wood.addColorStop(0, "#b7834f");
  wood.addColorStop(1, "#8a5a2e");
  ctx.fillStyle = wood;
  ctx.fillRect(0, 860, W, 220);

  // 2. product photo in a white rounded frame
  const px = 345, py = 225, pw = 690, ph = 610;
  ctx.save();
  ctx.shadowColor = "rgba(15,61,46,0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, px - 10, py - 10, pw + 20, ph + 20, 44);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 36);
  ctx.clip();
  cover(ctx, photo, px, py, pw, ph);
  ctx.restore();
  leaf(ctx, px + pw - 30, py - 8, 70, -0.9);
  leaf(ctx, px + pw - 5, py + 30, 54, -0.2, "#5fb848");

  // 3. logo top-left
  try {
    const logo = await loadImage(opts.logo || "/logo.png.png");
    const lw = 360;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, 36, 30, lw, Math.min(lh, 170));
  } catch {
    ctx.font = "900 64px Arial, Helvetica, sans-serif";
    ctx.fillStyle = GREEN;
    ctx.fillText("Fresh", 44, 100);
    const fw = ctx.measureText("Fresh").width;
    ctx.fillStyle = "#f07a1a";
    ctx.fillText("2", 44 + fw, 100);
    ctx.fillStyle = GREEN;
    ctx.fillText("Cook", 44 + fw + ctx.measureText("2").width, 100);
    ctx.font = "700 24px Arial, Helvetica, sans-serif";
    ctx.fillText("Cut  •  Clean  •  Cook", 50, 136);
  }

  // 4. "Freshness You Can Trust"
  ctx.fillStyle = GREEN;
  ctx.font = "italic 800 46px Georgia, 'Times New Roman', serif";
  ["Freshness", "You Can", "Trust"].forEach((t, i) => ctx.fillText(t, 44, 290 + i * 52));
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(48, 425);
  ctx.quadraticCurveTo(170, 418, 300, 398);
  ctx.stroke();
  leaf(ctx, 250, 330, 60, -0.6);

  // 5. three ticks
  const ticks: [string, string][] = [
    ["Farm", "Fresh"],
    ["Hygienically", "Cut & Clean"],
    ["Nutritious", "& Healthy"],
  ];
  ticks.forEach(([a, b], i) => {
    const y = 500 + i * 110;
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.arc(80, y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(64, y + 1);
    ctx.lineTo(76, y + 13);
    ctx.lineTo(98, y - 12);
    ctx.stroke();
    ctx.fillStyle = GREEN;
    ctx.font = "800 27px Arial, Helvetica, sans-serif";
    ctx.fillText(a, 128, y - 4);
    ctx.fillText(b, 128, y + 28);
  });

  // 6. name ribbon
  const rx = 40, ry = 900, rw = W - 80, rh = 150;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, rx, ry, rw, rh, 75);
  ctx.fillStyle = GREEN;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, rx + 8, ry + 8, rw - 16, rh - 16, 67);
  ctx.strokeStyle = "rgba(190,230,170,0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  const title = opts.name.trim();
  const sub = (opts.subtitle || "").trim();
  fitText(ctx, title, rw - 300, sub ? 62 : 72);
  ctx.fillText(title, W / 2, sub ? ry + 78 : ry + 98);
  if (sub) {
    fitText(ctx, sub, rw - 300, 32, "700");
    ctx.fillStyle = "#e6f4dc";
    ctx.fillText(sub, W / 2, ry + 122);
  }
  ctx.textAlign = "left";
  // lines + leaves on both sides of the name
  ctx.strokeStyle = "#c8e86a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rx + 40, ry + rh / 2);
  ctx.lineTo(rx + 120, ry + rh / 2);
  ctx.moveTo(rx + rw - 40, ry + rh / 2);
  ctx.lineTo(rx + rw - 120, ry + rh / 2);
  ctx.stroke();
  leaf(ctx, rx + 122, ry + rh / 2, 48, -0.5, "#7cc142");
  leaf(ctx, rx + rw - 122, ry + rh / 2, 48, Math.PI + 0.5, "#7cc142");

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image"))), "image/jpeg", 0.9)
  );
}
