// Cache key constants for net-worth-monitor
export const CACHE_KEYS = {
  dashboard: "nwm:dashboard",
  accounts: "nwm:accounts",
  accountDetail: (id: string) => `nwm:accounts:${id}:detail`,
  accountHistory: (id: string) => `nwm:accounts:${id}:history`,
  accountBuckets: (id: string) => `nwm:accounts:${id}:buckets`,
  buckets: "nwm:buckets",
  bucketAccounts: (id: string) => `nwm:buckets:${id}:accounts`,
  exchangeRates: (from: string, to: string, after: string) =>
    `nwm:exchange-rates:${from}:${to}:${after}`,
} as const;

// Prefixes for bulk invalidation
export const CACHE_PREFIXES = {
  accounts: "nwm:accounts",
  buckets: "nwm:buckets",
  all: "nwm:",
} as const;
