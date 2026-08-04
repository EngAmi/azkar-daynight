import Index from "./Index";
import { SeoHead } from "@/components/SeoHead";
import { AdhkarTextList, adhkarItemListJsonLd } from "@/components/AdhkarTextList";

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
    adhkarItemListJsonLd("morning", `${SITE}/azkar-sabah`),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ما وقت أذكار الصباح؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "وقتها من بعد صلاة الفجر إلى طلوع الشمس، ومن فاته ذلك فله أن يقضيها إلى زوال الشمس (وقت الظهر).",
          },
        },
        {
          "@type": "Question",
          name: "هل أذكار الصباح هنا صحيحة ومخرّجة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، الأذكار مأخوذة من القرآن الكريم والسنة النبوية الصحيحة، ومذكور مع كل ذكر عدد تكراره وفضله ومصدره من كتب الحديث.",
          },
        },
        {
          "@type": "Question",
          name: "هل يمكن الاستماع لأذكار الصباح بصوت القارئ؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، يمكنك الاستماع لكل ذكر بصوت قارئ هادئ داخل الجلسة، مع عدّاد تكرار يعمل بلمسة واحدة، وبدون إعلانات.",
          },
        },
      ],
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
        title="أذكار الصباح مكتوبة كاملة بالتشكيل وبصوت القارئ — الذاكرين"
        description="أذكار الصباح كاملة مكتوبة بالتشكيل من السنة الصحيحة، مع عدد التكرار والفضل والمصدر، واستماع بصوت قارئ هادئ وعدّاد تسبيح — بدون تشتيت ولا إعلانات."
        canonical={`${SITE}/azkar-sabah`}
        jsonLd={jsonLd}
      />
      <Index
        initialTab="morning"
        pageHeading="أذكار الصباح"
        pageSubheading="ابدأ صباحك بذكر الله — مكتوبة ومسموعة بصوت القارئ"
      />
      <AdhkarTextList type="morning" />
    </>
  );
};

export default AzkarSabah;
