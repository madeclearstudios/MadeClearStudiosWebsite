// Focal points for cropped photos, so heads and the main subject stay in frame when a photo is cut to a
// fixed shape (the 4:3 top galleries on case studies, micro case studies and service pages).
// sharp's "attention" strategy scores regions by skin tone, saturation and detail. We use it twice, on a
// narrow vertical strip and a short horizontal strip, to find the most interesting point, then place the
// crop so that point sits in the middle horizontally and a little above the middle vertically (headroom).
import sharp from "sharp";

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

async function strip(file, W, H, axis) {
  // A strip 30% of the photo's width (or height), found by the attention strategy; returns its centre in px.
  const scale = Math.min(1, 800 / Math.max(W, H));
  const w = Math.round(W * scale), h = Math.round(H * scale);
  const size = axis === "x" ? { width: Math.max(1, Math.round(w * 0.3)), height: h } : { width: w, height: Math.max(1, Math.round(h * 0.3)) };
  const { info } = await sharp(file)
    .resize({ ...size, fit: "cover", position: sharp.strategy.attention })
    .toBuffer({ resolveWithObject: true });
  const off = axis === "x" ? -(info.cropOffsetLeft || 0) : -(info.cropOffsetTop || 0);
  return (off + (axis === "x" ? size.width : size.height) / 2) / scale;
}

// Returns a CSS object-position ("x% y%") for showing `file` at aspect ratio `ratio` (width / height).
export async function focalPoint(file, ratio = 4 / 3) {
  const { width: W, height: H } = await sharp(file).metadata();
  if (!W || !H) return null;
  let cw = W, ch = H;
  if (W / H > ratio) cw = H * ratio; else ch = W / ratio;
  let x = 50, y = 50;
  if (W - cw > 1) {
    const hx = await strip(file, W, H, "x");
    x = clamp(((hx - cw / 2) / (W - cw)) * 100);
  }
  if (H - ch > 1) {
    const hy = await strip(file, W, H, "y");
    // Put the point of interest 40% down the crop, leaving room above for heads. On tall photos, never go
    // below a third of the way down: heads are usually in the upper part, and bright clothing or props lower
    // down can otherwise pull the crop too far.
    y = Math.min(33, clamp(((hy - ch * 0.4) / (H - ch)) * 100));
  }
  return `${x}% ${y}%`;
}

