import { useEffect, useRef } from "preact/hooks";
import { MoneyInput } from "./MoneyInput";

type HistoryEditorProps = {
  history: Record<string, number | undefined>;
  onChange: (month: string, value: number | undefined) => void;
  onBlur?: (month: string) => void;
  currency?: string;
  savingMonths?: Record<string, boolean>;
  savedMonths?: Record<string, boolean>;
};

const formatMonth = (key: string): string => {
  const parts = key.split("-");
  const year = parts[0] ?? "2000";
  const month = parts[1] ?? "01";
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
  const monthStr = date.toLocaleDateString("en-US", { month: "short" });
  return `${year} ${monthStr}`;
};

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getPreviousMonth = (monthStr: string): string => {
  const parts = monthStr.split("-");
  const year = parseInt(parts[0] ?? "2000", 10);
  const month = parseInt(parts[1] ?? "01", 10);
  const date = new Date(year, month - 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const generateMonthRange = (startMonth: string, endMonth: string): string[] => {
  const months: string[] = [];
  let current = endMonth;

  while (current >= startMonth) {
    months.push(current);
    current = getPreviousMonth(current);
  }

  return months;
};

const getDisplayMonths = (
  history: Record<string, number | undefined>,
  currentMonth: string
): string[] => {
  const enteredMonths = Object.entries(history)
    .filter(([_, value]) => value !== undefined)
    .map(([month]) => month)
    .sort();

  const earliestEntered = enteredMonths[0];
  if (!earliestEntered) {
    return [currentMonth];
  }

  const startMonth = getPreviousMonth(earliestEntered);
  return generateMonthRange(startMonth, currentMonth);
};

export const HistoryEditor = ({
  history,
  onChange,
  onBlur,
  currency,
  savingMonths = {},
  savedMonths = {},
}: HistoryEditorProps) => {
  const currentMonth = getCurrentMonth();
  const sortedMonths = getDisplayMonths(history, currentMonth);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMonthCountRef = useRef(sortedMonths.length);

  useEffect(() => {
    if (sortedMonths.length > prevMonthCountRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    prevMonthCountRef.current = sortedMonths.length;
  }, [sortedMonths.length]);

  const getMonthStatus = (month: string): "saving" | "saved" | undefined => {
    if (savingMonths[month]) return "saving";
    if (savedMonths[month]) return "saved";
    return undefined;
  };

  return (
    <div
      ref={containerRef}
      class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 max-h-[50vh] min-h-48 overflow-y-auto"
    >
      <div class="space-y-3">
        {sortedMonths.map((month) => (
          <MoneyInput
            key={month}
            value={history[month]}
            onChange={(value) => onChange(month, value)}
            onBlur={onBlur ? () => onBlur(month) : undefined}
            status={getMonthStatus(month)}
            placeholder="Not set"
            prefix={formatMonth(month)}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
};
