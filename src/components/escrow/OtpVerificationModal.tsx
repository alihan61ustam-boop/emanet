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

      try {
        confetti({
          particleCount: 120,
          spread: 80,
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
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg chamfer-card bg-[#0D0F14] border-2 border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">
        {/* Üst Bar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12151C]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
              isPickup 
                ? 'bg-purple-600 text-white shadow-purple-500/30' 
                : 'bg-[#CCFF00] text-black shadow-[#CCFF00]/30'
            }`}>
              {isPickup ? <Camera className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] uppercase tracking-widest font-bold ${
                  isPickup ? 'text-purple-400' : 'text-[#CCFF00]'
                }`}>
                  {isPickup ? 'AŞAMA 01: TESLİM ALMA' : 'AŞAMA 02: TESLİMAT DOĞRULAMA'}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                  OTP VAULT
                </span>
              </div>
              <h3 className="text-base font-syne font-extrabold text-white tracking-tight">
                {isPickup ? 'Paketi Teslim Al & Fotoğrafla' : 'Teslimat Onayı & Bakiyeyi Çöz'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 font-mono"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde Formu */}
        <form onSubmit={handleVerify} className="p-6 space-y-5">
          {/* Paket Özeti */}
          <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="font-syne font-bold text-white text-sm">{pkg.title}</span>
              <div className="text-slate-400 mt-0.5 font-mono">
                {pkg.originCity} ➔ {pkg.destinationCity} ({pkg.desi} DESİ)
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Emanet Tutarı:</span>
              <div className="text-base font-syne font-extrabold text-[#CCFF00]">{pkg.emanetPrice} TL</div>
            </div>
          </div>

          {/* Hata Mesajı */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fotoğraf Yükleme / Seçme Alanı */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>{isPickup ? 'Paket Dış Ambalaj Fotoğrafı' : 'Teslimat Anı Görseli'}</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_PACKAGE_PHOTOS.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setCustomPhotoUrl('');
                  }}
                  className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                    selectedPhoto === photo && !customPhotoUrl
                      ? 'border-[#CCFF00] scale-102 ring-2 ring-[#CCFF00]/30'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="Koli" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="veya özel görsel URL'si girin..."
              value={customPhotoUrl}
              onChange={e => setCustomPhotoUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#07080A] border border-white/10 text-white text-xs font-mono focus:border-[#CCFF00] focus:outline-none"
            />
          </div>

          {/* 4 Haneli OTP Girişi */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#FF4500]" />
                <span>4 Haneli Doğrulama Kodu (OTP)</span>
              </label>

              <button
                type="button"
                onClick={() => setOtp(targetOtp)}
                className="text-[11px] text-[#CCFF00] hover:underline font-mono"
                title="Demo kolaylığı için tıkla"
              >
                Kodu Doldur [{targetOtp}]
              </button>
            </div>

            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-lg bg-[#07080A] border-2 border-white/20 text-white font-mono text-center text-3xl font-extrabold tracking-[0.8em] focus:border-[#CCFF00] focus:outline-none focus:ring-4 focus:ring-[#CCFF00]/15"
              required
            />
            <p className="text-[11px] text-slate-400 text-center font-grotesk">
              {isPickup 
                ? 'Göndericinin uygulamasındaki 4 haneli teslim alma kodunu isteyiniz.' 
                : 'Alıcının telefonundaki 4 haneli teslimat şifresini isteyiniz.'}
            </p>
          </div>

          {/* Alt Butonlar */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3 bg-[#0D0F14]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={otp.length !== 4}
              className={`px-6 py-2.5 rounded-lg text-xs font-syne font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 active:translate-y-0.5 ${
                isPickup 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/30'
                  : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[#CCFF00]/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>{isPickup ? 'Kodu Onayla & Teslim Al' : 'Teslimatı Bitir & Bakiyeyi Çöz'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
