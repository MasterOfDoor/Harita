# 🎨 Logo Dosyası Notları

## Mevcut Logo

Projede şu an `public/logo.svg` dosyası bulunmaktadır. Bu basit bir placeholder logo'dur.

## Kendi Logonuzu Eklemek

Base Mini App için logo gereksinimleri:

- **Format:** PNG veya SVG
- **Boyut:** 512x512 piksel (minimum)
- **Önerilen:** 1024x1024 piksel
- **Arka plan:** Şeffaf veya solid renk

### Logo Değiştirme Adımları

1. **Logo Dosyasını Hazırlayın:**
   - 512x512 veya 1024x1024 piksel boyutunda
   - PNG veya SVG formatında
   - Şeffaf arka plan önerilir

2. **Dosyayı Kopyalayın:**
   ```bash
   # PNG kullanıyorsanız
   cp your-logo.png public/logo.png
   
   # SVG kullanıyorsanız
   cp your-logo.svg public/logo.svg
   ```

3. **Dosya Adını Güncelleyin:**
   - Eğer `logo.png` kullanıyorsanız, `app/components/MiniKitProvider.tsx` dosyasında:
     ```tsx
     appLogoUrl: `${window.location.origin}/logo.png`
     ```
   - `public/manifest.json` dosyasında:
     ```json
     "src": "/logo.png",
     "type": "image/png"
     ```
   - `app/layout.tsx` dosyasında:
     ```tsx
     <link rel="apple-touch-icon" href="/logo.png" />
     ```

## Logo Optimizasyonu

Logo dosyanızı optimize etmek için:

- **PNG için:** [TinyPNG](https://tinypng.com/) veya [Squoosh](https://squoosh.app/)
- **SVG için:** [SVGOMG](https://jakearchibald.github.io/svgomg/)

## Base Mini App Logo Gereksinimleri

Base Mini App'lerde logo şu yerlerde kullanılır:

1. **Base App içinde:** Mini App listesinde görüntülenir
2. **Wallet bağlantısı:** Coinbase Wallet bağlantısında gösterilir
3. **Manifest:** PWA manifest dosyasında kullanılır
4. **Apple Touch Icon:** iOS cihazlarda home screen'e eklenirken kullanılır

## Not

Şu an projede `logo.svg` kullanılıyor. Kendi logonuzu ekledikten sonra yukarıdaki dosyalarda gerekli güncellemeleri yapın.



