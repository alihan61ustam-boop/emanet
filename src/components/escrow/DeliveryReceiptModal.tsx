import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer, ArrowDownRight, Sparkles, Building2, User } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1322] border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col">
        {/* Başarı Başlığı */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/70 to-transparent border-b border-white/5 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            Teslimat Onaylandı & Escrow Çözüldü
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            Resmi Emanet İşlem Dekontu
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            İşlem ID: {match.id.toUpperCase()} • {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Dekont Gövdesi */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Finansal Dağılım Kartı */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Emanet Finansal Detayı</span>
              <span className="text-emerald-400 font-bold">Ödeme Tamamlandı</span>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
              <span className="text-sm text-slate-300">Toplam Emanet Tutarı:</span>
              <span className="text-2xl font-extrabold text-white font-mono">{pkg.emanetPrice} TL</span>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-white/5">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sürücü Net Hakedişi (%85):</span>
                </span>
                <strong className="text-emerald-400 font-mono text-sm">{pkg.driverPayout} TL</strong>
              </div>

              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Platform Hizmet Bedeli (%15):</span>
                </span>
                <span className="font-mono text-slate-300">{pkg.platformFee} TL</span>
              </div>

              <div className="flex justify-between text-emerald-400 bg-emerald-950/40 p-2 rounded-xl mt-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kullanıcının Net Tasarrufu:</span>
                </span>
                <strong className="font-mono">{pkg.userSavings} TL (%25 İndirim)</strong>
              </div>
            </div>
          </div>

          {/* Taraflar Bilgisi */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Kargo Sahibi (Gönderen)</div>
              <div className="font-bold text-white">{pkg.senderName}</div>
              <div className="text-slate-400">{pkg.originCity}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Taşıyıcı (Sürücü)</div>
              <div className="font-bold text-white">{trip.driverName}</div>
              <div className="text-slate-400">{trip.destinationCity}</div>
            </div>
          </div>

          {/* Güvenlik Onayı */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Alıcı teslimat kodunu (Delivery OTP) başarıyla doğruladı. Bakiye anında transfer edildi.</span>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="p-5 border-t border-white/5 bg-slate-900/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Dekontu Yazdır</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
