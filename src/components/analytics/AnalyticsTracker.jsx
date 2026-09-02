import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "../../services/analyticsService";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", { path: `${location.pathname}${location.search}` });
  }, [location.pathname, location.search]);

  return null;
}
