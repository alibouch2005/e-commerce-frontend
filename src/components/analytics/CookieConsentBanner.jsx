import { useState } from "react";
import { hasAnalyticsConsent, setAnalyticsConsent, trackEvent } from "../../services/analyticsService";
import { useLanguage } from "../../context/LanguageContext";

export default function CookieConsentBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(() => !localStorage.getItem("ali_analytics_consent"));

  if (!visible || hasAnalyticsConsent()) return null;

  const accept = () => {
    setAnalyticsConsent(true);
    trackEvent("page_view", { path: `${window.location.pathname}${window.location.search}` });
    setVisible(false);
  };

  const decline = () => {
    setAnalyticsConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-4 shadow-2xl md:flex md:items-center md:justify-between md:gap-5">
      <p className="text-sm text-gray-600">
        {t("cookieText")}
      </p>
      <div className="mt-3 flex gap-2 md:mt-0">
        <button onClick={decline} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          {t("decline")}
        </button>
        <button onClick={accept} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
