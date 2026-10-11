import React, { useState } from 'react';
import { X, Calculator, Box, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9996] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg chamfer-card bg-[#0D0F14] border-2 border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">
        {/* Başlık */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12151C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4500] text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,69,0,0.35)]">
              <Calculator className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#FF4500] uppercase tracking-widest font-bold">
                  ÖLÇÜM & HACİM MATRİSİ
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                  DESI CALC
                </span>
              </div>
              <h3 className="text-base font-syne font-extrabold text-white tracking-tight">
                Hacimsel Desi Hesaplayıcı
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 font-mono"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-6 space-y-5">
          {/* Formül Bilgisi */}
          <div className="p-2.5 rounded bg-[#07080A] border border-white/10 flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span>FORMÜL: (EN x BOY x YÜKSEKLİK) / 3000</span>
            <span className="text-[#CCFF00]">STANDART KARGO NORMU</span>
          </div>

          {/* Ebat Girdileri */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">En (cm)</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={e => setWidth(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-center font-bold text-sm focus:border-[#FF4500] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Boy (cm)</label>
              <input
                type="number"
                min="1"
                value={length}
                onChange={e => setLength(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-center font-bold text-sm focus:border-[#FF4500] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Yükseklik (cm)</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={e => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white font-mono text-center font-bold text-sm focus:border-[#FF4500] focus:outline-none"
              />
            </div>
          </div>

          {/* Hesaplanan Sonuç Kartı */}
          <div className="p-4 rounded-xl bg-[#141009] border-2 border-[#FF4500]/50 flex items-center justify-between shadow-[0_4px_25px_rgba(255,69,0,0.15)]">
            <div className="space-y-1 font-mono">
              <span className="text-[10px] text-[#FF4500] font-bold uppercase tracking-widest bg-[#FF4500]/10 px-2 py-0.5 rounded border border-[#FF4500]/30">
                HESAPLANAN HACİM
              </span>
              <div className="text-xs text-slate-300">
                ({width} x {length} x {height}) / 3000 = <strong className="text-white">{((width * length * height) / 3000).toFixed(1)}</strong>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-syne font-extrabold text-[#CCFF00]">
                {calculatedDesi} <span className="text-xs font-mono font-normal text-slate-400">DESİ</span>
              </div>
            </div>
          </div>

          {/* Hazır Standart Ebatlar */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Veya Standart Şablon Seçin:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PACKAGE_TYPE_CONFIGS).map(cfg => (
                <button
                  key={cfg.type}
                  type="button"
                  onClick={() => handleApply(cfg.defaultDesi, cfg.type)}
                  className="p-3 rounded-lg bg-[#07080A] hover:bg-[#14161E] border border-white/10 hover:border-[#CCFF00]/50 text-left transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-syne font-bold text-white group-hover:text-[#CCFF00]">
                      {cfg.title}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-[#FF4500]">
                      {cfg.defaultDesi} DESİ
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-grotesk line-clamp-1">
                    {cfg.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="p-4 border-t border-white/10 bg-[#07080A] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => handleApply(calculatedDesi, suggestedType)}
            className="px-5 py-2.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-syne font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_4px_15px_rgba(204,255,0,0.3)] active:translate-y-0.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{calculatedDesi} Desi Olarak Uygula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
