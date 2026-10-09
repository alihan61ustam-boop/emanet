import React from 'react';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Truck,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Kargo Havuzu ve Gönderilerim</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {packages.length} Paket
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Bekleyen havuz talepleri, aktif taşınan emanetler ve teslimat OTP kodları
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPoolModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>İlan Havuzuna Yeni Kargo Bırak</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map(pkg => {
          // Bu pakete ait aktif eşleşmeyi bul
          const match = matches.find(m => m.packageId === pkg.id);
          const isMatched = !!match;

          let statusBadge = (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Havuzda Sürücü Bekliyor</span>
            </span>
          );

          if (pkg.status === 'matched') {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Sürücü Eşleşti (Teslim Alınacak)</span>
              </span>
            );
          } else if (pkg.status === 'in_transit') {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                <span>Yolda (Taşınıyor)</span>
              </span>
            );
          } else if (pkg.status === 'delivered') {
            statusBadge = (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teslim Edildi & Onaylandı</span>
              </span>
            );
          }

          return (
            <div
              key={pkg.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 space-y-4 hover:border-white/10 transition-all shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{pkg.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Gönderen: {pkg.senderName} • Alıcı: {pkg.receiverName} ({pkg.receiverPhone})
                    </div>
                  </div>

                  {statusBadge}
                </div>

                {/* Güzergah & Desi */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-white">{pkg.originCity}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-bold text-white">{pkg.destinationCity}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Hacim:</span>
                    <span className="font-mono font-bold text-amber-400">{pkg.desi} Desi</span>
                  </div>
                </div>

                {/* Fiyat Tasarrufu */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-slate-400">
                    Standart Piyasa: <span className="line-through text-slate-500">{pkg.quotedMarketPrice} TL</span>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">
                    Emanet: {pkg.emanetPrice} TL <span className="text-xs text-emerald-300/80 font-normal">({pkg.userSavings} TL Tasarruf)</span>
                  </div>
                </div>
              </div>

              {/* OTP ve Güvenlik Kutusu */}
              {isMatched && match && (
                <div className="mt-2 pt-3 border-t border-white/5 space-y-2">
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                        <span>Sürücüye Verilecek Teslim Alma Kodu (Pickup OTP)</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sürücü paketi kapınızda alırken bu 4 haneli kodu iletiniz.
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/40 font-mono text-lg font-extrabold text-white tracking-widest">
                      {match.pickupOtp}
                    </div>
                  </div>

                  {match.trip && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Taşıyıcı: <strong>{match.trip.driverName}</strong> ({match.trip.vehicleInfo})</span>
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
