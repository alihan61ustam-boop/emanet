import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, ExternalLink, ShieldAlert } from 'lucide-react';

const SQL_CONTENT = `-- ==============================================================================
-- EMANET (P2P Şehirler Arası Bagaj & Kargo Paylaşım Platformu)
-- PostgreSQL + PostGIS Veritabanı Şeması ve Rota Koridor Fonksiyonları
-- ==============================================================================

-- 1. Gerekli Eklentileri Etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Kullanıcı Profilleri Tablosu
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    tc_no_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    vehicle_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sürücü İlanları Tablosu (driver_trips)
CREATE TABLE IF NOT EXISTS driver_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    origin_city TEXT NOT NULL,
    origin_coords GEOGRAPHY(Point, 4326) NOT NULL,
    destination_city TEXT NOT NULL,
    destination_coords GEOGRAPHY(Point, 4326) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    route_geometry GEOGRAPHY(LineString, 4326) NOT NULL, -- Sürüş güzergahının çizgisi
    service_cities TEXT[] NOT NULL DEFAULT '{}',         -- Rota merkezine <= 30 km mesafedeki şehirler listesi (sıralı)
    available_capacity_desi INTEGER NOT NULL CHECK (available_capacity_desi >= 0),
    total_capacity_desi INTEGER NOT NULL CHECK (total_capacity_desi >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rota geometrisi için GiST spatial indeksi (Hızlı mekansal aramalar için)
CREATE INDEX IF NOT EXISTS idx_driver_trips_route_geom ON driver_trips USING GIST(route_geometry);
CREATE INDEX IF NOT EXISTS idx_driver_trips_status ON driver_trips(status);

-- 4. Gönderici İlanları ve İlan Havuzu (sender_packages)
CREATE TABLE IF NOT EXISTS sender_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    origin_city TEXT NOT NULL,
    origin_coords GEOGRAPHY(Point, 4326) NOT NULL,
    destination_city TEXT NOT NULL,
    destination_coords GEOGRAPHY(Point, 4326) NOT NULL,
    desi INTEGER NOT NULL CHECK (desi > 0),
    package_type TEXT NOT NULL CHECK (package_type IN ('zarf_evrak', 'kucuk', 'orta', 'buyuk')),
    receiver_name TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    ready_date TIMESTAMPTZ NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0,
    quoted_market_price NUMERIC(10, 2) NOT NULL, -- Gerçek kargo piyasa fiyatı (+%35)
    emanet_price NUMERIC(10, 2) NOT NULL,        -- %25 indirimli Emanet fiyatı
    driver_payout NUMERIC(10, 2) NOT NULL,       -- Sürücü net hakedişi (%85)
    platform_fee NUMERIC(10, 2) NOT NULL,        -- Platform komisyonu (%15)
    status TEXT NOT NULL DEFAULT 'waiting_match' 
        CHECK (status IN ('waiting_match', 'matched', 'in_transit', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sender_packages_status ON sender_packages(status);
CREATE INDEX IF NOT EXISTS idx_sender_packages_origin_coords ON sender_packages USING GIST(origin_coords);
CREATE INDEX IF NOT EXISTS idx_sender_packages_dest_coords ON sender_packages USING GIST(destination_coords);

-- 5. Eşleşmeler ve Escrow Emanet Güvenlik Akışı (matches_and_escrow)
CREATE TABLE IF NOT EXISTS matches_and_escrow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES driver_trips(id) ON DELETE RESTRICT,
    package_id UUID NOT NULL REFERENCES sender_packages(id) ON DELETE RESTRICT,
    pickup_otp VARCHAR(4) NOT NULL,     -- Göndericinin sürücüye vereceği 4 haneli teslim alma kodu
    delivery_otp VARCHAR(4) NOT NULL,   -- Alıcının teslimatta gireceği 4 haneli teyit kodu
    pickup_photo_url TEXT,              -- Sürücünün teslim alırken çektiği dış ambalaj fotoğrafı
    delivery_photo_url TEXT,            -- Teslimat anındaki teyit fotoğrafı
    payment_status TEXT NOT NULL DEFAULT 'held_in_escrow' 
        CHECK (payment_status IN ('held_in_escrow', 'released_to_driver', 'refunded')),
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    pickedUpAt TIMESTAMPTZ,
    deliveredAt TIMESTAMPTZ
);

-- 6. POSTGIS ROTA KORİDOR VE EŞLEŞTİRME FONKSİYONLARI (30 KM KURALI)
CREATE OR REPLACE FUNCTION find_matching_trips(
    p_origin_city TEXT,
    p_dest_city TEXT,
    p_desi INTEGER
)
RETURNS TABLE (
    trip_id UUID,
    driver_name TEXT,
    origin_city TEXT,
    destination_city TEXT,
    departure_time TIMESTAMPTZ,
    available_capacity_desi INTEGER,
    service_cities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dt.id AS trip_id,
        p.full_name AS driver_name,
        dt.origin_city,
        dt.destination_city,
        dt.departure_time,
        dt.available_capacity_desi,
        dt.service_cities
    FROM driver_trips dt
    JOIN profiles p ON dt.driver_id = p.id
    WHERE dt.status = 'active'
      AND dt.available_capacity_desi >= p_desi
      AND p_origin_city = ANY(dt.service_cities)
      AND p_dest_city = ANY(dt.service_cities)
      AND array_position(dt.service_cities, p_origin_city) < array_position(dt.service_cities, p_dest_city)
    ORDER BY dt.departure_time ASC;
END;
$$ LANGUAGE plpgsql STABLE;`;

export const SqlSchemaDrawer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>PostgreSQL + PostGIS Veritabanı Mimarisi</span>
          </h2>
          <p className="text-xs text-slate-400">
            3. ve 4. Görevde tanımlanan PostGIS LineString, GiST indeksleri ve koridor eşleştirme fonksiyonları
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'SQL Kopyalandı!' : 'Tüm SQL Şemasını Kopyala'}</span>
        </button>
      </div>

      <div className="relative rounded-3xl bg-slate-950/90 border border-white/10 shadow-2xl overflow-hidden">
        {/* Terminal Üst Barı */}
        <div className="p-3.5 bg-slate-900/90 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-xs font-mono text-slate-400 ml-2">supabase/schema.sql</span>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            PostGIS 3.4 Ready
          </span>
        </div>

        {/* Kod Bloğu */}
        <div className="p-6 overflow-x-auto max-h-[600px] text-xs font-mono text-slate-300 leading-relaxed">
          <pre>{SQL_CONTENT}</pre>
        </div>
      </div>
    </div>
  );
};
