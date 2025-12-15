# 🚀 Base Mini App Deployment Rehberi

Bu rehber, Base Mini App'inizi production'a deploy etmek için gereken tüm adımları içerir.

## 📋 Ön Hazırlık

### 1. Base Developer Platform'da Mini App Oluşturma

1. **Hesap Oluşturun:**
   - [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) adresine gidin
   - Hesap oluşturun veya giriş yapın

2. **Mini App Oluşturun:**
   - Dashboard'da "Create Mini App" butonuna tıklayın
   - Uygulama bilgilerini girin:
     - **Name:** Harita Uygulamasi
     - **Description:** Yakın mekanlar harita uygulaması
     - **Network:** Base
   - "Create" butonuna tıklayın

3. **API Key'i Alın:**
   - Oluşturduğunuz Mini App'in ayarlarına gidin
   - "API Keys" bölümünden API Key'i kopyalayın
   - Bu key'i `.env.local` dosyasına ekleyin

## 🔧 Local Development

### 1. Environment Variables Ayarlayın

`.env.local` dosyası oluşturun (`.env.example` dosyasını kopyalayarak):

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin ve API key'leri ekleyin:

```env
NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY=your_actual_api_key
GOOGLE_PLACES_KEY=your_google_key
GPT5_API_KEY=your_gpt_key
```

### 2. Geliştirme Sunucusunu Başlatın

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresine gidin.

### 3. Public URL ile Test Edin

Base Mini App'i test etmek için public URL gereklidir:

#### Seçenek 1: ngrok (Önerilen)

```powershell
# PowerShell'de
.\start-base-test.ps1
```

Veya manuel olarak:

```bash
ngrok http 3000
```

#### Seçenek 2: Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

### 4. Base Developer Platform'da URL Ayarlayın

1. Base Developer Platform'da Mini App'inizi açın
2. "Settings" → "Mini App URL" bölümüne gidin
3. ngrok veya Cloudflare Tunnel'den aldığınız public URL'i ekleyin
4. Kaydedin

### 5. Base App'te Test Edin

1. **Base App'i İndirin:**
   - iOS: App Store'dan "Base" uygulamasını indirin
   - Android: Google Play'den "Base" uygulamasını indirin

2. **Mini App'i Açın:**
   - Base App içinde Mini App'inizi bulun
   - Açın ve test edin
   - Wallet otomatik olarak bağlanmalı

## 🌐 Production Deployment

### Seçenek 1: Vercel (Önerilen)

#### 1. Vercel Hesabı Oluşturun

1. [Vercel](https://vercel.com/) adresine gidin
2. GitHub hesabınızla giriş yapın

#### 2. Projeyi Deploy Edin

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Deploy edin
vercel
```

Veya GitHub repository'nizi Vercel'e bağlayın:
1. Vercel Dashboard → "Add New Project"
2. GitHub repository'nizi seçin
3. "Deploy" butonuna tıklayın

#### 3. Environment Variables Ayarlayın

Vercel Dashboard'da:
1. Project → Settings → Environment Variables
2. Şu değişkenleri ekleyin:
   - `NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY`
   - `GOOGLE_PLACES_KEY`
   - `GPT5_API_KEY`
   - `GEMINI_API_KEY` (opsiyonel)

#### 4. Base Developer Platform'da Production URL'i Ayarlayın

1. Vercel'den aldığınız production URL'i kopyalayın (örn: `https://harita-mini-app.vercel.app`)
2. Base Developer Platform'da Mini App'inizin ayarlarına gidin
3. "Mini App URL" bölümüne production URL'i ekleyin
4. Kaydedin

### Seçenek 2: Netlify

#### 1. Netlify Hesabı Oluşturun

1. [Netlify](https://www.netlify.com/) adresine gidin
2. GitHub hesabınızla giriş yapın

#### 2. Projeyi Deploy Edin

```bash
# Netlify CLI yükleyin
npm i -g netlify-cli

# Deploy edin
netlify deploy --prod
```

Veya GitHub repository'nizi Netlify'e bağlayın:
1. Netlify Dashboard → "Add new site" → "Import an existing project"
2. GitHub repository'nizi seçin
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. "Deploy site" butonuna tıklayın

#### 3. Environment Variables Ayarlayın

Netlify Dashboard'da:
1. Site → Site settings → Environment variables
2. Şu değişkenleri ekleyin:
   - `NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY`
   - `GOOGLE_PLACES_KEY`
   - `GPT5_API_KEY`
   - `GEMINI_API_KEY` (opsiyonel)

### Seçenek 3: Kendi Server'ınız

#### 1. Build Alın

```bash
npm run build
```

#### 2. Production Sunucusunu Başlatın

```bash
npm start
```

#### 3. Environment Variables Ayarlayın

Server'da `.env` dosyası oluşturun:

```env
NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY=your_key
GOOGLE_PLACES_KEY=your_key
GPT5_API_KEY=your_key
```

#### 4. Reverse Proxy Ayarlayın (Nginx örneği)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ Deployment Kontrol Listesi

### Öncesi
- [ ] `.env.local` dosyası oluşturuldu ve dolduruldu
- [ ] Local'de test edildi (`npm run dev`)
- [ ] Public URL ile test edildi (ngrok/cloudflare)
- [ ] Base App'te test edildi
- [ ] Tüm API key'ler çalışıyor

### Deployment
- [ ] Production platform seçildi (Vercel/Netlify/Kendi server)
- [ ] Repository push edildi
- [ ] Build başarılı
- [ ] Environment variables ayarlandı
- [ ] Production URL alındı

### Sonrası
- [ ] Base Developer Platform'da production URL ayarlandı
- [ ] Base App'te production URL test edildi
- [ ] Tüm özellikler çalışıyor
- [ ] Wallet bağlantısı çalışıyor
- [ ] API proxy'ler çalışıyor

## 🔍 Sorun Giderme

### Wallet Bağlanmıyor

1. Base App'in güncel versiyonunu kullandığınızdan emin olun
2. Base Developer Platform'da Mini App URL'inin doğru olduğunu kontrol edin
3. Console'da hata var mı kontrol edin
4. `MiniKitProvider` doğru yapılandırılmış mı kontrol edin

### API Proxy Çalışmıyor

1. Environment variables'ların doğru ayarlandığını kontrol edin
2. API key'lerin geçerli olduğunu kontrol edin
3. Server-side route'ların çalıştığını kontrol edin (`app/api/proxy/`)

### Build Hatası

1. TypeScript hatalarını kontrol edin: `npm run lint`
2. Dependencies eksik mi kontrol edin: `npm install`
3. Next.js versiyonunu kontrol edin: `npm list next`

## 📚 Kaynaklar

- [Base Mini App Dokümantasyonu](https://docs.base.org/cookbook/converting-customizing-mini-apps)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)

## 🎯 Sonraki Adımlar

1. **Analytics Ekleme:** Kullanıcı etkileşimlerini takip edin
2. **Error Tracking:** Sentry veya benzeri bir servis ekleyin
3. **Performance Optimization:** Lighthouse skorlarını iyileştirin
4. **Onchain Features:** Smart contract entegrasyonları ekleyin
5. **Paymaster:** Gasless transaction desteği ekleyin




