import React, { useState } from 'react';
import { 
  Car, 
  Clock, 
  Package, 
  MapPin, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { DriverTrip, SenderPackage } from '../../types';
import { RouteCorridorBadge } from '../map/RouteCorridorBadge';
import { store } from '../../lib/mockStore';

interface DriverTripsListProps {
  trips: DriverTrip[];
  selectedTripId?: string;
  onSelectTrip: (trip: DriverTrip) => void;
  onOpenCreateTrip: () => void;
  onRefresh: () => void;
}

export const DriverTripsList: React.FC<DriverTripsListProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
  onOpenCreateTrip,
  onRefresh
}) => {
  const [reviewTrip, setReviewTrip] = useState<DriverTrip | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Havuzdaki bir kargoyu sürücü kabul eder
  const handleAcceptPackage = (pkg: SenderPackage, trip: DriverTrip) => {
    const match = store.matchPackageWithTrip(pkg.id, trip.id);
    if (match) {
      setSuccessToast(`"${pkg.title}" başarıyla kabul edildi! ${pkg.driverPayout} TL hakediş Escrow havuzuna kilitlendi.`);
      onRefresh();
      // Toast'u 4 sn sonra gizle
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Başlık ve Yeni İlan Aç Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <span>Aktif Sürücü Güzergahları</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {trips.length} Sefer
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Kalkış yapacak sürücüler ve 30 km koridorundaki boş bagaj kapasiteleri
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateTrip}
          className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Güzergah & İlan Aç</span>
        </button>
      </div>

      {/* Başarı Bildirimi */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sürücü Seferleri Listesi */}
      <div className="grid grid-cols-1 gap-4">
        {trips.map(trip => {
          const isSelected = trip.id === selectedTripId;
          const waitingPackages = store.getWaitingPackagesForTrip(trip);
          const departureDate = new Date(trip.departureTime);

          return (
            <div
              key={trip.id}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/95 border-emerald-500/50 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900/80'
              }`}
              onClick={() => onSelectTrip(trip)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Sol Kısım: Sürücü & Rota Başlığı */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {trip.driverName.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{trip.driverName}</span>
                        {trip.tcNoVerified && (
                          <span title="T.C. Doğrulandı"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /></span>
                        )}
                        <span className="text-[11px] font-semibold text-amber-400">★ {trip.driverRating}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{trip.vehicleInfo}</div>
                    </div>
                  </div>

                  {/* Şehir Başlığı */}
                  <div className="flex items-center gap-2 text-base font-extrabold text-white">
                    <span className="text-emerald-400">{trip.originCity}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-purple-400">{trip.destinationCity}</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">
                      (~{trip.distanceKm} km • ~{trip.estimatedHours} saat)
                    </span>
                  </div>

                  {/* 30 km Koridor Rozetleri */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      30 KM Otoyol Koridoru (Yol Üstü Durakları):
                    </div>
                    <RouteCorridorBadge
                      cities={trip.serviceCities}
                      highlightOrigin={trip.originCity}
                      highlightDest={trip.destinationCity}
                    />
                  </div>
                </div>

                {/* Sağ Kısım: Kapasite, Saat ve Butonlar */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                  <div className="space-y-1 text-right sm:text-left lg:text-right">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{departureDate.toLocaleDateString('tr-TR')} • {departureDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-slate-400">Kalan Bagaj:</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {trip.availableCapacityDesi} / {trip.totalCapacityDesi} Desi
                      </span>
                    </div>
                  </div>

                  {/* Bekleyen Kargo Uyarısı veya Aksiyon */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {waitingPackages.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewTrip(trip);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{waitingPackages.length} Bekleyen Kargo</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 px-2 py-1 rounded bg-slate-800/40">
                        Bekleyen kargo yok
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrip(trip);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-white/10 transition-all"
                    >
                      Haritada Göster
                    </button>
                  </div>
                </div>
              </div>

              {trip.notes && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                  <strong className="text-slate-300">Not:</strong> {trip.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bekleyen Kargoları İnceleme ve Kabul Etme Modalı */}
      {reviewTrip && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0D1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                    30 KM Yol Üstü Havuzu
                  </span>
                  <span className="text-xs text-slate-400">
                    {reviewTrip.originCity} → {reviewTrip.destinationCity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Rotanızla Kesişen Bekleyen Kargolar
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setReviewTrip(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {store.getWaitingPackagesForTrip(reviewTrip).map(pkg => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{pkg.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Gönderen: {pkg.senderName} • Alıcı: {pkg.receiverName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-400">
                        {pkg.driverPayout} TL
                      </div>
                      <div className="text-[10px] text-slate-500">Sürücü Net Kazancı</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {pkg.originCity} → {pkg.destinationCity}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-amber-400 font-bold">{pkg.desi} Desi</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">~{pkg.distanceKm} km</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Emanet Escrow bakiyesi hazır bekliyor</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAcceptPackage(pkg, reviewTrip);
                        if (store.getWaitingPackagesForTrip(reviewTrip).length <= 1) {
                          setReviewTrip(null);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Kabul Et ve Bagaja Ekle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-900/40 text-right">
              <button
                type="button"
                onClick={() => setReviewTrip(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
