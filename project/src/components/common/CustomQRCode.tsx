import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface CustomQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  centerLabel?: string;
}

export const CustomQRCode: React.FC<CustomQRCodeProps> = ({
  value,
  size = 220,
  color = '#1c1917',
  bgColor = '#ffffff',
  centerLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: color,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('QR Code Generation Error:', error);
        }
      );
    }
  }, [value, size, color, bgColor]);

  return (
    <div className="relative inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white p-3 shadow-md">
      <canvas ref={canvasRef} className="rounded-lg" />
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-900 shadow-sm">
            {centerLabel}
          </span>
        </div>
      )}
    </div>
  );
};
