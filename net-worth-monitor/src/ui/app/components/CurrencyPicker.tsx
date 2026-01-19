import { useEffect, useRef, useState } from "preact/hooks";

type CurrencyPickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN"];

export const CurrencyPicker = ({ value, onChange, placeholder = "Select currency" }: CurrencyPickerProps) => {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setCurrencies(Object.keys(data.rates).sort());
        }
      })
      .catch(() => setCurrencies(POPULAR_CURRENCIES))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCurrencies = currencies.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const sortedCurrencies = [
    ...POPULAR_CURRENCIES.filter((c) => filteredCurrencies.includes(c)),
    ...filteredCurrencies.filter((c) => !POPULAR_CURRENCIES.includes(c)),
  ];

  const handleSelect = (currency: string) => {
    onChange(currency);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} class="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        class="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors disabled:opacity-50"
      >
        <span class={value ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-500"}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div class="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          <div class="p-2 border-b border-neutral-200 dark:border-neutral-700">
            <input
              type="text"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Filter..."
              class="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              autoFocus
            />
          </div>
          <ul class="max-h-48 overflow-y-auto py-1">
            {sortedCurrencies.map((currency) => (
              <li key={currency}>
                <button
                  type="button"
                  onClick={() => handleSelect(currency)}
                  class={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${value === currency
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                      : "text-neutral-700 dark:text-neutral-300"
                    }`}
                >
                  {currency}
                </button>
              </li>
            ))}
            {sortedCurrencies.length === 0 && (
              <li class="px-4 py-2 text-sm text-neutral-400 dark:text-neutral-500">No currencies found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
