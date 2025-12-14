# 🚀 Base Mini App - Hızlı Başlangıç

Bu rehber, Base Mini App'inizi hızlıca başlatmak için gereken adımları içerir.

## ⚡ 5 Dakikada Başlatma

### 1. Paketleri Yükleyin

```bash
npm install
```

### 2. Environment Variables Ayarlayın.

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY=your_api_key_here
GOOGLE_PLACES_KEY=your_google_key_here
GPT5_API_KEY=your_gpt_key_here
```

**API Key Nasıl Alınır:**
1. [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) → Giriş yapın
2. "Create Mini App" → Yeni Mini App oluşturun
3. Settings → API Key'i kopyalayın

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresine gidin.

### 4. Public URL ile Test Edin

Base Mini App'i test etmek için public URL gereklidir:

#### PowerShell ile (Önerilen):

```powershell
.\start-base-test.ps1
```

Bu script:
- Next.js sunucusunun çalışıp çalışmadığını kontrol eder
- ngrok veya Cloudflare Tunnel ile public URL oluşturur
- URL'i gösterir

#### Manuel olarak:

**ngrok:**
```bash
ngrok http 3000
```

**Cloudflare Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3000
```

### 5. Base Developer Platform'da URL Ayarlayın

1. Base Developer Platform'da Mini App'inizi açın
2. "Settings" → "Mini App URL" bölümüne gidin
3. ngrok/Cloudflare Tunnel'den aldığınız public URL'i ekleyin
4. Kaydedin

### 6. Base App'te Test Edin

1. **Base App'i İndirin:**
   - iOS: App Store'dan "Base" uygulamasını indirin
   - Android: Google Play'den "Base" uygulamasını indirin

2. **Mini App'i Açın:**
   - Base App içinde Mini App'inizi bulun
   - Açın ve test edin
   - ✅ Wallet otomatik olarak bağlanmalı

## ✅ Kontrol Listesi

- [ ] `npm install` çalıştırıldı
- [ ] `.env.local` dosyası oluşturuldu ve dolduruldu
- [ ] `npm run dev` çalışıyor
- [ ] Local'de test edildi (http://localhost:3000)
- [ ] Public URL oluşturuldu (ngrok/cloudflare)
- [ ] Base Developer Platform'da URL ayarlandı
- [ ] Base App'te test edildi
- [ ] Wallet bağlantısı çalışıyor

## 🔧 Sorun Giderme

### "Next.js sunucusu çalışmıyor" Hatası

```bash
# Yeni terminal açın ve çalıştırın:
npm run dev
```

### ngrok/Cloudflare Bulunamadı

**ngrok yüklemek için:**
- [ngrok.com/download](https://ngrok.com/download)

**Cloudflare Tunnel yüklemek için:**
```powershell
winget install --id Cloudflare.cloudflared
```

### Wallet Bağlanmıyor

1. Base App'in güncel versiyonunu kullandığınızdan emin olun
2. Base Developer Platform'da Mini App URL'inin doğru olduğunu kontrol edin
3. Console'da hata var mı kontrol edin (F12 → Console)

### API Proxy Çalışmıyor

1. `.env.local` dosyasında API key'lerin doğru olduğunu kontrol edin
2. Server-side route'ların çalıştığını kontrol edin:
   - `app/api/proxy/google/route.ts`
   - `app/api/proxy/ai/route.ts`

## 📚 Daha Fazla Bilgi

- **Detaylı Deployment:** [BASE_MINI_APP_DEPLOYMENT.md](./BASE_MINI_APP_DEPLOYMENT.md)
- **Logo Değiştirme:** [LOGO_NOTLARI.md](./LOGO_NOTLARI.md)
- **Güvenlik:** [BLOCKCHAIN_PROXY_GUVENLIK.md](./BLOCKCHAIN_PROXY_GUVENLIK.md)

## 🎯 Sonraki Adımlar

1. ✅ Local development çalışıyor
2. ✅ Base App'te test edildi
3. 🚀 Production'a deploy edin (Vercel/Netlify)
4. 📱 Base App'te yayınlayın



