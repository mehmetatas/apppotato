import { NotFoundPage } from "../../client/pages/NotFoundPage";
import { page } from "../lambda";
import { render } from "../page-response";

page.notFound(async () => {
  return render(<NotFoundPage />).withOptions({
    title: "404 - Not Found",
    status: 404,
    skipLayout: true,
  });
});
