import * as v from "valibot";
import { verifyAuthorizationCode } from "../../../auth/cognito-server";
import { page } from "../lambda";

page
  .withRequest({
    code: v.string(),
  })
  .handle("/auth/callback", async (req, ctx) => {
    const codeVerifier = ctx.getCookie("pkce_code_verifier");

    if (!codeVerifier) {
      console.log("pkce_code_verifier cookie not found - auth session expired");
      return {
        status: 302,
        data: "",
        headers: { Location: "/?error=expired" },
      };
    }

    const result = await verifyAuthorizationCode(req.code, codeVerifier);

    if (!result.valid) {
      console.log("Failed to verify authorization code:", result.error);
      return {
        status: 302,
        data: "",
        headers: { Location: `/?error=${result.error}` },
      };
    }

    // Print the ID token payload to console
    console.log("ID Token received:", result.idToken);
    console.log("User info:", {
      userId: result.userId,
      email: result.email,
      name: result.name,
      provider: result.provider,
    });

    // Clean up PKCE cookie and redirect to home
    return {
      status: 302,
      data: "",
      headers: { Location: "/" },
      cookies: [
        {
          name: "pkce_code_verifier",
          value: "",
          maxAge: 0,
          path: "/",
          sameSite: "Lax",
          secure: true,
        },
      ],
    };
  });
