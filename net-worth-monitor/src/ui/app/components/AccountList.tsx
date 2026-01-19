import { route } from "preact-router";
import type { Account } from "../../../db/accounts";
import { AccountCard } from "./AccountCard";

type AccountListProps = {
  title: string;
  accounts: Account[];
  latestValues: Record<string, number>;
  accountHistories: Record<string, Record<string, number>>;
};

export const AccountList = ({ title, accounts, latestValues, accountHistories }: AccountListProps) => {
  if (accounts.length === 0) {
    return null;
  }

  // Sort by latest value descending
  const sortedAccounts = [...accounts].sort((a, b) => {
    const valueA = latestValues[a.id] ?? 0;
    const valueB = latestValues[b.id] ?? 0;
    return valueB - valueA;
  });

  return (
    <div>
      <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        {title}
      </h2>
      <div class="space-y-3">
        {sortedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            latestValue={latestValues[account.id]}
            onClick={() => route(`/app/accounts/${account.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
