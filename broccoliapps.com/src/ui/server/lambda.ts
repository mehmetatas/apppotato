import { PageRouter } from "@broccoliapps/backend/http/page";

export const page = new PageRouter();

// Import page handlers - they self-register routes on page
import("./pages");

export const handler = page.lambdaHandler();
