import type { Cookie } from "@broccoliapps/shared";
import type { VNode } from "preact";
import { render as renderToString } from "preact-render-to-string";
import { Html } from "../client/layout/Html";

/**
 * Options for page rendering
 */
export type PageOptions = {
  title?: string;
  skipLayout?: boolean;
  staticPage?: boolean;
  status?: number;
  cookies?: Cookie[];
  headers?: Record<string, string>;
};

/**
 * Response from page handler - router just returns this as html
 */
export type PageResponse = {
  status: number;
  data: string;
  cookies?: Cookie[];
  headers?: Record<string, string>;
};

/**
 * Render a page component to HTML response.
 *
 * @example
 * page.route("/users/:id").handler(async (req) => {
 *   return render(<UserDetailPage id={req.id} name="Alice" />)
 *     .withOptions({ title: "User Details" });
 * });
 */
export function render(element: VNode) {
  const pageProps = element.props as Record<string, unknown>;

  return {
    withOptions(options: PageOptions = {}): PageResponse {
      const html = renderToString(
        <Html
          title={options.title}
          pageProps={pageProps}
          status={options.status}
          staticPage={options.staticPage}
          skipLayout={options.skipLayout}
        >
          {element}
        </Html>
      );

      return {
        status: options.status ?? 200,
        data: "<!DOCTYPE html>" + html,
        cookies: options.cookies,
        headers: options.headers,
      };
    },
  };
}
