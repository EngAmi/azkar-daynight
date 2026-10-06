import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  pages: z
    .array(
      z.object({
        path: z.string().max(200),
        label: z.string().max(100),
        checks: z.array(z.object({ name: z.string().max(100), ok: z.boolean(), detail: z.string().max(500) })).max(40),
      }),
    )
    .max(20),
  notes: z.string().max(4000).optional(),
});

export type SeoAdvice = { ok: true; text: string } | { ok: false; status: number; message: string };

export const getSeoAdvice = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<SeoAdvice> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, status: 401, message: "مفتاح الذكاء الاصطناعي غير مُعدّ." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const { createLovableAiGatewayRunIdFetch } = await import("./run-id.server");
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    const report = data.pages
      .map((p) => `## ${p.label} (${p.path})\n` + p.checks.map((c) => `- [${c.ok ? "OK" : "FAIL"}] ${c.name}: ${c.detail}`).join("\n"))
      .join("\n\n");
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions:
          "أنت خبير SEO تقني لموقع أذكار عربي (TanStack Start، RTL). استلمت نتائج فحص لكل صفحة. رتّب الإصلاحات حسب الأولوية (عالية/متوسطة/منخفضة) مع ذكر الصفحة المتأثرة، ولماذا تهم، وخطوات حلها بوضوح ومختصر. ابدأ بما يمنع الفهرسة. تجاهل البنود السليمة إلا للتأكيد باختصار. اكتب بالعربية وبتنسيق Markdown، بحد أقصى نحو 500 كلمة.",
        messages: [{ role: "user", content: `نتائج الفحص:\n\n${report}${data.notes ? `\n\nملاحظات إضافية:\n${data.notes}` : ""}` }],
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = await result.text;
      if (!text.trim()) return { ok: false, status: 502, message: "لم يُرجع النموذج إجابة." };
      return { ok: true, text };
    } catch (e: unknown) {
      const err = e as { statusCode?: number; message?: string };
      const status = err.statusCode ?? 500;
      const message =
        status === 402 ? "نفد رصيد الذكاء الاصطناعي في مساحة العمل." : status === 429 ? "طلبات كثيرة، حاول بعد قليل." : err.message || "تعذّر التحليل.";
      console.error("seo advice failed", status, err.message);
      return { ok: false, status, message };
    }
  });
