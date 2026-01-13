import { serve } from "@broccoliapps/dev-tools";
import { api } from "../../src/api/lambda";
import { page } from "../../src/ui/server/lambda";

serve({
  port: 8080,
  routes: {
    "/api/*": api,
    "/health/*": api,
    "*": page,
  },
});
