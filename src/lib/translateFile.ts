// Client-side OCR + document extraction + free Google Translate.
// Mirrors the standalone "Eburon OCR Visual Translator" sample:
//   - images: Tesseract.js OCR -> free translate -> canvas paint-over
//   - documents: PDF.js / Mammoth / SheetJS / plain-text extraction -> free translate
//
// NOTE on host: we call translate.googleapis.com (NOT translate.google.com) because
// only the googleapis host returns `Access-Control-Allow-Origin: *`, so this works from
// the browser. Both are the ".com" host (no ".ph"), same engine as translate.google.com.

const TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";

export interface TranslateBatchResult {
  translation: string;
  detected: string;
}

/** Free, keyless Google Translate — identical to the sample's translateTextBatch(). */
export async function translateTextBatch(
  text: string,
  langCode: string,
): Promise<TranslateBatchResult> {
  if (!text.trim()) return { translation: "", detected: "" };
  const url = `${TRANSLATE_ENDPOINT}?client=gtx&sl=auto&tl=${encodeURIComponent(
    langCode,
  )}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Translate error: ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "Google Translate returned a non-JSON response (likely rate-limited or blocked). Try again in a moment.",
    );
  }
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error("Google Translate returned invalid JSON (possibly an HTML block page).");
  }
  let translation = "";
  if (Array.isArray(data?.[0])) {
    for (const item of data[0]) translation += item?.[0] ?? "";
  }
  return { translation, detected: data?.[2] || "" };
}

export interface ImageTranslateResult {
  imageDataUrl: string;
  extractedText: string;
  translatedText: string;
  detectedLanguage: string;
}

const RTL_LANGS = ["ar", "he", "fa", "ur"];

/** OCR an image, translate, and visually overwrite the original text on a canvas. */
export async function translateVisualImage(
  file: File,
  langCode: string,
  onProgress?: (stage: string) => void,
): Promise<ImageTranslateResult> {
  const Tesseract = await import("tesseract.js");

  // 1. Load image to canvas
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(img, 0, 0);

  // 2. OCR text + bounding boxes
  onProgress?.("Analyzing image (OCR)…");
  const recognize: any = (Tesseract as any).recognize;
  const {
    data: { lines },
  } = await recognize(img, "eng");
  URL.revokeObjectURL(img.src);
  const validLines: any[] = (lines || []).filter(
    (l: any) => (l.text || "").trim().length > 0,
  );
  if (validLines.length === 0) throw new Error("No text found in image.");

  // 3. Batch translate
  onProgress?.("Translating text…");
  const textToTranslate = validLines.map((l: any) => l.text.trim()).join("\n");
  const { translation: translatedBlock, detected } = await translateTextBatch(
    textToTranslate,
    langCode,
  );
  const translatedLines = translatedBlock.split("\n");
  const isRTL = RTL_LANGS.includes(langCode);

  // 4. Overwrite original text with translated text
  onProgress?.("Re-rendering image…");
  for (let i = 0; i < validLines.length; i++) {
    const line = validLines[i];
    const transText = translatedLines[i] || "";
    const { x0, y0, x1, y1 } = line.bbox;
    const w = x1 - x0;
    const h = y1 - y0;

    // Sample background just outside the box to paint over original text
    const sampleX = Math.max(0, x0 - 2);
    const sampleY = Math.max(0, y0 - 2);
    const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
    const bgR = pixel[0];
    const bgG = pixel[1];
    const bgB = pixel[2];

    const brightness = Math.round(
      (bgR * 299 + bgG * 587 + bgB * 114) / 1000,
    );
    const textColor = brightness > 125 ? "#111827" : "#ffffff";

    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(x0 - 2, y0 - 2, w + 4, h + 4);

    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    const fontSize = Math.max(14, h * 0.75);
    ctx.font = `${fontSize}px sans-serif`;
    if (isRTL) {
      ctx.textAlign = "right";
      (ctx as any).direction = "rtl";
      ctx.fillText(transText, x1, y0 + h * 0.1, w);
    } else {
      ctx.textAlign = "left";
      (ctx as any).direction = "ltr";
      ctx.fillText(transText, x0, y0 + h * 0.1, w);
    }
  }

  const imageDataUrl = canvas.toDataURL(file.type || "image/jpeg", 0.9);
  return {
    imageDataUrl,
    extractedText: textToTranslate,
    translatedText: translatedBlock,
    detectedLanguage: detected,
  };
}

/** Extract plain text from a document (pdf/docx/xlsx/csv/txt). */
export async function extractDocumentText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = name.substring(name.lastIndexOf("."));

  if (ext === ".txt") return await file.text();
  if (ext === ".pdf") return await extractPDF(file);
  if (ext === ".docx") return await extractDOCX(file);
  if (ext === ".xlsx" || ext === ".csv") return await extractXLSX(file);
  throw new Error("Unsupported document type. Use .pdf, .docx, .xlsx, .csv, or .txt.");
}

async function extractPDF(file: File): Promise<string> {
  const pdfjsLib: any = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).href;
  const arr = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arr }).promise;
  let t = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    t += content.items.map((m: any) => m.str).join(" ") + "\n\n";
  }
  return t;
}

async function extractDOCX(file: File): Promise<string> {
  const mammoth: any = await import("mammoth");
  const arr = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: arr });
  return res.value;
}

async function extractXLSX(file: File): Promise<string> {
  const XLSX: any = await import("xlsx");
  const arr = await file.arrayBuffer();
  const wb = XLSX.read(arr, { type: "array" });
  let t = "";
  wb.SheetNames.forEach((n: string) => {
    t += XLSX.utils.sheet_to_csv(wb.Sheets[n]) + "\n";
  });
  return t;
}
