import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  CheckCircle2, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { TURKISH_CITIES, getCityByName } from '../../lib/turkishCities';
import { calculateEmanetPricing } from '../../lib/pricing';
import { generateFallbackRoute } from '../../lib/gis';
import { SavingsBadge } from '../common/SavingsBadge';
import { CURRENT_USER, store } from '../../lib/mockStore';
import { PackageType, SenderPackage } from '../../types';

interface PackagePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrigin?: string;
  initialDest?: string;
  initialDesi?: number;
  initialPackageType?: PackageType;
  onPackageAdded: (pkg: SenderPackage) => void;
}

export const PackagePoolModal: React.FC<PackagePoolModalProps> = ({
  isOpen,
  onClose,
  initialOrigin = 'Sakarya',
  initialDest = 'Ankara',
  initialDesi = 6,
  initialPackageType = 'orta',
  onPackageAdded
}) => {
  const [originCity, setOriginCity] = useState<string>(initialOrigin);
  const [destCity, setDestCity] = useState<string>(initialDest);
  const [desi, setDesi] = useState<number>(initialDesi);
  const [packageType, setPackageType] = useState<PackageType>(initialPackageType);
  const [title, setTitle] = useState<string>('Özel Koli ve Belge Dosyası');
  const [receiverName, setReceiverName] = useState<string>('Mehmet Yıldız');
  const [receiverPhone, setReceiverPhone] = useState<string>('+90 (532) 999-0011');
  const [readyDate, setReadyDate] = useState<string>('2026-10-10T10:00');

  if (!isOpen) return null;

  const origin = getCityByName(originCity) || TURKISH_CITIES[0];
  const dest = getCityByName(destCity) || TURKISH_CITIES[1];

  const route = generateFallbackRoute(origin, dest);
  const pricing = calculateEmanetPricing(route.distanceKm, desi);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = store.getCurrentUser() || CURRENT_USER;

    const newPkg: SenderPackage = {
      id: `pkg-${Date.now()}`,
      senderId: user.id,
      senderName: user.fullName,
      senderPhone: user.phone,
      originCity,
      originCoords: [origin.lat, origin.lng],
      destinationCity: destCity,
      destinationCoords: [dest.lat, dest.lng],
      desi,
      packageType,
      title,
      receiverName,
      receiverPhone,
      readyDate: new Date(readyDate).toISOString(),
      distanceKm: route.distanceKm,
      quotedMarketPrice: pricing.marketPrice,
      emanetPrice: pricing.emanetPrice,
      userSavings: pricing.userSavings,
      driverPayout: pricing.driverPayout,
      platformFee: pricing.platformFee,
      status: 'waiting_match',
      createdAt: new Date().toISOString()
    };

    store.addPackage(newPkg);
    onPackageAdded(newPkg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl chamfer-card bg-[#0D0F14] border-2 border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Üst Bar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12151C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFF00] text-black flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.35)]">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest font-bold">
                  HAVUZ İLAN MANİFESTOSU
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                  PARCEL INTAKE
                </span>
              </div>
              <h2 className="text-lg font-syne font-extrabold text-white tracking-tight">
                İlan Havuzuna Kargo Bırak
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Fiyat Tasarruf Kartı */}
          <SavingsBadge
            marketPrice={pricing.marketPrice}
            emanetPrice={pricing.emanetPrice}
            userSavings={pricing.userSavings}
            discountRate={pricing.discountRate}
            size="lg"
          />

          {/* Şehirler */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>Çıkış İli</span>
              </label>
              <select
                value={originCity}
                onChange={e => setOriginCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold focus:border-[#CCFF00] focus:outline-none"
              >
                {TURKISH_CITIES.map(c => (
                  <option key={c.plate} value={c.name}>
                    {c.plate} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF4500]" />
                <span>Varış İli</span>
              </label>
              <select
                value={destCity}
                onChange={e => setDestCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono font-bold focus:border-[#FF4500] focus:outline-none"
              >
                {TURKISH_CITIES.map(c => (
                  <option key={c.plate} value={c.name}>
                    {c.plate} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kargo Başlığı & Desi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Kargo İçerik Açıklaması
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Örn: Yedek parça kutusu, tasarım maketi vb."
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-grotesk focus:border-[#CCFF00] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Desi Hacmi
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={desi}
                onChange={e => setDesi(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-[#CCFF00] text-xs font-mono font-bold focus:border-[#CCFF00] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Alıcı Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Alıcı Adı Soyadı</span>
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={e => setReceiverName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-grotesk focus:border-[#CCFF00] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Alıcı Telefonu</span>
              </label>
              <input
                type="text"
                value={receiverPhone}
                onChange={e => setReceiverPhone(e.target.value)}
                placeholder="Örn: +90 (5XX) XXX-XXXX"
                className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono focus:border-[#CCFF00] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Teslime Hazır Olma Zamanı</span>
            </label>
            <input
              type="datetime-local"
              value={readyDate}
              onChange={e => setReadyDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#07080A] border border-white/15 text-white text-xs font-mono focus:border-[#CCFF00] focus:outline-none"
              required
            />
          </div>

          <div className="p-3.5 rounded-lg bg-[#07080A] border border-white/10 flex items-center gap-3 text-xs text-slate-400 font-grotesk">
            <ShieldCheck className="w-5 h-5 text-[#CCFF00] shrink-0" />
            <span>Kargo bir sürücüyle eşleştiğinde emanet tutarı bloke edilir ve sürücüye verilecek 4 haneli teslim alma (pickup OTP) kodunuz anında üretilir.</span>
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
              className="px-6 py-2.5 rounded-lg text-xs font-syne font-extrabold uppercase tracking-wider text-black bg-[#CCFF00] hover:bg-[#b8e600] transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(204,255,0,0.3)] active:translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>Talebi İlan Havuzuna Bırak</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
