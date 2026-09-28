import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StatusProgressProps {
  status: string;
}

const STATUS_FLOW = [
  'Pending Payment',
  'Order Received',
  'Accepted',
  'Preparing',
  'Ready to Serve',
  'Completed',
];

export const StatusProgress: React.FC<StatusProgressProps> = ({ status }) => {
  const currentStep = STATUS_FLOW.indexOf(status);
  const steps = ['Received', 'Preparing', 'Ready', 'Served'];
  const stepMap: Record<number, number> = {
    0: -1, // Pending Payment
    1: 0,  // Order Received
    2: 0,  // Accepted
    3: 1,  // Preparing
    4: 2,  // Ready to Serve
    5: 3,  // Completed
  };
  const activeStep = stepMap[currentStep] ?? -1;

  return (
    <div className="mt-4 flex items-center justify-between">
      {steps.map((step, idx) => {
        const isComplete = activeStep >= idx;
        const isCurrent = activeStep === idx;
        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    activeStep >= idx ? 'bg-emerald-500' : 'bg-stone-200'
                  }`}
                />
              )}
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-200 text-stone-400'
                } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    activeStep > idx ? 'bg-emerald-500' : 'bg-stone-200'
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-1.5 text-[11px] font-medium ${
                isCurrent
                  ? 'text-emerald-600 font-semibold'
                  : isComplete
                  ? 'text-stone-700'
                  : 'text-stone-400'
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};
