export type UserRole = 'driver' | 'sender' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  tcNoVerified: boolean;
  rating: number;
  vehicleInfo?: string;
  role: 'driver' | 'sender';
  avatarUrl?: string;
  totalTripsCompleted?: number;
  totalDeliveriesReceived?: number;
}

export interface CityLocation {
  plate: number;
  name: string;
  lat: number;
  lng: number;
  region: string;
}

export interface DriverTrip {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  vehicleInfo: string;
  tcNoVerified: boolean;
  originCity: string;
  originCoords: [number, number]; // [lat, lng]
  destinationCity: string;
  destinationCoords: [number, number]; // [lat, lng]
  departureTime: string;
  routeCoordinates: [number, number][]; // [lat, lng] waypoints
  distanceKm: number;
  estimatedHours: number;
  serviceCities: string[]; // Order corridor cities <= 30km
  availableCapacityDesi: number;
  totalCapacityDesi: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type PackageType = 'zarf_evrak' | 'kucuk' | 'orta' | 'buyuk';

export interface SenderPackage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  originCity: string;
  originCoords: [number, number];
  destinationCity: string;
  destinationCoords: [number, number];
  desi: number;
  packageType: PackageType;
  title: string;
  receiverName: string;
  receiverPhone: string;
  readyDate: string;
  distanceKm: number;
  quotedMarketPrice: number; // 135x piyasa taban fiyatı
  emanetPrice: number;        // %25 indirimli Emanet fiyatı
  userSavings: number;        // Cebinizde kalan (marketPrice - emanetPrice)
  driverPayout: number;       // Sürücü net hakedişi (%85)
  platformFee: number;        // Platform hizmet payı (%15)
  status: 'waiting_match' | 'matched' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
}

export type PaymentEscrowStatus = 'held_in_escrow' | 'released_to_driver' | 'refunded';

export interface MatchAndEscrow {
  id: string;
  tripId: string;
  packageId: string;
  trip?: DriverTrip;
  pkg?: SenderPackage;
  pickupOtp: string;        // Göndericinin sürücüye vereceği 4 haneli teslim alma kodu
  deliveryOtp: string;      // Alıcının teslimatta gireceği 4 haneli teyit kodu
  pickupPhotoUrl?: string;  // Teslim alma anı ambalaj görseli
  deliveryPhotoUrl?: string;// Teslimat anı teyit görseli
  paymentStatus: PaymentEscrowStatus;
  matchedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface PricingBreakdown {
  baseCost: number;
  marketPrice: number;
  emanetPrice: number;
  userSavings: number;
  discountRate: number; // 25
  driverPayout: number;
  platformFee: number;
}
