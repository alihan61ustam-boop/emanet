import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface RouteMapProps {
  routeCoordinates: [number, number][]; // [lat, lng]
  bufferPolygon?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null;
  originCity?: string;
  destCity?: string;
  corridorCities?: string[];
  interactive?: boolean;
  className?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  routeCoordinates,
  bufferPolygon,
  originCity = 'Başlangıç',
  destCity = 'Varış',
  corridorCities = [],
  className = 'h-[420px] w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showBuffer, setShowBuffer] = useState(true);
  const [showCorridorMarkers, setShowCorridorMarkers] = useState(true);

  // Haritayı başlat
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Türkiye merkez koordinatları
    const map = L.map(mapContainerRef.current, {
      center: [39.0, 35.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // %100 Ücretsiz, API Anahtarı İstemeyen Standart OpenStreetMap Katmanı
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Rota, Tampon Bölge ve Şehir Noktalarını Çiz
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = routeLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!routeCoordinates || routeCoordinates.length === 0) return;

    const bounds = L.latLngBounds([]);

    // 1. 30 KM Yol Üstü Güvenli Koridor Poligonu
    if (showBuffer && bufferPolygon) {
      try {
        const bufferLayer = L.geoJSON(bufferPolygon, {
          style: {
            color: '#10b981',
            weight: 2,
            dashArray: '5, 5',
            fillColor: '#10b981',
            fillOpacity: 0.16
          }
        });
        group.addLayer(bufferLayer);
      } catch (err) {
        console.error('Buffer render error:', err);
      }
    }

    // 2. Rota Çizgisi (Vurgulu ve Parlak)
    const glowLine = L.polyline(routeCoordinates, {
      color: '#34d399',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    });
    group.addLayer(glowLine);

    const mainLine = L.polyline(routeCoordinates, {
      color: '#059669',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    });
    group.addLayer(mainLine);

    routeCoordinates.forEach(coord => bounds.extend(coord));

    // 3. Başlangıç (A) ve Bitiş (B) İkonları
    const startCoord = routeCoordinates[0];
    const endCoord = routeCoordinates[routeCoordinates.length - 1];

    if (startCoord) {
      const startIcon = L.divIcon({
        className: 'custom-pin-start',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-emerald-400 opacity-75"></span>
            <div class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-slate-950 shadow-lg border-2 border-white font-bold text-xs">
              A
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const startMarker = L.marker(startCoord, { icon: startIcon })
        .bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-emerald-400 text-sm">Çıkış Şehri</div>
            <div class="text-white font-medium mt-0.5">${originCity}</div>
            <div class="text-slate-400 mt-1">Yolculuğun başladığı nokta</div>
          </div>
        `);
      group.addLayer(startMarker);
    }

    if (endCoord) {
      const endIcon = L.divIcon({
        className: 'custom-pin-end',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-purple-400 opacity-75"></span>
            <div class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-500 text-white shadow-lg border-2 border-white font-bold text-xs">
              B
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const endMarker = L.marker(endCoord, { icon: endIcon })
        .bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-purple-400 text-sm">Varış Şehri</div>
            <div class="text-white font-medium mt-0.5">${destCity}</div>
            <div class="text-slate-400 mt-1">Yolculuğun tamamlandığı nokta</div>
          </div>
        `);
      group.addLayer(endMarker);
    }

    // 4. Koridor Üzerindeki Yol Üstü Durak Şehirleri
    if (showCorridorMarkers && corridorCities.length > 2) {
      const intermediate = corridorCities.slice(1, -1);
      intermediate.forEach((cityName, idx) => {
        const approxIdx = Math.floor(((idx + 1) / (intermediate.length + 1)) * routeCoordinates.length);
        const approxCoord = routeCoordinates[approxIdx];

        if (approxCoord) {
          const midIcon = L.divIcon({
            className: 'custom-pin-mid',
            html: `
              <div class="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900 shadow-md"></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });

          const marker = L.marker(approxCoord, { icon: midIcon })
            .bindPopup(`
              <div class="p-1.5 text-xs">
                <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">Yol Üstü Durak</span>
                <div class="font-bold text-white mt-1 text-sm">${cityName}</div>
                <div class="text-slate-400 text-[11px] mt-0.5">Sürücünün kargo alıp bırakabileceği nokta</div>
              </div>
            `);
          group.addLayer(marker);
        }
      });
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
    }
  }, [routeCoordinates, bufferPolygon, originCity, destCity, corridorCities, showBuffer, showCorridorMarkers]);

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !routeCoordinates || routeCoordinates.length === 0) return;
    const bounds = L.latLngBounds(routeCoordinates);
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${className}`}>
      {/* Harita Konteyneri */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Harita Üstü Kontrol Paneli (Basit ve Anlaşılır Başlıklar) */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>30 km Yol Üstü Alanı</span>
        </div>

        <button
          type="button"
          onClick={() => setShowBuffer(!showBuffer)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition-all flex items-center gap-1.5 ${
            showBuffer
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          {showBuffer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Yol Çevresi ({showBuffer ? 'Açık' : 'Kapalı'})</span>
        </button>

        <button
          type="button"
          onClick={() => setShowCorridorMarkers(!showCorridorMarkers)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition-all flex items-center gap-1.5 ${
            showCorridorMarkers
              ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Yol Üstü Şehirler</span>
        </button>
      </div>

      {/* Sağ Üst Haritayı Ortala Butonu */}
      <button
        type="button"
        onClick={handleFitBounds}
        title="Rotaya Odaklan"
        className="absolute top-3 right-3 z-[1000] p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-slate-900 transition-all shadow-lg"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Alt Bilgi Barı */}
      <div className="absolute bottom-3 left-3 right-16 z-[1000] pointer-events-none">
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/10 text-xs text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-white">{originCity}</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="font-semibold text-white">{destCity}</span>
          </div>
          {corridorCities.length > 0 && (
            <span className="text-slate-400 hidden sm:inline">
              ({corridorCities.length} şehir yol üstü güzergahında)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
