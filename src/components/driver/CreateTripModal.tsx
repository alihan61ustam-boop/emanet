import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  MapPin, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
  Shield
} from 'lucide-react';
import { TURKISH_CITIES, getCityByName } from '../../lib/turkishCities';
import { calculateCorridorCities, fetchOrGenerateRoute } from '../../lib/gis';
import { RouteMap } from '../map/RouteMap';
import { RouteCorridorBadge } from '../map/RouteCorridorBadge';
import { CURRENT_USER, store } from '../../lib/mockStore';
import { DriverTrip, SenderPackage } from '../../types';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (trip: DriverTrip) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onTripCreated
}) => {
  const [originCity, setOriginCity] = useState<string>('İstanbul');
  const [destCity, setDestCity] = useState<string>('Ankara');
  const [departureDate, setDepartureDate] = useState<string>('2026-10-10T09:00');
  const [capacityDesi, setCapacityDesi] = useState<number>(40);
  const [vehicleInfo, setVehicleInfo] = useState<string>('2022 Volkswagen Passat (Sedan, 586L Bagaj)');
  const [notes, setNotes] = useState<string>('TEM otoyolu güzergahı boyunca teslim alıp teslim edebilirim.');
  const [loading, setLoading] = useState<boolean>(false);

  // Hesaplanmış koridor ve rota durumu
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(450);
  const [serviceCities, setServiceCities] = useState<string[]>([]);
  const [bufferPolygon, setBufferPolygon] = useState<GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null>(null);
  const [waitingPackages, setWaitingPackages] = useState<SenderPackage[]>([]);

  // Rota ve 30km Koridorunu Gerçek Zamanlı Hesapla
  useEffect(() => {
    if (!isOpen) return;
    if (originCity === destCity) return;

    const origin = getCityByName(originCity);
    const dest = getCityByName(destCity);
    if (!origin || !dest) return;

    let isMounted = true;
    setLoading(true);

    const compute = async () => {
      const routeData = await fetchOrGenerateRoute(origin, dest);
      if (!isMounted) return;

      setRouteCoordinates(routeData.coordinates);
      setDistanceKm(routeData.distanceKm);

      const corridor = calculateCorridorCities(routeData.coordinates, originCity, destCity, 30);
      setServiceCities(corridor.serviceCities);
      setBufferPolygon(corridor.bufferPolygon);

      const tempTrip: DriverTrip = {
        id: 'temp',
        driverId: CURRENT_USER.id,
        driverName: CURRENT_USER.fullName,
        driverPhone: CURRENT_USER.phone,
        driverRating: CURRENT_USER.rating,
        vehicleInfo,
        tcNoVerified: CURRENT_USER.tcNoVerified,
        originCity,
        originCoords: [origin.lat, origin.lng],
        destinationCity: destCity,
        destinationCoords: [dest.lat, dest.lng],
        departureTime: new Date(departureDate).toISOString(),
        routeCoordinates: routeData.coordinates,
        distanceKm: routeData.distanceKm,
        estimatedHours: Math.round((routeData.distanceKm / 90) * 10) / 10,
        serviceCities: corridor.serviceCities,
        availableCapacityDesi: capacityDesi,
        totalCapacityDesi: capacityDesi,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const matched = store.getWaitingPackagesForTrip(tempTrip);
      setWaitingPackages(matched);
      setLoading(false);
    };

    compute();

    return () => {
      isMounted = false;
    };
  }, [originCity, destCity, capacityDesi, departureDate, isOpen, vehicleInfo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originCity === destCity) {
      alert('Başlangıç ve varış şehri aynı olamaz!');
      return;
    }

    const origin = getCityByName(originCity)!;
    const dest = getCityByName(destCity)!;

    const newTrip: DriverTrip = {
      id: `trip-${Date.now()}`,
      driverId: CURRENT_USER.id,
      driverName: CURRENT_USER.fullName,
      driverPhone: CURRENT_USER.phone,
      driverRating: CURRENT_USER.rating,
      vehicleInfo,
      tcNoVerified: CURRENT_USER.tcNoVerified,
      originCity,
      originCoords: [origin.lat, origin.lng],
      destinationCity: destCity,
      destinationCoords: [dest.lat, dest.lng],
      departureTime: new Date(departureDate).toISOString(),
      routeCoordinates,
      distanceKm,
      estimatedHours: Math.round((distanceKm / 90) * 10) / 10,
      serviceCities,
      availableCapacityDesi: capacityDesi,
      totalCapacityDesi: capacityDesi,
      status: 'active',
      notes,
      createdAt: new Date().toISOString()
    };

    store.addTrip(newTrip);
    onTripCreated(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl chamfer-card bg-[#0D0F14] border-2 border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Üst Şerit: Industrial Dispatch Bar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12151C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4500] text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,69,0,0.4)]">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#FF4500] uppercase tracking-widest font-bold">
                  GÜZERGAH MANİFESTOSU #NEW
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                  DISPATCH FORM
                </span>
              </div>
              <h2 className="text-lg font-syne font-extrabold text-white tracking-tight">
                Yeni Sürücü Güzergahı Aç
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form ve İnteraktif Harita Önizlemesi */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sol Taraf: Giriş Parametreleri */}
            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Kalkış İli</span>
                  </label>
                  <select
                    value={originCity}
                    onChange={e => setOriginCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold focus:border-[#FF4500] focus:outline-none"
                  >
                    {TURKISH_CITIES.map(c => (
                      <option key={c.plate} value={c.name}>
                        {c.plate} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span>Varış İli</span>
                  </label>
                  <select
                    value={destCity}
                    onChange={e => setDestCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold focus:border-[#FF4500] focus:outline-none"
                  >
                    {TURKISH_CITIES.map(c => (
                      <option key={c.plate} value={c.name}>
                        {c.plate} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Kalkış Tarihi & Saati</span>
                </label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold focus:border-[#FF4500] focus:outline-none"
                  required
                />
              </div>

              {/* Bagaj Kapasite Göstergesi */}
              <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-mono uppercase text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span>Boş Bagaj Hacmi</span>
                  </label>
                  <span className="font-mono font-extrabold text-[#CCFF00] text-sm">
                    {capacityDesi} DESİ
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={capacityDesi}
                  onChange={e => setCapacityDesi(Number(e.target.value))}
                  className="w-full accent-[#FF4500] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>5 Desi (Koli)</span>
                  <span>40 Desi (Orta)</span>
                  <span>100 Desi (SUV)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  Araç Modeli & Bagaj Hacmi
                </label>
                <input
                  type="text"
                  value={vehicleInfo}
                  onChange={e => setVehicleInfo(e.target.value)}
                  placeholder="Örn: 2022 Passat (586L Bagaj)"
                  className="w-full px-3 py-2 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-grotesk focus:border-[#FF4500] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  Sürücü Notu & Teslimat Tercihleri
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Otoyol gişeleri, buluşma noktaları..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-grotesk focus:border-[#FF4500] focus:outline-none"
                />
              </div>
            </div>

            {/* Sağ Taraf: Canlı GIS Haritası, Koridor Analizi ve Bekleyen Kargolar */}
            <div className="lg:col-span-7 space-y-4 flex flex-col">
              {/* Canlı GIS Haritası */}
              <div className="h-56 w-full rounded-xl overflow-hidden border border-white/15 relative">
                <RouteMap
                  routeCoordinates={routeCoordinates}
                  bufferPolygon={bufferPolygon}
                  originCity={originCity}
                  destCity={destCity}
                  corridorCities={serviceCities}
                  className="h-full w-full"
                />
              </div>

              {/* Koridor Bilgisi */}
              <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Yol Üstü Durakları (±30 KM Koridoru)</span>
                  </span>
                  <span className="text-[#CCFF00] font-mono font-extrabold">~{distanceKm} km</span>
                </div>

                <RouteCorridorBadge
                  cities={serviceCities}
                  highlightOrigin={originCity}
                  highlightDest={destCity}
                />
              </div>

              {/* Kesişen Havuz Kargoları Uyarısı */}
              {waitingPackages.length > 0 ? (
                <div className="p-4 rounded-lg bg-[#181106] border border-[#FF4500]/50 flex items-start gap-3 text-xs">
                  <Sparkles className="w-4 h-4 text-[#FF4500] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-syne font-bold text-white text-sm">
                      Rotanız üzerinde taşınmayı bekleyen <span className="text-[#CCFF00] font-mono font-extrabold">{waitingPackages.length} adet kargo</span> tespit edildi!
                    </div>
                    <p className="text-slate-300 font-grotesk">
                      Güzergahınızı açtığınızda bu kargoları doğrudan tek tıkla onaylayıp bagajınıza ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#07080A] border border-white/5 flex items-center gap-2 text-xs text-slate-400 font-grotesk">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Şu an bu hatta bekleyen talep yok. İlanınız açıldığında bildirim alacaksınız.</span>
                </div>
              )}
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#0D0F14]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || originCity === destCity}
              className="px-6 py-2.5 rounded-lg text-xs font-syne font-extrabold tracking-wider uppercase text-black bg-[#FF4500] hover:bg-[#e03d00] transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(255,69,0,0.4)] disabled:opacity-50 active:translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>Güzergahı Başlat & İlanı Aç</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
