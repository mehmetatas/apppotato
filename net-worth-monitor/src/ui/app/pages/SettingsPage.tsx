import { cache } from "@broccoliapps/browser";
import { useState } from "preact/hooks";
import type { AuthUserDto } from "../../../shared/api-contracts";
import { patchUser } from "../../../shared/api-contracts";
import { PageHeader, TargetCurrencySettings, ThemeSettings } from "../components";
import { type Theme, getStoredTheme } from "../utils/themeUtils";

export const SettingsPage = () => {
  const user = cache.get<AuthUserDto>("user");
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [currency, setCurrency] = useState(user?.targetCurrency || "USD");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    setSaving(true);
    setSaved(false);
    try {
      const { user: updatedUser } = await patchUser.invoke({ targetCurrency: newCurrency });
      cache.set("user", { ...user, targetCurrency: updatedUser.targetCurrency });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update currency:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    cache.remove("accessToken");
    cache.remove("refreshToken");
    cache.remove("user");
    window.location.href = "/";
  };

  return (
    <div>
      <PageHeader title="Settings" backHref="/" />
      <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        <ThemeSettings value={theme} onChange={setTheme} />
        <TargetCurrencySettings
          value={currency}
          onChange={handleCurrencyChange}
          saving={saving}
          saved={saved}
        />
      </div>

      <div class="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={handleSignOut}
          class="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};
