type AnalyticsEvent = {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: string;
};

/**
 * Lightweight analytics logger. Events are written to stdout in structured
 * JSON format for easy ingestion by log aggregators (CloudWatch, Datadog, etc.).
 * Replace the implementation with a real analytics SDK (Mixpanel, PostHog,
 * Amplitude) when ready for production instrumentation.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  const payload: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  console.log(`[analytics] ${JSON.stringify(payload)}`);
}
