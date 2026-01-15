import { HttpError } from "@broccoliapps/backend";
import * as v from "valibot";
import { AuthPage } from "../../client/pages/AuthPage";
import { page } from "../lambda";
import { render } from "../page-response";

page
  .withRequest({
    app: v.picklist(["expense-tracker"]),
    provider: v.picklist(["google"]),
  })
  .handle("/auth", async (req) => {
    if (Date.now() > -1) {
      throw new HttpError(401, "You are not authorized to see this page");
    }
    return render(<AuthPage app={req.app} provider={req.provider} />).withOptions({
      title: "Sign In",
      skipLayout: true,
    });
  });
