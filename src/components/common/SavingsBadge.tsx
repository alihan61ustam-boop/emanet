import React from 'react';
import { ArrowDownRight, Sparkles, TrendingDown } from 'lucide-react';

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
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs">
        <span className="text-slate-400 line-through">{marketPrice} TL</span>
        <span className="text-emerald-400 font-bold">{emanetPrice} TL</span>
        <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded text-[10px]">
          %{discountRate} İndirim
        </span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Emanet Fiyat Güvencesi</span>
            </div>
            <div className="text-sm text-slate-300">
              Standart Kargo Fiyatı: <span className="line-through text-slate-400 font-medium">{marketPrice} TL</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {emanetPrice} <span className="text-lg text-emerald-400 font-bold">TL</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>%{discountRate} Tasarruf</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            <strong className="text-emerald-300 font-semibold">{userSavings} TL Cebinizde Kalsın</strong>
          </span>
          <span className="text-[11px] text-slate-500">Piyasa bazlı dinamik tarife</span>
        </div>
      </div>
    );
  }

  // Default 'md'
  return (
    <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-400 text-xs">
          Standart Kargo: <span className="line-through text-slate-500">{marketPrice} TL</span>
        </span>
        <span className="text-emerald-400 font-bold">
          Emanet: {emanetPrice} TL
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-emerald-300/90 font-medium">
          {userSavings} TL Cebinizde Kalsın
        </span>
        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px] font-semibold">
          %{discountRate} Tasarruf
        </span>
      </div>
    </div>
  );
};
