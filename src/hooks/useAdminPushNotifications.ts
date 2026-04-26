import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Hook to register the admin Service Worker and expose a function
 * to display native push notifications on mobile (works even when the
 * dashboard tab is in the background or closed, if installed as PWA).
 *
 * Skips registration inside Lovable preview iframes.
 */
export function useAdminPushNotifications(enabled: boolean) {
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (!enabled) return;
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const host = window.location.hostname;
    const isPreview = host.includes("id-preview--") || host.includes("lovableproject.com");

    if (isInIframe || isPreview) {
      // Cleanup any stale SW from preview environments
      navigator.serviceWorker?.getRegistrations().then(rs =>
        rs.forEach(r => {
          if (r.active?.scriptURL.includes("admin-sw.js")) r.unregister();
        })
      ).catch(() => {});
      return;
    }

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/" })
      .then((reg) => {
        swRegRef.current = reg;
      })
      .catch(() => {});
  }, [enabled]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    setPermission(Notification.permission);
    return Notification.permission;
  }, []);

  const showNotification = useCallback(
    (title: string, body: string, opts?: { requireInteraction?: boolean; tag?: string }) => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const reg = swRegRef.current;
      if (reg && reg.active) {
        reg.active.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            title,
            body,
            tag: opts?.tag || "admin-alert",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [200, 100, 200, 100, 400],
            requireInteraction: opts?.requireInteraction ?? true,
          },
        });
        return;
      }
      // Fallback: only show direct notifications when tab is hidden
      if (document.visibilityState !== "visible") {
        try {
          new Notification(title, {
            body,
            icon: "/icon-192.png",
            tag: opts?.tag || "admin-alert",
          });
        } catch {
          /* noop */
        }
      }
    },
    []
  );

  return { permission, requestPermission, showNotification };
}
