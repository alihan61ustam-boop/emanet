import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer, Building2, User, Sparkles } from 'lucide-react';
import { MatchAndEscrow } from '../../types';

interface DeliveryReceiptModalProps {
  match: MatchAndEscrow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryReceiptModal: React.FC<DeliveryReceiptModalProps> = ({
  match,
  isOpen,
  onClose
}) => {
  if (!isOpen || !match || !match.pkg || !match.trip) return null;

  const pkg = match.pkg;
  const trip = match.trip;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg chamfer-card bg-[#0D0F14] border-2 border-[#CCFF00]/50 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col">
        {/* Başarı Başlığı */}
        <div className="p-6 bg-gradient-to-b from-[#18220A] to-[#0D0F14] border-b border-white/10 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 font-mono"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-xl bg-[#CCFF00] text-black flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(204,255,0,0.4)]">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="font-mono text-[10px] px-2.5 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40 font-bold uppercase tracking-widest">
            ESCROW KİLİDİ ÇÖZÜLDÜ • BAKİYE AKTARILDI
          </span>
          <h3 className="text-2xl font-syne font-extrabold text-white mt-1">
            Resmi Emanet İşlem Dekontu
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            REF #{match.id.toUpperCase()} • {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Dekont Gövdesi: Fiziksel Fatura / Makbuz Havası */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Barkod Şeridi */}
          <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center gap-1 h-7 opacity-80">
              <span className="w-1 h-full bg-white"></span>
              <span className="w-2 h-full bg-white"></span>
              <span className="w-0.5 h-full bg-white"></span>
              <span className="w-3 h-full bg-white"></span>
              <span className="w-1 h-full bg-white"></span>
              <span className="w-0.5 h-full bg-white"></span>
              <span className="w-2 h-full bg-white"></span>
              <span className="w-4 h-full bg-white"></span>
              <span className="w-1 h-full bg-white"></span>
              <span className="w-0.5 h-full bg-white"></span>
              <span className="w-2 h-full bg-white"></span>
              <span className="w-3 h-full bg-white"></span>
            </div>
            <span className="font-mono text-[9px] text-slate-400 tracking-widest">
              CERTIFIED SECURE ESCROW CLEARANCE
            </span>
          </div>

          {/* Finansal Dağılım Kartı */}
          <div className="p-4 rounded-xl bg-[#07080A] border border-white/10 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>FİNANSAL DÖKÜM</span>
              <span className="text-[#CCFF00]">ÖDEME TAMAMLANDI</span>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
              <span className="text-sm text-slate-300 font-grotesk">Toplam Emanet Bedeli:</span>
              <span className="text-2xl font-syne font-extrabold text-white">{pkg.emanetPrice} TL</span>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-dashed border-white/10">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-grotesk">
                  <User className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Sürücü Net Hakedişi (%85):</span>
                </span>
                <strong className="text-[#CCFF00] font-syne font-bold text-sm">{pkg.driverPayout} TL</strong>
              </div>

              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-grotesk">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Platform Altyapı Payı (%15):</span>
                </span>
                <span className="text-slate-300 font-bold">{pkg.platformFee} TL</span>
              </div>

              <div className="flex justify-between text-[#CCFF00] bg-[#18220A] p-2.5 rounded-lg border border-[#CCFF00]/30 mt-2">
                <span className="flex items-center gap-1.5 font-grotesk font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kullanıcı Net Tasarrufu:</span>
                </span>
                <strong className="font-syne font-extrabold">{pkg.userSavings} TL (%25 İndirim)</strong>
              </div>
            </div>
          </div>

          {/* Taraflar Bilgisi */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Kargo Sahibi (Gönderen)</div>
              <div className="font-syne font-bold text-white">{pkg.senderName}</div>
              <div className="text-slate-400 font-mono text-[11px]">{pkg.originCity}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Taşıyıcı (Sürücü)</div>
              <div className="font-syne font-bold text-white">{trip.driverName}</div>
              <div className="text-slate-400 font-mono text-[11px]">{trip.destinationCity}</div>
            </div>
          </div>

          {/* Güvenlik Onayı */}
          <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 flex items-center gap-3 text-xs text-slate-400 font-grotesk">
            <ShieldCheck className="w-5 h-5 text-[#CCFF00] shrink-0" />
            <span>Alıcı teslimat şifresini (Delivery OTP) başarıyla onayladı. Tutar sürücünün hesabına derhal aktarıldı.</span>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="p-4 border-t border-white/10 bg-[#07080A] flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Dekontu Yazdır</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-syne font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(204,255,0,0.3)] active:translate-y-0.5"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
