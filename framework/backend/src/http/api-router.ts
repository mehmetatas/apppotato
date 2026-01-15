import type { ApiContract, HttpMethod, HttpResponse, Schema } from "@broccoliapps/shared";
import type { Context } from "hono";
import * as v from "valibot";
import { log } from "../log";
import { RequestContext } from "./context";
import { deserializeRequest } from "./deserializer";
import { HttpRouter, setCookies } from "./http-router";
import { HttpError } from "./page-router";
import { createApiResponse, type ApiResponse } from "./response";
import { HttpHandler } from "./types";

/**
 * Standard API error response format
 */
type ApiErrorResponse = {
  status: number;
  message: string;
  details?: string[];
};

export class ApiRouter extends HttpRouter {
  /**
   * Register an API contract with its implementation
   *
   * @example
   * api.register(createUser, async (req, res) => {
   *   return res.created({ id: 1, name: req.name });
   * });
   */
  register<TReq extends Record<string, unknown>, TRes>(
    contract: ApiContract<TReq, TRes>,
    fn: (req: TReq, res: ApiResponse<TRes>, ctx: RequestContext) => Promise<HttpResponse<TRes>>
  ): this {
    const res = createApiResponse<TRes>();
    this.registerRoute(contract.method, contract.path, contract.schema, (req: TReq, ctx: RequestContext) =>
      fn(req, res, ctx)
    );
    return this;
  }

  private registerRoute<TReq, TRes>(
    method: HttpMethod,
    path: string,
    schema: Schema<TReq>,
    handler: HttpHandler<TReq, TRes>
  ): void {
    const honoHandler = async (c: Context): Promise<Response> => {
      try {
        const request = await deserializeRequest(c, method, schema);
        const ctx = new RequestContext(c);
        const response = await handler(request, ctx);
        setCookies(c, response.cookies);

        const status = response.status ?? 200;
        if (status === 204) {
          return c.body(null, 204, response.headers);
        }

        return c.json(response.data, status as 200, response.headers);
      } catch (error) {
        return this.handleApiError(c, error);
      }
    };

    this.hono[method.toLowerCase() as Lowercase<HttpMethod>](path, honoHandler);
  }

  private handleApiError(c: Context, error: unknown): Response {
    let apiError: ApiErrorResponse;

    if (error instanceof v.ValiError) {
      apiError = {
        status: 400,
        message: "Validation Error",
        details: error.issues.map((issue) => {
          const path = issue.path?.map((p: { key: string | number }) => p.key).join(".") ?? "";
          return path ? `${path}: ${issue.message}` : issue.message;
        }),
      };
    } else if (error instanceof HttpError) {
      apiError = {
        status: error.status,
        message: error.status >= 500 ? "Internal Server Error" : error.message,
      };
    } else {
      log.err("API error:", { error });
      apiError = {
        status: 500,
        message: "Internal Server Error",
      };
    }

    return c.json(apiError, apiError.status as 400);
  }
}
