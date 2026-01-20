import { cache } from "@broccoliapps/browser";
import { route } from "preact-router";
import { useEffect, useMemo, useState } from "preact/hooks";
import type { Account } from "../../../db/accounts";
import type { Bucket } from "../../../db/buckets";
import type { AuthUser } from "../../../shared/api-contracts";
import { getAccountHistory, getAccounts, getBucketAccounts, getBuckets } from "../../../shared/api-contracts";
import { AccountList, BucketFilterPills, HomePageSkeleton, NewAccountForm, ValueChart } from "../components";
import { getCurrencySymbol } from "../currency";
import { calculateNetWorth, historyItemsToMap } from "../utils/historyUtils";

export const HomePage = () => {
  // Redirect to onboarding if user has no currency set
  const user = cache.get<AuthUser>("user");
  useEffect(() => {
    if (user && !user.targetCurrency) {
      route("/app/onboarding");
    }
  }, [user]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [latestValues, setLatestValues] = useState<Record<string, number>>({});
  const [accountHistories, setAccountHistories] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [accountsByBucket, setAccountsByBucket] = useState<Record<string, string[]>>({});
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null); // null = "Net Worth" (all accounts)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountList, bucketList] = await Promise.all([
          getAccounts.invoke({}),
          getBuckets.invoke(),
        ]);
        setAccounts(accountList);
        setBuckets(bucketList);

        // Fetch accounts for each bucket
        const bucketAccountsMap: Record<string, string[]> = {};
        await Promise.all(
          bucketList.map(async (bucket) => {
            const bucketAccounts = await getBucketAccounts.invoke({ id: bucket.id });
            bucketAccountsMap[bucket.id] = bucketAccounts.map((a) => a.id);
          })
        );
        setAccountsByBucket(bucketAccountsMap);

        // Fetch history for each account in parallel
        const historyPromises = accountList.map((acc) =>
          getAccountHistory.invoke({ id: acc.id }).then((items) => ({
            accountId: acc.id,
            items,
          }))
        );
        const histories = await Promise.all(historyPromises);

        // Extract latest value for each account
        const values: Record<string, number> = {};
        const accountValuesByMonth: Record<string, Record<string, number>> = {};

        for (const { accountId, items } of histories) {
          if (items.length > 0) {
            // Sort by month descending and get the latest
            const sorted = [...items].sort((a, b) => b.month.localeCompare(a.month));
            const latest = sorted[0];
            if (latest) {
              values[accountId] = latest.value;
            }
          }
          accountValuesByMonth[accountId] = historyItemsToMap(items);
        }
        setLatestValues(values);
        setAccountHistories(accountValuesByMonth);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter accounts based on selected bucket (hide closed accounts from display)
  const filteredAccounts = useMemo(() => {
    const openAccounts = accounts.filter((a) => !a.closedAt);
    if (selectedBucketId === null) {
      // "Net Worth" selected - show all open accounts
      return openAccounts;
    }
    const bucketAccountIds = accountsByBucket[selectedBucketId] || [];
    return openAccounts.filter((a) => bucketAccountIds.includes(a.id));
  }, [accounts, selectedBucketId, accountsByBucket]);

  // Calculate net worth data for filtered accounts
  const netWorthData = useMemo(() => {
    return calculateNetWorth(filteredAccounts, accountHistories);
  }, [filteredAccounts, accountHistories]);

  // Filtered latest values for display
  const filteredLatestValues = useMemo(() => {
    const result: Record<string, number> = {};
    for (const account of filteredAccounts) {
      const value = latestValues[account.id];
      if (value !== undefined) {
        result[account.id] = value;
      }
    }
    return result;
  }, [filteredAccounts, latestValues]);

  if (loading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return <p class="text-red-600 dark:text-red-400">{error}</p>;
  }

  if (accounts.length === 0) {
    return (
      <div>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
          No assets or debts yet. Add your first one to start tracking your net worth.
        </p>
        <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <NewAccountForm onSuccess={() => window.location.reload()} showBucketsPicker={false} />
        </div>
      </div>
    );
  }

  const hasFilteredAccounts = filteredAccounts.length > 0;
  const months = Object.keys(netWorthData).sort((a, b) => b.localeCompare(a));
  const latestMonth = months[0];
  const currentNetWorth = latestMonth ? (netWorthData[latestMonth] ?? 0) : 0;
  const isNegative = currentNetWorth < 0;

  return (
    <div>
      <BucketFilterPills
        buckets={buckets}
        selectedBucketId={selectedBucketId}
        onSelect={setSelectedBucketId}
      />

      <div class="mb-4">
        <span class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          {getCurrencySymbol(user?.targetCurrency || "USD")}{currentNetWorth.toLocaleString()}
        </span>
        <span class="ml-2 text-lg text-neutral-500 dark:text-neutral-400">
          {user?.targetCurrency || "USD"}
        </span>
      </div>

      <ValueChart
        data={hasFilteredAccounts ? netWorthData : {}}
        variant={isNegative ? "negative" : "default"}
        currency={user?.targetCurrency || "USD"}
      />

      {!hasFilteredAccounts && selectedBucketId !== null && (
        <p class="text-center text-neutral-500 dark:text-neutral-400 mb-6">
          No assets or debts in this bucket yet.
        </p>
      )}

      {filteredAccounts.length > 0 && (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AccountList
            title="Assets"
            accounts={filteredAccounts.filter((a) => a.type === "asset")}
            latestValues={filteredLatestValues}
            accountHistories={accountHistories}
          />
          <AccountList
            title="Debts"
            accounts={filteredAccounts.filter((a) => a.type === "debt")}
            latestValues={filteredLatestValues}
            accountHistories={accountHistories}
          />
        </div>
      )}
    </div>
  );
};
