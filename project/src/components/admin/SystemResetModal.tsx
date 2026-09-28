import React, { useState } from 'react';
import { Archive, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: () => Promise<void>;
  onFullReset: () => Promise<void>;
  busy: null | 'archive' | 'full';
}

export const SystemResetModal: React.FC<SystemResetModalProps> = ({
  isOpen,
  onClose,
  onArchive,
  onFullReset,
  busy,
}) => {
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmFull, setConfirmFull] = useState(false);
  const [fullAck, setFullAck] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Reset & Archiving"
      subtitle="Manage live orders and database cleanup"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Option A — Soft Reset / Session Archive */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Archive className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-stone-800">Soft Reset — Session Archive</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Recommended for daily use
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                Marks all current orders as archived and clears active customer sessions. No
                records are deleted — sales summaries, revenue, and order counts continue to
                include these orders for accurate reporting.
              </p>
            </div>
          </div>

          {confirmArchive ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="flex-1 text-xs text-amber-700">
                Archive all live orders now? Active table sessions will reset.
              </span>
              <button
                onClick={() => setConfirmArchive(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={onArchive}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {busy === 'archive' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
                Archive Now
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmArchive(true)}
              disabled={busy !== null}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
            >
              <Archive className="h-3.5 w-3.5" />
              Run Soft Reset
            </button>
          )}
        </div>

        {/* Option B — Master Hard Wipe */}
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-stone-800">Hard Reset — Master Wipe</p>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  For testing / pre-demo only
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                Permanently deletes all order history and test records across every table. Active
                sessions are cleared instantly. Menu items and table setup are preserved.
              </p>
            </div>
          </div>

          {confirmFull ? (
            <div className="mt-3 space-y-2.5">
              <label className="flex items-center gap-2 text-xs text-red-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fullAck}
                  onChange={(e) => setFullAck(e.target.checked)}
                  className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-400"
                />
                I understand all orders will be permanently deleted from the database.
              </label>

              <div>
                <label className="block text-xs font-medium text-stone-600">
                  Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-1 w-full rounded-xl border border-red-300 px-3 py-2 text-xs font-mono text-stone-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setConfirmFull(false);
                    setFullAck(false);
                    setDeleteText('');
                  }}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={onFullReset}
                  disabled={!fullAck || deleteText !== 'DELETE' || busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === 'full' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Wipe All Orders
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmFull(true)}
              disabled={busy !== null}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Run Hard Reset
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
