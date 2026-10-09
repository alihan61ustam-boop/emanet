import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MatchAndEscrow } from '../../types';
import { SAMPLE_PACKAGE_PHOTOS, verifyPickup, verifyDelivery } from '../../lib/escrow';
import { store } from '../../lib/mockStore';

interface OtpVerificationModalProps {
  match: MatchAndEscrow | null;
  mode: 'pickup' | 'delivery';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedMatch: MatchAndEscrow) => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  match,
  mode,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [otp, setOtp] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_PACKAGE_PHOTOS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !match || !match.pkg) return null;

  const pkg = match.pkg;
  const isPickup = mode === 'pickup';
  const targetOtp = isPickup ? match.pickupOtp : match.deliveryOtp;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activePhoto = customPhotoUrl.trim() || selectedPhoto;

    if (isPickup) {
      const result = verifyPickup(match, otp, activePhoto);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      store.confirmPickup(match.id, otp, activePhoto);
      onSuccess(match);
      onClose();
    } else {
      const result = verifyDelivery(match, otp, activePhoto);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      store.confirmDelivery(match.id, otp, activePhoto);

      // Kutlama Konfetisi Patlat
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }

      onSuccess(match);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Üst Bar */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isPickup ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isPickup ? <Camera className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isPickup ? '1. Aşama: Paketi Teslim Al & Fotoğrafla' : '2. Aşama: Teslimat Onayı & Escrow Çözümü'}
              </h3>
              <p className="text-xs text-slate-400">
                {isPickup ? 'Göndericiden 4 haneli teslim alma kodunu (Pickup OTP) alınız' : 'Alıcıdan 4 haneli teslimat kodunu (Delivery OTP) alınız'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde Formu */}
        <form onSubmit={handleVerify} className="p-6 space-y-5">
          {/* Paket Özeti */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white text-sm">{pkg.title}</span>
              <div className="text-slate-400 mt-0.5">
                {pkg.originCity} → {pkg.destinationCity} ({pkg.desi} Desi)
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Emanet Tutarı:</span>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">{pkg.emanetPrice} TL</div>
            </div>
          </div>

          {/* Hata Mesajı */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fotoğraf Yükleme / Seçme Alanı (Özellikle Teslim Alırken Kural) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>{isPickup ? 'Paket Dış Ambalaj Fotoğrafı' : 'Teslimat Anı Doğrulama Fotoğrafı'}</span>
            </label>

            {/* Örnek Foto Galeri Seçimi */}
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_PACKAGE_PHOTOS.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setCustomPhotoUrl('');
                  }}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                    selectedPhoto === photo && !customPhotoUrl
                      ? 'border-emerald-500 scale-102 ring-2 ring-emerald-500/20'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="Örnek Koli" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="veya özel görsel URL'si girin..."
                value={customPhotoUrl}
                onChange={e => setCustomPhotoUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4 Haneli OTP Girişi */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>4 Haneli Doğrulama Kodu (OTP)</span>
              </label>

              {/* Demo Kolaylığı İçin Tıkla-Doldur Butonu */}
              <button
                type="button"
                onClick={() => setOtp(targetOtp)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline"
                title="Test etmek için otomatik doldur"
              >
                Kodu Doldur ({targetOtp})
              </button>
            </div>

            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white font-mono text-center text-2xl font-bold tracking-[1em] focus:border-emerald-500 focus:outline-none"
              required
            />
            <p className="text-[11px] text-slate-500 text-center">
              {isPickup 
                ? 'Göndericinin uygulamasında görünen 4 haneli kodu isteyiniz.' 
                : 'Alıcının telefonuna gelen 4 haneli teyit kodunu giriniz.'}
            </p>
          </div>

          {/* Alt Butonlar */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={otp.length !== 4}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 ${
                isPickup 
                  ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/25'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPickup ? 'Kodu Onayla & Teslim Al' : 'Teslimatı Bitir & Bakiyeyi Çöz'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
