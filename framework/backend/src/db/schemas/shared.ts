import { table } from "../table";

export type Token = {
  hash: string;
  type: "refresh" | string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  ttl: number;
};

export const tokens = table<Token>("token").key(["hash"]).gsi1("byUser", ["userId"], ["type", "createdAt"]).build();
