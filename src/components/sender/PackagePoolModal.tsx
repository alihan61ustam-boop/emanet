import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
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

  // Mesafe ve Fiyat Hesapla
  const route = generateFallbackRoute(origin, dest);
  const pricing = calculateEmanetPricing(route.distanceKm, desi);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPkg: SenderPackage = {
      id: `pkg-${Date.now()}`,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.fullName,
      senderPhone: CURRENT_USER.phone,
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
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0D1322] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Üst Bar */}
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                İlan Havuzuna Kargo Bırak
              </h2>
              <p className="text-xs text-slate-400">
                Talebinizi havuza kaydedin, güzergahınızdan geçen sürücüler anında bildirim alsın
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
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
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Çıkış Şehri</span>
              </label>
              <select
                value={originCity}
                onChange={e => setOriginCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
              >
                {TURKISH_CITIES.map(c => (
                  <option key={c.plate} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Varış Şehri</span>
              </label>
              <select
                value={destCity}
                onChange={e => setDestCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:border-purple-500 focus:outline-none"
              >
                {TURKISH_CITIES.map(c => (
                  <option key={c.plate} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kargo Başlığı & Desi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Kargo Açıklaması</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Örn: Yedek parça kutusu, tasarım maketi vb."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Desi Hacmi</label>
              <input
                type="number"
                min="1"
                max="60"
                value={desi}
                onChange={e => setDesi(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Alıcı Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Alıcı Adı Soyadı</span>
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={e => setReceiverName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Alıcı Telefonu</span>
              </label>
              <input
                type="text"
                value={receiverPhone}
                onChange={e => setReceiverPhone(e.target.value)}
                placeholder="Örn: +90 (5XX) XXX-XXXX"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Teslime Hazır Olma Tarihi</span>
            </label>
            <input
              type="datetime-local"
              value={readyDate}
              onChange={e => setReadyDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Kargo bir sürücüyle eşleştiğinde emanet tutarı bloke edilir ve sürücüye verilecek 4 haneli teslim alma (pickup OTP) kodunuz anında üretilir.</span>
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Talebi İlan Havuzuna Bırak</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
