import { UsersListPage } from "../../client/pages/UsersListPage";
import { page } from "../lambda";
import { render } from "../page-response";

page.handle("/users", async () => {
  // TODO: fetch from database
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  return render(<UsersListPage users={users} />).withOptions({
    title: "Users",
  });
});
