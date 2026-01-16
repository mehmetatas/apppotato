import { api } from "@broccoliapps/shared";

export const getHealth = api("GET", "/health").withResponse<{
  status: string;
  timestamp: string;
}>();
