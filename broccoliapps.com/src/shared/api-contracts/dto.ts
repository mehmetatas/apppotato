import * as v from "valibot";

// This is same as framework JwtData
export const authUserDto = v.object({
  userId: v.string(),
  email: v.string(),
  name: v.string(),
  provider: v.string(),
});
export type AuthUserDto = v.InferOutput<typeof authUserDto>;
