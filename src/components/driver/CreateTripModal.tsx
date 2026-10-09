import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  MapPin, 
  Calendar, 
  Layers, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';
import { TURKISH_CITIES, getCityByName } from '../../lib/turkishCities';
import { calculateCorridorCities, generateFallbackRoute, fetchOrGenerateRoute } from '../../lib/gis';
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
      // OSRM veya fallback ile rotayı al
      const routeData = await fetchOrGenerateRoute(origin, dest);
      if (!isMounted) return;

      setRouteCoordinates(routeData.coordinates);
      setDistanceKm(routeData.distanceKm);

      // 30 KM Tampon Bölge ve Şehirleri Çıkar
      const corridor = calculateCorridorCities(routeData.coordinates, originCity, destCity, 30);
      setServiceCities(corridor.serviceCities);
      setBufferPolygon(corridor.bufferPolygon);

      // Geçici trip nesnesi ile havuzdaki bekleyen paketleri tara
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
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0D1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Üst Bar */}
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Yeni Sürücü Güzergahı Aç
              </h2>
              <p className="text-xs text-slate-400">
                Aracınızın boş bagaj kapasitesini ilan edin, yol üstü kargolarla eşleşin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
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
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kalkış Şehri</span>
                  </label>
                  <select
                    value={originCity}
                    onChange={e => setOriginCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    {TURKISH_CITIES.map(c => (
                      <option key={c.plate} value={c.name}>
                        {c.name} ({c.plate})
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:border-purple-500 focus:outline-none"
                  >
                    {TURKISH_CITIES.map(c => (
                      <option key={c.plate} value={c.name}>
                        {c.name} ({c.plate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kalkış Tarihi & Saati</span>
                </label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Boş Bagaj Hacmi (Desi)</span>
                  </label>
                  <span className="font-bold text-amber-400 font-mono">{capacityDesi} Desi</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={capacityDesi}
                  onChange={e => setCapacityDesi(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5 Desi (1 Koli)</span>
                  <span>40 Desi (Orta Bagaj)</span>
                  <span>100 Desi (Geniş SUV/SW)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Araç Bilgisi</label>
                <input
                  type="text"
                  value={vehicleInfo}
                  onChange={e => setVehicleInfo(e.target.value)}
                  placeholder="Örn: 2022 Volkswagen Passat Sedan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sürücü Notu</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Teslimat noktaları, otoyol çıkışları veya tercihler..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sağ Taraf: Canlı GIS Haritası, Koridor Analizi ve Bekleyen Kargolar */}
            <div className="lg:col-span-7 space-y-4 flex flex-col">
              {/* Canlı GIS Haritası */}
              <div className="h-56 w-full rounded-2xl overflow-hidden border border-white/10 relative">
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
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-400" />
                    <span>Yol Üstünde Uğranabilecek Şehirler (Rotanıza 30 km Mesafede)</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">~{distanceKm} km</span>
                </div>

                <RouteCorridorBadge
                  cities={serviceCities}
                  highlightOrigin={originCity}
                  highlightDest={destCity}
                />
              </div>

              {/* Kesişen Havuz Kargoları Uyarısı */}
              {waitingPackages.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-white">
                      Rotanız üzerinde taşınmayı bekleyen <span className="text-emerald-300 font-extrabold">{waitingPackages.length} kargo</span> var!
                    </div>
                    <p className="text-slate-300">
                      Rotanızı açtıktan sonra bu kargoları doğrudan tek tıkla onaylayıp bagajınıza ekleyebilirsiniz.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2 text-xs text-slate-400">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Şu an bu hatta bekleyen kargo yok. İlanınız açıldığında yeni kargo talepleri size iletilecektir.</span>
                </div>
              )}
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || originCity === destCity}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Güzergahı Başlat & İlanı Aç</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
