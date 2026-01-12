import type { ComponentChildren } from "preact";
import { Layout } from "./Layout";

declare const __BUILD_ID__: string;

export type HtmlProps = {
  title?: string;
  description?: string;
  pageProps?: Record<string, unknown>;
  staticPage?: boolean;
  skipLayout?: boolean;
  status?: number;
  children: ComponentChildren;
};

export const Html = ({
  title = "Broccoli Apps",
  description = "The healthy food aisle of software",
  pageProps,
  staticPage = false,
  skipLayout = false,
  status = 200,
  children,
}: HtmlProps) => {
  // Build ID from esbuild define (set at build time)
  const buildId = typeof __BUILD_ID__ !== "undefined" ? __BUILD_ID__ : "";

  // Dev mode: use NODE_ENV or check if running without build ID
  const isDevMode = process.env.NODE_ENV === "development" || (!buildId && typeof window === "undefined");

  // In dev mode, load from Vite dev server; in prod, load from static path
  const cssFile = buildId ? `/static/app.${buildId}.css` : "/static/app.css";
  const jsFile = isDevMode
    ? "http://localhost:5173/src/ui/client/index.tsx"
    : buildId
      ? `/static/app.${buildId}.js`
      : "/static/app.js";

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* CSS - only load in production (Vite handles CSS in dev) */}
        {!isDevMode && <link rel="stylesheet" href={cssFile} />}
      </head>
      <body>
        <div id="app" data-status={status}>
          <Layout skip={skipLayout}>{children}</Layout>
        </div>

        {/* Hydration scripts (only for non-static pages) */}
        {!staticPage && (
          <>
            {/* Serialize page props for client hydration */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__PAGE_PROPS__=${JSON.stringify(pageProps ?? {})};`,
              }}
            />

            {/* Client bundle */}
            <script type="module" src={jsFile} />

            {/* Vite HMR client (dev mode only) */}
            {isDevMode && <script type="module" src="http://localhost:5173/@vite/client" />}
          </>
        )}
      </body>
    </html>
  );
};
