"use client";
import { useState } from "react";

const field =
  "w-full rounded-xl border-2 border-border-default bg-secondary px-3.5 py-2.5 text-sm text-text-white outline-none transition focus:border-brand-cyan/75";

type Status = { kind: "ok" | "err"; text: string } | null;

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pieces, setPieces] = useState(500);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  const base = () => (window.location.hostname === "localhost" ? "http://localhost:8787" : "");

  const send = async (path: string, body: object) => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${base()}/api/admin/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      if (res.ok) {
        setStatus({ kind: "ok", text: "Room updated successfully." });
      } else {
        setStatus({ kind: "err", text: `Error ${res.status}: ${text}` });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus({ kind: "err", text: `Failed: ${message}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary p-6 text-text-white sm:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-2xl border-2 border-border-default bg-primary/80 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-fredoka text-3xl text-brand-cyan sm:text-4xl">Puzzles Admin</h1>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-white/85">Admin Key</span>
          <input
            className={field}
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-text-white/85">Title</span>
            <input
              className={field}
              placeholder="Puzzle title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-text-white/85">Pieces</span>
            <input
              className={field}
              type="number"
              placeholder="500"
              value={pieces}
              onChange={(e) => setPieces(parseInt(e.target.value, 10) || 0)}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text-white/85">Image URL</span>
          <input
            className={field}
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <button
            disabled={busy || !adminKey || !imageUrl}
            onClick={() => send("update-puzzle", { title, imageUrl, pieces })}
            className="flex-1 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium whitespace-nowrap text-brand-pink transition hover:bg-secondary-hover disabled:opacity-50"
          >
            Update puzzle
          </button>

          <div className="flex gap-2">
            <button
              disabled={busy || !adminKey}
              onClick={() => send("set-closed", { closed: true })}
              className="rounded-full bg-secondary px-4 py-2.5 text-sm font-medium whitespace-nowrap text-red-400 transition hover:bg-secondary-hover disabled:opacity-50"
            >
              Close room
            </button>
            <button
              disabled={busy || !adminKey}
              onClick={() => send("set-closed", { closed: false })}
              className="rounded-full bg-secondary px-4 py-2.5 text-sm font-medium whitespace-nowrap text-brand-cyan transition hover:bg-secondary-hover disabled:opacity-50"
            >
              Open room
            </button>
          </div>
        </div>

        {status && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.kind === "ok"
                ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                : "border-red-400/40 bg-red-500/10 text-red-300"
            }`}
          >
            {status.text}
          </div>
        )}
      </div>
    </main>
  );
}
