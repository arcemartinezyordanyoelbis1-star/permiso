import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureBase64: string) => void;
  initialSignature?: string;
  readOnly?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  initialSignature = '',
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(initialSignature));

  // Initialize or re-draw canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#1e3a8a'; // Blue ink style
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
      // only setup again if empty to prevent clearing active signature unexpectedly
      if (!hasSignature) setupCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas, hasSignature]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setHasSignature(true);
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange('');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/40 hover:bg-sky-50/60 transition-colors overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-36 touch-none ${readOnly ? 'cursor-not-allowed opacity-90' : 'cursor-crosshair'}`}
        />

        {!hasSignature && !readOnly && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 select-none">
            <span className="text-sm font-medium">Firme aquí con el dedo o el mouse</span>
            <span className="text-xs text-slate-400 mt-1">Trazo digital válido</span>
          </div>
        )}

        {hasSignature && !readOnly && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firma registrada</span>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="w-full flex justify-between items-center mt-2 px-1">
          <button
            type="button"
            onClick={clearSignature}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar / Volver a firmar</span>
          </button>
          <span className="text-[11px] text-slate-600 font-mono">
            {hasSignature ? 'Listo para enviar' : '* Firma obligatoria'}
          </span>
        </div>
      )}
    </div>
  );
};
