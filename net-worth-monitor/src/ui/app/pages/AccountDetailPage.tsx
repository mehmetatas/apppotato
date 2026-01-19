import { ArrowLeft, Check, CreditCard, Loader2, Pencil, TrendingUp, X } from "lucide-preact";
import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import type { Account, HistoryItem } from "../../../db/accounts";
import { deleteAccount, getAccount, getAccountHistory, patchAccount, putAccountHistory } from "../../../shared/api-contracts";
import { Button, HistoryEditor, Modal, PageHeader, ValueChart } from "../components";
import { AppLink } from "../SpaApp";

type AccountDetailPageProps = {
  id?: string;
};

export const AccountDetailPage = ({ id }: AccountDetailPageProps) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<Pick<HistoryItem, "month" | "value">[]>([]);
  const [editedHistory, setEditedHistory] = useState<Record<string, number | undefined>>({});
  const [originalHistory, setOriginalHistory] = useState<Record<string, number>>({});
  const [savingMonths, setSavingMonths] = useState<Record<string, boolean>>({});
  const [savedMonths, setSavedMonths] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedImportData, setParsedImportData] = useState<{ month: string; value: number }[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [accountResult, historyResult] = await Promise.all([
          getAccount.invoke({ id }),
          getAccountHistory.invoke({ id }),
        ]);
        setAccount(accountResult);
        setHistoryItems(historyResult);

        // Convert history items to a map for editing
        const historyMap: Record<string, number> = {};
        for (const item of historyResult) {
          historyMap[item.month] = item.value;
        }
        setOriginalHistory(historyMap);
        setEditedHistory({ ...historyMap });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleHistoryChange = (month: string, value: number | undefined) => {
    setEditedHistory((prev) => ({ ...prev, [month]: value }));
  };

  const handleBlur = async (month: string) => {
    if (!account) return;

    const currentValue = editedHistory[month];
    const originalValue = originalHistory[month];

    // Check if value changed
    if (currentValue === originalValue) return;
    if (currentValue === undefined && originalValue === undefined) return;

    setSavingMonths((prev) => ({ ...prev, [month]: true }));

    try {
      // Build full items array for API
      const items: { month: string; value: number }[] = [];
      for (const [m, v] of Object.entries(editedHistory)) {
        if (v !== undefined) {
          items.push({ month: m, value: v });
        }
      }

      const updatedItems = await putAccountHistory.invoke({
        id: account.id,
        items,
      });

      // Update original history
      const historyMap: Record<string, number> = {};
      for (const item of updatedItems) {
        historyMap[item.month] = item.value;
      }
      setOriginalHistory(historyMap);
      setHistoryItems(updatedItems);

      // Show saved indicator
      setSavingMonths((prev) => ({ ...prev, [month]: false }));
      setSavedMonths((prev) => ({ ...prev, [month]: true }));

      // Hide saved indicator after 3 seconds
      setTimeout(() => {
        setSavedMonths((prev) => ({ ...prev, [month]: false }));
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
      setSavingMonths((prev) => ({ ...prev, [month]: false }));
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    setDeleting(true);
    try {
      await deleteAccount.invoke({ id: account.id });
      route("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStartEditName = () => {
    if (!account) return;
    setEditedName(account.name);
    setEditingName(true);
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (!account || !editedName.trim()) return;

    setSavingName(true);
    try {
      const updated = await patchAccount.invoke({ id: account.id, name: editedName.trim() });
      setAccount(updated);
      setEditingName(false);
      setEditedName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const isHeaderRow = (line: string): boolean => {
    const lower = line.toLowerCase();
    const headerWords = ["month", "date", "value", "amount", "balance"];
    return headerWords.some((word) => lower.includes(word));
  };

  const parseImportData = (
    data: string
  ): { success: true; items: { month: string; value: number }[] } | { success: false; error: string } => {
    const lines = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return { success: false, error: "No data provided" };
    }

    const items: { month: string; value: number }[] = [];
    const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
    let startIndex = 0;

    // Check if first line is a header
    if (lines[0] && isHeaderRow(lines[0])) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]!;
      const lineNumber = i + 1;

      // Split by comma, handling potential whitespace
      const parts = line.split(",").map((p) => p.trim());

      if (parts.length !== 2) {
        return {
          success: false,
          error: `Line ${lineNumber}: Expected format "yyyy-mm,value", got "${line}"`,
        };
      }

      const [monthStr, valueStr] = parts;

      if (!monthStr || !monthPattern.test(monthStr)) {
        return {
          success: false,
          error: `Line ${lineNumber}: Invalid month format "${monthStr}". Expected yyyy-mm (e.g., 2024-01)`,
        };
      }

      const value = parseFloat(valueStr!);
      if (isNaN(value)) {
        return {
          success: false,
          error: `Line ${lineNumber}: Invalid value "${valueStr}". Expected a number`,
        };
      }

      items.push({ month: monthStr, value });
    }

    if (items.length === 0) {
      return { success: false, error: "No valid data rows found" };
    }

    return { success: true, items };
  };

  const handleImport = () => {
    setImportError(null);

    const result = parseImportData(importData);
    if (!result.success) {
      setImportError(result.error);
      return;
    }

    setParsedImportData(result.items);
    setShowImportConfirmModal(true);
  };

  const handleConfirmImport = async () => {
    if (!account) return;

    setImporting(true);
    try {
      // Merge parsed data with existing history
      const mergedHistory = { ...editedHistory };
      for (const item of parsedImportData) {
        mergedHistory[item.month] = item.value;
      }

      // Build items array for API
      const items: { month: string; value: number }[] = [];
      for (const [month, value] of Object.entries(mergedHistory)) {
        if (value !== undefined) {
          items.push({ month, value });
        }
      }

      const updatedItems = await putAccountHistory.invoke({
        id: account.id,
        items,
      });

      // Update state
      const historyMap: Record<string, number> = {};
      for (const item of updatedItems) {
        historyMap[item.month] = item.value;
      }
      setOriginalHistory(historyMap);
      setEditedHistory({ ...historyMap });
      setHistoryItems(updatedItems);

      // Close modals and reset
      setShowImportConfirmModal(false);
      setShowImportModal(false);
      setImportData("");
      setParsedImportData([]);
      setImportError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import history");
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportData("");
    setImportError(null);
    setParsedImportData([]);
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." backHref="/" />
        <p class="text-neutral-500 dark:text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div>
        <PageHeader title="Error" backHref="/" />
        <p class="text-red-600 dark:text-red-400">{error || "Not found"}</p>
      </div>
    );
  }

  return (
    <div>
      <div class="flex items-center gap-3 mb-6">
        <AppLink
          href="/"
          class="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </AppLink>
        <div class={`p-2 rounded-lg ${account.type === "asset"
          ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
          : "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
          }`}>
          {account.type === "asset" ? <TrendingUp size={24} /> : <CreditCard size={24} />}
        </div>
        <div class="flex-1">
          {editingName ? (
            <div class="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onInput={(e) => setEditedName((e.target as HTMLInputElement).value)}
                class="flex-1 text-2xl font-bold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEditName();
                }}
              />
              {savingName ? (
                <span class="p-2 text-neutral-500">
                  <Loader2 size={20} class="animate-spin" />
                </span>
              ) : (
                <>
                  <button
                    onClick={handleSaveName}
                    class="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    class="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {account.name}
              </h1>
              <button
                onClick={handleStartEditName}
                class="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <Pencil size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div class="space-y-6">
        <div>
          {(() => {
            const latestMonth = Object.entries(editedHistory)
              .filter(([, v]) => v !== undefined)
              .sort(([a], [b]) => b.localeCompare(a))[0];
            const latestValue = latestMonth?.[1];
            return latestValue !== undefined ? (
              <div class="mb-4">
                <span class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                  ${latestValue.toLocaleString()}
                </span>
              </div>
            ) : null;
          })()}
          <ValueChart data={editedHistory} variant={account.type === "debt" ? "negative" : "default"} />
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Value History
            </h2>
            <button
              onClick={() => setShowImportModal(true)}
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
            >
              Import
            </button>
          </div>

          <HistoryEditor
            history={editedHistory}
            onChange={handleHistoryChange}
            onBlur={handleBlur}
            currency={account.currency}
            savingMonths={savingMonths}
            savedMonths={savedMonths}
          />
        </div>

        <div class="pt-12 text-center">
          <button
            onClick={() => setShowDeleteModal(true)}
            class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm hover:underline"
          >
            Delete {account.type === "asset" ? "Asset" : "Debt"}
          </button>
        </div>
      </div>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Delete {account.type === "asset" ? "Asset" : "Debt"}
        </h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">
          Are you sure you want to delete this {account.type === "asset" ? "asset" : "debt"}? This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            class="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            class="flex-1"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      <Modal open={showImportModal} onClose={handleCloseImportModal}>
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Import Value History
        </h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">
          Paste your data with one entry per line:
        </p>
        <textarea
          value={importData}
          onInput={(e) => {
            setImportData((e.target as HTMLTextAreaElement).value);
            setImportError(null);
          }}
          placeholder={`2024-01,15000\n2024-02,15500\n2024-03,16000`}
          class="w-full h-40 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
        />
        {importError && (
          <p class="mt-2 text-sm text-red-600 dark:text-red-400">{importError}</p>
        )}
        <div class="flex gap-3 mt-6">
          <Button variant="secondary" onClick={handleCloseImportModal} class="flex-1">
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!importData.trim()} class="flex-1">
            Import
          </Button>
        </div>
      </Modal>

      <Modal
        open={showImportConfirmModal}
        onClose={() => setShowImportConfirmModal(false)}
      >
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Confirm Import
        </h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4">
          You are about to import <strong>{parsedImportData.length}</strong> value
          {parsedImportData.length === 1 ? "" : "s"}.
        </p>
        <p class="text-neutral-600 dark:text-neutral-400 mb-6">
          This will overwrite existing values for the imported months. Values for
          months not included in the import will be preserved.
        </p>
        <div class="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowImportConfirmModal(false)}
            class="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmImport} disabled={importing} class="flex-1">
            {importing ? "Importing..." : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
