import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

/**
 * Lightweight SEO head manager — يحدّث العنوان والوصف والـcanonical وJSON-LD
 * لكل صفحة دون الحاجة لمكتبات خارجية. مناسب لـSPA يقوم Lovable بتحويل الطلبات إليه.
 */
export function SeoHead({ title, description, canonical, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [k, v] = selector.replace(/[\[\]"]/g, "").split("=");
        el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    // canonical
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

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
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, canonical, JSON.stringify(jsonLd)]);

  return null;
}
