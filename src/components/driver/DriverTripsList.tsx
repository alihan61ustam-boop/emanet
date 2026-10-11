import React, { useState } from 'react';
import { 
  Car, 
  Clock, 
  Package, 
  MapPin, 
  CheckCircle, 
  Plus, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  X,
  Gauge
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

  const handleAcceptPackage = (pkg: SenderPackage, trip: DriverTrip) => {
    const match = store.matchPackageWithTrip(pkg.id, trip.id);
    if (match) {
      setSuccessToast(`"${pkg.title}" bagajınıza eklendi! ${pkg.driverPayout} TL hakediş hesabınıza kilitlendi.`);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 5000);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202432]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 uppercase font-display">
            <Car className="w-5 h-5 text-[#FF4500]" />
            <span>Aktif Sefer Manifestoları</span>
            <span className="px-2 py-0.5 rounded bg-[#1A1D28] text-[#8C93A6] text-xs font-bold font-mono">
              {trips.length} SEFER
            </span>
          </h2>
          <p className="text-xs text-[#7A8094]">
            Planlanmış güzergahlar ve kalan bagaj desi kapasiteleri
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateTrip}
          className="px-4 py-2.5 rounded-lg bg-[#FF4500] hover:bg-[#FF5719] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF4500]/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>YENİ SEFER MANİFESTOSU AÇ</span>
        </button>
      </div>

      {/* Başarı Bildirimi */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-[#12161A] border border-[#CCFF00]/50 text-white text-xs flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-[#CCFF00] hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sefer Kartları */}
      <div className="grid grid-cols-1 gap-4">
        {trips.map(trip => {
          const isSelected = trip.id === selectedTripId;
          const waitingPackages = store.getWaitingPackagesForTrip(trip);
          const departureDate = new Date(trip.departureTime);
          const capacityPercent = Math.round((trip.availableCapacityDesi / trip.totalCapacityDesi) * 100);

          return (
            <div
              key={trip.id}
              className={`p-5 sm:p-6 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#12141C] border-[#FF4500] shadow-2xl ring-1 ring-[#FF4500]/30'
                  : 'bg-[#0E1016] border-[#222533] hover:border-[#35394B] hover:bg-[#12141C]'
              }`}
              onClick={() => onSelectTrip(trip)}
            >
              {/* Seçili Rozeti */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-[#FF4500] text-black font-black text-[9px] px-2 py-0.5 uppercase tracking-wider rounded-bl-md">
                  HARİTADA AKTİF
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Sol Kısım: Sürücü, Şehirler ve Koridor */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#191D28] text-white flex items-center justify-center font-bold text-xs border border-[#2B3042]">
                      {trip.driverName.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{trip.driverName}</span>
                        {trip.tcNoVerified && (
                          <span title="T.C. Doğrulandı"><CheckCircle className="w-3.5 h-3.5 text-[#CCFF00]" /></span>
                        )}
                        <span className="text-[11px] font-bold text-[#FFB800]">★ {trip.driverRating}</span>
                      </div>
                      <div className="text-[11px] text-[#7A8094]">{trip.vehicleInfo}</div>
                    </div>
                  </div>

                  {/* Rota Şehirleri */}
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-white font-display">
                    <span className="text-[#FF4500]">{trip.originCity}</span>
                    <span className="text-[#595E70] text-xs">➔</span>
                    <span className="text-[#CCFF00]">{trip.destinationCity}</span>
                    <span className="text-xs font-normal text-[#7A8094] ml-2 font-mono">
                      (~{trip.distanceKm} km • ~{trip.estimatedHours} saat)
                    </span>
                  </div>

                  {/* 30 km Koridor Durakları */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-[#72788C] uppercase tracking-wider">
                      GÜZERGAH DURAKLARI:
                    </div>
                    <RouteCorridorBadge
                      cities={trip.serviceCities}
                      highlightOrigin={trip.originCity}
                      highlightDest={trip.destinationCity}
                    />
                  </div>
                </div>

                {/* Sağ Kısım: Bagaj Göstergesi & Butonlar */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#1E2230]">
                  <div className="space-y-2 text-left lg:text-right">
                    <div className="flex items-center lg:justify-end gap-1.5 text-xs text-[#8A90A4]">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{departureDate.toLocaleDateString('tr-TR')} {departureDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Segmentli Bagaj Doluluk Sayacı */}
                    <div className="p-2.5 rounded-lg bg-[#161822] border border-[#262A38] space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="text-[#7A8094] flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-[#FFB800]" />
                          <span>Kalan Bagaj:</span>
                        </span>
                        <span className="font-extrabold text-[#CCFF00]">
                          {trip.availableCapacityDesi} / {trip.totalCapacityDesi} Desi
                        </span>
                      </div>

                      {/* İlerleme Çubuğu */}
                      <div className="w-36 h-2 bg-[#202330] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FF4500] to-[#CCFF00] rounded-full transition-all"
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {waitingPackages.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewTrip(trip);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-[#CCFF00] hover:bg-[#BBE800] text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-[#CCFF00]/15"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{waitingPackages.length} TALEP BEKLİYOR</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#636879] px-2 py-1 rounded bg-[#161822]">
                        Talep Beklenmiyor
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrip(trip);
                      }}
                      className="px-3 py-2 rounded-lg bg-[#191C26] hover:bg-[#252938] text-white text-xs font-bold border border-[#2E3346] transition-all"
                    >
                      Haritada Aç
                    </button>
                  </div>
                </div>
              </div>

              {trip.notes && (
                <div className="mt-3 pt-3 border-t border-dashed border-[#202330] text-[11px] text-[#7A8094]">
                  <strong className="text-white">NOT:</strong> {trip.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bekleyen Kargoları İnceleme Modalı */}
      {reviewTrip && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0F1118] border border-[#2A2F40] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-[#202432] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#FF4500] text-black text-[10px] font-black uppercase">
                    YOL ÜSTÜ TALEPLERİ
                  </span>
                  <span className="text-xs text-[#7A8094]">
                    {reviewTrip.originCity} ➔ {reviewTrip.destinationCity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 font-display">
                  Rotanızla Kesişen Bekleyen Kargolar
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setReviewTrip(null)}
                className="p-1.5 rounded-lg text-[#7A8094] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {store.getWaitingPackagesForTrip(reviewTrip).map(pkg => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl bg-[#141620] border border-[#252938] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{pkg.title}</div>
                      <div className="text-xs text-[#7A8094] mt-0.5">
                        Gönderen: {pkg.senderName} • Alıcı: {pkg.receiverName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-[#CCFF00]">
                        +{pkg.driverPayout} TL
                      </div>
                      <div className="text-[10px] text-[#7A8094]">Sürücü Net Kazancı</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A0A6BA] pt-2 border-t border-[#1F2332]">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#FF4500]" />
                      {pkg.originCity} ➔ {pkg.destinationCity}
                    </span>
                    <span>•</span>
                    <span className="text-[#FFB800] font-bold">{pkg.desi} Desi</span>
                    <span>•</span>
                    <span>~{pkg.distanceKm} km</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-[#7A8094] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>Ödeme sistem güvencesinde hazır</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleAcceptPackage(pkg, reviewTrip);
                        if (store.getWaitingPackagesForTrip(reviewTrip).length <= 1) {
                          setReviewTrip(null);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-[#FF4500] hover:bg-[#FF5719] text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-[#FF4500]/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>KABUL ET VE BAGAJA EKLE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#202432] bg-[#0A0B10] text-right">
              <button
                type="button"
                onClick={() => setReviewTrip(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#8A90A2] hover:text-white"
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
