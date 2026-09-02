import api from "../Api/axios";

const SESSION_KEY = "ali_analytics_session";
const CONSENT_KEY = "ali_analytics_consent";

export const hasAnalyticsConsent = () => localStorage.getItem(CONSENT_KEY) === "accepted";

export const setAnalyticsConsent = (accepted) => {
  localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
};

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const trackEvent = async (event, payload = {}) => {
  if (!hasAnalyticsConsent()) return;

  try {
    await api.post("/api/analytics/events", {
      session_id: getSessionId(),
      event,
      path: window.location.pathname,
      ...payload,
    });
  } catch {
    // Analytics should never block the user journey.
  }
};
