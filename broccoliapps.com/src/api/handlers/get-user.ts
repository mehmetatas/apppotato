import { api } from "../lambda";
import { getUser } from "../../shared/api-contracts";

api.register(getUser, async (req, res) => {
  // TODO: fetch from database
  return res.ok({
    id: req.id,
    name: "Alice",
    email: "alice@example.com",
  });
});
