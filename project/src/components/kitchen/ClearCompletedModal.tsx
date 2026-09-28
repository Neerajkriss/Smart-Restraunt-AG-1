import React from 'react';
import { AlertTriangle, Archive, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ClearCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  completedCount: number;
  clearing: boolean;
}

export const ClearCompletedModal: React.FC<ClearCompletedModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  completedCount,
  clearing,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-stone-800">Clear Completed Orders?</h3>
        <p className="mt-2 text-sm text-stone-500">
          {completedCount} completed order{completedCount !== 1 ? 's' : ''} will be hidden
          from the kitchen board. Order records stay in the database for sales analytics.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={clearing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            Clear {completedCount}
          </button>
        </div>
      </div>
    </Modal>
  );
};
