import { PageRouter } from "@broccoliapps/backend";
import { PageResponse } from "@broccoliapps/backend/dist/http/response";
import renderToString from "preact-render-to-string";
import { SpaHtml } from "./SpaHtml";

export const app = new PageRouter();

app.handle(
  "/app",
  async (): Promise<PageResponse> => ({
    html: renderToString(<SpaHtml />),
  })
);

app.handle(
  "/app/*",
  async (): Promise<PageResponse> => ({
    html: renderToString(<SpaHtml />),
  })
);

export const handler = app.lambdaHandler();
