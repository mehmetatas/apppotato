// Client-side hydration entry point
import { render } from "preact";
import { App } from "./SpaApp";

// CSS import for Vite HMR in development only
// In production, CSS is loaded via <link> tag in Html.tsx from CDN
if (import.meta.env.DEV) {
  import("./app.css");
}

const renderApp = () => {
  console.log("renderApp");
  const appElement = document.getElementById("app");
  if (!appElement) {
    console.error("App element not found");
    return;
  }

  console.log("rendering...");
  // Hydrate the app
  render(<App />, appElement);
};

// Wait for DOM if still loading
if (document.readyState === "loading") {
  console.log("ready state");
  document.addEventListener("DOMContentLoaded", renderApp);
} else {
  console.log("else");
  renderApp();
}
