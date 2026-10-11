import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Calculator, 
  Clock, 
  Send, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  X,
  Tag
} from 'lucide-react';
import { TURKISH_CITIES, getCityByName } from '../../lib/turkishCities';
import { calculateEmanetPricing } from '../../lib/pricing';
import { generateFallbackRoute } from '../../lib/gis';
import { SavingsBadge } from '../common/SavingsBadge';
import { RouteCorridorBadge } from '../map/RouteCorridorBadge';
import { DesiCalculatorModal } from './DesiCalculatorModal';
import { PackagePoolModal } from './PackagePoolModal';
import { CURRENT_USER, store } from '../../lib/mockStore';
import { DriverTrip, PackageType, SenderPackage } from '../../types';

interface PackageSearchProps {
  onSelectTripForMap: (trip: DriverTrip) => void;
  onRefresh: () => void;
}

export const PackageSearch: React.FC<PackageSearchProps> = ({
  onSelectTripForMap,
  onRefresh
}) => {
  const [originCity, setOriginCity] = useState<string>('İstanbul');
  const [destCity, setDestCity] = useState<string>('Ankara');
  const [desi, setDesi] = useState<number>(6);
  const [packageType, setPackageType] = useState<PackageType>('orta');
  const [searchDate, setSearchDate] = useState<string>('2026-10-10');

  // Modallar
  const [isDesiModalOpen, setIsDesiModalOpen] = useState<boolean>(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const origin = getCityByName(originCity) || TURKISH_CITIES[0];
  const dest = getCityByName(destCity) || TURKISH_CITIES[1];

  const route = generateFallbackRoute(origin, dest);
  const pricing = calculateEmanetPricing(route.distanceKm, desi);
  const matchingTrips = store.findMatchingTripsForRoute(originCity, destCity, desi);

  const handleBookTrip = (trip: DriverTrip) => {
    const newPkg: SenderPackage = {
      id: `pkg-${Date.now()}`,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.fullName,
      senderPhone: CURRENT_USER.phone,
      originCity,
      originCoords: [origin.lat, origin.lng],
      destinationCity: destCity,
      destinationCoords: [dest.lat, dest.lng],
      desi,
      packageType,
      title: `${desi} Desi Emanet Kargosu (${originCity} → ${destCity})`,
      receiverName: 'Ayşe Demir',
      receiverPhone: '+90 (533) 222-3344',
      readyDate: new Date().toISOString(),
      distanceKm: route.distanceKm,
      quotedMarketPrice: pricing.marketPrice,
      emanetPrice: pricing.emanetPrice,
      userSavings: pricing.userSavings,
      driverPayout: pricing.driverPayout,
      platformFee: pricing.platformFee,
      status: 'matched',
      createdAt: new Date().toISOString()
    };

    store.addPackage(newPkg);
    const match = store.matchPackageWithTrip(newPkg.id, trip.id);

    if (match) {
      setSuccessToast(`Eşleşme sağlandı! ${trip.driverName} kargonuzu teslim alacak. Teslim Alma Kodunuz: [${match.pickupOtp}]`);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sevk ve Arama Terminali */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1117] border border-[#262A38] shadow-2xl relative overflow-hidden chamfer-card space-y-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF4500]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Üst Başlık & Ebat Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dashed border-[#262A38]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF4500] rotate-45 inline-block"></span>
              <h2 className="text-xl font-black text-white tracking-tight font-display uppercase">
                Kargo Sevk Arama Terminali
              </h2>
            </div>
            <p className="text-xs text-[#7B8194] font-mono">
              Güzergahınızdaki aktif sürücülerin boş bagaj hacmini sorgulayın
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDesiModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-[#171922] hover:bg-[#202330] border border-[#2D3242] text-xs font-mono font-bold text-[#CCFF00] transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>DESİ & EBAT HESAPLAYICI</span>
          </button>
        </div>

        {/* Giriş Alanları (Industrial Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8C93A7] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF4500]" />
              <span>[01] Çıkış İli</span>
            </label>
            <select
              value={originCity}
              onChange={e => setOriginCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161F] border border-[#2A2E3E] text-white text-xs font-bold focus:border-[#FF4500] focus:outline-none"
            >
              {TURKISH_CITIES.map(c => (
                <option key={c.plate} value={c.name}>
                  [{String(c.plate).padStart(2, '0')}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8C93A7] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>[02] Varış İli</span>
            </label>
            <select
              value={destCity}
              onChange={e => setDestCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#14161F] border border-[#2A2E3E] text-white text-xs font-bold focus:border-[#CCFF00] focus:outline-none"
            >
              {TURKISH_CITIES.map(c => (
                <option key={c.plate} value={c.name}>
                  [{String(c.plate).padStart(2, '0')}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#8C93A7] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>[03] Sefer Tarihi</span>
            </label>
            <input
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#14161F] border border-[#2A2E3E] text-white text-xs font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-[#8C93A7] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>[04] Paket Hacmi</span>
              </label>
              <span className="font-extrabold text-[#FFB800]">{desi} DESİ</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={desi}
              onChange={e => setDesi(Number(e.target.value))}
              className="w-full accent-[#FF4500] cursor-pointer pt-2"
            />
          </div>
        </div>

        {/* Fiyat Tasarruf Manifestosu */}
        <SavingsBadge
          marketPrice={pricing.marketPrice}
          emanetPrice={pricing.emanetPrice}
          userSavings={pricing.userSavings}
          discountRate={pricing.discountRate}
          size="lg"
        />
      </div>

      {/* Başarı Bildirimi */}
      {successToast && (
        <div className="p-4 rounded-xl bg-[#12161A] border border-[#CCFF00]/50 text-white text-xs font-mono flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#CCFF00] shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-[#CCFF00] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Arama Sonuçları: Yolculuk Biletleri / Manifestoları */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#FF4500]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              EŞLEŞEN SÜRÜCÜ MANİFESTOLARI
            </h3>
            <span className="px-2 py-0.5 rounded bg-[#1A1D27] text-[#9EA4B8] text-[11px] font-bold">
              {matchingTrips.length} SEFER
            </span>
          </div>

          {matchingTrips.length === 0 && (
            <button
              type="button"
              onClick={() => setIsPoolModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#FF4500] text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-[#FF4500]/25"
            >
              <Package className="w-3.5 h-3.5" />
              <span>İLAN HAVUZUNA BIRAK</span>
            </button>
          )}
        </div>

        {matchingTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 font-mono">
            {matchingTrips.map(trip => {
              const depDate = new Date(trip.departureTime);

              return (
                <div
                  key={trip.id}
                  className="rounded-xl bg-[#0D0F14] border border-[#232736] hover:border-[#FF4500]/40 transition-all shadow-xl overflow-hidden"
                >
                  {/* Bilet Üst Şeridi */}
                  <div className="px-5 py-2.5 bg-[#12151E] border-b border-[#1E2230] flex items-center justify-between text-[11px] text-[#7C8296]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">SEFER NO: #{trip.id.toUpperCase()}</span>
                      <span>•</span>
                      <span>KORİDOR KAPSAMI: {trip.serviceCities.length} İL</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#CCFF00]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse"></span>
                      <span>REZERVASYONA AÇIK</span>
                    </div>
                  </div>

                  {/* Bilet Ana Gövdesi */}
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Sol Kısım: Sürücü ve Rota */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#181B26] border border-[#2B3042] flex items-center justify-center font-display font-extrabold text-white text-base">
                          {trip.driverName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-wide">{trip.driverName}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-bold">
                              ★ {trip.driverRating}
                            </span>
                            {trip.tcNoVerified && (
                              <span className="text-[10px] text-[#7E8498]">• TC ONAYLI</span>
                            )}
                          </div>
                          <div className="text-xs text-[#7A8196]">{trip.vehicleInfo}</div>
                        </div>
                      </div>

                      {/* Şehir Başlığı */}
                      <div className="flex items-center gap-2 text-lg sm:text-xl font-display font-black text-white">
                        <span className="text-[#FF4500]">{trip.originCity}</span>
                        <span className="text-[#595E70] text-sm">➔</span>
                        <span className="text-[#CCFF00]">{trip.destinationCity}</span>
                      </div>

                      {/* Yol Üstü Durak Şehirleri */}
                      <RouteCorridorBadge
                        cities={trip.serviceCities}
                        highlightOrigin={originCity}
                        highlightDest={destCity}
                      />
                    </div>

                    {/* Sağ Kısım: Bilet Koçanı & Fiyat */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-dashed border-[#222634] lg:pl-6 shrink-0">
                      <div className="space-y-1 text-left lg:text-right text-xs">
                        <div className="text-[#7A8094] flex items-center lg:justify-end gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{depDate.toLocaleDateString('tr-TR')} • {depDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-[#989EAF]">
                          Kalan Bagaj: <strong className="text-[#FFB800]">{trip.availableCapacityDesi} Desi</strong>
                        </div>
                      </div>

                      {/* Fiyat ve Bağla Butonu */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between lg:justify-end">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-[#7A8094] block uppercase">EMANET TARİFESİ</span>
                          <div className="text-2xl font-black text-white font-display">
                            {pricing.emanetPrice} <span className="text-sm text-[#FF4500] font-mono">TL</span>
                          </div>
                          <div className="text-[10px] text-[#5C6173] line-through font-mono">
                            Piyasa: {pricing.marketPrice} TL
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookTrip(trip)}
                          className="px-5 py-3 rounded-lg bg-[#FF4500] hover:bg-[#FF5719] text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#FF4500]/25"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>SEFERİ BAĞLA</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectTripForMap(trip)}
                        className="text-[11px] text-[#8C93A6] hover:text-[#FF4500] underline self-end"
                      >
                        Haritada Güzergâhı Aç ➔
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Eşleşme Yoksa: Havuz Manifestosu */
          <div className="p-8 rounded-2xl bg-[#0D0F14] border border-[#232736] text-center space-y-4 max-w-xl mx-auto shadow-2xl font-mono">
            <div className="w-12 h-12 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/30 flex items-center justify-center text-[#FF4500] mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white uppercase font-display">
                Bu Güzergâhta Henüz Sefer Yok
              </h4>
              <p className="text-xs text-[#82889A] leading-relaxed">
                {originCity} ile {destCity} arasında doğrudan sürücü bulunamadı. Kargonuzu İlan Havuzuna bırakarak geçen sürücülerin anlık bildirim almasını sağlayabilirsiniz.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#14161F] border border-[#242735] text-xs text-[#A0A6BA] flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
              <span>Garantili Fiyatınız: <strong className="text-white">{pricing.emanetPrice} TL</strong> (%25 İndirim Sabitlenir)</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPoolModalOpen(true)}
              className="px-6 py-3 rounded-lg bg-[#FF4500] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF4500]/25 mx-auto"
            >
              <Package className="w-4 h-4" />
              <span>TALEBİ İLAN HAVUZUNA BIRAK</span>
            </button>
          </div>
        )}
      </div>

      {/* Modallar */}
      <DesiCalculatorModal
        isOpen={isDesiModalOpen}
        onClose={() => setIsDesiModalOpen(false)}
        onSelectDesi={(calculatedDesi, calculatedType) => {
          setDesi(calculatedDesi);
          setPackageType(calculatedType);
        }}
      />

      <PackagePoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        initialOrigin={originCity}
        initialDest={destCity}
        initialDesi={desi}
        initialPackageType={packageType}
        onPackageAdded={pkg => {
          setSuccessToast(`"${pkg.title}" ilan havuzuna kaydedildi! Güzergâhınızdan geçen sürücülere bildirim iletilecektir.`);
          onRefresh();
          setTimeout(() => setSuccessToast(null), 6000);
        }}
      />
    </div>
  );
};
