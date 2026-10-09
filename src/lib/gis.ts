import * as turf from '@turf/turf';
import { CityLocation } from '../types';
import { TURKISH_CITIES, getCityByName } from './turkishCities';

export interface CorridorResult {
  serviceCities: string[];
  bufferPolygon: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null;
  corridorCitiesDetails: {
    city: CityLocation;
    distanceToRouteKm: number;
    sortIndex: number;
  }[];
  totalDistanceKm: number;
}

/**
 * Türk Karayolu Ağı Üzerinde Bilinen Başlıca Koridor Düğümleri (Fallback / Seed)
 */
const HIGHWAY_CORRIDORS: Record<string, string[]> = {
  'İstanbul-Ankara': ['İstanbul', 'Kocaeli', 'Sakarya', 'Düzce', 'Bolu', 'Ankara'],
  'Ankara-İstanbul': ['Ankara', 'Bolu', 'Düzce', 'Sakarya', 'Kocaeli', 'İstanbul'],
  'İstanbul-İzmir': ['İstanbul', 'Yalova', 'Bursa', 'Balıkesir', 'Manisa', 'İzmir'],
  'İzmir-İstanbul': ['İzmir', 'Manisa', 'Balıkesir', 'Bursa', 'Yalova', 'İstanbul'],
  'İstanbul-Trabzon': ['İstanbul', 'Kocaeli', 'Sakarya', 'Düzce', 'Bolu', 'Samsun', 'Ordu', 'Giresun', 'Trabzon'],
  'Ankara-Antalya': ['Ankara', 'Konya', 'Isparta', 'Burdur', 'Antalya'],
  'İstanbul-Antalya': ['İstanbul', 'Bilecik', 'Kütahya', 'Afyonkarahisar', 'Burdur', 'Antalya'],
  'İzmir-Antalya': ['İzmir', 'Aydın', 'Denizli', 'Burdur', 'Antalya'],
  'Ankara-Adana': ['Ankara', 'Aksaray', 'Niğde', 'Adana'],
  'İstanbul-Adana': ['İstanbul', 'Kocaeli', 'Sakarya', 'Bolu', 'Ankara', 'Aksaray', 'Niğde', 'Adana'],
};

/**
 * İki şehir arasında OSRM REST API veya akıllı rota interpolasyonu ile rota koordinatları üretir
 */
export async function fetchOrGenerateRoute(
  origin: CityLocation,
  dest: CityLocation
): Promise<{ coordinates: [number, number][]; distanceKm: number }> {
  // Önce ücretsiz OSRM genel rota servisine istek atmayı deneriz
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM [lng, lat] formatında döner, biz [lat, lng] formatına çeviririz
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );
        const distanceKm = Math.round(route.distance / 1000);
        return { coordinates, distanceKm };
      }
    }
  } catch {
    // Ağ yoksa veya OSRM zaman aşımına uğrarsa yedek akıllı hesaplamaya geçer
  }

  // Yedek Rota Üretici: Türkiye karayolu ağı ara durakları ve hafif viraj eğrisi
  return generateFallbackRoute(origin, dest);
}

/**
 * Çevrimdışı ve hızlı çalışma için Türkiye karayolu düğümlerini kullanan pürüzsüz rota
 */
export function generateFallbackRoute(
  origin: CityLocation,
  dest: CityLocation
): { coordinates: [number, number][]; distanceKm: number } {
  const corridorKey = `${origin.name}-${dest.name}`;
  const knownCities = HIGHWAY_CORRIDORS[corridorKey];

  let waypoints: [number, number][] = [];

  if (knownCities && knownCities.length > 0) {
    waypoints = knownCities
      .map(name => getCityByName(name))
      .filter((c): c is CityLocation => !!c)
      .map(c => [c.lat, c.lng]);
  } else {
    // Bilinen direkt hat yoksa, araya 3-4 kavis noktası ekleyerek gerçekçi hat simüle et
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Hafif yay eğrisi (Türkiye karayolları genelde doğrusal değildir)
      const latOffset = Math.sin(t * Math.PI) * (Math.sin((origin.lng + dest.lng) * 2) * 0.15);
      const lngOffset = Math.sin(t * Math.PI) * (Math.cos((origin.lat + dest.lat) * 2) * 0.15);
      
      const lat = origin.lat + (dest.lat - origin.lat) * t + latOffset;
      const lng = origin.lng + (dest.lng - origin.lng) * t + lngOffset;
      waypoints.push([lat, lng]);
    }
  }

  // Turf ile hat uzunluğunu hesapla
  const turfLine = turf.lineString(waypoints.map(([lat, lng]) => [lng, lat]));
  const distanceKm = Math.round(turf.length(turfLine, { units: 'kilometers' }) * 1.08); // +%8 viraj payı

  return { coordinates: waypoints, distanceKm };
}

/**
 * 30 KM KURALI VE TAMPON BÖLGE (BUFFER) HESAPLAMA MOTORU
 * Turf.js kullanarak rota etrafında 30 km tampon bölge oluşturur,
 * rotaya en fazla 30 km mesafedeki il merkezlerini sıralı koridor olarak çıkarır.
 */
export function calculateCorridorCities(
  routeCoordinates: [number, number][],
  originCityName: string,
  destCityName: string,
  bufferKm: number = 30
): CorridorResult {
  if (!routeCoordinates || routeCoordinates.length < 2) {
    return {
      serviceCities: [originCityName, destCityName],
      bufferPolygon: null,
      corridorCitiesDetails: [],
      totalDistanceKm: 0
    };
  }

  // Turf formatı: [lng, lat]
  const lineCoords = routeCoordinates.map(([lat, lng]) => [lng, lat]);
  const routeLine = turf.lineString(lineCoords);
  const totalDistanceKm = Math.round(turf.length(routeLine, { units: 'kilometers' }));

  let bufferPolygon: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null = null;
  try {
    const buf = turf.buffer(routeLine, bufferKm, { units: 'kilometers' });
    bufferPolygon = buf ?? null;
  } catch (e) {
    console.error('Turf buffer error:', e);
  }

  // 2. Türkiye'deki 81 ilin rotaya mesafesini test et
  const matchingCities: {
    city: CityLocation;
    distanceToRouteKm: number;
    sortIndex: number;
  }[] = [];

  for (const city of TURKISH_CITIES) {
    const cityPt = turf.point([city.lng, city.lat]);
    
    // Mesafeyi km cinsinden ölç
    const distanceToLine = turf.pointToLineDistance(cityPt, routeLine, { units: 'kilometers' });

    // 30 km içinde mi veya başlangıç/bitiş şehri mi?
    const isOrigin = city.name.toLowerCase() === originCityName.toLowerCase();
    const isDest = city.name.toLowerCase() === destCityName.toLowerCase();

    if (distanceToLine <= bufferKm || isOrigin || isDest) {
      // Rotanın başlangıcından olan iz düşüm mesafesi (Yön sıralaması için)
      const nearestPt = turf.nearestPointOnLine(routeLine, cityPt);
      const sortProgress = nearestPt.properties.location || 0;

      matchingCities.push({
        city,
        distanceToRouteKm: Math.round(distanceToLine * 10) / 10,
        sortIndex: isOrigin ? -1 : isDest ? 999999 : sortProgress
      });
    }
  }

  // 3. Sıralı Koridor Listesi: Şehirleri gidiş yönüne göre diz
  matchingCities.sort((a, b) => a.sortIndex - b.sortIndex);

  // Başlangıç ve bitiş şehirlerinin garanti listede bulunmasını sağla
  const serviceCityNames = matchingCities.map(m => m.city.name);
  if (!serviceCityNames.includes(originCityName)) {
    serviceCityNames.unshift(originCityName);
  }
  if (!serviceCityNames.includes(destCityName)) {
    serviceCityNames.push(destCityName);
  }

  return {
    serviceCities: serviceCityNames,
    bufferPolygon: bufferPolygon || null,
    corridorCitiesDetails: matchingCities,
    totalDistanceKm
  };
}

/**
 * 30 KM KORİDOR EŞLEŞTİRME VE AYNI YÖN DOĞRULAMA KURALI
 * Gönderici arama yaptığında: origin_city ve destination_city sürücünün service_cities listesinde yer almalı
 * VE origin_city indeksi destination_city indeksinden küçük olmalıdır (aynı yön doğrulaması).
 */
export function isRouteCompatible(
  serviceCities: string[],
  originCity: string,
  destCity: string
): { isMatch: boolean; reason?: string } {
  const normOrigin = originCity.trim().toLowerCase();
  const normDest = destCity.trim().toLowerCase();

  const originIndex = serviceCities.findIndex(c => c.toLowerCase() === normOrigin);
  const destIndex = serviceCities.findIndex(c => c.toLowerCase() === normDest);

  if (originIndex === -1 && destIndex === -1) {
    return { isMatch: false, reason: 'Ne çıkış ne de varış şehri sürücünün 30 km koridorunda yer almıyor.' };
  }
  if (originIndex === -1) {
    return { isMatch: false, reason: `${originCity} şehri sürücünün güzergah koridorunda değil.` };
  }
  if (destIndex === -1) {
    return { isMatch: false, reason: `${destCity} şehri sürücünün güzergah koridorunda değil.` };
  }
  if (originIndex >= destIndex) {
    return { isMatch: false, reason: 'Sürücü ters yönde seyahat ediyor. Güzergah akışına aykırı.' };
  }

  return { isMatch: true };
}
