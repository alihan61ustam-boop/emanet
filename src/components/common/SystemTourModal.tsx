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
      subtitle: 'Şehirler arası boş bagaj hacmini güvenle paylaşın',
      icon: Car,
      badge: '1. Sistem Mantığı',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Emanet; şahsi aracıyla şehirler arası seyahat eden sürücüler ile aynı yöne eşya veya paket göndermek isteyen kişileri doğrudan buluşturan modern bir paylaşım platformudur.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                <Car className="w-4 h-4" />
                <span>Sürücüler İçin</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zaten gideceğiniz yolda bagajınızdaki boş yeri değerlendirin. Yol üstünden kargo alıp bırakarak <strong>akaryakıt ve otoyol masraflarınızı çıkarın</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
                <PackageCheck className="w-4 h-4" />
                <span>Kargo Gönderenler İçin</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kargonuzu şubelerde günlerce bekletmeden, doğrudan yoldaki güvenilir bir sürücüyle <strong>aynı gün içinde ve %25 daha ucuza</strong> gönderin.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center gap-3 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hem sürücü kazanır, hem kargo sahibi tasarruf eder, hem de kargo hızla hedefine varır.</span>
          </div>
        </div>
      )
    },
    {
      id: 'pricing',
      title: 'Net %25 Daha Ucuz Fiyat Garantisi',
      subtitle: 'Standart kargo şirketlerinin fiyatına göre her zaman avantajlı',
      icon: TrendingDown,
      badge: '2. Fiyat Avantajı',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Kargonuzun hacmi (desi) ve mesafesine göre sistem adil ve şeffaf bir fiyat belirler.
          </p>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
              <span>Örnek Kargo Karşılaştırması (İstanbul → Ankara, 6 Desi):</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">%25 Tasarruf</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div>
                <span className="text-xs text-slate-400">Normal Kargo Firmaları:</span>
                <div className="text-base text-slate-400 line-through font-mono font-semibold">440 TL</div>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-400 font-semibold">Emanet Fiyatı:</span>
                <div className="text-2xl font-extrabold text-white font-mono">
                  330 TL <span className="text-xs text-emerald-400 font-bold">(110 TL Cebinizde!)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-slate-400 font-semibold">%85 Sürücüye Ödenir</span>
              <p className="text-[11px] text-slate-300">Ödenen tutarın büyük bölümü doğrudan sürücünün net hakedişidir.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-slate-400 font-semibold">%15 Hizmet & Güvence</span>
              <p className="text-[11px] text-slate-300">Platformun kodlu güvenlik altyapısı ve destek masrafları için ayrılır.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'corridor',
      title: 'Yol Üstü Şehirlerden Kargo Alma',
      subtitle: 'Sürücü yolundan sapmadan yolunun üstündeki illere de uğrayabilir',
      icon: MapPin,
      badge: '3. Yol Üstü Duraklar',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Sürücü seyahat ederken ana yolunun en fazla 30 kilometre sağında ve solunda kalan tüm şehir merkezleri otomatik olarak yol üstü durağı sayılır.
          </p>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
            <div className="text-xs font-bold text-white">Örnek Yolculuk: İstanbul'dan Ankara'ya Giden Bir Sürücü</div>
            
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-950/80 text-xs text-slate-300">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">İstanbul (Kalkış)</span>
              <span>→</span>
              <span className="text-slate-200">Kocaeli</span>
              <span>→</span>
              <span className="text-slate-200">Sakarya</span>
              <span>→</span>
              <span className="text-slate-200">Düzce</span>
              <span>→</span>
              <span className="text-slate-200">Bolu</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">Ankara (Varış)</span>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Böylece Sakarya'dan Bolu'ya veya Kocaeli'den Ankara'ya kargo göndermek isteyen biri, aynı otoyoldan geçen sürücüyle kolayca eşleşebilir.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Sistem ters yöndeki (örneğin Ankara'dan İstanbul'a giden) araçları eşleştirmeyerek kargonun doğru yöne gitmesini güvenceye alır.</span>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: '4 Haneli Güvenlik Kodları ile Sıfır Risk',
      subtitle: 'Kargonuz sağlam teslim edilene kadar ödeme sürücüye geçmez',
      icon: KeyRound,
      badge: '4. Güvenli Teslimat',
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Paranız teslimat bitene kadar sistem güvencesinde bekletilir. Süreç iki basit adımla işler:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">1</span>
                <span>Teslim Alma Kodu (Pickup OTP)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sürücü kapınıza gelip kargoyu teslim alırken, ekranınızda beliren <strong>4 haneli kodu</strong> sürücüye söylersiniz. Sürücü ambalaj fotoğrafıyla onaylar ve kargo yola çıkar.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">2</span>
                <span>Teslimat Kodu (Delivery OTP)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kargo alıcıya ulaştığında, alıcı paketi kontrol eder ve sürücüye <strong>4 haneli teslimat kodunu</strong> verir. Kod girildiği an sürücünün parası serbest bırakılır.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Alıcı teslimat kodunu vermediği sürece ödeme asla aktarılmaz. İki taraf için de %100 güvenlidir.</span>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[activeTab];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0D1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Üst Şerit */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-500" />
        
        {/* Başlık */}
        <div className="p-6 pb-4 border-b border-white/5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Nasıl Çalışır?
              </span>
              <span className="text-xs text-slate-400">Adım {activeTab + 1} / {steps.length}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {currentStep.title}
            </h2>
            <p className="text-xs text-slate-400">
              {currentStep.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Adım Seçici Butonları */}
        <div className="px-6 py-2.5 bg-slate-900/60 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto">
          {steps.map((s, idx) => {
            const isActive = idx === activeTab;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
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
        <div className="p-5 border-t border-white/5 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
            />
            <span>Bir sonraki gelişimde otomatik açma</span>
          </label>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Önceki</span>
              </button>
            )}

            {activeTab < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab(prev => prev + 1)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>Sonraki Adım</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Anladım, Kullanmaya Başla</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
