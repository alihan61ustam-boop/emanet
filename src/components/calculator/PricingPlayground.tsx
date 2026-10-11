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
  MapPin,
  CheckCircle2
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
    { name: 'İstanbul - Kocaeli (Kısa)', km: 110, desi: 4 },
    { name: 'İstanbul - Ankara (TEM)', km: 450, desi: 10 },
    { name: 'İstanbul - İzmir (O-5)', km: 480, desi: 15 },
    { name: 'Ankara - Antalya (Güney)', km: 490, desi: 25 },
    { name: 'İstanbul - Trabzon (Karadeniz)', km: 1060, desi: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık Çubuğu */}
      <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#CCFF00] tracking-widest uppercase bg-[#CCFF00]/10 px-2 py-0.5 border border-[#CCFF00]/30 rounded">
              TARİFE & KORİDOR SİMÜLATÖRÜ
            </span>
            <span className="font-mono text-xs text-white/50">BENCHMARK LAB</span>
          </div>
          <h2 className="text-xl font-syne font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Fiyatlama & Yol Üstü Güzergah Test Masası</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-grotesk">
            Hacim ve mesafeye göre piyasa farkını, %25 tasarrufu ve 30 km yol koridorunu canlı test edin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Taraf: Dinamik Fiyatlandırma Formülü ve Kaydırıcılar */}
        <div className="lg:col-span-6 space-y-6">
          <div className="chamfer-card p-6 bg-[#0D0F14] border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                01. FİYAT MATRİS PARAMETRELERİ
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 font-mono text-xs font-bold">
                NET %25 İNDİRİM
              </span>
            </div>

            {/* Hızlı Şablonlar */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Hazır Rota Şablonları:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setDistanceKm(p.km);
                      setDesi(p.desi);
                    }}
                    className="px-3 py-1.5 rounded bg-[#07080A] hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all active:scale-95"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mesafe Kaydırıcısı */}
            <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[11px] uppercase text-slate-300">Taşıma Mesafesi</span>
                <span className="font-mono font-extrabold text-[#CCFF00] text-base">{distanceKm} KM</span>
              </div>
              <input
                type="range"
                min="20"
                max="1500"
                step="10"
                value={distanceKm}
                onChange={e => setDistanceKm(Number(e.target.value))}
                className="w-full accent-[#FF4500] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>20 km</span>
                <span>500 km</span>
                <span>1000 km</span>
                <span>1500 km</span>
              </div>
            </div>

            {/* Desi Kaydırıcısı */}
            <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-[11px] uppercase text-slate-300">Paket Hacmi (Desi)</span>
                <span className="font-mono font-extrabold text-[#FF4500] text-base">{desi} DESİ</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={desi}
                onChange={e => setDesi(Number(e.target.value))}
                className="w-full accent-[#CCFF00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 Desi (Evrak)</span>
                <span>10 Desi (Koli)</span>
                <span>30 Desi (Valiz)</span>
                <span>60 Desi</span>
              </div>
            </div>

            {/* Formül Çıktıları */}
            <div className="p-4 rounded-xl bg-[#07080A] border border-white/10 space-y-3 font-mono">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                HESAPLAMA ADIMLARI & FORMÜL:
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>1. Baz Maliyet (80 + {distanceKm}*0.18 + {desi}*12):</span>
                  <span className="text-white font-bold">{pricing.baseCost} TL</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>2. Gerçek Standart Kargo Piyasa Fiyatı (+%35):</span>
                  <span className="line-through text-slate-500 font-bold">{pricing.marketPrice} TL</span>
                </div>

                <div className="flex justify-between text-[#CCFF00] bg-[#18220A] p-2.5 rounded-lg border border-[#CCFF00]/40">
                  <span className="font-bold">3. Emanet Fiyatı (%25 İndirimli):</span>
                  <span className="font-syne font-extrabold text-lg">{pricing.emanetPrice} TL</span>
                </div>

                <div className="flex justify-between text-slate-300 pt-1 border-t border-white/10">
                  <span className="flex items-center gap-1.5 font-grotesk">
                    <Wallet className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Sürücü Net Hakedişi (%85):</span>
                  </span>
                  <strong className="text-[#CCFF00] text-sm">{pricing.driverPayout} TL</strong>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 font-grotesk">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Platform Hizmet Bedeli (%15):</span>
                  </span>
                  <span className="text-slate-300 font-bold">{pricing.platformFee} TL</span>
                </div>

                <div className="flex justify-between text-[#FF4500] pt-1 border-t border-white/10">
                  <span className="flex items-center gap-1.5 font-grotesk font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kullanıcının Net Tasarrufu:</span>
                  </span>
                  <strong className="text-sm">{pricing.userSavings} TL Tasarruf</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf: GIS 30 KM Koridor Testi */}
        <div className="lg:col-span-6 space-y-6">
          <div className="chamfer-card p-6 bg-[#0D0F14] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                02. YOL ÜSTÜ DURAK KORİDORU
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-mono text-xs font-bold">
                ±30 KM TAMPON BÖLGE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Çıkış İli</label>
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
                  className="w-full px-3 py-2 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold"
                >
                  {TURKISH_CITIES.map(c => (
                    <option key={c.plate} value={c.name}>
                      {c.plate} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Varış İli</label>
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
                  className="w-full px-3 py-2 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold"
                >
                  {TURKISH_CITIES.map(c => (
                    <option key={c.plate} value={c.name}>
                      {c.plate} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Canlı Mini Harita */}
            <div className="h-48 rounded-xl overflow-hidden border border-white/15">
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
                <span className="font-mono text-[11px] uppercase text-slate-300">
                  Rota Üstü Durak İlleri ({corridor.serviceCities.length} İl):
                </span>
                <span className="text-[#CCFF00] font-mono font-extrabold">~{corridor.totalDistanceKm} km</span>
              </div>

              <RouteCorridorBadge
                cities={corridor.serviceCities}
                highlightOrigin={testOrigin}
                highlightDest={testDest}
              />
            </div>

            <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 text-xs text-slate-400 font-grotesk">
              Kural: Göndericinin arama yaptığı çıkış ve varış şehirleri bu sıralı koridor listesinde yer almalı ve çıkış şehri varış şehrinden önce gelmelidir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
