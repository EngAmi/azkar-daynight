import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  /** Canonical URL — يجب أن يطابق المسار الفعلي بدون trailing slash (عدا الجذر "/") */
  canonical: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

/**
 * Lightweight SEO head manager — يحدّث العنوان والوصف والـcanonical وhreflang وJSON-LD
 * لكل صفحة دون الحاجة لمكتبات خارجية.
 *
 * يضمن:
 * - canonical موحّد يطابق المسار (يمنع تكرار الفهرسة بين / و /path/ وغيرها).
 * - hreflang ar + x-default يشيران إلى نفس الـ canonical للصفحة الحالية.
 * - استرجاع القيم السابقة عند الخروج من الصفحة (لتفادي تسرّب canonical خاطئ بين المسارات في SPA).
 */
export function SeoHead({ title, description, canonical, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    // تطبيع: إزالة أي trailing slash إلا للجذر
    const normalizedCanonical = (() => {
      try {
        const u = new URL(canonical);
        if (u.pathname !== "/" && u.pathname.endsWith("/")) {
          u.pathname = u.pathname.replace(/\/+$/, "");
        }
        return u.toString();
      } catch {
        return canonical;
      }
    })();

    const prevTitle = document.title;
    document.title = title;

    const upsertMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      const prev = el?.getAttribute("content") ?? null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return prev;
    };

    const prevDesc = upsertMeta('meta[name="description"]', "name", "description", description);
    const prevOgTitle = upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    const prevOgDesc = upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    const prevOgUrl = upsertMeta('meta[property="og:url"]', "property", "og:url", normalizedCanonical);
    const prevTwTitle = upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    const prevTwDesc = upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    // canonical
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = link?.getAttribute("href") ?? null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", normalizedCanonical);

    // hreflang ar
    const upsertAlternate = (hreflang: string) => {
      let l = document.head.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${hreflang}"]`
      );
      const prev = l?.getAttribute("href") ?? null;
      if (!l) {
        l = document.createElement("link");
        l.setAttribute("rel", "alternate");
        l.setAttribute("hreflang", hreflang);
        document.head.appendChild(l);
      }
      l.setAttribute("href", normalizedCanonical);
      return prev;
    };
    const prevHrefAr = upsertAlternate("ar");
    const prevHrefDefault = upsertAlternate("x-default");

    // JSON-LD page-scoped
    const scriptId = "page-jsonld";
    const old = document.getElementById(scriptId);
    if (old) old.remove();
    if (jsonLd) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = scriptId;
      s.text = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }

    return () => {
      document.title = prevTitle;
      // استرجاع القيم السابقة لتفادي تسرّب canonical/og خاطئ عند التنقل داخل SPA
      if (prevDesc !== null) document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", prevDesc);
      if (prevOgTitle !== null) document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", prevOgTitle);
      if (prevOgDesc !== null) document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", prevOgDesc);
      if (prevOgUrl !== null) document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", prevOgUrl);
      if (prevTwTitle !== null) document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", prevTwTitle);
      if (prevTwDesc !== null) document.head.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", prevTwDesc);
      if (prevCanonical !== null) link?.setAttribute("href", prevCanonical);
      const arEl = document.head.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="ar"]');
      if (prevHrefAr !== null && arEl) arEl.setAttribute("href", prevHrefAr);
      const defEl = document.head.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="x-default"]');
      if (prevHrefDefault !== null && defEl) defEl.setAttribute("href", prevHrefDefault);

      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, canonical, JSON.stringify(jsonLd)]);

  return null;
}
