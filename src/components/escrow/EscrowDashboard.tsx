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
  ArrowRight, 
  TrendingDown,
  Building2,
  Clock,
  Sparkles
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
      {/* Üst İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <span>Güvencede Bekleyen Tutar</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {totalHeldInEscrow} <span className="text-sm font-semibold text-purple-400">TL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Teslimat onaylanana dek korumada
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Sürücülere Ödenen Net</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {totalReleasedPayout} <span className="text-sm font-semibold text-emerald-300">TL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            %85 oranında doğrudan sürücü kazancı
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-blue-500/30 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <span>Platform Hizmet Geliri</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            {totalPlatformFees} <span className="text-sm font-semibold text-blue-300">TL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            %15 platform altyapı & sigorta payı
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <span>Kullanıcı Toplam Tasarrufu</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {totalUserSavings} <span className="text-sm font-semibold text-amber-300">TL</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Piyasa kargo şirketlerine kıyasla cepte kalan
          </div>
        </div>
      </div>

      {/* Filtre Barı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Güvenli Teslimat & Kod Doğrulama</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              {filteredMatches.length} İşlem
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Fotoğraflı teslim alma, 4 haneli güvenlik kodları ve garantili ödeme akışı
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/5 self-start sm:self-auto overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filter === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending_pickup')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filter === 'pending_pickup' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Teslim Alınacaklar
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_transit')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filter === 'in_transit' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yoldakiler
          </button>
          <button
            type="button"
            onClick={() => setFilter('released')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filter === 'released' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ödenenler
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
                className="p-6 rounded-3xl bg-slate-900/80 border border-white/5 space-y-5 shadow-xl hover:border-emerald-500/20 transition-all"
              >
                {/* Üst Bilgi Satırı */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{match.id}</span>
                      <span className="text-sm font-bold text-white">{pkg.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {pkg.desi} Desi
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {pkg.originCity} → {pkg.destinationCity} • Taşıyıcı: <strong>{trip.driverName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white font-mono">
                        {pkg.emanetPrice} TL
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        Sürücü Net: {pkg.driverPayout} TL (%85)
                      </div>
                    </div>

                    {isDelivered ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Escrow Çözüldü</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Havuzda Bloke</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Teslimat İlerleme Adımları (Stepper) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 pb-2">
                  {/* Adım 1: Eşleşme */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span>1. Eşleşme</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] text-slate-400">Tutar bloke edildi</div>
                  </div>

                  {/* Adım 2: Teslim Alma */}
                  <div className={`p-3 rounded-2xl border space-y-1 ${
                    isPickedUp
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>2. Teslim Alma</span>
                      {isPickedUp ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {isPickedUp ? 'Fotoğraf & OTP Onaylı' : `Pickup OTP: ${match.pickupOtp}`}
                    </div>
                  </div>

                  {/* Adım 3: Yolda */}
                  <div className={`p-3 rounded-2xl border space-y-1 ${
                    isDelivered
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : isPickedUp
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                      : 'bg-slate-950/40 border-white/5 text-slate-500'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>3. Yolda (In-Transit)</span>
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px]">
                      {isPickedUp ? 'Taşıma sürüyor' : 'Beklemede'}
                    </div>
                  </div>

                  {/* Adım 4: Teslimat */}
                  <div className={`p-3 rounded-2xl border space-y-1 ${
                    isDelivered
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-white/5 text-slate-500'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>4. Teslim & Bakiye</span>
                      {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <KeyRound className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-[11px]">
                      {isDelivered ? 'Sürücüye Ödendi' : `Alıcı OTP: ${match.deliveryOtp}`}
                    </div>
                  </div>
                </div>

                {/* Aksiyon Barı */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    {match.pickupPhotoUrl && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Fotoğraf kayıtlı</span>
                      </div>
                    )}
                    <span>Alıcı: {pkg.receiverName} ({pkg.receiverPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isPickedUp && (
                      <button
                        type="button"
                        onClick={() => handleOpenPickup(match)}
                        className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>1. Adım: Teslim Al (Pickup OTP Doğrula)</span>
                      </button>
                    )}

                    {isPickedUp && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => handleOpenDelivery(match)}
                        className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>2. Adım: Teslim Et (Delivery OTP & Bakiyeyi Çöz)</span>
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        type="button"
                        onClick={() => setReceiptMatch(match)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resmi Dekontu İncele</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-white">Bu filtrede eşleşme bulunamadı</div>
            <div className="text-xs text-slate-400">Kargo arama sekmesinden yeni bir sürücüyle eşleşme sağlayabilirsiniz.</div>
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
