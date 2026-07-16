/**
 * توليد صورة ذكر بمقاس ستوري (1080×1920) على canvas ثم مشاركتها
 * عبر Web Share API (مع fallback إلى تنزيل الملف).
 *
 * تعتمد على خط Amiri المُحمَّل من صفحة الموقع؛ نضمن جاهزيته عبر document.fonts.load.
 */

export interface ShareDhikrInput {
  content: string;
  source?: string;
  sessionType?: "morning" | "evening";
  /** توقيع مخصّص أسفل البطاقة. الافتراضي: "الذاكرين". */
  signature?: string;
  /** رابط/نص التوقيع الفرعي. الافتراضي: نطاق الموقع. */
  signatureUrl?: string;
}

export const DEFAULT_SIGNATURE = "الذاكرين";
export const DEFAULT_SIGNATURE_URL = "azkar-daynight.lovable.app";

const CANVAS_W = 1080;
const CANVAS_H = 1920;

/**
 * لف نص عربي على عدة أسطر داخل عرض معين.
 * نقسم على المسافات ونحسب العرض بالسياق الحالي.
 */
function wrapArabic(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** يختار حجم خط مناسب حتى يتسع النص عموديًا داخل ارتفاع معين. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string,
  {
    max = 72,
    min = 30,
    lineHeightFactor = 1.9,
  }: { max?: number; min?: number; lineHeightFactor?: number } = {}
): { size: number; lines: string[]; lineHeight: number } {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `${size}px ${fontFamily}`;
    const lines = wrapArabic(ctx, text, maxWidth);
    const lineHeight = size * lineHeightFactor;
    if (lines.length * lineHeight <= maxHeight) {
      return { size, lines, lineHeight };
    }
  }
  ctx.font = `${min}px ${fontFamily}`;
  const lines = wrapArabic(ctx, text, maxWidth);
  return { size: min, lines, lineHeight: min * lineHeightFactor };
}

async function ensureFontsReady() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    // نُحمّل بعض الأوزان الشائعة لخط أميري كي لا يقع القياس على Fallback.
    await Promise.all([
      document.fonts.load('64px "Amiri"'),
      document.fonts.load('bold 64px "Amiri"'),
      document.fonts.load('32px "Amiri"'),
    ]);
    await document.fonts.ready;
  } catch {
    // لا شيء — سنستخدم Fallback ذا مقاييس مضبوطة.
  }
}

export async function generateDhikrImage(
  input: ShareDhikrInput
): Promise<Blob> {
  await ensureFontsReady();

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");

  // خلفية زمرد عميق مع تدرج ناعم
  const bg = ctx.createRadialGradient(
    CANVAS_W / 2,
    CANVAS_H * 0.35,
    100,
    CANVAS_W / 2,
    CANVAS_H / 2,
    CANVAS_W
  );
  bg.addColorStop(0, "#0f3d33");
  bg.addColorStop(0.55, "#082821");
  bg.addColorStop(1, "#04150f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // نقوش نجمية خافتة (خلفية زخرفية بسيطة)
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#caa766";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * CANVAS_W;
    const y = Math.random() * CANVAS_H;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // إطار ذهبي رفيع
  const margin = 60;
  ctx.strokeStyle = "rgba(202, 167, 102, 0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, CANVAS_W - margin * 2, CANVAS_H - margin * 2);
  ctx.strokeStyle = "rgba(202, 167, 102, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    margin + 14,
    margin + 14,
    CANVAS_W - (margin + 14) * 2,
    CANVAS_H - (margin + 14) * 2
  );

  // زخرفة علوية: زهرة/نجمة ثمانية بسيطة
  drawGoldOrnament(ctx, CANVAS_W / 2, margin + 130, 44);

  // عنوان "ذكر" أو الوقت
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(202, 167, 102, 0.85)";
  ctx.font = 'bold 40px "Amiri", "Amiri Fallback", serif';
  const label =
    input.sessionType === "morning"
      ? "من أذكار الصباح"
      : input.sessionType === "evening"
      ? "من أذكار المساء"
      : "ذكر";
  ctx.fillText(label, CANVAS_W / 2, margin + 230);

  // خط فاصل ذهبي دقيق
  ctx.strokeStyle = "rgba(202, 167, 102, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2 - 100, margin + 275);
  ctx.lineTo(CANVAS_W / 2 + 100, margin + 275);
  ctx.stroke();

  // نص الذكر
  const textAreaTop = margin + 340;
  const textAreaBottom = CANVAS_H - margin - 340;
  const textAreaHeight = textAreaBottom - textAreaTop;
  const textMaxWidth = CANVAS_W - margin * 2 - 80;

  ctx.fillStyle = "#f2ead6";
  const family = '"Amiri", "Amiri Fallback", serif';
  const { size, lines, lineHeight } = fitFontSize(
    ctx,
    input.content,
    textMaxWidth,
    textAreaHeight,
    family,
    { max: 74, min: 30, lineHeightFactor: 1.85 }
  );
  ctx.font = `${size}px ${family}`;

  const totalTextHeight = lines.length * lineHeight;
  let y = textAreaTop + (textAreaHeight - totalTextHeight) / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, CANVAS_W / 2, y);
    y += lineHeight;
  }

  // المصدر
  const sourceText = input.source?.trim();
  if (sourceText) {
    ctx.fillStyle = "rgba(242, 234, 214, 0.55)";
    ctx.font = '28px "Amiri", "Amiri Fallback", serif';
    const srcLines = wrapArabic(ctx, sourceText, textMaxWidth);
    let sy = CANVAS_H - margin - 220;
    for (const line of srcLines.slice(0, 2)) {
      ctx.fillText(line, CANVAS_W / 2, sy);
      sy += 40;
    }
  }

  // زخرفة سفلية
  drawGoldOrnament(ctx, CANVAS_W / 2, CANVAS_H - margin - 130, 32);

  // توقيع الموقع (قابل للتخصيص)
  const signature = (input.signature ?? DEFAULT_SIGNATURE).trim() || DEFAULT_SIGNATURE;
  const signatureUrl = (input.signatureUrl ?? DEFAULT_SIGNATURE_URL).trim();
  ctx.fillStyle = "rgba(202, 167, 102, 0.7)";
  ctx.font = 'bold 32px "Amiri", "Amiri Fallback", serif';
  ctx.fillText(signature, CANVAS_W / 2, CANVAS_H - margin - 70);
  if (signatureUrl) {
    ctx.fillStyle = "rgba(242, 234, 214, 0.4)";
    ctx.font = '22px "Karla", system-ui, sans-serif';
    ctx.direction = "ltr";
    ctx.fillText(signatureUrl, CANVAS_W / 2, CANVAS_H - margin - 30);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
      0.95
    );
  });
}

/** رسم نجمة ثمانية ذهبية بسيطة كزخرفة. */
function drawGoldOrnament(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(202, 167, 102, 0.7)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.18, -r * 0.18);
    ctx.lineTo(r, 0);
    ctx.lineTo(r * 0.18, r * 0.18);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(202, 167, 102, 0.85)";
  ctx.fill();
  ctx.restore();
}

/**
 * يشارك صورة الذكر عبر Web Share API إن توفر مع دعم الملفات،
 * وإلا يقوم بتنزيلها.
 * @returns "shared" | "downloaded"
 */
export async function shareDhikrAsImage(
  input: ShareDhikrInput
): Promise<"shared" | "downloaded"> {
  const blob = await generateDhikrImage(input);
  const filename = `dhikr-${Date.now()}.png`;
  const file = new File([blob], filename, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  if (
    nav.canShare &&
    nav.share &&
    nav.canShare({ files: [file] })
  ) {
    try {
      await nav.share({
        files: [file],
        title: "ذكر",
        text: "من تطبيق الذاكرين — أذكار الصباح والمساء",
      });
      return "shared";
    } catch (err) {
      // المستخدم أغلق المشاركة — نتوقف بهدوء
      if ((err as DOMException)?.name === "AbortError") return "shared";
      // نستمر إلى fallback
    }
  }

  // Fallback: تنزيل الملف
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
