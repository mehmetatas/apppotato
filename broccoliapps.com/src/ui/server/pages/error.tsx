import { ErrorPage } from "../../client/pages/ErrorPage";
import { page } from "../lambda";
import { render } from "../page-response";

page.onError(async (error) => {
  return render(<ErrorPage {...error} />).withOptions({
    title: `${error.status} - Error`,
    status: error.status,
    skipLayout: true,
  });
});
