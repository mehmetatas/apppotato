import type { AccountDto } from "../../../shared/api-contracts/dto";
import { formatCurrency } from "../../../shared/currency";
import { AccountCard } from "./AccountCard";

type AccountListProps = {
  title: string;
  accounts: AccountDto[];
  latestValues: Record<string, number>;
  currency: string;
};

export const AccountList = ({ title, accounts, latestValues, currency }: AccountListProps) => {
  if (accounts.length === 0) {
    return null;
  }

  // Sort by latest value descending
  const sortedAccounts = [...accounts].sort((a, b) => {
    const valueA = latestValues[a.id] ?? 0;
    const valueB = latestValues[b.id] ?? 0;
    return valueB - valueA;
  });

  // Calculate total of shown accounts
  const total = accounts.reduce((sum, account) => sum + (latestValues[account.id] ?? 0), 0);

  return (
    <div>
      <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 mb-3">
        <h2 class="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
          {title}
        </h2>
        <span class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {formatCurrency(total, currency)}
        </span>
      </div>
      <div class="space-y-2">
        {sortedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            latestValue={latestValues[account.id]}
          />
        ))}
      </div>
    </div>
  );
};
