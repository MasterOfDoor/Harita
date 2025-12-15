# 📋 Yapılacaklar - Detaylı Rehber

## 🔍 Mevcut Durum Analizi

### ✅ Tamamlananlar
1. **Next.js Projesi:** Kuruldu ve çalışıyor
2. **Base Mini App Yapılandırması:** MiniKitProvider, Wagmi, Base chain entegrasyonu tamam
3. **API Proxy Routes:** Google Places ve AI proxy'leri hazır
4. **Logo ve Manifest:** VibelyMap logosu ve manifest.json eklendi
5. **Vercel Yapılandırması:** vercel.json dosyası hazır

### ❌ Eksikler
1. **Harita Fonksiyonları:** MapComponent sadece temel haritayı gösteriyor, fonksiyonlar yok
2. **UI Bileşenleri:** Arama, filtre, detay paneli, sonuçlar paneli yok
3. **Production Deployment:** Vercel'e deploy edilmemiş
4. **Base Mini App URL:** Production URL Base Developer Platform'a eklenmemiş

## 🎯 Yapılması Gerekenler

### 1. Harita Fonksiyonlarını Eklemek (ÖNCELİK 1)

**Sorun:** MapComponent sadece temel haritayı gösteriyor, hiçbir fonksiyon yok.

**Çözüm:** Eski `script.js` dosyasındaki fonksiyonları React component'lerine dönüştürmek.

**Gerekli Bileşenler:**
- ✅ `MapComponent.tsx` - Temel harita (mevcut)
- ❌ `SearchOverlay.tsx` - Arama overlay'i
- ❌ `FilterPanel.tsx` - Filtre paneli
- ❌ `DetailPanel.tsx` - Mekan detay paneli
- ❌ `ResultsPanel.tsx` - Sonuçlar listesi
- ❌ `TopBar.tsx` - Üst bar (menü, arama butonu, konum butonu)

**Gerekli Hook'lar:**
- ✅ `useProxy.ts` - API proxy hook'u (mevcut)
- ❌ `useMapPlaces.ts` - Mekan yönetimi hook'u
- ❌ `useMapSearch.ts` - Arama hook'u
- ❌ `useMapFilters.ts` - Filtre hook'u

### 2. Production Deployment (ÖNCELİK 2)

**Sorun:** Uygulama sadece local'de çalışıyor, production'da yok.

**Çözüm:** Vercel'e deploy etmek.

**Adımlar:**
1. GitHub repository oluştur
2. Kodu GitHub'a push et
3. Vercel'e bağla
4. Environment variables ekle
5. Deploy et

### 3. Base Mini App URL Ayarlama (ÖNCELİK 3)

**Sorun:** Base Developer Platform'da production URL yok.

**Çözüm:** Vercel'den aldığınız URL'i Base Developer Platform'a eklemek.

## 📝 Adım Adım Yapılacaklar

### ADIM 1: Harita Fonksiyonlarını Eklemek

#### 1.1. TopBar Bileşeni Oluştur
```typescript
// app/components/TopBar.tsx
- Menü butonu (hamburger)
- Arama butonu
- Başlık
- Konum butonu
- Profil butonu
```

#### 1.2. SearchOverlay Bileşeni Oluştur
```typescript
// app/components/SearchOverlay.tsx
- Arama input'u
- Arama butonu
- Öneriler listesi
- useProxy hook'unu kullanarak arama yapma
```

#### 1.3. FilterPanel Bileşeni Oluştur
```typescript
// app/components/FilterPanel.tsx
- Kategori filtreleri
- Işıklandırma filtreleri
- Priz filtreleri
- Ambiyans filtreleri
- Oturma filtreleri
- Deniz görünümü filtreleri
- Sigara filtreleri
- Uygula/Temizle butonları
```

#### 1.4. DetailPanel Bileşeni Oluştur
```typescript
// app/components/DetailPanel.tsx
- Mekan adı
- Mekan tipi
- Adres
- Çalışma saatleri
- Fotoğraf
- Etiketler
- Yorumlar
- Yorum formu
```

#### 1.5. ResultsPanel Bileşeni Oluştur
```typescript
// app/components/ResultsPanel.tsx
- Bulunan mekanlar listesi
- Her mekan için kart görünümü
- Tıklanınca detay panelini açma
```

#### 1.6. MapComponent'i Güncelle
```typescript
// app/components/MapComponent.tsx
- Marker ekleme fonksiyonu
- Popup gösterme
- Marker tıklama event'i
- Detay panelini açma
- Filtreleme sonuçlarını gösterme
```

#### 1.7. Hook'ları Oluştur
```typescript
// app/hooks/useMapPlaces.ts
- Mekan listesi yönetimi
- Marker ekleme/silme
- Mekan detaylarını yükleme

// app/hooks/useMapSearch.ts
- Arama fonksiyonu
- Öneriler
- Sonuçları gösterme

// app/hooks/useMapFilters.ts
- Filtre seçimleri
- Filtre uygulama
- Filtre temizleme
```

### ADIM 2: Production Deployment

#### 2.1. GitHub Repository Oluştur
1. GitHub'da yeni repository oluştur
2. Repository adı: `vibelymap` veya `harita-mini-app`

#### 2.2. Kodu GitHub'a Push Et
```bash
git init
git add .
git commit -m "Initial commit: Base Mini App with full functionality"
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git push -u origin main
```

#### 2.3. Vercel'e Bağla
1. [Vercel](https://vercel.com/) → GitHub ile giriş yap
2. "Add New Project" → Repository'yi seç
3. Framework: Next.js (otomatik algılanır)
4. "Deploy" butonuna tıkla

#### 2.4. Environment Variables Ekle
Vercel Dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY=your_key
GOOGLE_PLACES_KEY=your_key
GPT5_API_KEY=your_key
GEMINI_API_KEY=your_key
```

#### 2.5. Deploy Et
- İlk deploy otomatik başlar
- Deploy tamamlandıktan sonra production URL alınır (örn: `https://vibelymap.vercel.app`)

### ADIM 3: Base Mini App URL Ayarlama

#### 3.1. Base Developer Platform'a Git
1. [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Mini App'inizi açın

#### 3.2. Production URL'i Ekleyin
1. Settings → "Mini App URL" bölümüne gidin
2. Vercel'den aldığınız production URL'i ekleyin
3. Kaydedin

#### 3.3. Test Edin
1. Base App'i açın
2. Mini App'inizi bulun
3. Açın ve test edin
4. Tüm fonksiyonların çalıştığını kontrol edin

## ⚠️ Önemli Notlar

### 1. Proxy URL Değişikliği
Eski `script.js` dosyasında:
```javascript
const PROXY_URL = "http://localhost:3001";
```

Yeni Next.js uygulamasında proxy `/api/proxy` route'ları üzerinden çalışıyor. Bu yüzden:
- `fetchAllDiscover` fonksiyonunu `/api/proxy/google` kullanacak şekilde güncelle
- `fetchPlaceDetailsViaProxy` fonksiyonunu `/api/proxy/google` kullanacak şekilde güncelle
- `useProxy` hook'unu kullan

### 2. State Yönetimi
- React hooks kullan (`useState`, `useEffect`)
- Global state için Context API veya Zustand kullanabilirsin
- Eski `script.js`'deki global değişkenleri React state'ine çevir

### 3. Stil Dosyaları
- `style.css` dosyası mevcut
- `app/globals.css` içinde import edilmiş
- Tailwind CSS de kullanılabilir

## 🚀 Hızlı Başlangıç Sırası

1. **Önce harita fonksiyonlarını ekle** (ADIM 1)
   - TopBar → SearchOverlay → FilterPanel → DetailPanel → ResultsPanel
   - MapComponent'i güncelle
   - Hook'ları oluştur

2. **Local'de test et**
   - `npm run dev`
   - Tüm fonksiyonların çalıştığını kontrol et

3. **GitHub'a push et** (ADIM 2.1-2.2)

4. **Vercel'e deploy et** (ADIM 2.3-2.5)

5. **Base Developer Platform'da URL ayarla** (ADIM 3)

6. **Base App'te test et**

## 📚 Referans Dosyalar

- **Eski Uygulama:** `index.html`, `script.js`, `style.css`
- **Yeni Uygulama:** `app/page.tsx`, `app/components/MapComponent.tsx`
- **API Routes:** `app/api/proxy/google/route.ts`, `app/api/proxy/ai/route.ts`
- **Hook'lar:** `app/hooks/useProxy.ts`

## ✅ Kontrol Listesi

### Harita Fonksiyonları
- [ ] TopBar bileşeni
- [ ] SearchOverlay bileşeni
- [ ] FilterPanel bileşeni
- [ ] DetailPanel bileşeni
- [ ] ResultsPanel bileşeni
- [ ] MapComponent güncellemeleri
- [ ] useMapPlaces hook'u
- [ ] useMapSearch hook'u
- [ ] useMapFilters hook'u

### Production Deployment
- [ ] GitHub repository oluşturuldu
- [ ] Kod GitHub'a push edildi
- [ ] Vercel'e bağlandı
- [ ] Environment variables eklendi
- [ ] Deploy edildi
- [ ] Production URL alındı

### Base Mini App
- [ ] Base Developer Platform'da Mini App oluşturuldu
- [ ] Production URL eklendi
- [ ] Base App'te test edildi
- [ ] Tüm fonksiyonlar çalışıyor




