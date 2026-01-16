import { JwtPayload, globalConfig } from "@broccoliapps/shared";
import JWT from "jsonwebtoken";
import { AuthCode } from "../db/schemas/broccoliapps";
import { params } from "../params";
import { getAuthConfig } from "./config";

const ALGORITHM = "RS256";

export type JwtData = Pick<AuthCode, "userId" | "email" | "name" | "provider">;

const sign = async (data: JwtData): Promise<string> => {
  const { appId, accessTokenLifetime } = getAuthConfig();

  const key = await params.getAppKey(appId);

  return JWT.sign(
    {
      sub: data.userId,
      data,
    },
    key,
    {
      expiresIn: accessTokenLifetime.toSeconds(),
      algorithm: ALGORITHM,
      issuer: appId,
    }
  );
};

const verify = <T extends JwtPayload & { data: JwtData }>(token: string): T | undefined => {
  const { appId } = getAuthConfig();

  const key = globalConfig.apps[appId].publicKey;

  try {
    const decoded = JWT.verify(token, key, {
      algorithms: [ALGORITHM],
      issuer: appId,
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
