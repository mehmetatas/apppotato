import { cache } from "@broccoliapps/browser";
import {
  deleteBucket as deleteBucketApi,
  getBucketAccounts as getBucketAccountsApi,
  getBuckets as getBucketsApi,
  patchBucket as patchBucketApi,
  postBucket as postBucketApi,
  putBucketAccounts as putBucketAccountsApi,
} from "../../../shared/api-contracts";
import { CACHE_CONFIG } from "./cache-config";
import { CACHE_KEYS } from "./cache-keys";
import { invalidateBucket, invalidateBucketAccounts, invalidateBuckets } from "./invalidation";

type BucketsResponse = Awaited<ReturnType<typeof getBucketsApi.invoke>>;
type BucketAccountsResponse = Awaited<ReturnType<typeof getBucketAccountsApi.invoke>>;

const opts = { storage: CACHE_CONFIG.storage };

// GET /buckets - list all buckets (cache-first)
export const getBuckets = async (): Promise<BucketsResponse> => {
  const cached = cache.get<BucketsResponse>(CACHE_KEYS.buckets, opts);
  if (cached) {return cached;}

  const data = await getBucketsApi.invoke();
  cache.set(CACHE_KEYS.buckets, data, undefined, opts);
  return data;
};

// GET /buckets/:id/accounts - get accounts in a bucket (cache-first)
export const getBucketAccounts = async (id: string): Promise<BucketAccountsResponse> => {
  const cached = cache.get<BucketAccountsResponse>(CACHE_KEYS.bucketAccounts(id), opts);
  if (cached) {return cached;}

  const data = await getBucketAccountsApi.invoke({ id });
  cache.set(CACHE_KEYS.bucketAccounts(id), data, undefined, opts);
  return data;
};

// POST /buckets - create bucket (invalidates caches)
export const postBucket = async (
  ...args: Parameters<typeof postBucketApi.invoke>
): Promise<Awaited<ReturnType<typeof postBucketApi.invoke>>> => {
  const result = await postBucketApi.invoke(...args);
  invalidateBuckets();
  return result;
};

// PATCH /buckets/:id - update bucket (invalidates caches)
export const patchBucket = async (
  ...args: Parameters<typeof patchBucketApi.invoke>
): Promise<Awaited<ReturnType<typeof patchBucketApi.invoke>>> => {
  const result = await patchBucketApi.invoke(...args);
  invalidateBucket(args[0]!.id);
  return result;
};

// DELETE /buckets/:id - delete bucket (invalidates caches)
export const deleteBucket = async (
  ...args: Parameters<typeof deleteBucketApi.invoke>
): Promise<void> => {
  await deleteBucketApi.invoke(...args);
  invalidateBuckets();
};

// PUT /buckets/:id/accounts - set accounts for bucket (invalidates caches)
export const putBucketAccounts = async (
  id: string,
  accountIds: string[],
  affectedAccountIds?: string[]
): Promise<void> => {
  await putBucketAccountsApi.invoke({ id, accountIds });
  invalidateBucketAccounts(id, affectedAccountIds);
};
