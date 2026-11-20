"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileDown,
  FileUp,
  FolderDown,
  Loader2,
  Share,
  Zap,
} from "lucide-react";

interface DownloadMenuProps {
  onDownload: () => Promise<void>;
  onSaveAs: () => Promise<void>;
  onCopy: () => Promise<void>;
  onExportJson: () => Promise<void>;
  onImportJson: (file: File) => Promise<void>;
}

export function DownloadMenu({
  onDownload,
  onSaveAs,
  onCopy,
  onExportJson,
  onImportJson,
}: DownloadMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // capture phase, because the navbar stops mousedown from bubbling
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler, true);
    return () => window.removeEventListener("mousedown", handler, true);
  }, [open]);

  const run = async (action: () => Promise<void>, isCopy = false) => {
    setBusy(true);
    try {
      await action();
      if (isCopy) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const item =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-text-white transition-colors hover:bg-secondary-hover active:bg-secondary-hover disabled:opacity-50 md:gap-2 md:rounded-lg md:px-3 md:py-2 md:text-sm";

  return (
    <div ref={ref} className="relative">
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={importInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) run(() => onImportJson(file));
          e.target.value = "";
        }}
      />

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-2xl bg-secondary px-3 py-2 text-sm font-medium text-brand-cyan transition-all hover:bg-secondary-hover active:scale-95 lg:px-4"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share className="h-4 w-4" />
        )}
        <span>{copied ? "Copied!" : "Share"}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-2xl bg-secondary p-1.5 shadow-2xl md:w-48 md:rounded-xl md:p-1">
          <button disabled={busy} className={item} onClick={() => run(onDownload)}>
            <Download className="size-5 text-brand-cyan md:size-4" /> Download
          </button>
          <button disabled={busy} className={item} onClick={() => run(onSaveAs)}>
            <FolderDown className="size-5 text-brand-cyan md:size-4" /> Save as...
          </button>
          <button disabled={busy} className={item} onClick={() => run(onCopy, true)}>
            <Copy className="size-4 text-brand-cyan" /> Copy image
          </button>

          <button disabled={busy} className={item} onClick={() => importInputRef.current?.click()}>
            <FileUp className="size-5 text-brand-pink md:size-4" /> Import JSON
          </button>
          <button disabled={busy} className={item} onClick={() => run(onExportJson)}>
            <FileDown className="size-5 text-brand-pink md:size-4" /> Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
