import { DriverTrip, SenderPackage, MatchAndEscrow, UserProfile } from '../types';
import { calculateEmanetPricing } from './pricing';
import { calculateCorridorCities, generateFallbackRoute } from './gis';
import { getCityByName } from './turkishCities';
import { generateOtp } from './escrow';

// Mevcut Aktif Kullanıcı Profili
export const CURRENT_USER: UserProfile = {
  id: 'usr-101',
  fullName: 'Barış Doğan',
  phone: '+90 (532) 412-8890',
  tcNoVerified: true,
  rating: 4.95,
  vehicleInfo: '2022 Volkswagen Passat (Sedan, 586L Bagaj)',
  role: 'driver',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  totalTripsCompleted: 14,
  totalDeliveriesReceived: 8
};

// Seed Sürücü İlanları
function createInitialTrips(): DriverTrip[] {
  const istCity = getCityByName('İstanbul')!;
  const ankCity = getCityByName('Ankara')!;
  const izmCity = getCityByName('İzmir')!;

  // 1. Rota: İstanbul -> Ankara
  const istAnkRoute = generateFallbackRoute(istCity, ankCity);
  const istAnkCorridor = calculateCorridorCities(istAnkRoute.coordinates, 'İstanbul', 'Ankara', 30);

  // 2. Rota: İstanbul -> İzmir
  const istIzmRoute = generateFallbackRoute(istCity, izmCity);
  const istIzmCorridor = calculateCorridorCities(istIzmRoute.coordinates, 'İstanbul', 'İzmir', 30);

  return [
    {
      id: 'trip-001',
      driverId: 'drv-201',
      driverName: 'Ahmet Çelik',
      driverPhone: '+90 (533) 891-2345',
      driverRating: 4.92,
      vehicleInfo: '2023 Skoda Superb (Kombi, 660L Bagaj)',
      tcNoVerified: true,
      originCity: 'İstanbul',
      originCoords: [istCity.lat, istCity.lng],
      destinationCity: 'Ankara',
      destinationCoords: [ankCity.lat, ankCity.lng],
      departureTime: '2026-10-10T09:30:00Z',
      routeCoordinates: istAnkRoute.coordinates,
      distanceKm: istAnkRoute.distanceKm,
      estimatedHours: 4.8,
      serviceCities: istAnkCorridor.serviceCities, // ['İstanbul', 'Kocaeli', 'Sakarya', 'Düzce', 'Bolu', 'Ankara']
      availableCapacityDesi: 35,
      totalCapacityDesi: 50,
      status: 'active',
      notes: 'TEM Otoyolu üzerinden direkt geçiyorum. Yol üstü dinlenme tesislerinde veya kavşaklarda teslim alıp bırakabilirim.',
      createdAt: '2026-10-09T08:00:00Z'
    },
    {
      id: 'trip-002',
      driverId: 'drv-202',
      driverName: 'Zeynep Aktaş',
      driverPhone: '+90 (542) 345-6789',
      driverRating: 4.88,
      vehicleInfo: '2021 Toyota Corolla (Bagaj boş)',
      tcNoVerified: true,
      originCity: 'İstanbul',
      originCoords: [istCity.lat, istCity.lng],
      destinationCity: 'İzmir',
      destinationCoords: [izmCity.lat, izmCity.lng],
      departureTime: '2026-10-10T14:00:00Z',
      routeCoordinates: istIzmRoute.coordinates,
      distanceKm: istIzmRoute.distanceKm,
      estimatedHours: 4.2,
      serviceCities: istIzmCorridor.serviceCities, // ['İstanbul', 'Yalova', 'Bursa', 'Balıkesir', 'Manisa', 'İzmir']
      availableCapacityDesi: 22,
      totalCapacityDesi: 40,
      status: 'active',
      notes: 'O-5 Otoyolu güzergahı. Bursa veya Balıkesir çıkışlarında da kargo bırakabilirim.',
      createdAt: '2026-10-09T09:30:00Z'
    }
  ];
}

// Seed Gönderici İlanları & Bekleyen Havuz Kargoları
function createInitialPackages(): SenderPackage[] {
  // Sakarya -> Ankara (Ahmet Çelik'in 30km koridoruna tam düşüyor!)
  const p1Pricing = calculateEmanetPricing(305, 6);
  // Kocaeli -> Bolu (Ahmet Çelik'in koridorunda)
  const p2Pricing = calculateEmanetPricing(170, 3);
  // İstanbul -> Ankara (Doğrudan rotada)
  const p3Pricing = calculateEmanetPricing(450, 12);
  // Bursa -> İzmir (Zeynep Aktaş'ın koridorunda)
  const p4Pricing = calculateEmanetPricing(330, 4);

  const sakCity = getCityByName('Sakarya')!;
  const ankCity = getCityByName('Ankara')!;
  const kocCity = getCityByName('Kocaeli')!;
  const bolCity = getCityByName('Bolu')!;
  const istCity = getCityByName('İstanbul')!;
  const burCity = getCityByName('Bursa')!;
  const izmCity = getCityByName('İzmir')!;

  return [
    {
      id: 'pkg-001',
      senderId: 'usr-301',
      senderName: 'Mert Kayra',
      senderPhone: '+90 (555) 123-4567',
      originCity: 'Sakarya',
      originCoords: [sakCity.lat, sakCity.lng],
      destinationCity: 'Ankara',
      destinationCoords: [ankCity.lat, ankCity.lng],
      desi: 6,
      packageType: 'orta',
      title: 'Mimari Maket Parçaları & Rulo Çizimler',
      receiverName: 'Cemre Gökçek',
      receiverPhone: '+90 (531) 234-5678',
      readyDate: '2026-10-10T08:00:00Z',
      distanceKm: 305,
      quotedMarketPrice: p1Pricing.marketPrice,
      emanetPrice: p1Pricing.emanetPrice,
      userSavings: p1Pricing.userSavings,
      driverPayout: p1Pricing.driverPayout,
      platformFee: p1Pricing.platformFee,
      status: 'waiting_match',
      createdAt: '2026-10-09T10:15:00Z'
    },
    {
      id: 'pkg-002',
      senderId: 'usr-302',
      senderName: 'Selin Yurt',
      senderPhone: '+90 (544) 987-6543',
      originCity: 'Kocaeli',
      originCoords: [kocCity.lat, kocCity.lng],
      destinationCity: 'Bolu',
      destinationCoords: [bolCity.lat, bolCity.lng],
      desi: 3,
      packageType: 'kucuk',
      title: 'Yedek Tablet ve Şarj Aksesuarları',
      receiverName: 'Emre Karaca',
      receiverPhone: '+90 (505) 345-6789',
      readyDate: '2026-10-10T11:00:00Z',
      distanceKm: 170,
      quotedMarketPrice: p2Pricing.marketPrice,
      emanetPrice: p2Pricing.emanetPrice,
      userSavings: p2Pricing.userSavings,
      driverPayout: p2Pricing.driverPayout,
      platformFee: p2Pricing.platformFee,
      status: 'waiting_match',
      createdAt: '2026-10-09T11:00:00Z'
    },
    {
      id: 'pkg-003',
      senderId: 'usr-303',
      senderName: 'Deniz Aydın',
      senderPhone: '+90 (530) 777-8899',
      originCity: 'İstanbul',
      originCoords: [istCity.lat, istCity.lng],
      destinationCity: 'Ankara',
      destinationCoords: [ankCity.lat, ankCity.lng],
      desi: 12,
      packageType: 'orta',
      title: 'Özel Tasarım Hediyelik Cam Seramik Kutusu',
      receiverName: 'Burcu Şen',
      receiverPhone: '+90 (536) 444-2211',
      readyDate: '2026-10-10T09:00:00Z',
      distanceKm: 450,
      quotedMarketPrice: p3Pricing.marketPrice,
      emanetPrice: p3Pricing.emanetPrice,
      userSavings: p3Pricing.userSavings,
      driverPayout: p3Pricing.driverPayout,
      platformFee: p3Pricing.platformFee,
      status: 'waiting_match',
      createdAt: '2026-10-09T11:45:00Z'
    },
    {
      id: 'pkg-004',
      senderId: 'usr-304',
      senderName: 'Kaan Demirtaş',
      senderPhone: '+90 (552) 888-9900',
      originCity: 'Bursa',
      originCoords: [burCity.lat, burCity.lng],
      destinationCity: 'İzmir',
      destinationCoords: [izmCity.lat, izmCity.lng],
      desi: 4,
      packageType: 'kucuk',
      title: 'Hassas Laboratuvar Numune Örneği',
      receiverName: 'Dr. Ayhan Tekin',
      receiverPhone: '+90 (539) 111-2233',
      readyDate: '2026-10-10T15:00:00Z',
      distanceKm: 330,
      quotedMarketPrice: p4Pricing.marketPrice,
      emanetPrice: p4Pricing.emanetPrice,
      userSavings: p4Pricing.userSavings,
      driverPayout: p4Pricing.driverPayout,
      platformFee: p4Pricing.platformFee,
      status: 'waiting_match',
      createdAt: '2026-10-09T12:00:00Z'
    }
  ];
}

// Seed Eşleşme ve Escrow
function createInitialMatches(trips: DriverTrip[], packages: SenderPackage[]): MatchAndEscrow[] {
  // Örnek: pkg-003 daha önce trip-001 ile eşleşmiş ve havuzda teslim alma bekliyor
  const samplePkg = packages.find(p => p.id === 'pkg-003');
  const sampleTrip = trips.find(t => t.id === 'trip-001');

  if (!samplePkg || !sampleTrip) return [];

  return [
    {
      id: 'match-001',
      tripId: sampleTrip.id,
      packageId: samplePkg.id,
      trip: sampleTrip,
      pkg: samplePkg,
      pickupOtp: '4821',   // Göndericinin sürücüye vereceği kod
      deliveryOtp: '7935', // Alıcının teslimatta vereceği kod
      pickupPhotoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
      paymentStatus: 'held_in_escrow',
      matchedAt: '2026-10-09T12:30:00Z',
      pickedUpAt: undefined,
      deliveredAt: undefined
    }
  ];
}

const STORAGE_KEYS = {
  TRIPS: 'emanet_trips_v1',
  PACKAGES: 'emanet_packages_v1',
  MATCHES: 'emanet_matches_v1'
};

export class MockDataStore {
  private trips: DriverTrip[] = [];
  private packages: SenderPackage[] = [];
  private matches: MatchAndEscrow[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      const storedPackages = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      const storedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);

      if (storedTrips && storedPackages) {
        this.trips = JSON.parse(storedTrips);
        this.packages = JSON.parse(storedPackages);
        this.matches = storedMatches ? JSON.parse(storedMatches) : [];
        this.relinkEntities();
      } else {
        this.resetToDefaults();
      }
    } catch {
      this.resetToDefaults();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(this.trips));
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(this.packages));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(this.matches));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.notify();
  }

  public resetToDefaults() {
    this.trips = createInitialTrips();
    this.packages = createInitialPackages();
    this.matches = createInitialMatches(this.trips, this.packages);
    this.relinkEntities();
    this.saveToStorage();
  }

  private relinkEntities() {
    for (const match of this.matches) {
      match.trip = this.trips.find(t => t.id === match.tripId);
      match.pkg = this.packages.find(p => p.id === match.packageId);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // Getters
  public getTrips(): DriverTrip[] {
    return [...this.trips];
  }

  public getPackages(): SenderPackage[] {
    return [...this.packages];
  }

  public getMatches(): MatchAndEscrow[] {
    return [...this.matches];
  }

  // Sürücü Yeni Rota Açar
  public addTrip(trip: DriverTrip) {
    this.trips.unshift(trip);
    this.saveToStorage();
  }

  // Gönderici Yeni Kargo / İlan Havuzuna Bırakır
  public addPackage(pkg: SenderPackage) {
    this.packages.unshift(pkg);
    this.saveToStorage();
  }

  // Kargo ile Sürücüyü Eşleştir ve Escrow'u Başlat
  public matchPackageWithTrip(packageId: string, tripId: string): MatchAndEscrow | null {
    const pkg = this.packages.find(p => p.id === packageId);
    const trip = this.trips.find(t => t.id === tripId);

    if (!pkg || !trip) return null;
    if (trip.availableCapacityDesi < pkg.desi) return null;

    // Kapasiteyi düşür
    trip.availableCapacityDesi -= pkg.desi;
    pkg.status = 'matched';

    const newMatch: MatchAndEscrow = {
      id: `match-${Date.now()}`,
      tripId: trip.id,
      packageId: pkg.id,
      trip,
      pkg,
      pickupOtp: generateOtp(),
      deliveryOtp: generateOtp(),
      paymentStatus: 'held_in_escrow',
      matchedAt: new Date().toISOString()
    };

    this.matches.unshift(newMatch);
    this.saveToStorage();
    return newMatch;
  }

  // Teslim Alma Onayı (Pickup OTP Doğrulama + Fotoğraf)
  public confirmPickup(matchId: string, enteredOtp: string, photoUrl?: string): boolean {
    const match = this.matches.find(m => m.id === matchId);
    if (!match || match.pickupOtp !== enteredOtp) return false;

    match.pickedUpAt = new Date().toISOString();
    if (photoUrl) match.pickupPhotoUrl = photoUrl;

    if (match.pkg) {
      match.pkg.status = 'in_transit';
    }

    this.saveToStorage();
    return true;
  }

  // Teslim Etme Onayı (Delivery OTP Doğrulama + Escrow Serbest Bırakma)
  public confirmDelivery(matchId: string, enteredOtp: string, photoUrl?: string): boolean {
    const match = this.matches.find(m => m.id === matchId);
    if (!match || match.deliveryOtp !== enteredOtp) return false;

    match.deliveredAt = new Date().toISOString();
    if (photoUrl) match.deliveryPhotoUrl = photoUrl;
    match.paymentStatus = 'released_to_driver';

    if (match.pkg) {
      match.pkg.status = 'delivered';
    }

    this.saveToStorage();
    return true;
  }

  // Belirli bir rotanın 30km koridoruna düşen havuzdaki kargoları tespit eder
  public getWaitingPackagesForTrip(trip: DriverTrip): SenderPackage[] {
    return this.packages.filter(pkg => {
      if (pkg.status !== 'waiting_match') return false;
      if (pkg.desi > trip.availableCapacityDesi) return false;

      const origIdx = trip.serviceCities.findIndex(c => c.toLowerCase() === pkg.originCity.toLowerCase());
      const destIdx = trip.serviceCities.findIndex(c => c.toLowerCase() === pkg.destinationCity.toLowerCase());

      return origIdx !== -1 && destIdx !== -1 && origIdx < destIdx;
    });
  }

  // Gönderici için uyumlu aktif sürücüleri ara
  public findMatchingTripsForRoute(originCity: string, destCity: string, desi: number): DriverTrip[] {
    const normOrigin = originCity.trim().toLowerCase();
    const normDest = destCity.trim().toLowerCase();

    return this.trips.filter(t => {
      if (t.status !== 'active') return false;
      if (t.availableCapacityDesi < desi) return false;

      const origIdx = t.serviceCities.findIndex(c => c.toLowerCase() === normOrigin);
      const destIdx = t.serviceCities.findIndex(c => c.toLowerCase() === normDest);

      return origIdx !== -1 && destIdx !== -1 && origIdx < destIdx;
    });
  }
}

export const store = new MockDataStore();
