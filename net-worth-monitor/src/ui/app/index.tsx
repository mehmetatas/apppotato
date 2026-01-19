// Client-side hydration entry point
import { render } from "preact";
import { App } from "./SpaApp";

// CSS import for Vite HMR in development only
// In production, CSS is loaded via <link> tag in Html.tsx from CDN
if (import.meta.env.DEV) {
  import("./app.css");
}

// Apply theme based on preference
const applyTheme = () => {
  const theme = localStorage.getItem("theme") || "system";
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    // System preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};

// Apply theme on initial load
applyTheme();

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  const theme = localStorage.getItem("theme") || "system";
  if (theme === "system") {
    applyTheme();
  }
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
