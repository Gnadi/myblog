/**
 * Theme storage shared with the portfolio (www.gnadlinger.me) and the CV
 * (cv.gnadlinger.me).
 *
 * Those are separate deployments, so localStorage — which is scoped to one
 * origin — cannot carry the theme across the links between them. What the
 * three sites do share is the registrable domain, so the choice is mirrored
 * into a cookie scoped to it and every site reads that first. localStorage
 * stays as the per-site copy, which keeps working on localhost and on preview
 * deployments, where the shared domain does not apply.
 */
export const THEME_COOKIE_KEY = "theme";
export const THEME_STORAGE_KEY = "theme";
export const THEME_COOKIE_DOMAIN = "gnadlinger.me";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Matches the body background: white / gray-900. */
export const THEME_COLOR = { light: "#ffffff", dark: "#111827" } as const;

export type Theme = "light" | "dark";

export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  // Keep the mobile browser UI (status/address bar) in sync with the theme.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
}

export function readCookieTheme(): Theme | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${THEME_COOKIE_KEY}=(dark|light)(?:\\s*;|$)`),
  );
  return match ? (match[1] as Theme) : null;
}

export function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode and friends: the cookie below still keeps the session
    // consistent, so a blocked localStorage is not worth failing over.
  }

  const host = location.hostname;
  const shared =
    host === THEME_COOKIE_DOMAIN || host.endsWith(`.${THEME_COOKIE_DOMAIN}`)
      ? `; domain=.${THEME_COOKIE_DOMAIN}`
      : "";
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${shared}${secure}`;
}

/**
 * Applies the theme before first paint, so dark mode never flashes white, and
 * keeps this tab in step with a theme switched on one of the sibling sites.
 * Inlined into the head as a raw string, ahead of any bundle.
 */
export const themeInitScript = `(function () {
  var COOKIE = ${JSON.stringify(THEME_COOKIE_KEY)};
  var STORAGE = ${JSON.stringify(THEME_STORAGE_KEY)};
  var DOMAIN = ${JSON.stringify(THEME_COOKIE_DOMAIN)};
  var COLOR = ${JSON.stringify(THEME_COLOR)};
  var MAX_AGE = ${THEME_COOKIE_MAX_AGE};
  var VALUE = /^(dark|light)$/;

  function fromCookie() {
    var match = document.cookie.match(new RegExp("(?:^|;\\\\s*)" + COOKIE + "=(dark|light)(?:\\\\s*;|$)"));
    return match ? match[1] : null;
  }

  function fromStorage() {
    try {
      var stored = localStorage.getItem(STORAGE);
      return VALUE.test(stored) ? stored : null;
    } catch (error) {
      return null;
    }
  }

  function toStorage(theme) {
    try {
      localStorage.setItem(STORAGE, theme);
    } catch (error) {}
  }

  function toCookie(theme) {
    var host = location.hostname;
    var shared = host === DOMAIN || host.slice(-DOMAIN.length - 1) === "." + DOMAIN ? "; domain=." + DOMAIN : "";
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = COOKIE + "=" + theme + "; path=/; max-age=" + MAX_AGE + "; SameSite=Lax" + shared + secure;
  }

  function apply(theme) {
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", COLOR[theme]);
  }

  function sync() {
    var shared = fromCookie();
    var local = fromStorage();
    var theme = shared || local;

    if (theme) {
      // Refreshes the cookie's lifetime, seeds it for visitors whose choice
      // predates it, and adopts a theme picked on one of the sibling sites.
      toCookie(theme);
      if (theme !== local) toStorage(theme);
    } else {
      theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    apply(theme);
  }

  sync();

  // The portfolio links here with target="_blank", so both tabs stay open and
  // the theme may have been switched in the other one meanwhile.
  addEventListener("visibilitychange", function () {
    if (!document.hidden) sync();
  });
  addEventListener("focus", sync);
  addEventListener("pageshow", function (event) {
    if (event.persisted) sync();
  });
  document.addEventListener("astro:after-swap", sync);
})();`;
