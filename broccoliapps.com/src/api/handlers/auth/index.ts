import { auth } from "@broccoliapps/backend";
import { Duration } from "@broccoliapps/shared";
import { config } from "../../../shared/config";
import "./verify";

auth.setConfig({
  app: "expense-tracker",
  accessToken: {
    jwtPrivateKeyParam: "",
    jwtPublicKey: "",
    lifetime: Duration.days(1),
  },
  exchange: {
    secretParam: "/expense-tracker/app-secret",
    verifyEndpoint: config.baseUrl + "/api/v1/auth/verify",
  },
  refreshToken: {
    lifetime: Duration.years(1),
  },
});
