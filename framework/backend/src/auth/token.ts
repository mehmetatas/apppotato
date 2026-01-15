import { ApiError, epoch, random } from "@broccoliapps/shared";
import { crypto } from "../crypto";
import { tokens } from "../db/schemas/shared";
import { params } from "../params";
import { getAuthConfig } from "./config";
import { jwt, JwtData } from "./jwt";

export type AuthTokens = { accessToken: string; refreshToken: string };

const exchange = async (authCode: string): Promise<AuthTokens> => {
  const {
    app,
    exchange: { secretParam, verifyEndpoint },
  } = getAuthConfig();

  const appSecret = await params.get(secretParam);
  const signature = crypto.sha256(appSecret + authCode);

  const resp = await fetch(verifyEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app,
      authCode,
      signature,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new ApiError(resp.status ?? 500, err.message ?? "Unable to exchange auth token", err.details);
  }

  const data = (await resp.json()) as JwtData;

  const accessToken = await createAccessToken(data);
  const refreshToken = await createRefreshToken(data.userId);

  return { accessToken, refreshToken };
};

const verifyAuthCodeSignature = async (secretParam: string, authCode: string, signature: string) => {
  const appSecret = await params.get(secretParam);
  const calculatedSignatrue = crypto.sha256(appSecret + authCode);
  return signature === calculatedSignatrue;
};

const refresh = async (jwtData: JwtData, refreshToken: string): Promise<AuthTokens | undefined> => {
  const hash = crypto.sha256(refreshToken);
  const token = await tokens.get({ hash });
  if (!token || token.expiresAt < epoch.millis() || token.userId !== jwtData.userId) {
    return undefined;
  }

  // if refresh token completed 80% of its life time refresh it too
  if ((token.expiresAt - epoch.millis()) / getAuthConfig().refreshToken.lifetime.toMilliseconds() > 0.8) {
    [refreshToken] = await Promise.all([createRefreshToken(jwtData.userId), tokens.delete({ hash })]);
  }

  const accessToken = await createAccessToken(jwtData);

  return { accessToken, refreshToken };
};

const verifyAccessToken = (accessToken: string) => {
  const decoded = jwt.verify(accessToken);
  if (!decoded) {
    return false;
  }
  if (decoded.exp < epoch.seconds()) {
    return false;
  }
  return true;
};

const createAccessToken = (data: JwtData) => {
  return jwt.sign(data);
};

const createRefreshToken = async (userId: string): Promise<string> => {
  const token = random.token(128);
  const hash = crypto.sha256(token);

  const expires = getAuthConfig().refreshToken.lifetime.fromNow();

  await tokens.put({
    hash,
    type: "refresh",
    userId,
    createdAt: epoch.millis(),
    expiresAt: expires.toMilliseconds(),
    ttl: expires.toSeconds(),
  });

  return token;
};

export const authToken = {
  exchange,
  verifyAuthCodeSignature,
  refresh,
  verifyAccessToken,
  // todo: token invalidation
};
