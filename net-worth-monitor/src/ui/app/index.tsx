// Client-side hydration entry point
import { cache } from "@broccoliapps/browser";
import { setTokenProvider } from "@broccoliapps/shared";
import { render } from "preact";
import { refreshToken } from "../../shared/api-contracts";
import { App } from "./SpaApp";
import { applyTheme, getStoredTheme } from "./utils/themeUtils";

// CSS import for Vite HMR in development only
// In production, CSS is loaded via <link> tag in Html.tsx from CDN
if (import.meta.env.DEV) {
  import("./app.css");
}

// Apply theme on initial load
applyTheme();

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getStoredTheme() === "system") {
    applyTheme();
  }
});

// Configure access token getter for authenticated API requests
setTokenProvider({
  get: async () => {
    const accessToken = cache.get<string>("accessToken");
    if (accessToken) {
      return accessToken;
    }
    const oldRefreshToken = cache.get<string>("refreshToken");
    if (!oldRefreshToken) {
      return undefined;
    }
    const response = await refreshToken.invoke(
      { refreshToken: oldRefreshToken },
      { skipAuth: true }
    );
    cache.set("accessToken", response.accessToken, response.accessTokenExpiresAt);
    cache.set("refreshToken", response.refreshToken, response.refreshTokenExpiresAt);
    return response.accessToken;
  },
});

const renderApp = () => {
  const appElement = document.getElementById("app");
  if (!appElement) {
    console.error("App element not found");
    return;
  }

  // Hydrate the app
  render(<App />, appElement);
};

// Wait for DOM if still loading
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderApp);
} else {
  renderApp();
}
