import type { Account } from "../../../db/accounts";
import { generateMonthRangeAscending, getCurrentMonth, getNextMonth } from "./dateUtils";

type HistoryItem = { month: string; value: number };

/**
 * Convert an array of history items to a map (Record<string, number>)
 */
export const historyItemsToMap = (items: HistoryItem[]): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const item of items) {
    map[item.month] = item.value;
  }
  return map;
};

/**
 * Convert a history map to an array of history items
 */
export const historyMapToItems = (
  map: Record<string, number | undefined>
): HistoryItem[] => {
  const items: HistoryItem[] = [];
  for (const [month, value] of Object.entries(map)) {
    if (value !== undefined) {
      items.push({ month, value });
    }
  }
  return items;
};

/**
 * Fill missing months in history data with carry-forward values up to the current month
 */
export const fillToCurrentMonth = (
  data: Record<string, number | undefined>
): Record<string, number | undefined> => {
  // Get entries with defined values
  const entries = Object.entries(data).filter(
    (entry): entry is [string, number] => entry[1] !== undefined
  );

  if (entries.length === 0) {
    return data;
  }

  // Find earliest month from data
  const sortedMonths = entries.map(([m]) => m).sort((a, b) => a.localeCompare(b));
  const earliestMonth = sortedMonths[0]!;

  // Get current month
  const currentMonth = getCurrentMonth();

  // Generate all months from earliest to current
  const allMonths = generateMonthRangeAscending(earliestMonth, currentMonth);

  // Build filled data with carry-forward
  const filled: Record<string, number | undefined> = {};
  let lastKnownValue: number | undefined;

  for (const month of allMonths) {
    if (data[month] !== undefined) {
      lastKnownValue = data[month];
    }
    filled[month] = lastKnownValue;
  }

  return filled;
};

/**
 * Calculate net worth by month with carry-forward logic
 * Returns a Record<string, number> where keys are months and values are net worth
 */
export const calculateNetWorth = (
  accounts: Account[],
  accountHistories: Record<string, Record<string, number>>
): Record<string, number> => {
  const currentMonth = getCurrentMonth();

  // Find earliest month from all account histories
  let earliestMonth = currentMonth;
  for (const account of accounts) {
    const history = accountHistories[account.id];
    if (history) {
      for (const month of Object.keys(history)) {
        if (month < earliestMonth) {
          earliestMonth = month;
        }
      }
    }
  }

  // Generate all months from earliest to current
  const sortedMonths = generateMonthRangeAscending(earliestMonth, currentMonth);

  // Calculate net worth by month with carry-forward
  const netWorthByMonth: Record<string, number> = {};
  const lastKnownValue: Record<string, number> = {};

  for (const month of sortedMonths) {
    let total = 0;
    for (const account of accounts) {
      const history = accountHistories[account.id];
      if (history && history[month] !== undefined) {
        lastKnownValue[account.id] = history[month];
      }
      const value = lastKnownValue[account.id] ?? 0;
      if (account.type === "asset") {
        total += value;
      } else {
        total -= value;
      }
    }
    netWorthByMonth[month] = total;
  }

  return netWorthByMonth;
};

/**
 * Get the latest value from a history map
 */
export const getLatestValue = (
  history: Record<string, number | undefined>
): number | undefined => {
  const entries = Object.entries(history)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => b.localeCompare(a));

  return entries[0]?.[1];
};
