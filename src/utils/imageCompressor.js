/**
 * High-Resolution Client-Side WebP Image Compressor & Validator
 * Converts JPEG/PNG/WEBP to crisp, lightweight WebP while preserving full alpha transparency
 * and high display resolution (Retina / 2K).
 *
 * Strictly blocks GIFs, Videos, and unsupported files.
 */

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BLOCKED_EXTENSIONS = [
  "gif",
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "flv",
  "wmv",
  "m4v",
];

/**
 * Validate that a file is a valid still image
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  const name = file.name || "";
  const ext = name.split(".").pop()?.toLowerCase();

  // 1. Check for explicitly blocked video / gif formats
  if (BLOCKED_EXTENSIONS.includes(ext) || file.type.startsWith("video/") || file.type === "image/gif") {
    return {
      valid: false,
      error: `Invalid file format (.${ext || "format"}). GIFs and Videos are not allowed. Please select a JPG, PNG, or WEBP image.`,
    };
  }

  // 2. Strict MIME check
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Only still image formats (JPG, PNG, WEBP) are supported.",
    };
  }

  // 3. Size check (Max raw input: 20MB)
  if (file.size > 20 * 1024 * 1024) {
    return {
      valid: false,
      error: "Original file size exceeds 20MB limit.",
    };
  }

  return { valid: true };
};

/**
 * Compress and convert file to high-resolution WebP
 * @param {File} file
 * @param {Object} options
 * @param {number} options.maxWidth Max width in pixels (default 2560 for crisp 2K/Retina displays)
 * @param {number} options.maxHeight Max height in pixels (default 1600)
 * @param {number} options.quality WebP quality factor (0.85 - 0.92, default 0.90 for high visual fidelity)
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, width: number, height: number }>}
 */
export const compressToWebP = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return reject(new Error(validation.error));
    }

    const maxWidth = options.maxWidth || 2560;
    const maxHeight = options.maxHeight || 1600;
    const quality = options.quality !== undefined ? options.quality : 0.90;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Preserve aspect ratio while constraining to high-res maximums
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) {
        return reject(new Error("Unable to create canvas context for compression."));
      }

      // High-quality bicubic downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Clear for full transparency support (vital for logos)
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP format
      let webpDataUrl = canvas.toDataURL("image/webp", quality);

      // Safety fallback: if browser returns PNG fallback because WebP unsupported
      if (!webpDataUrl.startsWith("data:image/webp")) {
        webpDataUrl = canvas.toDataURL("image/png");
      }

      // Calculate approximate size in bytes
      const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(",") + 1);
      const compressedSize = Math.round((base64Length * 3) / 4);

      resolve({
        dataUrl: webpDataUrl,
        originalSize: file.size,
        compressedSize,
        width,
        height,
        format: "image/webp",
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image. The file may be corrupt or an unreadable format."));
    };

    img.src = objectUrl;
  });
};
