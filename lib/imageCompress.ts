/**
 * Compresses and resizes raster images (PNG, JPEG, WebP) client-side before storing as Data URL,
 * keeping transparency intact while preventing oversized base64 payloads in PostgreSQL/localStorage.
 * SVGs are preserved verbatim so vector crispness is never lost.
 */
export async function compressUploadedImage(
  file: File,
  maxDimension: number = 1600,
  quality: number = 0.88
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Gagal membaca file gambar'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });

  // Preserve vector SVGs as-is unless unexpectedly large
  if (file.type === 'image/svg+xml' && rawDataUrl.length < 250_000) {
    return rawDataUrl;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width || 1;
      const h = img.naturalHeight || img.height || 1;

      // Skip re-encoding if already within dimensions and file is lightweight (< 400KB)
      if (w <= maxDimension && h <= maxDimension && file.size <= 400_000) {
        resolve(rawDataUrl);
        return;
      }

      const scale = Math.min(1, maxDimension / Math.max(w, h));
      const targetW = Math.max(1, Math.round(w * scale));
      const targetH = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Use PNG for images that may contain transparency (PNG/SVG/WebP), JPEG for opaque photos
      const isOpaquePhoto = file.type === 'image/jpeg' || file.type === 'image/jpg';
      const outputMime = isOpaquePhoto ? 'image/jpeg' : 'image/webp';
      const compressed = canvas.toDataURL(outputMime, quality);

      // Fallback to original if compressed ended up larger
      resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}
