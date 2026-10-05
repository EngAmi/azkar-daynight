import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SITE } from "@/lib/seo";

export const Route = createFileRoute("/seo-status")({
  head: () => ({
    meta: [
      { title: "لوحة فحص الفهرسة — الذاكرين" },
      { name: "description", content: "لوحة داخلية لفحص قابلية الفهرسة والبيانات الوصفية وخريطة الموقع لصفحات الأذكار." },
      { property: "og:title", content: "لوحة فحص الفهرسة — الذاكرين" },
      { property: "og:description", content: "فحص قابلية الفهرسة والبيانات الوصفية لصفحات الأذكار." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SeoStatus,
});

const PAGES = [
  { path: "/", label: "الرئيسية" },
  { path: "/azkar-sabah", label: "أذكار الصباح" },
  { path: "/azkar-massa", label: "أذكار المساء" },
  { path: "/azkar-baad-salah", label: "أذكار بعد الصلاة" },
  { path: "/azkar-baad-alfajr-walmaghrib", label: "أذكار بعد الفجر والمغرب" },
  { path: "/azkar-nawm", label: "أذكار النوم" },
];

type Check = { name: string; ok: boolean; detail: string };
type Result = { path: string; label: string; checks: Check[] };

async function inspect(path: string, sitemapLocs: Set<string>, robotsTxt: string): Promise<Check[]> {
  const checks: Check[] = [];
  const expected = path === "/" ? `${SITE}/` : `${SITE}${path}`;
  let html = "";
  try {
    const res = await fetch(path, { cache: "no-store" });
    checks.push({ name: "حالة الصفحة", ok: res.ok, detail: `HTTP ${res.status}` });
    html = await res.text();
  } catch {
    checks.push({ name: "حالة الصفحة", ok: false, detail: "تعذّر التحميل" });
    return checks;
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const meta = (sel: string) => doc.querySelector(sel)?.getAttribute("content")?.trim() || "";
  const title = doc.querySelector("title")?.textContent?.trim() || "";
  const desc = meta('meta[name="description"]');
  const robots = meta('meta[name="robots"]').toLowerCase();
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  const ogTitle = meta('meta[property="og:title"]');
  const ogImage = meta('meta[property="og:image"]');
  const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]').length;
  const h1 = doc.querySelector("h1")?.textContent?.trim() || "";
  const blocked = robotsTxt.split("\n").some((l) => {
    const m = l.match(/^\s*Disallow:\s*(\S+)/i);
    return !!m?.[1] && path.startsWith(m[1]);
  });

  checks.push({ name: "مسموح للفهرسة", ok: !robots.includes("noindex"), detail: robots || "لا يوجد منع" });
  checks.push({ name: "robots.txt", ok: !blocked, detail: blocked ? "محظورة" : "مسموحة" });
  checks.push({ name: "في خريطة الموقع", ok: sitemapLocs.has(expected), detail: sitemapLocs.has(expected) ? "موجودة" : "غير موجودة" });
  checks.push({ name: "الرابط الأساسي", ok: canonical === expected, detail: canonical || "مفقود" });
  checks.push({ name: "العنوان", ok: title.length >= 15 && title.length <= 70, detail: `${title} (${title.length})` });
  checks.push({ name: "الوصف", ok: desc.length >= 70 && desc.length <= 170, detail: `${desc.length} حرفًا` });
  checks.push({ name: "عنوان رئيسي H1", ok: !!h1, detail: h1 || "مفقود" });
  checks.push({ name: "Open Graph", ok: !!ogTitle && !!ogImage, detail: ogTitle && ogImage ? "مكتمل" : "ناقص" });
  checks.push({ name: "بيانات منظمة", ok: jsonLd > 0, detail: `${jsonLd} كتلة` });
  return checks;
}

function SeoStatus() {
  const [results, setResults] = useState<Result[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    const [smText, robotsTxt] = await Promise.all([
      fetch("/sitemap.xml", { cache: "no-store" }).then((r) => r.text()).catch(() => ""),
      fetch("/robots.txt", { cache: "no-store" }).then((r) => r.text()).catch(() => ""),
    ]);
    const locs = new Set(
      Array.from(new DOMParser().parseFromString(smText, "application/xml").getElementsByTagName("loc")).map((n) => n.textContent?.trim() || ""),
    );
    const known = new Set(PAGES.map((p) => (p.path === "/" ? `${SITE}/` : `${SITE}${p.path}`)));
    setExtra([...locs].filter((l) => !known.has(l)));
    const out = await Promise.all(PAGES.map(async (p) => ({ ...p, checks: await inspect(p.path, locs, robotsTxt) })));
    setResults(out);
    setLoading(false);
  }, []);

  useEffect(() => { run(); }, [run]);

  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="font-amiri text-3xl text-primary">لوحة فحص الفهرسة</h1>
          <button onClick={run} disabled={loading} className="rounded-full border border-primary/40 px-5 py-2 text-sm hover:border-primary disabled:opacity-50">
            {loading ? "جارٍ الفحص…" : "إعادة الفحص"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          تفحص هذه اللوحة جاهزية كل صفحة للظهور في البحث. ظهورها الفعلي في جوجل يُتحقق منه عبر Search Console بالرابط أدناه.
        </p>
        <div className="grid gap-4">
          {results.map((r) => {
            const fails = r.checks.filter((c) => !c.ok).length;
            const url = r.path === "/" ? `${SITE}/` : `${SITE}${r.path}`;
            return (
              <section key={r.path} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="font-amiri text-xl">
                    <Link to={r.path} className="hover:text-primary">{r.label}</Link>
                    <span className="mr-2 text-xs text-muted-foreground" dir="ltr">{r.path}</span>
                  </h2>
                  <span className={`rounded-full px-3 py-1 text-xs ${fails ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                    {fails ? `${fails} مشكلة` : "جاهزة للفهرسة"}
                  </span>
                </div>
                <ul className="grid gap-1.5 sm:grid-cols-2 text-sm">
                  {r.checks.map((c) => (
                    <li key={c.name} className="flex gap-2">
                      <span aria-hidden className={c.ok ? "text-primary" : "text-destructive"}>{c.ok ? "✓" : "✗"}</span>
                      <span className="font-medium">{c.name}:</span>
                      <span className="text-muted-foreground truncate" title={c.detail}>{c.detail}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <a className="text-primary underline" target="_blank" rel="noreferrer"
                    href={`https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(SITE + "/")}&id=${encodeURIComponent(url)}`}>
                    فحص في Search Console
                  </a>
                  <a className="text-primary underline" target="_blank" rel="noreferrer"
                    href={`https://www.google.com/search?q=${encodeURIComponent("site:" + url)}`}>
                    هل هي في جوجل؟
                  </a>
                </div>
              </section>
            );
          })}
        </div>
        {extra.length > 0 && (
          <p className="mt-6 text-sm text-destructive">روابط في خريطة الموقع لا تطابق صفحات معروفة: {extra.join("، ")}</p>
        )}
      </div>
    </main>
  );
}
