# EMANET (P2P Şehirler Arası Bagaj & Kargo Paylaşım Platformu)

Emanet; şehirler arası şahsi aracıyla seyahat eden sürücülerin boş bagaj hacmini, aynı güzergaha kargo göndermek isteyen kişilerle eşleştiren, **%25 net fiyat tasarrufu**, **30 km GIS tampon koridoru** ve **çift aşamalı OTP Escrow güvenliği** sunan bir P2P kargo pazaryeri platformudur.

---

## 🌟 Öne Çıkan Özellikler ve Mimari

### 1. Fiyatlandırma Dinamiği ve Algoritması
Geleneksel kargo şirketlerinin piyasa fiyatları taban formülün **%35 fazlası (135x)** olarak realize edilmektedir. Emanet ise bu piyasa fiyatı üzerinden kullanıcıya **net %25 indirimli** önerilen fiyat sunar:
- **Baz Maliyet:** `base = 80 + (distanceKm * 0.18) + (desi * 12)`
- **Standart Piyasa Fiyatı (+%35):** `marketPrice = Math.round(base * 1.35)` *(Taban 108 TL + 0.243 TL/km + 16.2 TL/desi)*
- **Emanet Önerilen Fiyatı:** `emanetPrice = Math.round(marketPrice * 0.75)` (%25 İndirimli)
- **Finansal Dağılım:**
  - **Platform Hizmet Bedeli:** %15
  - **Sürücü Net Hakedişi:** %85
  - **Kullanıcı Tasarrufu:** `marketPrice - emanetPrice`

### 2. GIS & 30 KM Koridor Kuralı (Turf.js + PostGIS)
- **Tampon Bölge (Buffer):** Sürücü güzergah açtığında rota çizgisi oluşturulur. `turf.buffer(line, 30, {units: 'kilometers'})` ile rota merkezine en fazla 30 km mesafedeki il merkezleri otomatik tespit edilir.
- **Sıralı Koridor Listesi (`service_cities`):** Şehirler gidiş yönüne göre indekslenerek dizilir *(Örn: [İstanbul, Kocaeli, Sakarya, Düzce, Bolu, Ankara])*.
- **Aynı Yön Doğrulaması:** `origin_city` ve `destination_city` sürücünün koridorunda olmalı VE `origin_index < destination_index` olmalıdır.
- **Akıllı İlan Havuzu:** Eşleşmeyen kargolar havuzda toplanır. Sürücü rota açtığında:
  > *"Rotanız üzerinde taşınmayı bekleyen 3 adet kargo var! Hemen bagajına ekle"* uyarısı verilir.

### 3. Çift Kademeli OTP ve Fotoğraflı Escrow Güvenliği
- **1. Aşama (Teslim Alma):** Sürücü paketin ambalaj fotoğrafını yükler + Göndericinin 4 haneli `pickup_otp` kodunu sisteme girer. Paket durumu `in_transit` (Taşınıyor) olur.
- **2. Aşama (Teslim Etme):** Alıcı paketi kontrol edip 4 haneli `delivery_otp` kodunu sürücüye verir. Kod girildiğinde Escrow havuzundaki bakiye anında sürücü hesabına (%85) aktarılır, kutlama konfetisi patlar ve resmi dekont üretilir.

### 4. Teknoloji Yığını
- **Tek Dil:** 100% TypeScript
- **Frontend & GIS:** React 19, Vite, Tailwind CSS v4, Leaflet (CartoDB Dark Matter), @turf/turf, Lucide React, Canvas Confetti
- **Veritabanı Şeması:** PostgreSQL + PostGIS (`supabase/schema.sql`)

---

## 🚀 Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim derlemesi
npm run build
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışmaktadır.
