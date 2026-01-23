import { cache } from "@broccoliapps/browser";
import { CACHE_CONFIG } from "./cache-config";
import { CACHE_KEYS, CACHE_PREFIXES } from "./cache-keys";

const opts = { storage: CACHE_CONFIG.storage };

// Invalidate all account-related caches and dashboard
export const invalidateAccounts = () => {
  cache.removeByPrefix(CACHE_PREFIXES.accounts, opts);
  cache.remove(CACHE_KEYS.dashboard, opts);
};

// Invalidate a specific account and related caches
export const invalidateAccount = (id: string) => {
  cache.remove(CACHE_KEYS.accountDetail(id), opts);
  cache.remove(CACHE_KEYS.accountHistory(id), opts);
  cache.remove(CACHE_KEYS.accountBuckets(id), opts);
  cache.remove(CACHE_KEYS.accounts, opts);
  cache.remove(CACHE_KEYS.dashboard, opts);
};

// Invalidate all bucket-related caches and dashboard
export const invalidateBuckets = () => {
  cache.removeByPrefix(CACHE_PREFIXES.buckets, opts);
  cache.remove(CACHE_KEYS.dashboard, opts);
};

// Invalidate a specific bucket and related caches
export const invalidateBucket = (id: string) => {
  cache.remove(CACHE_KEYS.bucketAccounts(id), opts);
  cache.remove(CACHE_KEYS.buckets, opts);
  cache.remove(CACHE_KEYS.dashboard, opts);
};

// Invalidate account-bucket associations (affects both sides)
export const invalidateAccountBuckets = (accountId: string) => {
  cache.remove(CACHE_KEYS.accountDetail(accountId), opts);
  cache.remove(CACHE_KEYS.accountBuckets(accountId), opts);
  cache.removeByPrefix(CACHE_PREFIXES.buckets, opts);
  cache.remove(CACHE_KEYS.dashboard, opts);
};

// Invalidate bucket-account associations (affects both sides)
export const invalidateBucketAccounts = (bucketId: string, affectedAccountIds?: string[]) => {
  cache.remove(CACHE_KEYS.bucketAccounts(bucketId), opts);
  if (affectedAccountIds) {
    for (const accountId of affectedAccountIds) {
      cache.remove(CACHE_KEYS.accountDetail(accountId), opts);
      cache.remove(CACHE_KEYS.accountBuckets(accountId), opts);
    }
  }
  cache.remove(CACHE_KEYS.dashboard, opts);
};

// Clear all net-worth-monitor caches
export const invalidateAll = () => {
  cache.removeByPrefix(CACHE_PREFIXES.all, opts);
};
