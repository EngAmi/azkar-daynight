import Index from "./Index";
import { adhkarItemListJsonLd } from "@/components/AdhkarTextList";

const SITE = "https://azkar-daynight.lovable.app";

export const sabahJsonLd = [
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

const AzkarSabah = () => {
  return (
    <>
      <Index
        initialTab="morning"
        pageHeading="أذكار الصباح"
        pageSubheading="ابدأ صباحك بذكر الله — مكتوبة ومسموعة بصوت القارئ"
      />
    </>
  );
};

export default AzkarSabah;
