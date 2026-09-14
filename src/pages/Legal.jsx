import { Link, useParams } from "react-router-dom";
import { AlertTriangle, FileText, Headphones, LockKeyhole, RotateCcw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const documents = {
  contact: {
    icon: Headphones,
    fr: ["Contact", "Notre équipe répond depuis la page Support. Point de retrait : Rue 177, 20202 Casablanca.", "À compléter avant publication : téléphone commercial, email légal, horaires et identité de l’exploitant."],
    en: ["Contact", "Our team replies through the Support page. Pickup point: Rue 177, 20202 Casablanca.", "Complete before launch: business phone, legal email, opening hours and operator identity."],
    ar: ["اتصل بنا", "يرد فريقنا عبر صفحة الدعم. نقطة الاستلام: شارع 177، 20202 الدار البيضاء.", "يجب إكماله قبل النشر: الهاتف التجاري والبريد القانوني وساعات العمل وهوية المشغّل."],
  },
  "delivery-returns": {
    icon: RotateCcw,
    fr: ["Livraison et retours", "La livraison est proposée à Casablanca selon le créneau choisi au checkout. Les frais définitifs sont affichés avant confirmation. Le retrait en magasin est gratuit.", "À valider par le propriétaire avant publication : délais, zones exactes, conditions de retour, exclusions, frais et procédure de remboursement."],
    en: ["Delivery and returns", "Delivery is available in Casablanca for the checkout time slot. Final fees appear before confirmation. Store pickup is free.", "Owner approval required before launch: delivery times and areas, return conditions, exclusions, fees and refund process."],
    ar: ["التوصيل والإرجاع", "التوصيل متاح في الدار البيضاء حسب الفترة المختارة، وتظهر الرسوم النهائية قبل التأكيد. الاستلام من المتجر مجاني.", "يجب أن يعتمد المالك قبل النشر: الآجال والمناطق وشروط الإرجاع والاستثناءات والرسوم وطريقة الاسترداد."],
  },
  terms: {
    icon: FileText,
    fr: ["Conditions générales de vente", "Les prix sont affichés en dirhams marocains. Le total confirmé est recalculé depuis les articles, la remise éventuelle et les frais de livraison.", "Document juridique à finaliser par le propriétaire : identité légale, commande, paiement, livraison, rétractation, garanties, responsabilité et règlement des litiges."],
    en: ["Terms of sale", "Prices are displayed in Moroccan dirhams. The confirmed total is recalculated from items, discounts and delivery fees.", "Legal document to be finalized by the owner: legal identity, orders, payment, delivery, withdrawal, warranties, liability and disputes."],
    ar: ["الشروط العامة للبيع", "تعرض الأسعار بالدرهم المغربي، ويعاد حساب المجموع المؤكد من المنتجات والخصم ورسوم التوصيل.", "وثيقة قانونية يجب أن يكملها المالك: الهوية القانونية والطلب والدفع والتوصيل والضمان والمسؤولية والنزاعات."],
  },
  privacy: {
    icon: LockKeyhole,
    fr: ["Confidentialité", "AliShop traite les informations nécessaires au compte, au panier, aux commandes, à la livraison et au support. Les pièces jointes du support sont accessibles uniquement au client concerné et aux administrateurs.", "À compléter avant publication : responsable du traitement, durées de conservation, base légale, prestataires, droits des personnes et contact d’exercice des droits."],
    en: ["Privacy", "AliShop processes information required for accounts, carts, orders, delivery and support. Support attachments are restricted to the customer and administrators.", "Complete before launch: data controller, retention periods, legal basis, processors, user rights and privacy contact."],
    ar: ["الخصوصية", "تعالج AliShop البيانات اللازمة للحساب والسلة والطلبات والتوصيل والدعم. مرفقات الدعم متاحة فقط للعميل المعني وللمشرفين.", "يجب إكماله قبل النشر: مسؤول المعالجة ومدد الاحتفاظ والأساس القانوني والمزوّدون وحقوق الأشخاص ووسيلة التواصل."],
  },
};

export default function Legal() {
  const { document = "contact" } = useParams();
  const { locale } = useLanguage();
  const config = documents[document] || documents.contact;
  const [title, description, pending] = config[locale] || config.fr;
  const Icon = config.icon;

  return (
    <div className="mx-auto min-h-[65vh] max-w-4xl px-4 py-8 sm:px-6 sm:py-12" dir={locale === "ar" ? "rtl" : "ltr"}>
      <article className="premium-surface rounded-[2rem] p-5 sm:p-9">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon size={26} /></span>
        <h1 className="mt-5 text-3xl font-black text-gray-950 sm:text-4xl">{title}</h1>
        <p className="mt-5 text-base leading-8 text-gray-600">{description}</p>
        <div className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <p>{pending}</p>
        </div>
        <Link to="/support" className="mt-7 inline-flex min-h-12 items-center rounded-2xl bg-indigo-600 px-5 font-black text-white">Support AliShop</Link>
      </article>
    </div>
  );
}
