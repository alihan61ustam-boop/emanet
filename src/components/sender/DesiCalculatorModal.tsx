import React, { useState } from 'react';
import { X, Calculator, Box, Check, HelpCircle } from 'lucide-react';
import { calculateDesiFromDimensions, PACKAGE_TYPE_CONFIGS } from '../../lib/pricing';
import { PackageType } from '../../types';

interface DesiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesi: (desi: number, packageType: PackageType) => void;
}

export const DesiCalculatorModal: React.FC<DesiCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectDesi
}) => {
  const [width, setWidth] = useState<number>(30);
  const [length, setLength] = useState<number>(40);
  const [height, setHeight] = useState<number>(25);

  if (!isOpen) return null;

  const calculatedDesi = calculateDesiFromDimensions(width, length, height);

  // Desiye göre en uygun paket tipini belirle
  let suggestedType: PackageType = 'orta';
  if (calculatedDesi <= 1) suggestedType = 'zarf_evrak';
  else if (calculatedDesi <= 3) suggestedType = 'kucuk';
  else if (calculatedDesi <= 10) suggestedType = 'orta';
  else suggestedType = 'buyuk';

  const handleApply = (desiVal: number, type: PackageType) => {
    onSelectDesi(desiVal, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9996] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Başlık */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Hacimsel Desi Hesaplayıcı
              </h3>
              <p className="text-xs text-slate-400">
                Formül: (En x Boy x Yükseklik) / 3000
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-6 space-y-6">
          {/* Ebat Girdileri */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">En (cm)</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={e => setWidth(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Boy (cm)</label>
              <input
                type="number"
                min="1"
                value={length}
                onChange={e => setLength(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Yükseklik (cm)</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={e => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hesaplanan Sonuç Kartı */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                Hesaplanan Hacimsel Desi
              </span>
              <div className="text-xs text-slate-400 font-mono">
                ({width} x {length} x {height}) / 3000 = {((width * length * height) / 3000).toFixed(1)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-amber-400 font-mono">
                {calculatedDesi} <span className="text-sm font-normal text-slate-300">Desi</span>
              </div>
            </div>
          </div>

          {/* Hazır Standart Ebatlar */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Veya Standart Paket Şablonu Seçin:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PACKAGE_TYPE_CONFIGS).map(cfg => (
                <button
                  key={cfg.type}
                  type="button"
                  onClick={() => handleApply(cfg.defaultDesi, cfg.type)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/5 hover:border-amber-500/40 text-left transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      {cfg.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {cfg.defaultDesi} Desi
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {cfg.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="p-5 border-t border-white/5 bg-slate-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => handleApply(calculatedDesi, suggestedType)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            <span>{calculatedDesi} Desi Olarak Uygula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
