import { auth, HttpError } from "@broccoliapps/backend";
import { authCodes } from "@broccoliapps/backend/dist/db/schemas/broccoliapps";
import { isExpired } from "@broccoliapps/shared";
import { verifyAuthToken } from "../../../shared/api-contracts";
import { config } from "../../../shared/config";
import { api } from "../../lambda";

api.register(verifyAuthToken, async (req, res) => {
  const authCode = await authCodes.get({ code: req.code });

  if (!authCode || isExpired(authCode) || authCode.app !== req.app) {
    throw new HttpError(404, "Auth code not found");
  }

  const secretParam = `/broccoliapps-com${config.isProd ? "" : `-${config.env}`}/${req.app}-app-secret`;

  const isValid = await auth.verifyAuthCodeSignature(secretParam, req.code, req.signature);

  if (!isValid) {
    throw new HttpError(403, "Invalid exchange code signature");
  }

  await authCodes.delete(authCode);

  const { name, provider, email, userId } = authCode;
  return res.ok({ name, provider, email, userId });
});
