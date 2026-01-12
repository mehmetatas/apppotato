import { serve } from "@broccoliapps/framework-dev-tools";
import { api } from "../../src/api/lambda";
import { page } from "../../src/ui/server/lambda";

serve({
  port: 3000,
  routes: {
    "/api/*": api,
    "/health/*": api,
    "*": page,
  },
});
