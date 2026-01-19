import { cache } from "@broccoliapps/browser";
import { route } from "preact-router";
import { useState } from "preact/hooks";
import type { AuthUser } from "../../../shared/api-contracts";
import { postAccount } from "../../../shared/api-contracts";
import { Button } from "./Button";
import { CurrencyPicker } from "./CurrencyPicker";
import { HistoryEditor } from "./HistoryEditor";
import { Input } from "./Input";
import { TypeToggle } from "./TypeToggle";
import { ValueChart } from "./ValueChart";

type NewAccountFormProps = {
  onSuccess?: () => void;
  onBack?: () => void;
};

export const NewAccountForm = ({ onSuccess, onBack }: NewAccountFormProps) => {
  const user = cache.get<AuthUser>("user");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<"asset" | "debt">("asset");
  const [currency, setCurrency] = useState(user?.targetCurrency || "USD");
  const [history, setHistory] = useState<Record<string, number | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHistoryChange = (month: string, value: number | undefined) => {
    setHistory((prev) => ({ ...prev, [month]: value }));
  };

  const hasAtLeastOneValue = Object.values(history).some((v) => v !== undefined);

  const handleNext = () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!hasAtLeastOneValue) {
      setError("Please enter at least one value");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const historyItems: { month: string; value: number }[] = [];
    for (const [month, value] of Object.entries(history)) {
      if (value !== undefined) {
        historyItems.push({ month, value });
      }
    }

    try {
      await postAccount.invoke({
        name: name.trim(),
        type,
        currency,
        historyItems,
      });
      if (onSuccess) {
        onSuccess();
      } else {
        route("/app");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {step === 2 && (
        <button
          type="button"
          onClick={handleBack}
          class="mb-4 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {step === 1 && (
        <div class="space-y-6">
          <Input
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g., Main Savings"
          />

          <TypeToggle value={type} onChange={setType} />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Currency
            </label>
            <CurrencyPicker value={currency} onChange={setCurrency} />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Currency and type cannot be changed after creation.
            </p>
          </div>

          {error && (
            <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button onClick={handleNext} class="w-full">
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div class="space-y-6">
          <ValueChart data={history} variant={type === "debt" ? "negative" : "default"} />
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Value History for {name}
              </label>
            </div>
            <HistoryEditor
              history={history}
              onChange={handleHistoryChange}
              currency={currency}
            />
            <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Enter at least 1 value. You can complete the history later.
            </p>
          </div>

          {error && (
            <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasAtLeastOneValue}
            class="w-full"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      )}
    </div>
  );
};
