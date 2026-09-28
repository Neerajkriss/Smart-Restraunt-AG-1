import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PinGateProps {
  correctPin: string;
  roleName: string;
  onSuccess: () => void;
}

export const PinGate: React.FC<PinGateProps> = ({ correctPin, roleName, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">{roleName} Access</h2>
        <p className="mt-1 text-sm text-stone-500">
          Please enter your 4-digit PIN to continue
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setError(false);
              setPin(e.target.value);
            }}
            placeholder="••••"
            autoFocus
            className={`w-36 rounded-xl border-2 px-3 py-2 text-center text-3xl font-mono tracking-[0.5em] outline-none transition ${
              error
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-stone-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100'
            }`}
          />
          {error && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              Incorrect PIN. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 active:scale-[0.99]"
          >
            Unlock Access
          </button>
        </form>
      </div>
    </div>
  );
};
