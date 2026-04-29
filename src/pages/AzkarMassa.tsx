import Index from "./Index";
import { SeoHead } from "@/components/SeoHead";

const SITE = "https://azkar-daynight.lovable.app";

const AzkarMassa = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "أذكار المساء — الذاكرين",
      inLanguage: "ar",
      url: `${SITE}/azkar-massa`,
      description:
        "أذكار المساء الصحيحة من السنة النبوية مع عدّاد التكرار وصوت القارئ — تطبيق الذاكرين.",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "أذكار المساء", item: SITE + "/azkar-massa" },
      ],
    },
  ];

  return (
    <>
      <SeoHead
        title="أذكار المساء كاملة مكتوبة ومسموعة بصوت القارئ — الذاكرين"
        description="ابدأ أذكار المساء الصحيحة من السنة النبوية الآن: نص مكتوب، صوت قارئ، وعدّاد تكرار هادئ — بدون تشتيت ولا إعلانات. تطبيق الذاكرين."
        canonical={`${SITE}/azkar-massa`}
        jsonLd={jsonLd}
      />
      <Index
        initialTab="evening"
        pageHeading="أذكار المساء"
        pageSubheading="اختم يومك بذكر الله — مكتوبة ومسموعة بصوت القارئ"
      />
    </>
  );
};

export default AzkarMassa;
