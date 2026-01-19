import { api } from "@broccoliapps/shared";
import * as v from "valibot";
import type { User } from "../../db/users";

export const getUser = api("GET", "/user").withResponse<User>();

export const patchUser = api("PATCH", "/user")
  .withRequest({
    targetCurrency: v.optional(v.pipe(v.string(), v.length(3))),
  })
  .withResponse<User>();
