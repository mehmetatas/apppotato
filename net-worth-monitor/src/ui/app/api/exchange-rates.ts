import { cache } from "@broccoliapps/browser";
import { getExchangeRates as getExchangeRatesApi } from "../../../shared/api-contracts";
import { CACHE_CONFIG } from "./cache-config";
import { CACHE_KEYS } from "./cache-keys";

type ExchangeRatesResponse = Awaited<ReturnType<typeof getExchangeRatesApi.invoke>>;

const opts = { storage: CACHE_CONFIG.storage };

export const getExchangeRates = async (
  fromCurrency: string,
  toCurrency: string,
  after: string
): Promise<ExchangeRatesResponse> => {
  const cacheKey = CACHE_KEYS.exchangeRates(fromCurrency, toCurrency, after);
  const cached = cache.get<ExchangeRatesResponse>(cacheKey, opts);
  if (cached) {return cached;}

  const data = await getExchangeRatesApi.invoke({ fromCurrency, toCurrency, after });
  cache.set(cacheKey, data, undefined, opts);
  return data;
};
