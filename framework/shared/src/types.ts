import * as v from "valibot";
import { Cookie } from "./cookie";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpResponse<T> = {
  status?: number;
  data: T;
  headers?: Record<string, string>;
  cookies?: Cookie[];
};

// Type alias for schema to reduce verbosity
export type Schema<T> = v.BaseSchema<unknown, T, v.BaseIssue<unknown>>;

export type ResponseOptions = {
  headers?: Record<string, string>;
  cookies?: Cookie[];
};
