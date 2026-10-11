import React from 'react';
import { ArrowRight, PackageCheck, AlertTriangle } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-xl bg-[#12141C] border border-[#FF4500]/50 p-5 shadow-2xl font-mono">
      {/* Sol İkaz Şeridi */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#FF4500]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 pl-2">
          <div className="w-10 h-10 rounded-lg bg-[#FF4500]/15 border border-[#FF4500]/30 flex items-center justify-center text-[#FF4500] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FF4500] text-black text-[10px] font-extrabold uppercase tracking-wider">
                YOL ÜSTÜ EŞLEŞMESİ
              </span>
              <span className="text-[11px] text-[#7A8094]">30 KM KORİDORUNDA BEKLEYEN TALEP</span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Rotanız üzerinde taşınmayı bekleyen <span className="text-[#CCFF00] font-black">{count} ADET KARGO</span> var!
            </h3>

            <p className="text-xs text-[#8A90A2]">
              Yolunuzu değiştirmeden yol üstünden teslim alarak yaklaşık <strong className="text-white">+{totalPotentialEarnings} TL</strong> net yakıt geliri sağlayabilirsiniz.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReviewPackages}
          className="px-5 py-2.5 rounded-lg bg-[#CCFF00] hover:bg-[#BBE800] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/20 shrink-0"
        >
          <PackageCheck className="w-4 h-4" />
          <span>KARGOLARI İNCELE & EKLE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
