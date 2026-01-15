import { table } from "../table";

export type AuthCode = {
  code: string;
  app: string;
  name: string;
  email: string;
  userId: string;
  provider: string;
  expiresAt: number;
  ttl: number;
};

export const authCodes = table<AuthCode>("authCode").key(["code"]).build();
