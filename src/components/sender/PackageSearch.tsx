import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Calculator, 
  Car, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  Send, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  X
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

  // Mesafe ve Fiyatlandırma Motorunu Dinamik Çalıştır
  const route = generateFallbackRoute(origin, dest);
  const pricing = calculateEmanetPricing(route.distanceKm, desi);

  // 30 KM Koridor Kurallarına Göre Eşleşen Aktif Sürücüleri Getir
  const matchingTrips = store.findMatchingTripsForRoute(originCity, destCity, desi);

  // Kargo Göndericisi Sürücüye Talep Gönderir ve Escrow Başlatılır
  const handleBookTrip = (trip: DriverTrip) => {
    // Önce kargo kaydını oluştur
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
      setSuccessToast(`Harika! ${trip.driverName} ile eşleşme sağlandı. Escrow tutarı güvenceye alındı. Pickup OTP: ${match.pickupOtp}`);
      onRefresh();
      setTimeout(() => setSuccessToast(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Arama ve Filtreleme Kartı */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              <span>Kargo Güzergahı & Sürücü Ara</span>
            </h2>
            <p className="text-xs text-slate-400">
              30 km koridorunda seyahat eden sürücüleri anında filtreleyin
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDesiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-amber-300 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Desi Ebat Hesapla</span>
          </button>
        </div>

        {/* Giriş Alanları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Çıkış Şehri</span>
            </label>
            <select
              value={originCity}
              onChange={e => setOriginCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
            >
              {TURKISH_CITIES.map(c => (
                <option key={c.plate} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Varış Şehri</span>
            </label>
            <select
              value={destCity}
              onChange={e => setDestCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs font-medium focus:border-purple-500 focus:outline-none"
            >
              {TURKISH_CITIES.map(c => (
                <option key={c.plate} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Tarih</span>
            </label>
            <input
              type="date"
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Paket Hacmi</span>
              </label>
              <span className="font-mono font-bold text-amber-400">{desi} Desi</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={desi}
              onChange={e => setDesi(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer pt-2"
            />
          </div>
        </div>

        {/* Fiyat Tasarruf Bilgilendirmesi Kartı */}
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
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Arama Sonuçları */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Eşleşen Sürücüler</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {matchingTrips.length} Sonuç
            </span>
          </h3>

          {matchingTrips.length === 0 && (
            <button
              type="button"
              onClick={() => setIsPoolModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Package className="w-3.5 h-3.5" />
              <span>İlan Havuzuna Bırak</span>
            </button>
          )}
        </div>

        {matchingTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {matchingTrips.map(trip => {
              const depDate = new Date(trip.departureTime);

              return (
                <div
                  key={trip.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-white/5 hover:border-emerald-500/30 transition-all space-y-4 group shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Sürücü ve Araç */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {trip.driverName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{trip.driverName}</span>
                          {trip.tcNoVerified && (
                            <span title="T.C. Doğrulandı"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /></span>
                          )}
                          <span className="text-xs font-semibold text-amber-400">★ {trip.driverRating}</span>
                        </div>
                        <div className="text-xs text-slate-400">{trip.vehicleInfo}</div>
                      </div>
                    </div>

                    {/* Fiyat ve Buton */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-white">
                          {pricing.emanetPrice} <span className="text-xs text-emerald-400 font-bold">TL</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-through">
                          {pricing.marketPrice} TL
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookTrip(trip)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Emanet Talebi Gönder</span>
                      </button>
                    </div>
                  </div>

                  {/* Detay Bilgileri */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{depDate.toLocaleDateString('tr-TR')} {depDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kalan Bagaj: <strong className="text-amber-300 font-mono">{trip.availableCapacityDesi} Desi</strong></span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectTripForMap(trip)}
                      className="text-emerald-400 hover:underline font-semibold ml-auto"
                    >
                      Haritada 30 km Koridorunu İncele →
                    </button>
                  </div>

                  {/* Koridor Şehirleri */}
                  <div className="pt-1">
                    <RouteCorridorBadge
                      cities={trip.serviceCities}
                      highlightOrigin={originCity}
                      highlightDest={destCity}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* EŞLEŞME YOKSA BOŞ DURUM & İLAN HAVUZUNA BIRAK CTA */
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white">
                Bu Güzergahta Henüz Aktif Sürücü Bulunamadı
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {originCity} ile {destCity} arasında şu an planlanmış sefer yok. Ancak kargonuzu <strong>İlan Havuzuna</strong> bırakabilirsiniz! Bu koridordan geçecek yeni bir sürücü sisteme girdiğinde anında eşleşeceksiniz.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-xs text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantili İndirimli Fiyat: <strong>{pricing.emanetPrice} TL</strong> (%25 Tasarruf Kilitlenir)</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPoolModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 mx-auto"
            >
              <Package className="w-4 h-4" />
              <span>Tek Tuşla İlan Havuzuna Bırak</span>
            </button>
          </div>
        )}
      </div>

      {/* Desi Ebat Hesaplama Modalı */}
      <DesiCalculatorModal
        isOpen={isDesiModalOpen}
        onClose={() => setIsDesiModalOpen(false)}
        onSelectDesi={(calculatedDesi, calculatedType) => {
          setDesi(calculatedDesi);
          setPackageType(calculatedType);
        }}
      />

      {/* İlan Havuzu Modalı */}
      <PackagePoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        initialOrigin={originCity}
        initialDest={destCity}
        initialDesi={desi}
        initialPackageType={packageType}
        onPackageAdded={pkg => {
          setSuccessToast(`"${pkg.title}" kargonuz başarıyla İlan Havuzuna bırakıldı! Geçen sürücüler bilgilendirilecek.`);
          onRefresh();
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
};
