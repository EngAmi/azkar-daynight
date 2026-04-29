import Index from "./Index";
import { SeoHead } from "@/components/SeoHead";

const SITE = "https://azkar-daynight.lovable.app";

const AzkarSabah = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "أذكار الصباح — الذاكرين",
      inLanguage: "ar",
      url: `${SITE}/azkar-sabah`,
      description:
        "أذكار الصباح الصحيحة من السنة النبوية مع عدّاد التكرار وصوت القارئ — تطبيق الذاكرين.",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "أذكار الصباح", item: SITE + "/azkar-sabah" },
      ],
    },
  ];

  return (
    <>
      <SeoHead
        title="أذكار الصباح المسموعة والمكتوبة — الذاكرين"
        description="أذكار الصباح الصحيحة من السنة النبوية مع عدّاد تكرار وصوت القارئ، بدون تشتيت — تطبيق الذاكرين."
        canonical={`${SITE}/azkar-sabah`}
        jsonLd={jsonLd}
      />
      <Index initialTab="morning" />
    </>
  );
};

export default AzkarSabah;
