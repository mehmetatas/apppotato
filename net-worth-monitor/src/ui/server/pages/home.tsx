import { HomePage } from "../../client/pages/HomePage";
import { page } from "../lambda";
import { render } from "../page-response";

page.handle("/", async () => {
  return render(<HomePage title="Net Worth Monitor" />).withOptions({
    title: "Net Worth Monitor",
    headers: { "Cache-Control": "public, max-age=86400" },
  });
});
