import React from 'react';
import { 
  Package, 
  Car, 
  ShieldCheck, 
  Calculator, 
  HelpCircle, 
  RotateCcw, 
  Star, 
  CheckCircle2, 
  Radio, 
  LogOut, 
  User, 
  Crown,
  LogIn
} from 'lucide-react';
import { UserProfile } from '../../types';

export type ActiveTab = 'sender' | 'driver' | 'escrow' | 'calculator' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenTour: () => void;
  onResetData: () => void;
  pendingEscrowCount: number;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenTour,
  onResetData,
  pendingEscrowCount,
  currentUser,
  onLogout,
  onOpenAuth
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090A0D]/95 backdrop-blur-md border-b border-[#20232F]">
      {/* Üst İnce Canlı Ticker Bandı */}
      <div className="bg-[#050608] border-b border-[#1A1D27] py-1 px-4 text-[11px] font-mono flex items-center justify-between text-[#787E92]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#FF4500] font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>SİSTEM AKTİF: 81 İL BAĞLANTISI</span>
          </span>
          <span className="hidden sm:inline text-[#3F4455]">•</span>
          <span className="hidden sm:inline text-[#9DA3B7]">30 KM YOL ÜSTÜ GÜZERGÂH KORUMASI</span>
        </div>

        <div className="flex items-center gap-4 text-[#9DA3B7]">
          <span className="text-[#CCFF00] font-bold font-mono">NET %25 İNDİRİMLİ TARİFE</span>
          <span className="hidden md:inline text-[#3F4455]">•</span>
          <span className="hidden md:inline font-mono">GÜVENLİ ÇİFT KOD SİSTEMİ</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Platform İsmi */}
          <div 
            className="flex items-center gap-3.5 shrink-0 cursor-pointer group" 
            onClick={() => onTabChange('sender')}
          >
            {/* Endüstriyel Bagaj Mührü İkonu */}
            <div className="w-11 h-11 bg-[#12141C] border border-[#2B2F40] rounded-lg flex items-center justify-center relative overflow-hidden group-hover:border-[#FF4500] transition-colors">
              <div className="absolute top-0 left-0 w-2 h-2 bg-[#FF4500]" />
              <Package className="w-5 h-5 text-[#FF4500]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white m-0 p-0 font-display font-syne">
                  EMANET
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-[#FF4500]/15 text-[#FF5719] text-[10px] font-mono font-extrabold uppercase tracking-wider border border-[#FF4500]/30">
                  P2P CARGO
                </span>
              </div>
              <p className="text-[11px] text-[#7A8094] font-mono hidden sm:block tracking-wide">
                ŞEHİRLER ARASI BAGAJ & KARGO MANİFESTOSU
              </p>
            </div>
          </div>

          {/* Ana Navigasyon Sekmeleri */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#11131A] border border-[#212431]">
            <button
              type="button"
              onClick={() => onTabChange('sender')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sender'
                  ? 'bg-[#FF4500] text-black shadow-lg shadow-[#FF4500]/25'
                  : 'text-[#8E94A8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>[01] KARGO GÖNDER</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('driver')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'driver'
                  ? 'bg-[#FF4500] text-black shadow-lg shadow-[#FF4500]/25'
                  : 'text-[#8E94A8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>[02] SÜRÜCÜ İLANI</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('escrow')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 relative ${
                activeTab === 'escrow'
                  ? 'bg-[#FF4500] text-black shadow-lg shadow-[#FF4500]/25'
                  : 'text-[#8E94A8] hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>[03] GÜVENCE</span>
              {pendingEscrowCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#CCFF00] text-black text-[9px] font-black flex items-center justify-center font-mono">
                  {pendingEscrowCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('calculator')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-[#FF4500] text-black shadow-lg shadow-[#FF4500]/25'
                  : 'text-[#8E94A8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>[04] TARİFE</span>
            </button>

            {/* Admin Giriş Yaptıysa Gösterilecek Sekme */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onTabChange('admin')}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/25'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/30'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>[05] YÖNETİM</span>
              </button>
            )}
          </nav>

          {/* Sağ Aksiyonlar: Rehber & Profil & Çıkış */}
          <div className="flex items-center gap-2.5">
            {/* Rehber Butonu */}
            <button
              type="button"
              onClick={onOpenTour}
              className="px-3 py-2 rounded-xl bg-[#141720] hover:bg-[#1D212E] border border-[#2C3144] hover:border-[#FF4500]/50 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5"
              title="Sistem Rehberi"
            >
              <HelpCircle className="w-4 h-4 text-[#FF4500]" />
              <span className="hidden sm:inline">REHBER</span>
            </button>

            {/* Verileri Sıfırla */}
            <button
              type="button"
              onClick={onResetData}
              className="p-2 rounded-xl text-[#787E92] hover:text-white hover:bg-white/5 border border-[#20232F] transition-all"
              title="Örnek Verileri Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Kullanıcı Giriş Durumu & Profil Rozeti */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#20232F]">
                <div className="hidden lg:block text-right font-mono">
                  <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                    <span>{currentUser.fullName}</span>
                    <CheckCircle2 className="w-3 h-3 text-[#CCFF00]" />
                  </div>
                  <div className="text-[10px] text-[#868C9F] flex items-center gap-1 justify-end">
                    {currentUser.role === 'admin' ? (
                      <span className="text-amber-400 font-bold">👑 ADMİN</span>
                    ) : currentUser.role === 'driver' ? (
                      <span className="text-[#FF4500] font-bold">🚗 SÜRÜCÜ</span>
                    ) : (
                      <span className="text-purple-400 font-bold">📦 GÖNDERİCİ</span>
                    )}
                    <span>• {currentUser.tcNo.slice(0, 3)}*** ONAYLI</span>
                  </div>
                </div>

                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.fullName}
                  className="w-9 h-9 rounded-lg object-cover border border-[#2B2F40]"
                  title={currentUser.fullName}
                />

                {/* Çıkış Yap Butonu */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-[#20232F] hover:border-red-500/40 transition-all"
                  title="Hesaptan Çıkış Yap"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-syne font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobil Navigasyon Menüsü */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => onTabChange('sender')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
              activeTab === 'sender' ? 'bg-[#FF4500] text-black' : 'text-[#8E94A8]'
            }`}
          >
            [01] Kargo
          </button>
          <button
            type="button"
            onClick={() => onTabChange('driver')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
              activeTab === 'driver' ? 'bg-[#FF4500] text-black' : 'text-[#8E94A8]'
            }`}
          >
            [02] Sürücü
          </button>
          <button
            type="button"
            onClick={() => onTabChange('escrow')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold flex items-center gap-1 ${
              activeTab === 'escrow' ? 'bg-[#FF4500] text-black' : 'text-[#8E94A8]'
            }`}
          >
            <span>[03] Güvenlik</span>
            {pendingEscrowCount > 0 && (
              <span className="px-1.5 rounded-full bg-[#CCFF00] text-black text-[9px] font-bold">
                {pendingEscrowCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('calculator')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
              activeTab === 'calculator' ? 'bg-[#FF4500] text-black' : 'text-[#8E94A8]'
            }`}
          >
            [04] Tarife
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onTabChange('admin')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                activeTab === 'admin' ? 'bg-amber-400 text-black' : 'text-amber-400'
              }`}
            >
              [05] Yönetim
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
