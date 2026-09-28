import React, { useState } from 'react';
import { Modal } from './Modal';
import { Shield } from 'lucide-react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  getPin: (role: 'admin' | 'kitchen') => string;
  onUpdatePin: (role: 'admin' | 'kitchen', newPin: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  getPin,
  onUpdatePin,
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'kitchen'>('admin');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStoredPin = getPin(selectedRole);

    if (oldPin !== currentStoredPin) {
      setMessage({ text: 'Current PIN is incorrect.', isError: true });
      return;
    }

    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      setMessage({ text: 'New PIN must be exactly 4 digits.', isError: true });
      return;
    }

    if (newPin !== confirmPin) {
      setMessage({ text: 'New PIN and Confirm PIN do not match.', isError: true });
      return;
    }

    onUpdatePin(selectedRole, newPin);
    setMessage({ text: `${selectedRole.toUpperCase()} PIN updated successfully!`, isError: false });

    setOldPin('');
    setNewPin('');
    setConfirmPin('');

    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Security Settings"
      subtitle="Change role access PINs"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Select Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value as 'admin' | 'kitchen');
              setMessage(null);
            }}
            className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          >
            <option value="admin">Admin Portal PIN</option>
            <option value="kitchen">Kitchen View PIN</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Current PIN:
          </label>
          <input
            type="password"
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            placeholder="••••"
            required
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-mono"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            New 4-Digit PIN:
          </label>
          <input
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="••••"
            required
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-mono"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Confirm New PIN:
          </label>
          <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="••••"
            required
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-mono"
          />
        </div>

        {message && (
          <p
            className={`text-center text-xs font-medium ${message.isError ? 'text-red-500' : 'text-emerald-600'
              }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <Shield className="h-4 w-4" />
            Update PIN
          </button>
        </div>
      </form>
    </Modal>
  );
};
