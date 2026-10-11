import React from 'react';
import { 
  Package, 
  MapPin, 
  KeyRound, 
  CheckCircle2, 
  Truck,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { SenderPackage, MatchAndEscrow } from '../../types';

interface SenderPackagesListProps {
  packages: SenderPackage[];
  matches: MatchAndEscrow[];
  onOpenPoolModal: () => void;
}

export const SenderPackagesList: React.FC<SenderPackagesListProps> = ({
  packages,
  matches,
  onOpenPoolModal
}) => {
  return (
    <div className="space-y-4">
      {/* Başlık & Eylem Çubuğu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D0F14] border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#CCFF00] tracking-widest uppercase bg-[#CCFF00]/10 px-2 py-0.5 border border-[#CCFF00]/30 rounded">
              MANIFEST HAVUZU
            </span>
            <span className="font-mono text-xs text-white/50">PARCEL QUEUE</span>
          </div>
          <h2 className="text-xl font-syne font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Kargo Taleplerim & Havuz Takibi</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-[#FF4500] font-bold">
              [{packages.length}]
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-grotesk">
            Güzergahından geçen sürücülerin eşleşmesini bekleyen koli ve emanetler
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPoolModal}
          className="px-5 py-3 rounded-lg bg-[#FF4500] hover:bg-[#e03d00] text-black font-syne font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,69,0,0.35)] shrink-0 active:translate-y-0.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>İlan Havuzuna Kargo Ekle</span>
        </button>
      </div>

      {/* Paket Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map(pkg => {
          const match = matches.find(m => m.packageId === pkg.id);
          const isMatched = !!match;

          let statusBadge = (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>HAVUZDA BEKLİYOR</span>
            </div>
          );

          if (pkg.status === 'matched') {
            statusBadge = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-[11px] font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>SÜRÜCÜ BULUNDU</span>
              </div>
            );
          } else if (pkg.status === 'in_transit') {
            statusBadge = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping"></span>
                <span>YOLDA (TAŞINIYOR)</span>
              </div>
            );
          } else if (pkg.status === 'delivered') {
            statusBadge = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>TESLİM EDİLDİ</span>
              </div>
            );
          }

          return (
            <div
              key={pkg.id}
              className="chamfer-card bg-[#0D0F14] border border-white/10 p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Üst Kimlik & Barkod Çizgisi */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500 tracking-wider">
                      PKG_WAYBILL #{pkg.id.slice(-6).toUpperCase()}
                    </div>
                    <h3 className="text-base font-syne font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                      {pkg.title}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5 font-grotesk">
                      Alıcı: <strong className="text-slate-200">{pkg.receiverName}</strong> ({pkg.receiverPhone})
                    </div>
                  </div>

                  {statusBadge}
                </div>

                {/* Güzergah Bagaj Şeridi */}
                <div className="p-3 rounded-lg bg-[#07080A] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                      {pkg.originCity}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                      {pkg.destinationCity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-slate-500">HACİM:</span>
                    <span className="px-2 py-0.5 rounded bg-[#FF4500]/15 text-[#FF4500] font-bold border border-[#FF4500]/30">
                      {pkg.desi} DESİ
                    </span>
                  </div>
                </div>

                {/* Fiyat Tasarrufu */}
                <div className="flex items-center justify-between pt-1 border-t border-dashed border-white/10 font-mono text-xs">
                  <div className="text-slate-400">
                    Normal Kargo: <span className="line-through text-slate-600 font-bold">{pkg.quotedMarketPrice} TL</span>
                  </div>
                  <div className="text-[#CCFF00] font-bold text-sm">
                    Emanet: <span className="text-base font-extrabold">{pkg.emanetPrice} TL</span>
                    <span className="ml-1 text-[11px] text-[#CCFF00]/80">(-{pkg.userSavings} TL)</span>
                  </div>
                </div>
              </div>

              {/* OTP Güvenlik Alanı (Eşleşme varsa) */}
              {isMatched && match && (
                <div className="mt-2 pt-3 border-t border-white/10 space-y-2">
                  <div className="p-3.5 rounded-lg bg-[#140E1B] border border-purple-500/40 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-syne font-bold text-purple-300">
                        <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                        <span>TESLİM ALMA KODU (PICKUP OTP)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-grotesk">
                        Sürücü kargoyu teslim alırken bu 4 haneli kodu iletiniz.
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded bg-purple-500/20 border-2 border-purple-400/60 font-mono text-xl font-extrabold text-white tracking-[0.25em] shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      {match.pickupOtp}
                    </div>
                  </div>

                  {match.trip && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                      <Truck className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>SÜRÜCÜ: <strong className="text-white">{match.trip.driverName}</strong> ({match.trip.vehicleInfo})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
