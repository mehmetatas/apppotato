// Client-side hydration entry point
import { hydrate } from "preact";
import { App } from "./App";
import * as Pages from "./pages";

// CSS import for Vite HMR in development only
// In production, CSS is loaded via <link> tag in Html.tsx
if (import.meta.env.DEV) {
  import("./app.css");
}

// Server tells us which page to render
declare global {
  interface Window {
    __PAGE_PROPS__: Record<string, unknown>;
    __PAGE_NAME__: string;
    __SKIP_LAYOUT__?: boolean;
  }
}

const hydrateApp = () => {
  const appElement = document.getElementById("app");
  if (!appElement) {
    console.error("App element not found");
    return;
  }

  const pageProps = window.__PAGE_PROPS__ ?? {};
  const status = parseInt(appElement.dataset.status || "200", 10);
  const pageName = window.__PAGE_NAME__;
  const skipLayout = window.__SKIP_LAYOUT__ ?? false;

  const PageComponent = (Pages as any)[pageName];
  if (!PageComponent) {
    console.error(`Unknown page: ${pageName}`);
    return;
  }

  hydrate(
    <App pageProps={pageProps} status={status} skipLayout={skipLayout}>
      <PageComponent {...pageProps} />
    </App>,
    appElement
  );
};

// Wait for DOM if still loading
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hydrateApp);
} else {
  hydrateApp();
}
