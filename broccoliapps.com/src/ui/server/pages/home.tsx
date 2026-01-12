import { HomePage } from "../../client/pages/HomePage";
import { page } from "../lambda";
import { render } from "../page-response";

page.handle("/", async () => {
  return render(<HomePage title="Welcome to BroccoliApps" />).withOptions({
    title: "Broccoli Apps",
    headers: { "Cache-Control": "public, max-age=86400" },
  });
});
