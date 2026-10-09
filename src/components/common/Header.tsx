import React from 'react';
import { 
  Package, 
  Car, 
  ShieldCheck, 
  Calculator, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle,
  Star
} from 'lucide-react';
import { CURRENT_USER } from '../../lib/mockStore';

export type ActiveTab = 'sender' | 'driver' | 'escrow' | 'calculator';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenTour: () => void;
  onResetData: () => void;
  pendingEscrowCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenTour,
  onResetData,
  pendingEscrowCount
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#080C14]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Platform İsmi */}
          <div className="flex items-center gap-3.5 shrink-0 cursor-pointer" onClick={() => onTabChange('sender')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-[#0B101E] rounded-[14px] flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white m-0 p-0 font-sans">
                  EMANET
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Bagaj & Kargo Paylaşımı
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Şehirler Arası Güvenli ve İndirimli Kargo Gönderimi
              </p>
            </div>
          </div>

          {/* Ana Kullanıcı Sekmeleri (Sade ve Anlaşılır) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/5">
            <button
              type="button"
              onClick={() => onTabChange('sender')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'sender'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Kargo Gönder & Ara</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('driver')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'driver'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Sürücüyüm (Bagaj Paylaş)</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('escrow')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'escrow'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Güvenli Teslimat & Kodlar</span>
              {pendingEscrowCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                  {pendingEscrowCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('calculator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Fiyat Hesapla</span>
            </button>
          </nav>

          {/* Sağ Aksiyonlar */}
          <div className="flex items-center gap-2.5">
            {/* Nasıl Çalışır? Kolay Rehber Butonu */}
            <button
              type="button"
              onClick={onOpenTour}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Nasıl Çalışır?</span>
            </button>

            {/* Verileri Sıfırla Butonu */}
            <button
              type="button"
              onClick={onResetData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
              title="Örnek Verileri Sıfırla"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Kullanıcı Profili Rozeti */}
            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                  <span>{CURRENT_USER.fullName}</span>
                  <span title="Kimlik Onaylı"><CheckCircle className="w-3 h-3 text-emerald-400" /></span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-amber-300 font-semibold">{CURRENT_USER.rating}</span>
                  <span className="text-slate-500">• Güvenilir Üye</span>
                </div>
              </div>

              <img
                src={CURRENT_USER.avatarUrl}
                alt={CURRENT_USER.fullName}
                className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Mobil Navigasyon Menüsü */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => onTabChange('sender')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'sender' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Kargo Gönder
          </button>
          <button
            type="button"
            onClick={() => onTabChange('driver')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'driver' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Sürücüyüm
          </button>
          <button
            type="button"
            onClick={() => onTabChange('escrow')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium flex items-center gap-1 ${
              activeTab === 'escrow' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <span>Güvenli Teslimat</span>
            {pendingEscrowCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                {pendingEscrowCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('calculator')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'calculator' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Fiyat Hesapla
          </button>
        </div>
      </div>
    </header>
  );
};
