import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Plus, 
  ArrowRight, 
  Radio, 
  Compass,
  Crown,
  UserCheck,
  Zap
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
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthPage } from './components/auth/AuthPage';
import { store } from './lib/mockStore';
import { DriverTrip, SenderPackage, MatchAndEscrow, UserProfile } from './types';
import { calculateCorridorCities } from './lib/gis';

export function App() {
  // Kullanıcı ve Kimlik Durumu
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => store.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => !store.getCurrentUser());

  // Aktif Sekme (Admin ise varsayılan 'admin', değilse 'sender')
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const user = store.getCurrentUser();
    if (user?.role === 'admin') return 'admin';
    if (user?.role === 'driver') return 'driver';
    return 'sender';
  });

  const [trips, setTrips] = useState<DriverTrip[]>(() => store.getTrips());
  const [packages, setPackages] = useState<SenderPackage[]>(() => store.getPackages());
  const [matches, setMatches] = useState<MatchAndEscrow[]>(() => store.getMatches());
  
  const [selectedTrip, setSelectedTrip] = useState<DriverTrip | null>(() => store.getTrips()[0] || null);

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
      setCurrentUser(store.getCurrentUser());

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
    setCurrentUser(store.getCurrentUser());
  };

  const handleResetData = () => {
    if (confirm('Tüm örnek verileri başlangıç durumuna sıfırlamak istiyor musunuz?')) {
      store.resetToDefaults();
      handleRefresh();
      setSelectedTrip(store.getTrips()[0] || null);
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);

    // Role göre en uygun sekmeye yönlendir
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else if (user.role === 'driver') {
      setActiveTab('driver');
    } else {
      setActiveTab('sender');
    }
  };

  const handleLogout = () => {
    store.logout();
    setCurrentUser(null);
    setIsAuthOpen(true);
  };

  // Eğer kullanıcı oturum açmamışsa veya giriş ekranını açmışsa Kapsamlı Auth Sayfasını Göster
  if (!currentUser || isAuthOpen) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        onExploreAsGuest={() => setIsAuthOpen(false)}
      />
    );
  }

  const corridorResult = selectedTrip
    ? calculateCorridorCities(selectedTrip.routeCoordinates, selectedTrip.originCity, selectedTrip.destinationCity, 30)
    : null;

  const matchingPoolPackages = selectedTrip ? store.getWaitingPackagesForTrip(selectedTrip) : [];
  const pendingEscrowCount = matches.filter(m => m.paymentStatus === 'held_in_escrow').length;

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col font-sans selection:bg-[#FF4500] selection:text-black">
      {/* Üst Menü */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenTour={() => setIsTourOpen(true)}
        onResetData={handleResetData}
        pendingEscrowCount={pendingEscrowCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Ana Gövde */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Karşılama ve Değer Önerisi Alanı: Manifesto 30KM Hero Terminal */}
        <div className="chamfer-card p-6 sm:p-8 bg-gradient-to-r from-[#0F1117] via-[#0E1015] to-[#161208] border-2 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Arka Plan Vurgu Işığı */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4500]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3.5 max-w-2xl">
              
              {/* Kullanıcı Giriş Rozeti & Rol Bilgisi */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF4500]/15 border border-[#FF4500]/30 text-[#FF4500] font-mono text-xs font-bold uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>P2P OTOYOL BAGAJ & KARGO AĞI</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-mono text-xs font-bold">
                  {currentUser.role === 'admin' ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>👑 YÖNETİCİ: {currentUser.fullName}</span>
                    </>
                  ) : currentUser.role === 'driver' ? (
                    <>
                      <Car className="w-3.5 h-3.5 text-[#FF4500]" />
                      <span>🚗 SÜRÜCÜ: {currentUser.fullName}</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      <span>📦 GÖNDERİCİ: {currentUser.fullName}</span>
                    </>
                  )}
                  <span className="text-white/60">• TC ONAYLI</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-white tracking-tight leading-tight">
                Şehirler Arası Boş Bagajını Paylaş, <span className="text-[#CCFF00] underline decoration-[#FF4500] decoration-4">%25 Tasarrufla</span> Kargo Gönder
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-grotesk leading-relaxed">
                Şahsi aracıyla seyahat eden sürücüler ile aynı hatta koli göndermek isteyenleri buluşturan güvenceli, 4 haneli kod teyitli yol arkadaşı platformu.
              </p>

              {/* Hızlı Aksiyon Butonları */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sender')}
                  className={`px-5 py-3 rounded-lg text-xs font-syne font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:translate-y-0.5 ${
                    activeTab === 'sender'
                      ? 'bg-[#CCFF00] text-black shadow-[0_4px_20px_rgba(204,255,0,0.35)]'
                      : 'bg-[#151821] text-white hover:bg-[#1E222E] border border-white/10'
                  }`}
                >
                  <Package className="w-4 h-4 stroke-[2.5]" />
                  <span>Kargo Gönder & Ara</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('driver');
                    setIsCreateTripOpen(true);
                  }}
                  className="px-5 py-3 rounded-lg bg-[#FF4500] hover:bg-[#e03d00] text-black text-xs font-syne font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(255,69,0,0.35)] active:translate-y-0.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Sürücüyüm (Rota Aç)</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="px-4 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-syne font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(251,191,36,0.35)] active:translate-y-0.5"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Admin Paneli</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTourOpen(true)}
                  className="font-mono text-xs text-[#CCFF00] hover:underline font-bold ml-2 flex items-center gap-1"
                >
                  <span>Rehberi İncele</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Yan Taraf: Taktiksel Metrik Blokları */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="chamfer-card p-4 bg-[#08090C] border border-[#CCFF00]/40 space-y-1">
                <div className="text-xs font-mono font-bold text-[#CCFF00] flex items-center gap-1.5 uppercase">
                  <TrendingDown className="w-4 h-4" />
                  <span>%25 İNDİRİM</span>
                </div>
                <div className="text-[11px] text-slate-400 font-grotesk">
                  Piyasa standart kargo şirketlerine kıyasla sabit kazanç
                </div>
              </div>

              <div className="chamfer-card p-4 bg-[#08090C] border border-purple-500/40 space-y-1">
                <div className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KODLU GÜVENCE</span>
                </div>
                <div className="text-[11px] text-slate-400 font-grotesk">
                  Teslim edilene dek tutar havuzda bloke kalır
                </div>
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
              {/* Sol Taraf: Seferler Listesi */}
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
                  <div className="chamfer-card p-5 bg-[#0D0F14] border border-white/10 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] animate-pulse"></span>
                        <h3 className="text-sm font-syne font-bold text-white uppercase tracking-wider">
                          Güzergah & Yol Üstü Durakları
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-[#CCFF00] font-extrabold">
                        ~{selectedTrip.distanceKm} km
                      </span>
                    </div>

                    {/* Harita */}
                    <div className="h-72 w-full rounded-xl overflow-hidden border border-white/15">
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
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span>Yol Üstü Durakları (±30 km Koridoru):</span>
                        </span>
                        <span className="text-[#CCFF00]">{selectedTrip.serviceCities.length} İl</span>
                      </div>

                      <RouteCorridorBadge
                        cities={selectedTrip.serviceCities}
                        highlightOrigin={selectedTrip.originCity}
                        highlightDest={selectedTrip.destinationCity}
                      />
                    </div>

                    {/* Alt İpuçları */}
                    <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-400">BOŞ BAGAJ:</span>
                        <div className="font-extrabold text-[#CCFF00] text-sm">
                          {selectedTrip.availableCapacityDesi} DESİ
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400">KALKIŞ VAKTİ:</span>
                        <div className="text-white font-bold">
                          {new Date(selectedTrip.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="chamfer-card p-8 bg-[#0D0F14] border border-white/10 text-center">
                    <Car className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-grotesk">Haritada incelemek için sol taraftan bir sefer seçin.</p>
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

        {/* 5. SEKME: ADMIN DASHBOARD (Sadece Yönetici Yetkisinde) */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <AdminDashboard
              currentUser={currentUser}
              trips={trips}
              packages={packages}
              matches={matches}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </main>

      {/* Alt Bilgi: Dispatch Terminal Footer */}
      <footer className="mt-12 border-t border-white/10 bg-[#050608] py-8 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-syne font-extrabold text-white tracking-widest text-sm text-[#FF4500]">
              EMANET
            </span>
            <span>• OTOYOL P2P BAGAJ & KARGO DAĞITIM SİSTEMİ</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>[KODLU GÜVENCE]</span>
            <span>•</span>
            <span className="text-[#CCFF00]">[%25 TASARRUF]</span>
            <span>•</span>
            <span>[±30KM KORİDOR]</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="text-[#FF4500] hover:underline font-bold"
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
