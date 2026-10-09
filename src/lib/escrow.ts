import { MatchAndEscrow, PaymentEscrowStatus } from '../types';

/**
 * 4 Haneli Rastgele Sayısal Güvenlik Kodu (OTP) Üretici
 */
export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Teslim Alma ve Teslim Etme İçin Gerçekçi Paket Görselleri Simülasyonu
 */
export const SAMPLE_PACKAGE_PHOTOS = [
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80'
];

export interface EscrowValidationResult {
  success: boolean;
  message: string;
  updatedStatus?: PaymentEscrowStatus;
}

/**
 * 1. Adım: Teslim Alma Doğrulaması (Pickup Verification)
 * Sürücü paketin dış fotoğrafını sisteme yükler + göndericinin 4 haneli pickup_otp kodunu girer.
 */
export function verifyPickup(
  match: MatchAndEscrow,
  enteredOtp: string,
  photoUrl?: string
): EscrowValidationResult {
  if (match.paymentStatus !== 'held_in_escrow') {
    return {
      success: false,
      message: 'Bu eşleşme şu anda teslim alınma aşamasında değil.'
    };
  }

  if (match.pickedUpAt) {
    return {
      success: false,
      message: 'Paket zaten teslim alınmış durumda.'
    };
  }

  if (enteredOtp.trim() !== match.pickupOtp.trim()) {
    return {
      success: false,
      message: 'Hatalı teslim alma kodu (Pickup OTP)! Göndericinin ekranındaki 4 haneli kodu giriniz.'
    };
  }

  return {
    success: true,
    message: 'Paket başarıyla teslim alındı! Taşıma süreci (In-Transit) başlatıldı.'
  };
}

/**
 * 2. Adım: Teslim Etme Doğrulaması (Delivery Verification & Escrow Release)
 * Alıcı paketi kontrol eder, sürücüye delivery_otp kodunu iletir.
 * Kod onaylandığında havuzdaki (escrow) bakiye anında sürücünün hesabına aktarılır.
 */
export function verifyDelivery(
  match: MatchAndEscrow,
  enteredOtp: string,
  photoUrl?: string
): EscrowValidationResult {
  if (!match.pickedUpAt) {
    return {
      success: false,
      message: 'Paket henüz teslim alınmamışken teslim edilemez.'
    };
  }

  if (match.paymentStatus === 'released_to_driver') {
    return {
      success: false,
      message: 'Bu paket zaten teslim edilmiş ve hakediş sürücüye aktarılmıştır.'
    };
  }

  if (enteredOtp.trim() !== match.deliveryOtp.trim()) {
    return {
      success: false,
      message: 'Hatalı teslimat kodu (Delivery OTP)! Alıcının telefonuna gelen 4 haneli kodu giriniz.'
    };
  }

  return {
    success: true,
    message: 'Teslimat başarıyla tamamlandı! Escrow emanet bakiyesi anında sürücü hesabına aktarıldı.',
    updatedStatus: 'released_to_driver'
  };
}
