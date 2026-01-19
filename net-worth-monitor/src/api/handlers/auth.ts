import { auth, HttpError } from "@broccoliapps/backend";
import { Duration } from "@broccoliapps/shared";
import { users } from "../../db/users";
import { type AuthUser, authExchange, refreshToken } from "../../shared/api-contracts";
import { api } from "../lambda";

const accessTokenLifetime = Duration.days(1);
const refreshTokenLifetime = Duration.years(1);

auth.setConfig({
  appId: "networthmonitor",
  accessTokenLifetime,
  refreshTokenLifetime,
});

api.register(authExchange, async (req, res) => {
  const { accessToken, refreshToken, user: jwtUser } = await auth.exchange(req.code);

  // Check if user exists by email
  const existingUsers = await users.query.byEmail({ email: jwtUser.email }).all();
  let existingUser = existingUsers[0];
  let isNewUser = false;

  if (!existingUser) {
    // Create new user
    isNewUser = true;
    const now = Date.now();
    existingUser = await users.put({
      id: jwtUser.userId,
      email: jwtUser.email,
      name: jwtUser.name,
      signInProvider: jwtUser.provider,
      targetCurrency: "",
      createdAt: now,
      updatedAt: now,
    });
  }

  const authUser: AuthUser = {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    isNewUser,
    targetCurrency: existingUser.targetCurrency || null,
  };

  return res.ok({
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessTokenLifetime.fromNow().toMilliseconds(),
    refreshTokenExpiresAt: refreshTokenLifetime.fromNow().toMilliseconds(),
    user: authUser,
  });
});


api.register(refreshToken, async (req, res) => {
  const newTokens = await auth.refresh(req.refreshToken, async (id) => {
    const user = await users.get({ id });
    if (!user) {
      throw new HttpError(403, "User not found");
    }
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.signInProvider,
    };
  });

  if (!newTokens) {
    throw new HttpError(403, "Invalid refresh token");
  }

  return res.ok({
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
    accessTokenExpiresAt: accessTokenLifetime.fromNow().toMilliseconds(),
    refreshTokenExpiresAt: refreshTokenLifetime.fromNow().toMilliseconds(),
  });
});