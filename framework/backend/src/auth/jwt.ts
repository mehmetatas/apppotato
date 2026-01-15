import { JwtPayload } from "@broccoliapps/shared";
import * as JWT from "jsonwebtoken";
import { AuthCode } from "../db/schemas/broccoliapps";
import { params } from "../params";
import { getAuthConfig } from "./config";

const ALGORITHM = "RS256";

export type JwtData = Pick<AuthCode, "userId" | "email" | "name" | "provider">;

let privateKey: string;

const getPrivateKey = async (): Promise<string> => {
  if (!privateKey) {
    privateKey = await params.get(getAuthConfig().accessToken.jwtPrivateKeyParam);
  }
  return privateKey;
};

const sign = async (data: JwtData): Promise<string> => {
  const privateKey = await getPrivateKey();

  const {
    app,
    accessToken: { lifetime },
  } = getAuthConfig();

  return JWT.sign(
    {
      sub: data.userId,
      data,
    },
    privateKey,
    {
      expiresIn: lifetime.fromNow().toSeconds(),
      algorithm: ALGORITHM,
      issuer: app,
    }
  );
};

const verify = <T extends JwtPayload & { data: JwtData }>(token: string): T | undefined => {
  const {
    app,
    accessToken: { jwtPublicKey },
  } = getAuthConfig();

  try {
    const decoded = JWT.verify(token, jwtPublicKey, {
      algorithms: [ALGORITHM],
      issuer: app,
    });
    return decoded as T;
  } catch {
    return undefined;
  }
};

export const jwt = {
  sign,
  verify,
};
