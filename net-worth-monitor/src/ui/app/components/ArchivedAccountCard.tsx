import { CreditCard, Wallet } from "lucide-preact";
import type { AccountDto } from "../../../shared/api-contracts/dto";
import { formatCurrency } from "../../../shared/currency";
import { AppLink } from "../SpaApp";

type ArchivedAccountCardProps = {
  account: AccountDto;
  maxValue: number;
};

export const ArchivedAccountCard = ({ account, maxValue }: ArchivedAccountCardProps) => {
  const isAsset = account.type === "asset";
  const Icon = isAsset ? Wallet : CreditCard;

  return (
    <AppLink
      href={`/accounts/${account.id}`}
      class="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
    >
      <div class={`p-2 rounded-lg ${isAsset ? "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400" : "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"}`}>
        <Icon size={20} />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {account.name}
        </p>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          Archived on {new Date(account.archivedAt!).toLocaleDateString()}
        </p>
      </div>
      <div class="text-right">
        <p class={`font-semibold ${isAsset ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
          {formatCurrency(maxValue, account.currency)}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {isAsset ? "peak value" : "paid off"}
        </p>
      </div>
    </AppLink>
  );
};
