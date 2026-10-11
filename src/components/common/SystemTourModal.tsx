import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  TrendingDown, 
  Car, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  PackageCheck
} from 'lucide-react';

interface SystemTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemTourModal: React.FC<SystemTourModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('emanet_hide_tour_modal', 'true');
    }
    onClose();
  };

  const steps = [
    {
      id: 'concept',
      title: 'Emanet Nedir? Nasıl Çalışır?',
      subtitle: 'Şehirler arası şahsi araçların boş bagajını güvenle paylaşın',
      icon: Car,
      badge: '01. SİSTEM MANTIĞI',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed font-grotesk">
            Emanet; şahsi aracıyla şehirler arası seyahat eden sürücüler ile aynı istikamete paket göndermek isteyen kişileri doğrudan buluşturan modern bir yol arkadaşı platformudur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-[#07080A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#FF4500] uppercase">
                <Car className="w-4 h-4" />
                <span>Sürücüler İçin</span>
              </div>
              <p className="text-xs text-slate-300 font-grotesk leading-relaxed">
                Zaten gideceğiniz güzergahta bagajınızdaki boş yeri değerlendirin. Yol üstünden kargo alıp bırakarak <strong>yakıt ve gişe masraflarınızı karşılayın</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#07080A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#00E5FF] uppercase">
                <PackageCheck className="w-4 h-4" />
                <span>Göndericiler İçin</span>
              </div>
              <p className="text-xs text-slate-300 font-grotesk leading-relaxed">
                Kargonuzu şubelerde günlerce bekletmeden, doğrudan yoldaki doğrulanmış bir sürücüyle <strong>aynı gün içinde ve net %25 daha ucuza</strong> ulaştırın.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#141208] border border-[#FF4500]/30 flex items-center gap-3 text-xs text-slate-300 font-grotesk">
            <Sparkles className="w-4 h-4 text-[#FF4500] shrink-0" />
            <span>Hem sürücü kazanır, hem kargo sahibi tasarruf eder, hem de gönderiniz doğrudan varış noktasına teslim edilir.</span>
          </div>
        </div>
      )
    },
    {
      id: 'pricing',
      title: 'Net %25 Daha Uygun Fiyat Garantisi',
      subtitle: 'Piyasa kargo firmalarının fiyatına göre her zaman avantajlı ve şeffaf',
      icon: TrendingDown,
      badge: '02. FİYAT DİNAMİĞİ',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed font-grotesk">
            Kargonuzun hacmi (desi) ve mesafesine göre sistem adil ve şeffaf bir tarife hesaplar.
          </p>

          <div className="p-4 rounded-xl bg-[#07080A] border border-[#CCFF00]/40 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-[#CCFF00]">
              <span>ÖRNEK: İSTANBUL ➔ ANKARA (6 DESİ KOLİ)</span>
              <span className="px-2 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] font-bold">%25 TASARRUF</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
              <div>
                <span className="text-[11px] text-slate-400 font-grotesk">Standart Kargo Şirketleri:</span>
                <div className="text-base text-slate-500 line-through font-bold">440 TL</div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[#CCFF00] font-grotesk font-bold">Emanet Fiyatı:</span>
                <div className="text-2xl font-syne font-extrabold text-white">
                  330 TL <span className="text-xs text-[#CCFF00] font-mono font-bold">(110 TL Cepte!)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 space-y-1">
              <span className="font-mono text-[#CCFF00] font-bold">%85 Sürücü Kazancı</span>
              <p className="text-[11px] text-slate-400 font-grotesk">Ödemenin büyük kısmı doğrudan sürücünün net hakedişidir.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 space-y-1">
              <span className="font-mono text-blue-400 font-bold">%15 Hizmet & Sigorta</span>
              <p className="text-[11px] text-slate-400 font-grotesk">Kodlu güvenlik altyapısı ve destek masrafları için ayrılır.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'corridor',
      title: 'Yol Üstü Şehirlerden Kargo Alma',
      subtitle: 'Sürücü ana yoldan sapmadan ±30 km mesafedeki illerden de kargo alabilir',
      icon: MapPin,
      badge: '03. YOL ÜSTÜ DURAKLAR',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed font-grotesk">
            Sürücü seyahat ederken ana yolunun en fazla 30 kilometre çevresinde kalan tüm şehir merkezleri otomatik olarak yol üstü durağı sayılır.
          </p>

          <div className="p-4 rounded-xl bg-[#07080A] border border-white/10 space-y-3">
            <div className="text-xs font-syne font-bold text-white uppercase tracking-wider">
              Örnek: İstanbul'dan Ankara'ya Giden Sürücünün Koridoru
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg bg-[#0E1015] font-mono text-xs text-slate-300">
              <span className="px-2 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] font-bold">34·İST (Kalkış)</span>
              <span>➔</span>
              <span className="text-slate-200">41·KOC</span>
              <span>➔</span>
              <span className="text-slate-200">54·SAK</span>
              <span>➔</span>
              <span className="text-slate-200">81·DÜZ</span>
              <span>➔</span>
              <span className="text-slate-200">14·BOL</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded bg-[#FF4500]/15 text-[#FF4500] font-bold">06·ANK (Varış)</span>
            </div>

            <p className="text-xs text-slate-400 font-grotesk leading-normal">
              Böylece Sakarya'dan Bolu'ya veya Kocaeli'den Ankara'ya kargo göndermek isteyen biri, aynı otoyoldan geçen sürücüyle zahmetsizce eşleşir.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#141208] border border-[#FF4500]/30 text-xs text-[#FF4500] flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Sistem ters yöndeki araçları eşleştirmeyerek kargonun daima doğru yöne gitmesini güvenceye alır.</span>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: '4 Haneli Güvenlik Kodları ile Sıfır Risk',
      subtitle: 'Kargonuz sağlam teslim edilene kadar ödeme sürücüye geçmez',
      icon: KeyRound,
      badge: '04. GÜVENLİ ESCROW',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed font-grotesk">
            Ödemeniz teslimat bitene kadar sistem güvencesinde (escrow) bekletilir. Süreç iki basit adımla işler:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#140E1B] border border-purple-500/40 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-purple-300">
                <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>TESLİM ALMA KODU (PICKUP OTP)</span>
              </div>
              <p className="text-xs text-slate-300 font-grotesk leading-relaxed">
                Sürücü kapınızdan paketi alırken, ekranınızdaki <strong>4 haneli kodu</strong> sürücüye verirsiniz. Sürücü ambalaj fotoğrafıyla onaylar ve kargo yola çıkar.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1E10] border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-300">
                <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>TESLİMAT KODU (DELIVERY OTP)</span>
              </div>
              <p className="text-xs text-slate-300 font-grotesk leading-relaxed">
                Kargo alıcıya ulaştığında, alıcı paketi kontrol eder ve sürücüye <strong>4 haneli teslimat kodunu</strong> söyler. Kod girildiği anda para sürücüye aktarılır.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#07080A] border border-white/10 flex items-center gap-3 text-xs text-slate-400 font-grotesk">
            <ShieldCheck className="w-4 h-4 text-[#CCFF00] shrink-0" />
            <span>Alıcı teslimat kodunu vermediği sürece ödeme asla aktarılmaz. İki taraf için de %100 güvenceli bir sistemdir.</span>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[activeTab];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl chamfer-card bg-[#0D0F14] border-2 border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Üst Şerit */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 bg-[#12151C]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest font-bold bg-[#CCFF00]/10 px-2 py-0.5 rounded border border-[#CCFF00]/30">
                KULLANIM REHBERİ
              </span>
              <span className="font-mono text-xs text-slate-400">ADIM [{activeTab + 1} / {steps.length}]</span>
            </div>
            <h2 className="text-xl font-syne font-extrabold text-white tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-xs text-slate-400 font-grotesk">
              {currentStep.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 font-mono"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Adım Seçici Tabları */}
        <div className="px-6 py-2.5 bg-[#07080A] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto font-mono text-xs">
          {steps.map((s, idx) => {
            const isActive = idx === activeTab;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 rounded font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#CCFF00] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Gövde */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep.content}
        </div>

        {/* Alt Butonlar */}
        <div className="p-5 border-t border-white/10 bg-[#07080A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer font-mono">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-[#FF4500] focus:ring-[#FF4500]"
            />
            <span>Bir daha otomatik açma</span>
          </label>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab(prev => prev - 1)}
                className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Önceki</span>
              </button>
            )}

            {activeTab < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab(prev => prev + 1)}
                className="px-5 py-2 rounded-lg text-xs font-syne font-extrabold uppercase tracking-wider text-black bg-[#FF4500] hover:bg-[#e03d00] transition-all flex items-center gap-1.5 shadow-[0_4px_15px_rgba(255,69,0,0.3)] active:translate-y-0.5"
              >
                <span>Sonraki Adım</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg text-xs font-syne font-extrabold uppercase tracking-wider text-black bg-[#CCFF00] hover:bg-[#b8e600] transition-all flex items-center gap-1.5 shadow-[0_4px_15px_rgba(204,255,0,0.3)] active:translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Anladım, Platformu Kullan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
