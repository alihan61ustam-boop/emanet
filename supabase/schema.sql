-- ==============================================================================
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
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_match ON matches_and_escrow(package_id);

-- ==============================================================================
-- 6. POSTGIS ROTA KORİDOR VE EŞLEŞTİRME FONKSİYONLARI (30 KM KURALI)
-- ==============================================================================

-- Fonksiyon: Belirli bir LineString güzergahına 30 km mesafedeki il merkezlerini sıralı getirir
CREATE OR REPLACE FUNCTION get_corridor_cities(
    p_route_geom GEOGRAPHY(LineString, 4326),
    p_buffer_km DOUBLE PRECISION DEFAULT 30.0
)
RETURNS TABLE (
    city_name TEXT,
    distance_meters DOUBLE PRECISION,
    sort_order DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.city_name,
        ST_Distance(p_route_geom, c.location_coords) AS distance_meters,
        ST_LineLocatePoint(p_route_geom::geometry, c.location_coords::geometry) AS sort_order
    FROM turkish_cities c
    WHERE ST_DWithin(p_route_geom, c.location_coords, p_buffer_km * 1000)
    ORDER BY sort_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonksiyon: Göndericinin rotasına uyan aktif sürücüleri ara (Yön ve 30km koridor doğrulaması)
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
      -- Her iki şehir de sürücünün 30 km koridorunda olmalı
      AND p_origin_city = ANY(dt.service_cities)
      AND p_dest_city = ANY(dt.service_cities)
      -- YÖN KONTROLÜ: origin_city dizin sırası, destination_city dizin sırasından önce olmalı
      AND array_position(dt.service_cities, p_origin_city) < array_position(dt.service_cities, p_dest_city)
    ORDER BY dt.departure_time ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonksiyon: Sürücü rota açtığında havuzda bekleyen eşleşebilir kargoları tespit et
CREATE OR REPLACE FUNCTION count_waiting_packages_for_corridor(
    p_service_cities TEXT[],
    p_available_desi INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    matched_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO matched_count
    FROM sender_packages sp
    WHERE sp.status = 'waiting_match'
      AND sp.desi <= p_available_desi
      AND sp.origin_city = ANY(p_service_cities)
      AND sp.destination_city = ANY(p_service_cities)
      AND array_position(p_service_cities, sp.origin_city) < array_position(p_service_cities, sp.destination_city);
      
    RETURN matched_count;
END;
$$ LANGUAGE plpgsql STABLE;
