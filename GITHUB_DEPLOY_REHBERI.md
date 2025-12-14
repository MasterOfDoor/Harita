# 🚀 GitHub'a Deploy Etme Rehberi

Bu rehber, Base Mini App'inizi GitHub'a push edip Vercel'e otomatik deploy etmek için gereken adımları içerir.

## 📋 Ön Hazırlık

### 1. GitHub Repository Oluşturun

1. [GitHub](https://github.com) adresine gidin
2. "New repository" butonuna tıklayın
3. Repository bilgilerini girin:
   - **Name:** `harita-mini-app` (veya istediğiniz isim)
   - **Description:** Base Mini App - Harita Uygulaması
   - **Visibility:** Public veya Private (tercihinize göre)
4. "Create repository" butonuna tıklayın

### 2. Local Repository'yi Hazırlayın

```bash
# Git başlat (eğer başlatılmadıysa)
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Base Mini App"

# GitHub repository'nizi remote olarak ekleyin
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git

# Main branch'e push edin
git branch -M main
git push -u origin main
```

## 🔧 Vercel'e Bağlama

### Seçenek 1: Vercel Dashboard (Önerilen)

1. **Vercel Hesabı Oluşturun:**
   - [Vercel](https://vercel.com/) adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Projeyi İçe Aktarın:**
   - Vercel Dashboard → "Add New Project"
   - GitHub repository'nizi seçin
   - "Import" butonuna tıklayın

3. **Yapılandırma:**
   - **Framework Preset:** Next.js (otomatik algılanır)
   - **Root Directory:** `./` (varsayılan)
   - **Build Command:** `npm run build` (varsayılan)
   - **Output Directory:** `.next` (varsayılan)
   - **Install Command:** `npm install` (varsayılan)

4. **Environment Variables Ekleyin:**
   - "Environment Variables" bölümüne gidin
   - Şu değişkenleri ekleyin:
     ```
     NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY=your_key_here
     GOOGLE_PLACES_KEY=your_key_here
     GPT5_API_KEY=your_key_here
     GEMINI_API_KEY=your_key_here
     ```
   - Her biri için "Production", "Preview", "Development" seçeneklerini işaretleyin

5. **Deploy:**
   - "Deploy" butonuna tıklayın
   - İlk deploy birkaç dakika sürebilir

### Seçenek 2: Vercel CLI

1. **Vercel CLI Yükleyin:**
   ```bash
   npm i -g vercel
   ```

2. **Login Olun:**
   ```bash
   vercel login
   ```

3. **Projeyi Linkleyin:**
   ```bash
   vercel link
   ```
   - Project name: `harita-mini-app`
   - Directory: `./`
   - Settings: Varsayılanları kabul edin

4. **Environment Variables Ekleyin:**
   ```bash
   vercel env add NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY
   vercel env add GOOGLE_PLACES_KEY
   vercel env add GPT5_API_KEY
   vercel env add GEMINI_API_KEY
   ```
   Her birinde değeri girin ve environment'ları seçin (Production, Preview, Development)

5. **Deploy Edin:**
   ```bash
   vercel --prod
   ```

## 🔐 GitHub Secrets (GitHub Actions için)

Eğer GitHub Actions kullanmak istiyorsanız:

1. GitHub repository'nize gidin
2. Settings → Secrets and variables → Actions
3. "New repository secret" butonuna tıklayın
4. Şu secret'ları ekleyin:
   - `VERCEL_TOKEN` - Vercel'den alın (Settings → Tokens)
   - `VERCEL_ORG_ID` - Vercel'den alın (Settings → General)
   - `VERCEL_PROJECT_ID` - Vercel'den alın (Project Settings → General)
   - `NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY`
   - `GOOGLE_PLACES_KEY`
   - `GPT5_API_KEY`
   - `GEMINI_API_KEY`

## ✅ Deployment Kontrol Listesi

### Öncesi
- [ ] GitHub repository oluşturuldu
- [ ] Local repository Git'e bağlandı
- [ ] `.env.local` dosyası `.gitignore` içinde (güvenlik için)
- [ ] Tüm dosyalar commit edildi
- [ ] GitHub'a push edildi

### Vercel Yapılandırması
- [ ] Vercel hesabı oluşturuldu
- [ ] GitHub repository Vercel'e bağlandı
- [ ] Environment variables eklendi
- [ ] İlk deploy başarılı

### Sonrası
- [ ] Production URL alındı (örn: `https://harita-mini-app.vercel.app`)
- [ ] Base Developer Platform'da production URL ayarlandı
- [ ] Base App'te test edildi
- [ ] Tüm özellikler çalışıyor

## 🔄 Otomatik Deploy

Vercel, GitHub repository'nize her push yaptığınızda otomatik olarak deploy eder:

- **Main/Master branch:** Production'a deploy edilir
- **Diğer branch'ler:** Preview deployment oluşturulur

### Manuel Deploy

```bash
# Production'a deploy
vercel --prod

# Preview deployment
vercel
```

## 📱 Base Developer Platform'da URL Güncelleme

1. Vercel'den aldığınız production URL'i kopyalayın
2. [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) → Mini App'inizi açın
3. Settings → "Mini App URL" bölümüne gidin
4. Production URL'i ekleyin
5. Kaydedin

## 🔍 Sorun Giderme

### Build Hatası

1. **TypeScript Hataları:**
   ```bash
   npm run lint
   ```

2. **Dependencies Eksik:**
   ```bash
   npm install
   ```

3. **Environment Variables Eksik:**
   - Vercel Dashboard'da environment variables'ları kontrol edin
   - Tüm gerekli key'lerin eklendiğinden emin olun

### Deploy Başarısız

1. **Vercel Logs:**
   - Vercel Dashboard → Deployments → Logs
   - Hata mesajlarını kontrol edin

2. **Local Build Test:**
   ```bash
   npm run build
   ```
   Local'de build başarılı olmalı

### Environment Variables Çalışmıyor

1. **Variable İsimleri:**
   - Büyük harf kullanın
   - Alt çizgi kullanın
   - `NEXT_PUBLIC_` prefix'i client-side değişkenler için gerekli

2. **Redeploy:**
   - Environment variable ekledikten sonra redeploy edin
   - Vercel Dashboard → Deployments → "Redeploy"

## 📚 Kaynaklar

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)

## 🎯 Sonraki Adımlar

1. ✅ GitHub'a push edildi
2. ✅ Vercel'e deploy edildi
3. ✅ Production URL alındı
4. 📱 Base Developer Platform'da URL güncellendi
5. 🚀 Base App'te test edildi



