import React from 'react';
import { ArrowDownRight, Tag } from 'lucide-react';

interface SavingsBadgeProps {
  marketPrice: number;
  emanetPrice: number;
  userSavings: number;
  discountRate?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const SavingsBadge: React.FC<SavingsBadgeProps> = ({
  marketPrice,
  emanetPrice,
  userSavings,
  discountRate = 25,
  size = 'md'
}) => {
  if (size === 'sm') {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#171922] border border-[#2A2E3D] text-xs font-mono">
        <span className="text-[#8A8F9E] line-through">{marketPrice} TL</span>
        <span className="text-[#FF4500] font-bold">{emanetPrice} TL</span>
        <span className="bg-[#FF4500]/15 text-[#FF6332] font-semibold px-1.5 py-0.5 rounded text-[10px]">
          -%{discountRate}
        </span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="relative p-5 rounded-xl bg-[#0F1117] border border-[#2A2E3D] shadow-2xl overflow-hidden chamfer-card">
        {/* Üst İnce Güvenlik Şeridi */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4500] via-[#FF7A00] to-[#CCFF00]" />
        
        {/* Sahte Barkod ve Manifest Kodu */}
        <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#262A38] text-[11px] font-mono text-[#8C92A4]">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#FF4500]" />
            <span className="font-bold tracking-wider text-white">TARİFE MANİFESTOSU</span>
            <span className="text-[#595E70]">#EMANET-NET-25</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 tracking-widest text-[#595E70] select-none text-[10px]">
            |||||| | ||| |||| || | |||||
          </div>
        </div>

        {/* Fiyat Karşılaştırması */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[#9DA2B4]">
              Standart Kargo Şirketleri
            </div>
            <div className="text-sm text-[#7D8294] font-mono">
              Piyasa Fiyatı: <span className="line-through text-white font-bold text-base">{marketPrice} TL</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-[#FF4500] font-bold block">
                ÖNERİLEN EMANET BEDELİ
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
                {emanetPrice} <span className="text-xl font-bold text-[#FF4500]">TL</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#FF4500] text-black font-extrabold font-mono text-xs shadow-lg shadow-[#FF4500]/25 whitespace-nowrap">
              -%{discountRate} İNDİRİM
            </div>
          </div>
        </div>

        {/* Perfore Çizgi ve Kazanç Özeti */}
        <div className="mt-4 pt-3 border-t border-dashed border-[#262A38] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#CCFF00]">
            <ArrowDownRight className="w-4 h-4" />
            <span className="font-bold tracking-wide">{userSavings} TL CEBİNİZDE KALIR</span>
          </div>
          <span className="text-[11px] text-[#6E7385]">
            Doğrudan sürücüyle paylaşım avantajı
          </span>
        </div>
      </div>
    );
  }

  // Default 'md'
  return (
    <div className="p-3.5 rounded-xl bg-[#0F1117] border border-[#2A2E3D] text-xs font-mono space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[#8C92A4]">
          Piyasa: <span className="line-through text-[#666B7D]">{marketPrice} TL</span>
        </span>
        <span className="text-white font-bold text-sm">
          Emanet: <span className="text-[#FF4500]">{emanetPrice} TL</span>
        </span>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#242735]">
        <span className="text-[#CCFF00] font-bold">
          +{userSavings} TL Tasarruf
        </span>
        <span className="text-[#FF4500] bg-[#FF4500]/15 px-1.5 py-0.5 rounded text-[10px] font-bold">
          -%{discountRate}
        </span>
      </div>
    </div>
  );
};
