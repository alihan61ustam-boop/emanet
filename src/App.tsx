import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  MapPin, 
  Layers, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { Header, ActiveTab } from './components/common/Header';
import { SystemTourModal } from './components/common/SystemTourModal';
import { RouteMap } from './components/map/RouteMap';
import { RouteCorridorBadge } from './components/map/RouteCorridorBadge';
import { DriverTripsList } from './components/driver/DriverTripsList';
import { CreateTripModal } from './components/driver/CreateTripModal';
import { CorridorAlertBanner } from './components/driver/CorridorAlertBanner';
import { PackageSearch } from './components/sender/PackageSearch';
import { SenderPackagesList } from './components/sender/SenderPackagesList';
import { PackagePoolModal } from './components/sender/PackagePoolModal';
import { EscrowDashboard } from './components/escrow/EscrowDashboard';
import { PricingPlayground } from './components/calculator/PricingPlayground';
import { store } from './lib/mockStore';
import { DriverTrip, SenderPackage, MatchAndEscrow } from './types';
import { calculateCorridorCities } from './lib/gis';

export function App() {
  // Varsayılan ilk sekme: Kargo Gönder & Ara (Son kullanıcı için en sade başlangıç)
  const [activeTab, setActiveTab] = useState<ActiveTab>('sender');
  const [trips, setTrips] = useState<DriverTrip[]>(() => store.getTrips());
  const [packages, setPackages] = useState<SenderPackage[]>(() => store.getPackages());
  const [matches, setMatches] = useState<MatchAndEscrow[]>(() => store.getMatches());
  
  const [selectedTrip, setSelectedTrip] = useState<DriverTrip | null>(() => store.getTrips()[0] || null);

  // Açılış Bilgilendirme Modalı
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    return localStorage.getItem('emanet_hide_tour_modal') !== 'true';
  });
  const [isCreateTripOpen, setIsCreateTripOpen] = useState<boolean>(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const currentTrips = store.getTrips();
      setTrips(currentTrips);
      setPackages(store.getPackages());
      setMatches(store.getMatches());

      if (selectedTrip) {
        const updated = currentTrips.find(t => t.id === selectedTrip.id);
        if (updated) setSelectedTrip(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedTrip]);

  const handleRefresh = () => {
    setTrips(store.getTrips());
    setPackages(store.getPackages());
    setMatches(store.getMatches());
  };

  const handleResetData = () => {
    if (confirm('Tüm örnek verileri başlangıç durumuna sıfırlamak istiyor musunuz?')) {
      store.resetToDefaults();
      handleRefresh();
      setSelectedTrip(store.getTrips()[0] || null);
    }
  };

  const corridorResult = selectedTrip
    ? calculateCorridorCities(selectedTrip.routeCoordinates, selectedTrip.originCity, selectedTrip.destinationCity, 30)
    : null;

  const matchingPoolPackages = selectedTrip ? store.getWaitingPackagesForTrip(selectedTrip) : [];
  const pendingEscrowCount = matches.filter(m => m.paymentStatus === 'held_in_escrow').length;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      {/* Üst Menü */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenTour={() => setIsTourOpen(true)}
        onResetData={handleResetData}
        pendingEscrowCount={pendingEscrowCount}
      />

      {/* Ana Sayfa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Karşılama ve Değer Önerisi Alanı (Sade & Anlaşılır) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-emerald-950/40 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>P2P Bagaj & Kargo Paylaşımı</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Şehirler Arası Boş Bagajını Paylaş, <span className="text-emerald-400">%25 İndirimle</span> Kargo Gönder
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Şahsi aracıyla seyahat eden sürücüler ile aynı yöne eşya göndermek isteyenleri buluşturan güvenli yol arkadaşı platformu.
              </p>

              {/* Hızlı Butonlar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sender')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                    activeTab === 'sender'
                      ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Kargo Gönder & Ara</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('driver');
                    setIsCreateTripOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Sürücüyüm (Rota Aç)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTourOpen(true)}
                  className="text-xs text-slate-400 hover:text-emerald-400 underline font-semibold ml-2"
                >
                  Sistem Nasıl Çalışır? →
                </button>
              </div>
            </div>

            {/* Basit Avantaj Rozetleri */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>%25 Daha Ucuz</span>
                </div>
                <div className="text-[11px] text-slate-400">Normal kargo şirketlerine göre sabit indirim</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kodlu Güvence</span>
                </div>
                <div className="text-[11px] text-slate-400">Teslim edilene kadar paranız güvende</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. SEKME: KARGO GÖNDER & ARA (Ana Ekran) */}
        {activeTab === 'sender' && (
          <div className="space-y-6">
            <PackageSearch
              onSelectTripForMap={trip => {
                setSelectedTrip(trip);
                setActiveTab('driver');
              }}
              onRefresh={handleRefresh}
            />

            <SenderPackagesList
              packages={packages}
              matches={matches}
              onOpenPoolModal={() => setIsPoolModalOpen(true)}
            />
          </div>
        )}

        {/* 2. SEKME: SÜRÜCÜ PANELİ */}
        {activeTab === 'driver' && (
          <div className="space-y-6">
            {selectedTrip && (
              <CorridorAlertBanner
                matchingPackages={matchingPoolPackages}
                onReviewPackages={() => {}}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol Taraf: Seferler */}
              <div className="lg:col-span-7 space-y-4">
                <DriverTripsList
                  trips={trips}
                  selectedTripId={selectedTrip?.id}
                  onSelectTrip={trip => setSelectedTrip(trip)}
                  onOpenCreateTrip={() => setIsCreateTripOpen(true)}
                  onRefresh={handleRefresh}
                />
              </div>

              {/* Sağ Taraf: Yol Üstü Harita Görünümü */}
              <div className="lg:col-span-5 space-y-4">
                {selectedTrip ? (
                  <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Güzergah & Yol Üstü Şehirleri
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        ~{selectedTrip.distanceKm} km
                      </span>
                    </div>

                    {/* Harita */}
                    <div className="h-72 w-full rounded-2xl overflow-hidden border border-white/10">
                      <RouteMap
                        routeCoordinates={selectedTrip.routeCoordinates}
                        bufferPolygon={corridorResult?.bufferPolygon}
                        originCity={selectedTrip.originCity}
                        destCity={selectedTrip.destinationCity}
                        corridorCities={selectedTrip.serviceCities}
                        className="h-full w-full"
                      />
                    </div>

                    {/* Yol Üstü Şehirler */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-400" />
                          <span>Yol Üstünde Kargo Alınabilecek İller:</span>
                        </span>
                        <span className="text-[11px] text-slate-500">{selectedTrip.serviceCities.length} Şehir</span>
                      </div>

                      <RouteCorridorBadge
                        cities={selectedTrip.serviceCities}
                        highlightOrigin={selectedTrip.originCity}
                        highlightDest={selectedTrip.destinationCity}
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Boş Bagaj Hacmi:</span>
                        <div className="font-mono font-extrabold text-amber-400 text-sm">
                          {selectedTrip.availableCapacityDesi} Desi
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">Tahmini Kalkış:</span>
                        <div className="text-slate-200 font-medium">
                          {new Date(selectedTrip.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center">
                    <Car className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Haritada incelemek için sol taraftan bir sefer seçin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. SEKME: GÜVENLİ TESLİMAT & KODLAR */}
        {activeTab === 'escrow' && (
          <div className="space-y-6">
            <EscrowDashboard
              matches={matches}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {/* 4. SEKME: FİYAT HESAPLA */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <PricingPlayground />
          </div>
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="mt-12 border-t border-white/5 bg-[#060910] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">EMANET</span>
            <span>• Şehirler Arası Güvenli Bagaj & Kargo Paylaşım Platformu</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Kodlu Güvence</span>
            <span>•</span>
            <span>%25 Tasarruf</span>
            <span>•</span>
            <span>Yol Üstü Eşleşme</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Nasıl Çalışır?
            </button>
          </div>
        </div>
      </footer>

      {/* Nasıl Çalışır? Giriş Modalı */}
      <SystemTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Sürücü Yeni Rota Modalı */}
      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onTripCreated={newTrip => {
          setSelectedTrip(newTrip);
          handleRefresh();
        }}
      />

      {/* İlan Havuzuna Kargo Bırak Modalı */}
      <PackagePoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        onPackageAdded={() => handleRefresh()}
      />
    </div>
  );
}

export default App;
