export const SITE = "https://azkar-daynight.lovable.app";
const OG_IMAGE = `${SITE}/og-image.jpg`;

interface PageHeadInput {
  path: string; // "/" or "/azkar-nawm"
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>[];
}

/** Per-route head: unique title/description, self canonical, OG/Twitter, JSON-LD (SSR-rendered). */
export function pageHead({ path, title, description, jsonLd = [] }: PageHeadInput) {
  const url = path === "/" ? `${SITE}/` : `${SITE}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: path === "/" ? "website" : "article" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "ar", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
    scripts: jsonLd.map((j) => ({ type: "application/ld+json", children: JSON.stringify(j) })),
  };
}

export function breadcrumb(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
    ],
  };
}

export function itemList(name: string, path: string, items: { content: string; fadl?: string; source?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    inLanguage: "ar",
    url: `${SITE}${path}`,
    numberOfItems: items.length,
    itemListElement: items.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.content.slice(0, 110),
      description: d.fadl || d.source,
    })),
  };
}
