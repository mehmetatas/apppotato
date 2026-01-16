import { auth, log } from "@broccoliapps/backend";
import { Duration } from "@broccoliapps/shared";
import * as v from "valibot";
import { www } from "../lambda";

auth.setConfig({
  appId: "networthmonitor",
  accessTokenLifetime: Duration.days(1),
  refreshTokenLifetime: Duration.years(1),
});

www
  .withRequest({
    code: v.string(),
  })
  .handle("/auth/callback", async (req, _ctx) => {
    const tokens = await auth.exchange(req.code);
    log.dbg("tokens", { tokens });
    return {
      status: 302,
      headers: { Location: "/" },
      cookies: [], // set cookies
    };
  });
