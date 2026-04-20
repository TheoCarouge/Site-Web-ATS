import * as fabric from "fabric";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY as string;
const VIEWS = ["front", "back", "left", "right"] as const;
const VIEW_LABELS: Record<string, string> = { front: "Devant", back: "Dos", left: "Gauche", right: "Droite" };

async function uploadBase64ToImgBB(base64: string): Promise<string | null> {
  if (!IMGBB_API_KEY || IMGBB_API_KEY === "VOTRE_CLE_API_IMGBB") return null;
  try {
    const form = new FormData();
    form.append("key", IMGBB_API_KEY);
    form.append("image", base64);
    form.append("expiration", String(60 * 60 * 24 * 365));
    const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data?.url as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * Uploads a base64 image (data URL) to ImgBB and returns the public URL.
 * Returns the original URL if it's already remote, null on failure.
 */
export async function uploadDesignToImgBB(imageDataUrl: string): Promise<string | null> {
  if (!imageDataUrl.startsWith("data:")) return imageDataUrl;
  const base64 = imageDataUrl.split(",")[1];
  if (!base64) return null;
  return uploadBase64ToImgBB(base64);
}

/**
 * Generates a composite 500×500 image: product mockup + canvas design on top.
 * Returns a base64 data URL.
 */
async function generateComposite(productImageUrl: string, canvasJson: string): Promise<string> {
  const el = document.createElement("canvas");
  el.width = 500;
  el.height = 500;
  const ctx = el.getContext("2d")!;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 500, 500);

  // Draw product mockup (object-contain, centered)
  if (productImageUrl) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = productImageUrl;
      });
      const scale = Math.min(500 / img.naturalWidth, 500 / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (500 - w) / 2, (500 - h) / 2, w, h);
    } catch {
      // CORS or load failure — continue without background
    }
  }

  // Render canvas design on top via StaticCanvas
  try {
    const parsed = JSON.parse(canvasJson);
    if (parsed.objects?.length > 0) {
      const temp = new (fabric as any).StaticCanvas(null, { width: 500, height: 500 });
      await (temp as any).loadFromJSON(canvasJson);
      temp.requestRenderAll();
      const designDataUrl: string = (temp as any).toDataURL({ format: "png", multiplier: 1 });
      temp.dispose();

      const designImg = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.src = designDataUrl;
      });
      ctx.drawImage(designImg, 0, 0, 500, 500);
    }
  } catch {
    // skip design layer on error
  }

  return el.toDataURL("image/png").split(",")[1]; // return raw base64
}

/**
 * Generates composite images for all 4 views that have canvas content,
 * uploads them to ImgBB and returns a map of view → URL.
 * Also returns a flat list of Shopify customAttributes.
 */
export async function uploadAllViewsToImgBB(
  viewCanvasStates: Record<string, string>,
  viewProductImages: Record<string, string>
): Promise<{ attributes: { key: string; value: string }[] }> {
  const attributes: { key: string; value: string }[] = [];

  for (const view of VIEWS) {
    const canvasJson = viewCanvasStates[view];
    if (!canvasJson) continue;
    try {
      const parsed = JSON.parse(canvasJson);
      if (!parsed.objects || parsed.objects.length === 0) continue;
    } catch { continue; }

    const productImageUrl = viewProductImages[view] || "";
    const base64 = await generateComposite(productImageUrl, canvasJson);
    const url = await uploadBase64ToImgBB(base64);
    if (url) attributes.push({ key: `Design – ${VIEW_LABELS[view]}`, value: url });
  }

  return { attributes };
}
