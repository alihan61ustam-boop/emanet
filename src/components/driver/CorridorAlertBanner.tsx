import React from 'react';
import { BellRing, ArrowRight, PackageCheck, Sparkles } from 'lucide-react';
import { SenderPackage } from '../../types';

interface CorridorAlertBannerProps {
  matchingPackages: SenderPackage[];
  onReviewPackages: () => void;
}

export const CorridorAlertBanner: React.FC<CorridorAlertBannerProps> = ({
  matchingPackages,
  onReviewPackages
}) => {
  const count = matchingPackages.length;
  if (count === 0) return null;

  const totalPotentialEarnings = matchingPackages.reduce((acc, p) => acc + p.driverPayout, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 p-5 shadow-xl shadow-emerald-950/40 animate-in fade-in duration-300">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>30 KM Koridor Eşleşmesi</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Anlık Sistem Taraması</span>
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              Rotanız üzerinde taşınmayı bekleyen <span className="text-emerald-400 underline decoration-emerald-500/50 font-extrabold">{count} adet kargo</span> var!
            </h3>

            <p className="text-xs text-slate-300">
              Yolunuzu değiştirmeden güzergahınız üstündeki paketleri bagajınıza ekleyerek yaklaşık <strong className="text-emerald-300 font-semibold">{totalPotentialEarnings} TL</strong> ek gelir sağlayabilirsiniz.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReviewPackages}
          className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 shrink-0"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Kargoları İncele & Ekle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
