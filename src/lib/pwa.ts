// The only place the offline service worker is registered. Never in dev, preview or iframes.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const PREVIEW_HOSTS = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];

function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const host = window.location.hostname.toLowerCase();
  const label = host.split(".")[0] ?? "";
  if (PREVIEW_HOSTS.some((h) => host.endsWith(h)) && PREVIEW_LABEL.test(label)) return true;
  if (/^project--[a-z0-9-]+-dev$/.test(label) && PREVIEW_HOSTS.some((h) => host.endsWith(h))) return true;
  for (const d of ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"]) {
    if (host === d || host.endsWith(`.${d}`)) return true;
  }
  return new URLSearchParams(window.location.search).get("sw") === "off";
}

export async function registerOfflineSupport() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()),
    );
    return;
  }
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    /* offline support is a bonus; ignore failures */
  }
}
