import { cache } from "@broccoliapps/browser";
import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import type { Account } from "../../../db/accounts";
import type { AuthUser } from "../../../shared/api-contracts";
import { getAccountHistory, getAccounts } from "../../../shared/api-contracts";
import { AccountList, NewAccountForm, ValueChart } from "../components";

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
  const [netWorthData, setNetWorthData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountList = await getAccounts.invoke({});
        setAccounts(accountList);

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
        for (const { accountId, items } of histories) {
          if (items.length > 0) {
            // Sort by month descending and get the latest
            const sorted = [...items].sort((a, b) => b.month.localeCompare(a.month));
            const latest = sorted[0];
            if (latest) {
              values[accountId] = latest.value;
            }
          }
        }
        setLatestValues(values);

        // Calculate net worth by month (carry forward last known value for missing months)
        // Get current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Find earliest month from data
        let earliestMonth = currentMonth;
        for (const { items } of histories) {
          for (const item of items) {
            if (item.month < earliestMonth) {
              earliestMonth = item.month;
            }
          }
        }

        // Generate all months from earliest to current
        const sortedMonths: string[] = [];
        let iterMonth = earliestMonth;
        while (iterMonth <= currentMonth) {
          sortedMonths.push(iterMonth);
          const [year, month] = iterMonth.split("-").map(Number);
          const nextDate = new Date(year!, month!); // month is already 1-based, Date expects 0-based so this gives next month
          iterMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
        }

        // Build a map of account values by month (sorted ascending for carry-forward)
        const accountValuesByMonth: Record<string, Record<string, number>> = {};
        for (const { accountId, items } of histories) {
          const valueMap: Record<string, number> = {};
          const sortedItems = [...items].sort((a, b) => a.month.localeCompare(b.month));
          for (const item of sortedItems) {
            valueMap[item.month] = item.value;
          }
          accountValuesByMonth[accountId] = valueMap;
        }
        setAccountHistories(accountValuesByMonth);

        // Calculate net worth for each month, carrying forward values
        const netWorth: Record<string, number> = {};
        const lastKnownValue: Record<string, number> = {};

        for (const month of sortedMonths) {
          let monthNetWorth = 0;

          for (const { accountId } of histories) {
            const account = accountList.find((a) => a.id === accountId);
            if (!account) continue;

            const accountValues = accountValuesByMonth[accountId];
            if (accountValues && accountValues[month] !== undefined) {
              lastKnownValue[accountId] = accountValues[month];
            }

            const value = lastKnownValue[accountId];
            if (value !== undefined) {
              if (account.type === "asset") {
                monthNetWorth += value;
              } else {
                monthNetWorth -= value;
              }
            }
          }

          netWorth[month] = monthNetWorth;
        }
        setNetWorthData(netWorth);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* <PageHeader
        title="Net Worth Monitor"
        action={accounts.length > 0 ? { icon: "plus", href: "/new" } : undefined}
      /> */}

      {loading && (
        <p class="text-neutral-500 dark:text-neutral-400">Loading...</p>
      )}

      {error && (
        <p class="text-red-600 dark:text-red-400">{error}</p>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div>
          <p class="text-neutral-600 dark:text-neutral-400 mb-6 text-center">
            No assets or debts yet. Add your first one to start tracking your net worth.
          </p>
          <div class="max-w-xl mx-auto bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <NewAccountForm onSuccess={() => window.location.reload()} />
          </div>
        </div>
      )}

      {!loading && !error && accounts.length > 0 && (
        <>
          {(() => {
            const months = Object.keys(netWorthData).sort((a, b) => b.localeCompare(a));
            const latestMonth = months[0];
            const currentNetWorth = latestMonth ? (netWorthData[latestMonth] ?? 0) : 0;
            const isNegative = currentNetWorth < 0;
            return (
              <>
                <div class="mb-4">
                  <span class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                    ${currentNetWorth.toLocaleString()}
                  </span>
                </div>
                <ValueChart data={netWorthData} variant={isNegative ? "negative" : "default"} />
              </>
            );
          })()}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccountList
              title="Assets"
              accounts={accounts.filter((a) => a.type === "asset")}
              latestValues={latestValues}
              accountHistories={accountHistories}
            />
            <AccountList
              title="Debts"
              accounts={accounts.filter((a) => a.type === "debt")}
              latestValues={latestValues}
              accountHistories={accountHistories}
            />
          </div>
        </>
      )}
    </div>
  );
};
