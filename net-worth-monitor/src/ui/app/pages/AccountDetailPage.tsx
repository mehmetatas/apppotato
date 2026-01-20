import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import type { Account, HistoryItem } from "../../../db/accounts";
import {
  deleteAccount,
  getAccount,
  getAccountBuckets,
  getAccountHistory,
  patchAccount,
  putAccountBuckets,
  putAccountHistory,
} from "../../../shared/api-contracts";
import {
  AccountDetailSkeleton,
  AccountHeader,
  BucketPicker,
  ConfirmActionModal,
  HistoryEditor,
  ImportHistoryModal,
  PageHeader,
  ValueChart,
} from "../components";
import { getCurrencySymbol } from "../currency";
import { useModal } from "../hooks";
import { getCurrentMonth } from "../utils/dateUtils";
import { historyMapToItems } from "../utils/historyUtils";

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

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Bucket picker
  const [accountBucketIds, setAccountBucketIds] = useState<Set<string>>(new Set());

  // Modals
  const deleteModal = useModal();
  const [deleting, setDeleting] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const closeDebtModal = useModal();
  const [closing, setClosing] = useState(false);

  const reopenDebtModal = useModal();
  const [reopening, setReopening] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [accountResult, historyResult, accountBucketsResult] = await Promise.all([
          getAccount.invoke({ id }),
          getAccountHistory.invoke({ id }),
          getAccountBuckets.invoke({ id }),
        ]);
        setAccount(accountResult);
        setHistoryItems(historyResult);
        setAccountBucketIds(new Set(accountBucketsResult.map((b) => b.id)));

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
      const items = historyMapToItems(editedHistory);
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
      deleteModal.close();
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

  const handleImport = async (items: { month: string; value: number }[]) => {
    if (!account) return;

    // Merge parsed data with existing history
    const mergedHistory = { ...editedHistory };
    for (const item of items) {
      mergedHistory[item.month] = item.value;
    }

    const historyItems = historyMapToItems(mergedHistory);
    const updatedItems = await putAccountHistory.invoke({
      id: account.id,
      items: historyItems,
    });

    // Update state
    const historyMap: Record<string, number> = {};
    for (const item of updatedItems) {
      historyMap[item.month] = item.value;
    }
    setOriginalHistory(historyMap);
    setEditedHistory({ ...historyMap });
    setHistoryItems(updatedItems);
  };

  const handleCloseDebt = async () => {
    if (!account) return;

    setClosing(true);
    try {
      const currentMonth = getCurrentMonth();

      // Set current month value to 0
      const updatedHistory = { ...editedHistory, [currentMonth]: 0 };
      const items = historyMapToItems(updatedHistory);

      const updatedItems = await putAccountHistory.invoke({
        id: account.id,
        items,
      });

      // Update history state
      const historyMap: Record<string, number> = {};
      for (const item of updatedItems) {
        historyMap[item.month] = item.value;
      }
      setOriginalHistory(historyMap);
      setEditedHistory({ ...historyMap });
      setHistoryItems(updatedItems);

      // Mark as closed
      const updated = await patchAccount.invoke({ id: account.id, closedAt: Date.now() });
      setAccount(updated);
      closeDebtModal.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close debt");
    } finally {
      setClosing(false);
    }
  };

  const handleReopenDebt = async () => {
    if (!account) return;

    setReopening(true);
    try {
      const updated = await patchAccount.invoke({ id: account.id, closedAt: null });
      setAccount(updated);
      reopenDebtModal.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reopen debt");
    } finally {
      setReopening(false);
    }
  };

  const handleBucketsChange = async (newBucketIds: Set<string>) => {
    if (!account) return;

    const previousBucketIds = accountBucketIds;
    setAccountBucketIds(newBucketIds);

    try {
      await putAccountBuckets.invoke({ id: account.id, bucketIds: Array.from(newBucketIds) });
    } catch (err) {
      setAccountBucketIds(previousBucketIds);
      setError(err instanceof Error ? err.message : "Failed to update buckets");
    }
  };

  if (loading) {
    return <AccountDetailSkeleton />;
  }

  if (error || !account) {
    return (
      <div>
        <PageHeader title="Error" backHref="/" />
        <p class="text-red-600 dark:text-red-400">{error || "Not found"}</p>
      </div>
    );
  }

  const latestMonth = Object.entries(editedHistory)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => b.localeCompare(a))[0];
  const latestValue = latestMonth?.[1] ?? 0;
  const isClosed = !!account.closedAt;
  const isDebt = account.type === "debt";
  const canClose = isDebt && !isClosed;
  const canReopen = isDebt && isClosed;

  return (
    <div>
      <AccountHeader
        account={account}
        isEditing={editingName}
        editedName={editedName}
        saving={savingName}
        onStartEdit={handleStartEditName}
        onCancelEdit={handleCancelEditName}
        onSave={handleSaveName}
        onNameChange={setEditedName}
      />

      <div class="space-y-6">
        <div>
          <div class="mb-4">
            <span class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              {getCurrencySymbol(account.currency)}{latestValue.toLocaleString()}
            </span>
            <span class="ml-2 text-lg text-neutral-500 dark:text-neutral-400">
              {account.currency}
            </span>
          </div>

          {isClosed && (
            <div class="mb-4 px-4 py-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-800 dark:text-green-200">
                This debt was closed on {new Date(account.closedAt!).toLocaleDateString()}
              </p>
            </div>
          )}

          <ValueChart
            data={editedHistory}
            variant={account.type === "debt" ? "negative" : "default"}
            currency={account.currency}
          />

          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Value History
            </h2>
            <div class="flex items-center gap-3">
              {canClose && (
                <button
                  onClick={() => closeDebtModal.open()}
                  class="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline"
                >
                  Close Debt
                </button>
              )}
              {canReopen && (
                <button
                  onClick={() => reopenDebtModal.open()}
                  class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                >
                  Reopen Debt
                </button>
              )}
              {!isClosed && (
                <button
                  onClick={() => setImportModalOpen(true)}
                  class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                >
                  Import
                </button>
              )}
            </div>
          </div>

          <HistoryEditor
            history={editedHistory}
            onChange={handleHistoryChange}
            onBlur={handleBlur}
            currency={account.currency}
            savingMonths={savingMonths}
            savedMonths={savedMonths}
            disabled={isClosed}
            updateFrequency={account.updateFrequency}
          />
        </div>

        <BucketPicker
          selectedBucketIds={accountBucketIds}
          onChange={handleBucketsChange}
        />

        <div class="pt-12 text-center">
          <button
            onClick={() => deleteModal.open()}
            class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm hover:underline"
          >
            Delete {account.type === "asset" ? "Asset" : "Debt"}
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmActionModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title={`Delete ${account.type === "asset" ? "Asset" : "Debt"}`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      >
        {isDebt && (
          <p class="mb-4">
            If you've paid off this debt, use "Close Debt" instead to hide it while preserving the history for net worth calculations.
          </p>
        )}
        <p class="mb-4">
          <strong>Warning:</strong> Deleting will remove all value history, which affects your historical net worth calculations.
        </p>
        <p>
          Are you sure you want to delete this {account.type === "asset" ? "asset" : "debt"}? This action cannot be undone.
        </p>
      </ConfirmActionModal>

      {/* Import Modal */}
      <ImportHistoryModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* Close Debt Modal */}
      <ConfirmActionModal
        open={closeDebtModal.isOpen}
        onClose={closeDebtModal.close}
        onConfirm={handleCloseDebt}
        title="Close Debt"
        confirmText="Close Debt"
        loading={closing}
      >
        <p class="mb-4">Congratulations on paying off this debt!</p>
        <p>
          This will set the current month's value to $0 and hide this debt from your home page and buckets while preserving all history for net worth calculations. You can reopen it anytime.
        </p>
      </ConfirmActionModal>

      {/* Reopen Debt Modal */}
      <ConfirmActionModal
        open={reopenDebtModal.isOpen}
        onClose={reopenDebtModal.close}
        onConfirm={handleReopenDebt}
        title="Reopen Debt"
        confirmText="Reopen Debt"
        loading={reopening}
      >
        <p>This will make the debt visible again on your home page and in buckets.</p>
      </ConfirmActionModal>
    </div>
  );
};
