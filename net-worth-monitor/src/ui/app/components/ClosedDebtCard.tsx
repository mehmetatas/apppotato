import { CreditCard } from "lucide-preact";
import type { Account } from "../../../db/accounts";
import { formatCurrency } from "../currency";
import { AppLink } from "../SpaApp";

type ClosedDebtCardProps = {
  debt: Account;
  maxValue: number;
};

export const ClosedDebtCard = ({ debt, maxValue }: ClosedDebtCardProps) => {
  return (
    <AppLink
      href={`/accounts/${debt.id}`}
      class="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
    >
      <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
        <CreditCard size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {debt.name}
        </p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          Closed on {new Date(debt.closedAt!).toLocaleDateString()}
        </p>
      </div>
      <div class="text-right">
        <p class="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(maxValue, debt.currency)}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">paid off</p>
      </div>
    </AppLink>
  );
};
