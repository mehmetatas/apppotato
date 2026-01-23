import { cache } from "@broccoliapps/browser";
import {
  deleteAccount as deleteAccountApi,
  getAccountBuckets as getAccountBucketsApi,
  getAccountDetail as getAccountDetailApi,
  getAccountHistory as getAccountHistoryApi,
  getAccounts as getAccountsApi,
  patchAccount as patchAccountApi,
  postAccount as postAccountApi,
  putAccountBuckets as putAccountBucketsApi,
  putAccountHistory as putAccountHistoryApi,
} from "../../../shared/api-contracts";
import { CACHE_CONFIG } from "./cache-config";
import { CACHE_KEYS } from "./cache-keys";
import { invalidateAccount, invalidateAccountBuckets, invalidateAccounts } from "./invalidation";

type AccountsResponse = Awaited<ReturnType<typeof getAccountsApi.invoke>>;
type AccountDetailResponse = Awaited<ReturnType<typeof getAccountDetailApi.invoke>>;
type AccountHistoryResponse = Awaited<ReturnType<typeof getAccountHistoryApi.invoke>>;
type AccountBucketsResponse = Awaited<ReturnType<typeof getAccountBucketsApi.invoke>>;

const opts = { storage: CACHE_CONFIG.storage };

// GET /accounts - list all accounts (cache-first)
export const getAccounts = async (): Promise<AccountsResponse> => {
  const cached = cache.get<AccountsResponse>(CACHE_KEYS.accounts, opts);
  if (cached) {return cached;}

  const data = await getAccountsApi.invoke({});
  cache.set(CACHE_KEYS.accounts, data, undefined, opts);
  return data;
};

// GET /accounts/:id/detail - get account with all related data (cache-first)
export const getAccountDetail = async (id: string): Promise<AccountDetailResponse> => {
  const cached = cache.get<AccountDetailResponse>(CACHE_KEYS.accountDetail(id), opts);
  if (cached) {return cached;}

  const data = await getAccountDetailApi.invoke({ id });
  cache.set(CACHE_KEYS.accountDetail(id), data, undefined, opts);
  return data;
};

// GET /accounts/:id/history - get history items (cache-first)
export const getAccountHistory = async (id: string): Promise<AccountHistoryResponse> => {
  const cached = cache.get<AccountHistoryResponse>(CACHE_KEYS.accountHistory(id), opts);
  if (cached) {return cached;}

  const data = await getAccountHistoryApi.invoke({ id });
  cache.set(CACHE_KEYS.accountHistory(id), data, undefined, opts);
  return data;
};

// GET /accounts/:id/buckets - get buckets for an account (cache-first)
export const getAccountBuckets = async (id: string): Promise<AccountBucketsResponse> => {
  const cached = cache.get<AccountBucketsResponse>(CACHE_KEYS.accountBuckets(id), opts);
  if (cached) {return cached;}

  const data = await getAccountBucketsApi.invoke({ id });
  cache.set(CACHE_KEYS.accountBuckets(id), data, undefined, opts);
  return data;
};

// POST /accounts - create account (invalidates caches)
export const postAccount = async (
  ...args: Parameters<typeof postAccountApi.invoke>
): Promise<Awaited<ReturnType<typeof postAccountApi.invoke>>> => {
  const result = await postAccountApi.invoke(...args);
  invalidateAccounts();
  return result;
};

// PATCH /accounts/:id - update account (invalidates caches)
export const patchAccount = async (
  ...args: Parameters<typeof patchAccountApi.invoke>
): Promise<Awaited<ReturnType<typeof patchAccountApi.invoke>>> => {
  const result = await patchAccountApi.invoke(...args);
  invalidateAccount(args[0]!.id);
  return result;
};

// DELETE /accounts/:id - delete account (invalidates caches)
export const deleteAccount = async (
  ...args: Parameters<typeof deleteAccountApi.invoke>
): Promise<void> => {
  await deleteAccountApi.invoke(...args);
  invalidateAccounts();
};

// PUT /accounts/:id/history - update history (invalidates caches)
export const putAccountHistory = async (
  ...args: Parameters<typeof putAccountHistoryApi.invoke>
): Promise<Awaited<ReturnType<typeof putAccountHistoryApi.invoke>>> => {
  const result = await putAccountHistoryApi.invoke(...args);
  invalidateAccount(args[0]!.id);
  return result;
};

// PUT /accounts/:id/buckets - set buckets for account (invalidates caches)
export const putAccountBuckets = async (
  ...args: Parameters<typeof putAccountBucketsApi.invoke>
): Promise<void> => {
  await putAccountBucketsApi.invoke(...args);
  invalidateAccountBuckets(args[0]!.id);
};
