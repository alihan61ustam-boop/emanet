import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingDown, 
  Compass, 
  Sparkles, 
  Wallet, 
  Building2, 
  ArrowRight,
  Layers,
  MapPin
} from 'lucide-react';
import { calculateEmanetPricing } from '../../lib/pricing';
import { TURKISH_CITIES, getCityByName } from '../../lib/turkishCities';
import { calculateCorridorCities, generateFallbackRoute } from '../../lib/gis';
import { RouteCorridorBadge } from '../map/RouteCorridorBadge';
import { RouteMap } from '../map/RouteMap';

export const PricingPlayground: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(450);
  const [desi, setDesi] = useState<number>(8);

  // Koridor Test Seçimi
  const [testOrigin, setTestOrigin] = useState<string>('İstanbul');
  const [testDest, setTestDest] = useState<string>('Ankara');

  const pricing = calculateEmanetPricing(distanceKm, desi);

  // Koridor Hesaplaması
  const originCityObj = getCityByName(testOrigin) || TURKISH_CITIES[0];
  const destCityObj = getCityByName(testDest) || TURKISH_CITIES[1];
  const testRoute = generateFallbackRoute(originCityObj, destCityObj);
  const corridor = calculateCorridorCities(testRoute.coordinates, testOrigin, testDest, 30);

  const presets = [
    { name: 'İstanbul - Kocaeli (Kısa Hat)', km: 110, desi: 4 },
    { name: 'İstanbul - Ankara (TEM Otoyolu)', km: 450, desi: 10 },
    { name: 'İstanbul - İzmir (O-5 Otoyolu)', km: 480, desi: 15 },
    { name: 'Ankara - Antalya (Güney Hattı)', km: 490, desi: 25 },
    { name: 'İstanbul - Trabzon (Karadeniz)', km: 1060, desi: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="pb-2 border-b border-white/5">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <span>Fiyat & Yol Üstü Güzergah Hesaplayıcı</span>
        </h2>
        <p className="text-xs text-slate-400">
          Kargo boyutu ve mesafeye göre net indirimli fiyatı, sürücü kazancını ve yol üstü durakları simüle edin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Taraf: Fiyatlandırma Formülü ve Kaydırıcılar */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Dinamik Fiyatlandırma Parametreleri
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                Net %25 Tasarruf Modeli
              </span>
            </div>

            {/* Hızlı Şablonlar */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Hazır Rota Şablonları:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setDistanceKm(p.km);
                      setDesi(p.desi);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/5 text-[11px] text-slate-300 hover:text-white transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mesafe Kaydırıcısı */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Taşıma Mesafesi (km)</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="1500"
                step="10"
                value={distanceKm}
                onChange={e => setDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>20 km</span>
                <span>500 km</span>
                <span>1000 km</span>
                <span>1500 km</span>
              </div>
            </div>

            {/* Desi Kaydırıcısı */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Paket Hacmi (Desi)</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm">{desi} Desi</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={desi}
                onChange={e => setDesi(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 Desi (Zarf)</span>
                <span>10 Desi (Orta Koli)</span>
                <span>30 Desi (Valiz)</span>
                <span>60 Desi</span>
              </div>
            </div>

            {/* Formül Çıktıları */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hesaplama Dökümü (Adım Adım):
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>1. Baz Maliyet (80 + {distanceKm}*0.18 + {desi}*12):</span>
                  <span className="font-mono text-slate-200">{pricing.baseCost} TL</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>2. Piyasa Standart Kargo Fiyatı (+%35):</span>
                  <span className="font-mono line-through text-slate-400 font-bold">{pricing.marketPrice} TL</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-bold text-sm bg-emerald-950/40 p-2 rounded-xl">
                  <span>3. Emanet Fiyatı (%25 İndirimli):</span>
                  <span className="font-mono text-base">{pricing.emanetPrice} TL</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sürücü Net Hakedişi (%85):</span>
                  </span>
                  <strong className="font-mono text-emerald-400">{pricing.driverPayout} TL</strong>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Platform Hizmet Bedeli (%15):</span>
                  </span>
                  <span className="font-mono text-slate-300">{pricing.platformFee} TL</span>
                </div>

                <div className="flex justify-between text-emerald-300 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kullanıcının Net Kazancı:</span>
                  </span>
                  <strong className="font-mono">{pricing.userSavings} TL Tasarruf</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: GIS 30 KM Koridor Testi */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Yol Üstü Güzergah Hesaplayıcı
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-bold">
                30 km Yol Çevresi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Çıkış İli</label>
                <select
                  value={testOrigin}
                  onChange={e => {
                    setTestOrigin(e.target.value);
                    const orig = getCityByName(e.target.value);
                    const dst = getCityByName(testDest);
                    if (orig && dst) {
                      const r = generateFallbackRoute(orig, dst);
                      setDistanceKm(r.distanceKm);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                >
                  {TURKISH_CITIES.map(c => (
                    <option key={c.plate} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Varış İli</label>
                <select
                  value={testDest}
                  onChange={e => {
                    setTestDest(e.target.value);
                    const orig = getCityByName(testOrigin);
                    const dst = getCityByName(e.target.value);
                    if (orig && dst) {
                      const r = generateFallbackRoute(orig, dst);
                      setDistanceKm(r.distanceKm);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                >
                  {TURKISH_CITIES.map(c => (
                    <option key={c.plate} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Canlı Mini Harita */}
            <div className="h-48 rounded-2xl overflow-hidden border border-white/10">
              <RouteMap
                routeCoordinates={testRoute.coordinates}
                bufferPolygon={corridor.bufferPolygon}
                originCity={testOrigin}
                destCity={testDest}
                corridorCities={corridor.serviceCities}
                className="h-full w-full"
              />
            </div>

            {/* Sıralı Koridor Listesi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Rota Boyunca Uğranabilecek Şehirler ({corridor.serviceCities.length} İl):
                </span>
                <span className="text-emerald-400 font-mono font-bold">~{corridor.totalDistanceKm} km</span>
              </div>

              <RouteCorridorBadge
                cities={corridor.serviceCities}
                highlightOrigin={testOrigin}
                highlightDest={testDest}
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400">
              Kural: Göndericinin arama yaptığı çıkış ve varış şehirleri bu listede bulunmalı ve çıkış şehri varış şehrinden önce gelmelidir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
