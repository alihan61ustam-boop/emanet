import { DriverTrip, SenderPackage, MatchAndEscrow, UserProfile, RegisteredUser, UserRole } from '../types';
import { calculateEmanetPricing } from './pricing';
import { calculateCorridorCities, generateFallbackRoute } from './gis';
import { getCityByName } from './turkishCities';
import { generateOtp } from './escrow';

// Demo Başlangıç Hesapları
export const DEMO_ADMIN: RegisteredUser = {
  id: 'usr-admin-01',
  fullName: 'Alihan Usta (Yönetici)',
  email: 'admin@emanet.com',
  phone: '+90 (555) 000-0001',
  tcNo: '10000000146',
  password: 'admin',
  tcNoVerified: true,
  rating: 5.0,
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  totalTripsCompleted: 45,
  totalDeliveriesReceived: 32,
  createdAt: '2026-01-01T00:00:00Z'
};

export const DEMO_DRIVER: RegisteredUser = {
  id: 'usr-driver-01',
  fullName: 'Barış Doğan',
  email: 'surucu@emanet.com',
  phone: '+90 (532) 412-8890',
  tcNo: '28475910284',
  password: 'surucu',
  tcNoVerified: true,
  rating: 4.95,
  role: 'driver',
  vehicleInfo: '2022 Volkswagen Passat (Sedan, 586L Bagaj)',
  plateNumber: '34 TR 4128',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  totalTripsCompleted: 14,
  totalDeliveriesReceived: 8,
  createdAt: '2026-02-15T00:00:00Z'
};

export const DEMO_SENDER: RegisteredUser = {
  id: 'usr-sender-01',
  fullName: 'Selin Yurt',
  email: 'gonderici@emanet.com',
  phone: '+90 (544) 987-6543',
  tcNo: '39485720194',
  password: 'kargo',
  tcNoVerified: true,
  rating: 4.89,
  role: 'sender',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  totalTripsCompleted: 0,
  totalDeliveriesReceived: 12,
  createdAt: '2026-03-20T00:00:00Z'
};

export const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  DEMO_ADMIN,
  DEMO_DRIVER,
  DEMO_SENDER
];

// Mevcut Aktif Kullanıcı Referansı (Geriye Uyumluluk İçin)
export let CURRENT_USER: UserProfile = DEMO_ADMIN;

// Seed Sürücü İlanları
function createInitialTrips(): DriverTrip[] {
  const istCity = getCityByName('İstanbul')!;
  const ankCity = getCityByName('Ankara')!;
  const izmCity = getCityByName('İzmir')!;

  const istAnkRoute = generateFallbackRoute(istCity, ankCity);
  const istAnkCorridor = calculateCorridorCities(istAnkRoute.coordinates, 'İstanbul', 'Ankara', 30);

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
      serviceCities: istAnkCorridor.serviceCities,
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
      serviceCities: istIzmCorridor.serviceCities,
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
  const p1Pricing = calculateEmanetPricing(305, 6);
  const p2Pricing = calculateEmanetPricing(170, 3);
  const p3Pricing = calculateEmanetPricing(450, 12);
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
      senderName: 'Mehmet Yılmaz',
      senderPhone: '+90 (532) 111-2233',
      originCity: 'Sakarya',
      originCoords: [sakCity.lat, sakCity.lng],
      destinationCity: 'Ankara',
      destinationCoords: [ankCity.lat, ankCity.lng],
      desi: 6,
      packageType: 'orta',
      title: 'Mimari Çizim & Pafta Proje Rulosu',
      receiverName: 'Ayşe Kaya',
      receiverPhone: '+90 (535) 222-3344',
      readyDate: '2026-10-10T10:00:00Z',
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

function createInitialMatches(trips: DriverTrip[], packages: SenderPackage[]): MatchAndEscrow[] {
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
      pickupOtp: '4821',
      deliveryOtp: '7935',
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
  MATCHES: 'emanet_matches_v1',
  USERS: 'emanet_users_v1',
  CURRENT_USER: 'emanet_current_user_v1'
};

export class MockDataStore {
  private trips: DriverTrip[] = [];
  private packages: SenderPackage[] = [];
  private matches: MatchAndEscrow[] = [];
  private users: RegisteredUser[] = [];
  private currentUser: UserProfile | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      const storedPackages = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      const storedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.users = [...INITIAL_REGISTERED_USERS];
      }

      if (storedCurrentUser) {
        this.currentUser = JSON.parse(storedCurrentUser);
        CURRENT_USER = this.currentUser!;
      } else {
        // İlk açılışta admin varsayılan olarak seçili olabilir
        this.currentUser = DEMO_ADMIN;
        CURRENT_USER = DEMO_ADMIN;
      }

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
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    this.notify();
  }

  public resetToDefaults() {
    this.trips = createInitialTrips();
    this.packages = createInitialPackages();
    this.matches = createInitialMatches(this.trips, this.packages);
    this.users = [...INITIAL_REGISTERED_USERS];
    this.currentUser = DEMO_ADMIN;
    CURRENT_USER = DEMO_ADMIN;
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

  // --- KULLANICI & KİMLİK DOĞRULAMA (AUTH) METOTLARI ---
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile | null) {
    this.currentUser = user;
    if (user) {
      CURRENT_USER = user;
    }
    this.saveToStorage();
  }

  public getAllUsers(): RegisteredUser[] {
    return this.users;
  }

  public login(identifier: string, pass: string): { success: boolean; user?: UserProfile; message?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    const found = this.users.find(u => 
      (u.email.toLowerCase() === cleanId || 
       u.tcNo === cleanId || 
       u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
    );

    if (!found) {
      return { success: false, message: 'Bu T.C., E-posta veya telefon ile kayıtlı hesap bulunamadı.' };
    }

    if (found.password !== cleanPass) {
      return { success: false, message: 'Şifreniz hatalı. Lütfen kontrol ediniz.' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProfile } = found;
    this.setCurrentUser(userProfile);
    return { success: true, user: userProfile };
  }

  public register(data: {
    fullName: string;
    email: string;
    phone: string;
    tcNo: string;
    password: string;
    role: UserRole;
    vehicleInfo?: string;
    plateNumber?: string;
  }): { success: boolean; user?: UserProfile; message?: string } {
    const cleanTc = data.tcNo.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();

    // Kontroller
    if (cleanTc.length !== 11) {
      return { success: false, message: 'T.C. Kimlik Numarası 11 haneli olmalıdır.' };
    }

    const existingTc = this.users.find(u => u.tcNo === cleanTc);
    if (existingTc) {
      return { success: false, message: 'Bu T.C. Kimlik Numarası zaten kayıtlı.' };
    }

    const existingEmail = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, message: 'Bu e-posta adresi ile zaten bir hesap mevcut.' };
    }

    const newUser: RegisteredUser = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      tcNo: cleanTc,
      password: data.password,
      tcNoVerified: true, // Emanet Nüfus doğrulaması simülasyonu
      rating: 5.0,
      role: data.role,
      vehicleInfo: data.vehicleInfo,
      plateNumber: data.plateNumber,
      avatarUrl: data.role === 'driver'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      totalTripsCompleted: 0,
      totalDeliveriesReceived: 0,
      createdAt: new Date().toISOString()
    };

    this.users.unshift(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userProfile } = newUser;
    this.setCurrentUser(userProfile);
    this.saveToStorage();

    return { success: true, user: userProfile };
  }

  public logout() {
    this.currentUser = null;
    this.saveToStorage();
  }

  // --- SEFER & KARGO VERİLERİ ---
  public getTrips(): DriverTrip[] {
    return this.trips;
  }

  public addTrip(trip: DriverTrip) {
    this.trips.unshift(trip);
    this.saveToStorage();
  }

  public getPackages(): SenderPackage[] {
    return this.packages;
  }

  public addPackage(pkg: SenderPackage) {
    this.packages.unshift(pkg);
    this.saveToStorage();
  }

  public getMatches(): MatchAndEscrow[] {
    return this.matches;
  }

  public createMatch(tripId: string, packageId: string): MatchAndEscrow {
    const trip = this.trips.find(t => t.id === tripId);
    const pkg = this.packages.find(p => p.id === packageId);

    if (!trip || !pkg) throw new Error('Sefer veya paket bulunamadı.');

    pkg.status = 'matched';
    trip.availableCapacityDesi = Math.max(0, trip.availableCapacityDesi - pkg.desi);

    const newMatch: MatchAndEscrow = {
      id: `match-${Date.now()}`,
      tripId,
      packageId,
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

  public matchPackageWithTrip(packageId: string, tripId: string): MatchAndEscrow {
    return this.createMatch(tripId, packageId);
  }

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

  public getWaitingPackagesForTrip(trip: DriverTrip): SenderPackage[] {
    return this.packages.filter(pkg => {
      if (pkg.status !== 'waiting_match') return false;
      if (pkg.desi > trip.availableCapacityDesi) return false;

      const origIdx = trip.serviceCities.findIndex(c => c.toLowerCase() === pkg.originCity.toLowerCase());
      const destIdx = trip.serviceCities.findIndex(c => c.toLowerCase() === pkg.destinationCity.toLowerCase());

      return origIdx !== -1 && destIdx !== -1 && origIdx < destIdx;
    });
  }

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
