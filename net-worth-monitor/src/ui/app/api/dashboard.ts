import { cache } from "@broccoliapps/browser";
import { getDashboard as getDashboardApi } from "../../../shared/api-contracts";
import { CACHE_CONFIG } from "./cache-config";
import { CACHE_KEYS } from "./cache-keys";

type DashboardResponse = Awaited<ReturnType<typeof getDashboardApi.invoke>>;

const opts = { storage: CACHE_CONFIG.storage };

export const getDashboard = async (): Promise<DashboardResponse> => {
  const cached = cache.get<DashboardResponse>(CACHE_KEYS.dashboard, opts);
  if (cached) {return cached;}

  const data = await getDashboardApi.invoke({});
  cache.set(CACHE_KEYS.dashboard, data, undefined, opts);
  return data;
};
