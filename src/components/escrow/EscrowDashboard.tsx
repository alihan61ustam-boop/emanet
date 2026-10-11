import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Wallet, 
  CheckCircle2, 
  Camera, 
  KeyRound, 
  Truck, 
  FileText, 
  TrendingDown,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { MatchAndEscrow } from '../../types';
import { OtpVerificationModal } from './OtpVerificationModal';
import { DeliveryReceiptModal } from './DeliveryReceiptModal';

interface EscrowDashboardProps {
  matches: MatchAndEscrow[];
  onRefresh: () => void;
}

export const EscrowDashboard: React.FC<EscrowDashboardProps> = ({
  matches,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'pending_pickup' | 'in_transit' | 'released'>('all');
  const [activeModalMatch, setActiveModalMatch] = useState<MatchAndEscrow | null>(null);
  const [modalMode, setModalMode] = useState<'pickup' | 'delivery'>('pickup');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [receiptMatch, setReceiptMatch] = useState<MatchAndEscrow | null>(null);

  // Toplam Finansal Metrikler
  const totalHeldInEscrow = matches
    .filter(m => m.paymentStatus === 'held_in_escrow')
    .reduce((sum, m) => sum + (m.pkg?.emanetPrice || 0), 0);

  const totalReleasedPayout = matches
    .filter(m => m.paymentStatus === 'released_to_driver')
    .reduce((sum, m) => sum + (m.pkg?.driverPayout || 0), 0);

  const totalPlatformFees = matches
    .filter(m => m.paymentStatus === 'released_to_driver')
    .reduce((sum, m) => sum + (m.pkg?.platformFee || 0), 0);

  const totalUserSavings = matches
    .reduce((sum, m) => sum + (m.pkg?.userSavings || 0), 0);

  // Filtrelenmiş eşleşmeler
  const filteredMatches = matches.filter(m => {
    if (filter === 'pending_pickup') return m.paymentStatus === 'held_in_escrow' && !m.pickedUpAt;
    if (filter === 'in_transit') return m.paymentStatus === 'held_in_escrow' && !!m.pickedUpAt;
    if (filter === 'released') return m.paymentStatus === 'released_to_driver';
    return true;
  });

  const handleOpenPickup = (m: MatchAndEscrow) => {
    setActiveModalMatch(m);
    setModalMode('pickup');
    setIsOtpModalOpen(true);
  };

  const handleOpenDelivery = (m: MatchAndEscrow) => {
    setActiveModalMatch(m);
    setModalMode('delivery');
    setIsOtpModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Üst İstatistik Kartları: Escrow Vault Matrisi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="chamfer-card p-5 bg-[#0D0F14] border-2 border-purple-500/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
            <span>[ESCROW_HELD]</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-white">
            {totalHeldInEscrow} <span className="text-sm font-mono text-purple-400">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            Teslimat onaylanana dek havuzda kilitli
          </div>
        </div>

        <div className="chamfer-card p-5 bg-[#0D0F14] border-2 border-[#CCFF00]/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
            <span>[DRIVER_PAYOUT]</span>
            <Wallet className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-[#CCFF00]">
            {totalReleasedPayout} <span className="text-sm font-mono text-white">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            %85 oranında doğrudan sürücü hakedişi
          </div>
        </div>

        <div className="chamfer-card p-5 bg-[#0D0F14] border-2 border-blue-500/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
            <span>[PLATFORM_FEE]</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-blue-400">
            {totalPlatformFees} <span className="text-sm font-mono text-white">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            %15 platform altyapı & güvence payı
          </div>
        </div>

        <div className="chamfer-card p-5 bg-[#0D0F14] border-2 border-[#FF4500]/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#FF4500] uppercase tracking-wider">
            <span>[NET_SAVINGS]</span>
            <TrendingDown className="w-4 h-4 text-[#FF4500]" />
          </div>
          <div className="text-3xl font-syne font-extrabold text-[#FF4500]">
            {totalUserSavings} <span className="text-sm font-mono text-white">TL</span>
          </div>
          <div className="text-[11px] text-slate-400 font-grotesk">
            Piyasa kargo şirketlerine kıyasla cepte kalan
          </div>
        </div>
      </div>

      {/* Kontrol Barı & Filtreleme */}
      <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#CCFF00] tracking-widest uppercase bg-[#CCFF00]/10 px-2 py-0.5 border border-[#CCFF00]/30 rounded">
              GÜVENLİ ESCROW KONSOLU
            </span>
            <span className="font-mono text-xs text-white/50">ZERO-RISK VERIFICATION</span>
          </div>
          <h2 className="text-xl font-syne font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Teslimat Güvenliği & Kod Teyidi</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-[#CCFF00] font-bold">
              [{filteredMatches.length} İşlem]
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-grotesk">
            Fotoğraflı teslim alma, 4 haneli şifreler ve alıcı teyidiyle otomatik bakiye aktarımı
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#07080A] border border-white/10 self-start sm:self-auto overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              filter === 'all' ? 'bg-[#CCFF00] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            TÜMÜ
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending_pickup')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              filter === 'pending_pickup' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            TESLİM ALINACAK
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_transit')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              filter === 'in_transit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            YOLDA
          </button>
          <button
            type="button"
            onClick={() => setFilter('released')}
            className={`px-3 py-1.5 rounded font-bold transition-all ${
              filter === 'released' ? 'bg-[#CCFF00] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            ÖDENENLER
          </button>
        </div>
      </div>

      {/* İşlemler Listesi */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => {
            const pkg = match.pkg;
            const trip = match.trip;
            if (!pkg || !trip) return null;

            const isPickedUp = !!match.pickedUpAt;
            const isDelivered = match.paymentStatus === 'released_to_driver';

            return (
              <div
                key={match.id}
                className="chamfer-card bg-[#0D0F14] border border-white/10 p-6 space-y-5 hover:border-white/20 transition-all shadow-xl group"
              >
                {/* Üst Bilgi Satırı */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#FF4500] font-bold">
                        ESCROW #{match.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-base font-syne font-bold text-white">{pkg.title}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-[10px] font-mono font-bold">
                        {pkg.desi} DESİ
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-grotesk">
                      {pkg.originCity} ➔ {pkg.destinationCity} • Taşıyıcı: <strong className="text-white">{trip.driverName}</strong> ({trip.vehicleInfo})
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-2xl font-syne font-extrabold text-white">
                        {pkg.emanetPrice} <span className="text-xs font-mono text-slate-400">TL</span>
                      </div>
                      <div className="text-[11px] text-[#CCFF00] font-mono font-bold">
                        Sürücü Net: {pkg.driverPayout} TL (%85)
                      </div>
                    </div>

                    {isDelivered ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>ESCROW ÇÖZÜLDÜ</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-400" />
                        <span>HAVUZDA BLOKE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Teslimat İlerleme Basamakları (4 Aşamalı Matris) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 pb-1">
                  {/* Adım 1: Eşleşme */}
                  <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#CCFF00]">
                      <span>01. EŞLEŞME</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-grotesk">Tutar havuzda bloke edildi</div>
                  </div>

                  {/* Adım 2: Teslim Alma */}
                  <div className={`p-3 rounded-lg border space-y-1 ${
                    isPickedUp
                      ? 'bg-[#07080A] border-emerald-500/40 text-emerald-300'
                      : 'bg-[#150E1C] border-purple-500/40 text-purple-300'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>02. TESLİM ALMA</span>
                      {isPickedUp ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="text-[11px] font-mono">
                      {isPickedUp ? 'Fotoğraf & OTP Onaylandı' : `Pickup OTP: ${match.pickupOtp}`}
                    </div>
                  </div>

                  {/* Adım 3: Yolda */}
                  <div className={`p-3 rounded-lg border space-y-1 ${
                    isDelivered
                      ? 'bg-[#07080A] border-emerald-500/40 text-emerald-300'
                      : isPickedUp
                      ? 'bg-[#0B1422] border-blue-500/40 text-blue-300'
                      : 'bg-[#07080A] border-white/5 text-slate-600'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>03. YOLDA (IN-TRANSIT)</span>
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] font-grotesk">
                      {isPickedUp ? 'Taşıma sürüyor' : 'Beklemede'}
                    </div>
                  </div>

                  {/* Adım 4: Teslimat */}
                  <div className={`p-3 rounded-lg border space-y-1 ${
                    isDelivered
                      ? 'bg-[#07080A] border-emerald-500/40 text-emerald-300'
                      : 'bg-[#07080A] border-white/5 text-slate-600'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>04. TESLİM & BAKİYE</span>
                      {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <KeyRound className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-[11px] font-mono">
                      {isDelivered ? 'Sürücüye Aktarıldı' : `Alıcı OTP: ${match.deliveryOtp}`}
                    </div>
                  </div>
                </div>

                {/* Aksiyon Barı */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 font-grotesk">
                    {match.pickupPhotoUrl && (
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <Camera className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Fotoğraf Arşivde</span>
                      </div>
                    )}
                    <span>Alıcı: <strong className="text-white">{pkg.receiverName}</strong> ({pkg.receiverPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPickedUp && (
                      <button
                        type="button"
                        onClick={() => handleOpenPickup(match)}
                        className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-syne font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.35)] active:translate-y-0.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>1. Adım: Teslim Al (Pickup OTP Doğrula)</span>
                      </button>
                    )}

                    {isPickedUp && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => handleOpenDelivery(match)}
                        className="px-5 py-2.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-syne font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(204,255,0,0.35)] active:translate-y-0.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>2. Adım: Teslim Et (Delivery OTP & Bakiyeyi Çöz)</span>
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        type="button"
                        onClick={() => setReceiptMatch(match)}
                        className="px-4 py-2 rounded-lg bg-[#07080A] hover:bg-[#14161E] text-white font-mono text-xs border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>Resmi Dekontu İncele</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="chamfer-card p-10 bg-[#0D0F14] border border-white/10 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-base font-syne font-bold text-white">Bu filtrede işlem bulunamadı</div>
            <div className="text-xs text-slate-400 font-grotesk">
              Kargo arama sekmesinden yeni bir sürücüyle eşleşme sağlayabilirsiniz.
            </div>
          </div>
        )}
      </div>

      {/* OTP Doğrulama Modalı */}
      <OtpVerificationModal
        match={activeModalMatch}
        mode={modalMode}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={updated => {
          onRefresh();
          if (modalMode === 'delivery') {
            setReceiptMatch(updated);
          }
        }}
      />

      {/* Teslimat Dekont Modalı */}
      <DeliveryReceiptModal
        match={receiptMatch}
        isOpen={!!receiptMatch}
        onClose={() => setReceiptMatch(null)}
      />
    </div>
  );
};
