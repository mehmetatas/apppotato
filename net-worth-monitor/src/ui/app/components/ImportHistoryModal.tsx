import { useState } from "preact/hooks";
import { Button } from "./Button";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { Modal } from "./Modal";

type ParsedItem = { month: string; value: number };

type ImportHistoryModalProps = {
  open: boolean;
  onClose: () => void;
  onImport: (items: ParsedItem[]) => Promise<void>;
};

const isHeaderRow = (line: string): boolean => {
  const lower = line.toLowerCase();
  const headerWords = ["month", "date", "value", "amount", "balance"];
  return headerWords.some((word) => lower.includes(word));
};

const parseImportData = (
  data: string
): { success: true; items: ParsedItem[] } | { success: false; error: string } => {
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { success: false, error: "No data provided" };
  }

  const items: ParsedItem[] = [];
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

export const ImportHistoryModal = ({
  open,
  onClose,
  onImport,
}: ImportHistoryModalProps) => {
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleClose = () => {
    setImportData("");
    setImportError(null);
    setParsedData([]);
    setShowConfirm(false);
    onClose();
  };

  const handleParse = () => {
    setImportError(null);

    const result = parseImportData(importData);
    if (!result.success) {
      setImportError(result.error);
      return;
    }

    setParsedData(result.items);
    setShowConfirm(true);
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      await onImport(parsedData);
      handleClose();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import");
      setShowConfirm(false);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Modal open={open && !showConfirm} onClose={handleClose}>
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
          <Button variant="secondary" onClick={handleClose} class="flex-1">
            Cancel
          </Button>
          <Button onClick={handleParse} disabled={!importData.trim()} class="flex-1">
            Import
          </Button>
        </div>
      </Modal>

      <ConfirmActionModal
        open={open && showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmImport}
        title="Confirm Import"
        confirmText="Confirm"
        loading={importing}
      >
        <p class="mb-4">
          You are about to import <strong>{parsedData.length}</strong> value
          {parsedData.length === 1 ? "" : "s"}.
        </p>
        <p>
          This will overwrite existing values for the imported months. Values for
          months not included in the import will be preserved.
        </p>
      </ConfirmActionModal>
    </>
  );
};
