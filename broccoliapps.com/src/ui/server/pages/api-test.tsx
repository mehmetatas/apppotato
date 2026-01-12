import { ApiTestPage } from "../../client/pages/ApiTestPage";
import { page } from "../lambda";
import { render } from "../page-response";

page.handle("/api-test", async () => {
  return render(<ApiTestPage />).withOptions({ title: "API Test" });
});
