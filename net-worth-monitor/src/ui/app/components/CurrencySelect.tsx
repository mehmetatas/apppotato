import { useEffect, useState } from "preact/hooks";

type CurrencySelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN"];

export const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setCurrencies(Object.keys(data.rates).sort());
        }
      })
      .catch(() => setError("Failed to load currencies"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCurrencies = currencies.filter((currency) =>
    currency.toLowerCase().includes(search.toLowerCase())
  );

  // Show popular currencies first, then the rest
  const sortedCurrencies = [
    ...POPULAR_CURRENCIES.filter((c) => filteredCurrencies.includes(c)),
    ...filteredCurrencies.filter((c) => !POPULAR_CURRENCIES.includes(c)),
  ];

  if (loading) {
    return (
      <div class="flex items-center justify-center py-8">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-indigo-600 dark:border-neutral-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
    );
  }

  return (
    <div class="flex flex-col gap-4">
      <input
        type="text"
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        placeholder="Search currencies..."
        class="px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
      />
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto">
        {sortedCurrencies.map((currency) => (
          <button
            key={currency}
            type="button"
            onClick={() => onChange(currency)}
            class={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${value === currency
              ? "bg-indigo-600 dark:bg-indigo-500 text-white"
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
          >
            {currency}
          </button>
        ))}
      </div>
    </div>
  );
};
