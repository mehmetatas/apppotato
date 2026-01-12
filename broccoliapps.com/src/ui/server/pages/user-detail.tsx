import * as v from "valibot";
import { UserDetailPage } from "../../client/pages/UserDetailPage";
import { page } from "../lambda";
import { render } from "../page-response";

page.withRequest({ id: v.string() }).handle("/users/:id", async (req) => {
  // TODO: fetch from database
  return render(
    <UserDetailPage id={req.id} name="Alice" email="alice@example.com" />
  ).withOptions({ title: "User Details" });
});
