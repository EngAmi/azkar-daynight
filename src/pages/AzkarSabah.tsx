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
        title="أذكار الصباح — الذاكرين | تجربة هادئة للذكر والخشوع"
        description="ابدأ صباحك بذكر الله بهدوء وخشوع. أذكار الصباح الصحيحة من السنة النبوية: نص مكتوب، صوت قارئ هادئ، وعدّاد تكرار ناعم — بدون تشتيت ولا إعلانات."
        canonical={`${SITE}/azkar-sabah`}
        jsonLd={jsonLd}
      />
      <Index
        initialTab="morning"
        pageHeading="أذكار الصباح"
        pageSubheading="ابدأ صباحك بذكر الله — مكتوبة ومسموعة بصوت القارئ"
      />
    </>
  );
};

export default AzkarSabah;
