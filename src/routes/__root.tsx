import { useEffect } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { FontScaleProvider } from "@/hooks/useFontScale";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import { useLocation, Navigate } from "@/lib/router-compat";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import NotFound from "@/pages/NotFound";

import appCss from "../styles.css?url";

const SITE_URL = "https://azkar-daynight.lovable.app/";

const webApplicationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "الذاكرين",
  alternateName: ["Al-Thakirin", "Adhkar", "أذكار الصباح والمساء"],
  description:
    "تطبيق أذكار الصباح والمساء الصحيحة من القرآن والسنة، مع عدّاد التسبيح والاستماع بصوت القارئ.",
  url: SITE_URL,
  image: `${SITE_URL}og-image.webp`,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, iOS, Android",
  browserRequirements: "Requires JavaScript",
  inLanguage: "ar",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "أذكار الصباح كاملة",
    "أذكار المساء كاملة",
    "عدّاد تسبيح تفاعلي",
    "استماع بصوت القارئ",
    "وضع التركيز الهادئ",
    "وضع ليلي ونهاري",
    "حفظ التقدم تلقائيًا",
    "وضع إمكانية الوصول لتكبير الخط",
  ],
  audience: { "@type": "Audience", audienceType: "Muslims" },
});

const webSiteJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "الذاكرين",
  url: SITE_URL,
  inLanguage: "ar",
  publisher: {
    "@type": "Organization",
    name: "الذاكرين",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}og-image.webp` },
  },
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ما هو وقت أذكار الصباح والمساء؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "وقت أذكار الصباح من بعد صلاة الفجر إلى طلوع الشمس، ويمتد إلى الزوال. ووقت أذكار المساء من بعد صلاة العصر إلى غروب الشمس، ويمتد إلى ثلث الليل.",
      },
    },
    {
      "@type": "Question",
      name: "هل تطبيق الذاكرين مجاني؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، تطبيق الذاكرين مجاني بالكامل، بدون إعلانات، ويعمل من المتصفح مباشرة دون الحاجة إلى تثبيت.",
      },
    },
    {
      "@type": "Question",
      name: "هل الأذكار صحيحة من القرآن والسنة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، جميع الأذكار في التطبيق مأخوذة من القرآن الكريم والسنة النبوية الصحيحة، مع ذكر المصدر لكل ذكر.",
      },
    },
    {
      "@type": "Question",
      name: "هل يحفظ التطبيق تقدّمي في القراءة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يحفظ التطبيق تقدّمك تلقائيًا، ويستأنف من حيث توقفت عند فتحه مرة أخرى.",
      },
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { name: "theme-color", content: "#06241c", media: "(prefers-color-scheme: dark)" },
      { name: "theme-color", content: "#f5f0e0", media: "(prefers-color-scheme: light)" },
      { title: "أذكار الصباح والمساء — الذاكرين | بصوت القارئ" },
      {
        name: "description",
        content:
          "أذكار الصباح والمساء من القرآن والسنة الصحيحة، مع عدّاد التسبيح والاستماع بصوت القارئ. تجربة هادئة بدون تشتيت ولا إعلانات.",
      },
      {
        name: "keywords",
        content:
          "أذكار الصباح والمساء, اذكار الصباح, اذكار المساء, حصن المسلم, أذكار المسلم, الأذكار اليومية, تسبيح, دعاء, اذكار بالصوت, تطبيق أذكار, الذاكرين, adhkar, azkar, morning adhkar, evening adhkar, hisn al muslim",
      },
      { name: "author", content: "الذاكرين" },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "googlebot", content: "index, follow" },
      { name: "rating", content: "general" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "google-site-verification", content: "767GdIUjhNQvK1noTEJlJpLCFmrG1Isx6oPEVTxw8o8" },
      {
        property: "og:title",
        content: "أذكار الصباح والمساء — الذاكرين | تجربة هادئة للذكر والخشوع",
      },
      {
        property: "og:description",
        content:
          "ابدأ يومك وأختمه بذكر الله بهدوء وخشوع. أذكار الصباح والمساء الصحيحة من القرآن والسنة، مع عدّاد التسبيح الناعم واستماع بصوت القارئ — بدون تشتيت ولا إعلانات.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "ar_SA" },
      { property: "og:site_name", content: "الذاكرين" },
      { property: "og:image", content: `${SITE_URL}og-image.webp` },
      { property: "og:image:secure_url", content: `${SITE_URL}og-image.webp` },
      { property: "og:image:type", content: "image/webp" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { property: "og:image:alt", content: "الذاكرين — أذكار الصباح والمساء بهدوء وخشوع" },
      { property: "og:image", content: `${SITE_URL}og-image.jpg` },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1536" },
      { property: "og:image:height", content: "1024" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "أذكار الصباح والمساء — الذاكرين | تجربة هادئة للذكر والخشوع",
      },
      {
        name: "twitter:description",
        content:
          "ابدأ يومك وأختمه بذكر الله بهدوء وخشوع. أذكار الصباح والمساء الصحيحة بصوت القارئ وعدّاد تسبيح ناعم — بدون تشتيت.",
      },
      { name: "twitter:image", content: `${SITE_URL}og-image.webp` },
      { name: "twitter:image:alt", content: "الذاكرين — أذكار الصباح والمساء بهدوء وخشوع" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "الذاكرين" },
      { name: "application-name", content: "الذاكرين" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "alternate", hrefLang: "ar", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "dns-prefetch", href: "https://alazkar.today" },
      { rel: "preconnect", href: "https://alazkar.today", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
        href: "/fonts/amiri-400-arabic.woff2",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
        href: "/fonts/karla-300-latin.woff2",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
        href: "/fonts/cormorant-garamond-400-latin.woff2",
      },
      { rel: "stylesheet", href: "/fonts/fonts.css" },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      { type: "application/ld+json", children: webApplicationJsonLd },
      { type: "application/ld+json", children: webSiteJsonLd },
      { type: "application/ld+json", children: faqJsonLd },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * يُطبّع المسار بإزالة أي trailing slash (عدا "/") عبر redirect
 * لمنع تكرار الفهرسة بين /azkar-sabah و /azkar-sabah/.
 */
function TrailingSlashRedirect() {
  const { pathname, search, hash } = useLocation();
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const clean = pathname.replace(/\/+$/, "");
    return <Navigate to={`${clean}${search}${hash}`} replace />;
  }
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FontScaleProvider>
          <AccessibilityProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <TrailingSlashRedirect />
              <Outlet />
            </TooltipProvider>
          </AccessibilityProvider>
        </FontScaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="glass-surface max-w-md w-full rounded-2xl p-8 text-center flex flex-col gap-4">
        <h1 className="font-amiri text-2xl text-primary">تعذّر تحميل الصفحة</h1>
        <p className="font-naskh text-sm text-muted-foreground leading-relaxed">
          حدث خلل غير متوقع. يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-naskh hover:opacity-90 transition-opacity"
          >
            حاول مجددًا
          </button>
          <a
            href="/"
            className="px-5 py-2 rounded-full border border-border text-sm font-naskh text-foreground hover:bg-secondary/50 transition-colors"
          >
            الصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
