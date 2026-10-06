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

const linkCache = new Map<string, Promise<boolean>>();
function checkLink(p: string): Promise<boolean> {
  if (!linkCache.has(p)) {
    linkCache.set(p, fetch(p, { cache: "no-store" }).then((r) => r.ok).catch(() => false));
  }
  return linkCache.get(p)!;
}

async function inspect(path: string, sitemapLocs: Set<string>, robotsTxt: string): Promise<Check[]> {
  const checks: Check[] = [];
  // checkLink is defined below with a shared cache
  const expected = path === "/" ? `${SITE}/` : `${SITE}${path}`;
  let html = "";
  try {
    const t0 = performance.now();
    const res = await fetch(path, { cache: "no-store" });
    const ms = Math.round(performance.now() - t0);
    const type = res.headers.get("content-type") || "";
    checks.push({
      name: "استجابة HTTP",
      ok: res.ok && !res.redirected && type.includes("text/html"),
      detail: `${res.status}${res.redirected ? " (تحويل)" : ""} · ${ms}ms · ${type.split(";")[0] || "؟"}`,
    });
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
    const rule = m?.[1] ?? "";
    return rule !== "" && path.startsWith(rule);
  });

  checks.push({ name: "مسموح للفهرسة", ok: !robots.includes("noindex"), detail: robots || "لا يوجد منع" });
  checks.push({ name: "robots.txt", ok: !blocked, detail: blocked ? "محظورة" : "مسموحة" });
  checks.push({ name: "في خريطة الموقع", ok: sitemapLocs.has(expected), detail: sitemapLocs.has(expected) ? "موجودة" : "غير موجودة" });
  const canonicalCount = doc.querySelectorAll('link[rel="canonical"]').length;
  const ogUrl = meta('meta[property="og:url"]');
  checks.push({
    name: "الرابط الأساسي",
    ok: canonical === expected && canonicalCount === 1 && (!ogUrl || ogUrl === expected),
    detail: !canonical
      ? "مفقود"
      : canonicalCount > 1
        ? `مكرر (${canonicalCount})`
        : canonical !== expected
          ? `يشير إلى ${canonical}`
          : ogUrl && ogUrl !== expected
            ? "og:url لا يطابق"
            : canonical,
  });
  checks.push({ name: "العنوان", ok: title.length >= 15 && title.length <= 70, detail: `${title} (${title.length})` });
  checks.push({ name: "الوصف", ok: desc.length >= 70 && desc.length <= 170, detail: `${desc.length} حرفًا` });
  checks.push({ name: "عنوان رئيسي H1", ok: !!h1, detail: h1 || "مفقود" });
  checks.push({ name: "Open Graph", ok: !!ogTitle && !!ogImage, detail: ogTitle && ogImage ? "مكتمل" : "ناقص" });
  checks.push({ name: "بيانات منظمة", ok: jsonLd > 0, detail: `${jsonLd} كتلة` });

  // Internal links found in the page HTML
  const internal = new Set<string>();
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    try {
      const u = new URL(href, SITE + path);
      if (u.origin === SITE || u.origin === location.origin) internal.add(u.pathname);
    } catch { /* ignore */ }
  });
  const broken: string[] = [];
  await Promise.all(
    [...internal].map(async (p) => {
      const ok = await checkLink(p);
      if (!ok) broken.push(p);
    }),
  );
  checks.push({
    name: "الروابط الداخلية",
    ok: internal.size > 0 && broken.length === 0,
    detail: broken.length ? `معطلة: ${broken.join("، ")}` : `${internal.size} رابطًا سليمًا`,
  });
  return checks;
}

function SeoStatus() {
  const [results, setResults] = useState<Result[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    linkCache.clear();
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
        <AiAdvisor results={results} loading={loading} />
      </div>
    </main>
  );
}

function AiAdvisor({ results, loading }: { results: Result[]; loading: boolean }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const ask = async () => {
    setBusy(true);
    setError("");
    setText("");
    try {
      const { getSeoAdvice } = await import("@/lib/ai/seo-advisor.functions");
      const r = await getSeoAdvice({ data: { pages: results, notes: notes.trim() || undefined } });
      if (r.ok) setText(r.text);
      else setError(r.message);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="mt-8 rounded-2xl border border-primary/30 bg-card p-5">
      <h2 className="font-amiri text-2xl text-primary mb-1">مستشار الإصلاحات الذكي</h2>
      <p className="text-sm text-muted-foreground mb-3">
        يحلّل نتائج آخر فحص ويرتّب الإصلاحات لكل صفحة حسب الأولوية مع شرح طريقة الحل. أضف ملاحظات (مثل رسائل Search Console) إن شئت.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={4000}
        rows={3}
        placeholder="ملاحظات اختيارية…"
        className="w-full rounded-xl border border-border bg-background p-3 text-sm mb-3"
      />
      <button
        onClick={ask}
        disabled={busy || loading || results.length === 0}
        className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {busy ? "جارٍ التحليل…" : "حلّل النتائج ورتّب الإصلاحات"}
      </button>
      <div aria-live="polite">
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        {text && <div className="mt-4 whitespace-pre-wrap text-sm leading-7">{text}</div>}
      </div>
    </section>
  );
}
