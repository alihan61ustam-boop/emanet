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

    const map = L.map(mapContainerRef.current, {
      center: [39.0, 35.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // %100 Ücretsiz OpenStreetMap (API anahtarı gerektirmez)
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

    // 1. 30 KM Yol Üstü Tampon Bölge Poligonu
    if (showBuffer && bufferPolygon) {
      try {
        const bufferLayer = L.geoJSON(bufferPolygon, {
          style: {
            color: '#FF4500',
            weight: 1.5,
            dashArray: '4, 4',
            fillColor: '#FF4500',
            fillOpacity: 0.12
          }
        });
        group.addLayer(bufferLayer);
      } catch (err) {
        console.error('Buffer render error:', err);
      }
    }

    // 2. Rota Çizgisi (Safety Flame Orange)
    const glowLine = L.polyline(routeCoordinates, {
      color: '#FF4500',
      weight: 8,
      opacity: 0.25,
      lineCap: 'round',
      lineJoin: 'round'
    });
    group.addLayer(glowLine);

    const mainLine = L.polyline(routeCoordinates, {
      color: '#FF4500',
      weight: 3.5,
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
          <div class="relative flex items-center justify-center font-mono font-bold">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#FF4500] opacity-75"></span>
            <div class="relative inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#FF4500] text-black shadow-xl border border-white font-black text-xs">
              A
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const startMarker = L.marker(startCoord, { icon: startIcon })
        .bindPopup(`
          <div class="p-2 font-mono text-xs">
            <div class="font-bold text-[#FF4500] text-sm tracking-wide">[ÇIKIŞ NOKTASI]</div>
            <div class="text-white font-bold text-base mt-0.5">${originCity}</div>
            <div class="text-[#8E93A6] text-[11px] mt-1">Yolculuğun başladığı il merkezi</div>
          </div>
        `);
      group.addLayer(startMarker);
    }

    if (endCoord) {
      const endIcon = L.divIcon({
        className: 'custom-pin-end',
        html: `
          <div class="relative flex items-center justify-center font-mono font-bold">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#CCFF00] opacity-75"></span>
            <div class="relative inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#CCFF00] text-black shadow-xl border border-black font-black text-xs">
              B
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const endMarker = L.marker(endCoord, { icon: endIcon })
        .bindPopup(`
          <div class="p-2 font-mono text-xs">
            <div class="font-bold text-[#CCFF00] text-sm tracking-wide">[VARIŞ NOKTASI]</div>
            <div class="text-white font-bold text-base mt-0.5">${destCity}</div>
            <div class="text-[#8E93A6] text-[11px] mt-1">Yolculuğun sonlandığı il merkezi</div>
          </div>
        `);
      group.addLayer(endMarker);
    }

    // 4. Yol Üstü Durak Şehirleri
    if (showCorridorMarkers && corridorCities.length > 2) {
      const intermediate = corridorCities.slice(1, -1);
      intermediate.forEach((cityName, idx) => {
        const approxIdx = Math.floor(((idx + 1) / (intermediate.length + 1)) * routeCoordinates.length);
        const approxCoord = routeCoordinates[approxIdx];

        if (approxCoord) {
          const midIcon = L.divIcon({
            className: 'custom-pin-mid',
            html: `
              <div class="w-3.5 h-3.5 bg-[#FFB800] border-2 border-black rotate-45 shadow-md"></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });

          const marker = L.marker(approxCoord, { icon: midIcon })
            .bindPopup(`
              <div class="p-1.5 font-mono text-xs">
                <span class="px-1.5 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] font-bold text-[10px]">YOL ÜSTÜ DURAK</span>
                <div class="font-bold text-white mt-1 text-sm">${cityName}</div>
                <div class="text-[#8E93A6] text-[11px] mt-0.5">30 km koridoru içinde kargo teslim noktası</div>
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
    <div className={`relative rounded-xl overflow-hidden border border-[#232635] shadow-2xl ${className}`}>
      {/* Harita Konteyneri */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Harita Üstü Kontroller */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 font-mono">
        <div className="px-3 py-1.5 rounded-lg bg-[#0E1017]/90 backdrop-blur-md border border-[#2A2E3D] text-[11px] font-bold text-[#D0D5E4] flex items-center gap-1.5 shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF4500]" />
          <span>30 KM YOL KORİDORU</span>
        </div>

        <button
          type="button"
          onClick={() => setShowBuffer(!showBuffer)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold backdrop-blur-md border shadow-lg transition-all flex items-center gap-1.5 ${
            showBuffer
              ? 'bg-[#FF4500]/20 border-[#FF4500]/50 text-[#FF6E3D]'
              : 'bg-[#0E1017]/90 border-[#2A2E3D] text-[#7E8498] hover:text-white'
          }`}
        >
          {showBuffer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Yol Alanı ({showBuffer ? 'AÇIK' : 'KAPALI'})</span>
        </button>

        <button
          type="button"
          onClick={() => setShowCorridorMarkers(!showCorridorMarkers)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold backdrop-blur-md border shadow-lg transition-all flex items-center gap-1.5 ${
            showCorridorMarkers
              ? 'bg-[#FFB800]/20 border-[#FFB800]/50 text-[#FFB800]'
              : 'bg-[#0E1017]/90 border-[#2A2E3D] text-[#7E8498] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Duraklar</span>
        </button>
      </div>

      {/* Sağ Üst Haritayı Ortala Butonu */}
      <button
        type="button"
        onClick={handleFitBounds}
        title="Rotaya Odaklan"
        className="absolute top-3 right-3 z-[1000] p-2 rounded-lg bg-[#0E1017]/90 backdrop-blur-md border border-[#2A2E3D] text-[#8C92A4] hover:text-white hover:border-[#FF4500] transition-all shadow-lg"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Alt Bilgi Bandı */}
      <div className="absolute bottom-3 left-3 right-16 z-[1000] pointer-events-none">
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0C0E14]/95 backdrop-blur-md border border-[#262A38] text-xs font-mono text-[#D0D5E4] pointer-events-auto">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded bg-[#FF4500]"></span>
            <span>{originCity}</span>
          </div>
          <span className="text-[#595E70]">➔</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded bg-[#CCFF00]"></span>
            <span>{destCity}</span>
          </div>
          {corridorCities.length > 0 && (
            <span className="text-[#787E92] hidden sm:inline text-[11px]">
              ({corridorCities.length} durak şehri aktif)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
