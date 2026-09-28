import React, { useState } from 'react';
import { CustomQRCode } from '../common/CustomQRCode';
import { RESTAURANT_CONFIG } from '../../config/restaurant.config';
import { Printer } from 'lucide-react';

export const TableQRGenerator: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<number>(1);

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://grand-bistro-app.vercel.app';

  const qrTargetUrl = `${origin}/menu?table=${selectedTable}`;

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-md">
      <h3 className="text-lg font-bold text-stone-800">Table Standee QR Generator</h3>
      <p className="mt-1 text-xs text-stone-500">
        Generate and print QR codes for customer self-ordering
      </p>

      <div className="my-5 flex items-center justify-center gap-3">
        <label htmlFor="table-select" className="text-sm font-semibold text-stone-700">
          Select Table:
        </label>
        <select
          id="table-select"
          value={selectedTable}
          onChange={(e) => setSelectedTable(Number(e.target.value))}
          className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 font-bold text-stone-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        >
          {RESTAURANT_CONFIG.tableNumbers.map((num) => (
            <option key={num} value={num}>
              Table {num}
            </option>
          ))}
        </select>
      </div>

      <div className="my-4 flex justify-center">
        <CustomQRCode
          value={qrTargetUrl}
          size={220}
          color="#1c1917"
          centerLabel={`T-${selectedTable}`}
        />
      </div>

      <p className="mt-2 text-xs text-stone-500">
        Encodes:{' '}
        <span className="break-all font-mono text-[11px] text-stone-700">{qrTargetUrl}</span>
      </p>

      <button
        onClick={() => window.print()}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.99]"
      >
        <Printer className="h-4 w-4" />
        Print Table Standee
      </button>
    </div>
  );
};
