import { PackageType, PricingBreakdown } from '../types';

/**
 * EMANET Resmi Fiyatlandırma Motoru
 * Kural: Standart kargo şirketlerinin piyasa fiyatı taban formülün %35 fazlasıdır.
 * Emanet bu piyasa fiyatı üzerinden net %25 indirim sağlar.
 * 
 * 1. Baz Maliyet: 80 + (distanceKm * 0.18) + (desi * 12)
 * 2. Standart Piyasa Fiyatı: base * 1.35 (Taban 108 TL + 0.243 TL/km + 16.2 TL/desi)
 * 3. Emanet Önerilen Fiyat: marketPrice * 0.75 (%25 Tasarruf)
 * 4. Finansal Dağılım:
 *    - Platform Hizmet Bedeli: Emanet fiyatının %15'i
 *    - Sürücü Net Hakedişi: Emanet fiyatının %85'i
 */
export function calculateEmanetPricing(distanceKm: number, desi: number): PricingBreakdown {
  const safeDistance = Math.max(1, distanceKm);
  const safeDesi = Math.max(1, desi);

  // 1. Baz maliyet
  const baseCost = 80 + (safeDistance * 0.18) + (safeDesi * 12);
  
  // 2. Güncel kargo firmalarının gerçek fiyatı (%35 artırılmış)
  const marketPrice = Math.round(baseCost * 1.35);
  
  // 3. Emanet önerilen fiyatı (Gerçek piyasadan %25 indirimli)
  const emanetPrice = Math.round(marketPrice * 0.75);
  
  // 4. Komisyon ve hakediş
  const platformFee = Math.round(emanetPrice * 0.15);
  const driverPayout = emanetPrice - platformFee;
  const userSavings = marketPrice - emanetPrice;

  return {
    baseCost: Math.round(baseCost),
    marketPrice,
    emanetPrice,
    userSavings,
    discountRate: 25,
    driverPayout,
    platformFee
  };
}

/**
 * Hacimsel Desi Hesaplama Formülü: (En x Boy x Yükseklik) / 3000
 */
export function calculateDesiFromDimensions(widthCm: number, lengthCm: number, heightCm: number): number {
  if (!widthCm || !lengthCm || !heightCm) return 1;
  const desi = Math.ceil((widthCm * lengthCm * heightCm) / 3000);
  return Math.max(1, desi);
}

export interface PackageTypeConfig {
  type: PackageType;
  title: string;
  defaultDesi: number;
  description: string;
  maxDimensions: string;
  iconName: string;
}

export const PACKAGE_TYPE_CONFIGS: Record<PackageType, PackageTypeConfig> = {
  zarf_evrak: {
    type: 'zarf_evrak',
    title: 'Zarf / Evrak',
    defaultDesi: 1,
    description: 'Resmi evrak, dosya, pasaport veya tapu belgeleri',
    maxDimensions: '35 x 25 x 3 cm',
    iconName: 'FileText'
  },
  kucuk: {
    type: 'kucuk',
    title: 'Küçük Paket',
    defaultDesi: 3,
    description: 'Ayakkabı kutusu, akıllı telefon, kozmetik, küçük elektronik',
    maxDimensions: '30 x 20 x 15 cm',
    iconName: 'Box'
  },
  orta: {
    type: 'orta',
    title: 'Orta Koli / Çanta',
    defaultDesi: 10,
    description: 'Sırt çantası, giyim kolisi, mutfak aletleri',
    maxDimensions: '45 x 35 x 25 cm',
    iconName: 'Package'
  },
  buyuk: {
    type: 'buyuk',
    title: 'Büyük Valiz / Koli',
    defaultDesi: 25,
    description: 'Büyük boy seyahat valizi, çeyiz kolisi, kamp ekipmanı',
    maxDimensions: '75 x 50 x 35 cm',
    iconName: 'Luggage'
  }
};
