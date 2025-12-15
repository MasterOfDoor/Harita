# 🔐 Environment-Based Configuration

Bu dosya, local development ve production arasındaki farkları açıklar.

## 📋 Environment Detection

Uygulama otomatik olarak environment'ı algılar:

- **Development**: `NODE_ENV=development` (local'de `npm run dev`)
- **Production**: `NODE_ENV=production` (Vercel'de otomatik)

## 🔧 Local Development (.env.local)

Local test için `.env.local` dosyası kullanılır:

```env
# Local development API keys
GOOGLE_PLACES_KEY=your_local_key
GPT5_API_KEY=your_local_key
GEMINI_API_KEY=your_local_key
NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY=your_local_key
NEXT_PUBLIC_REVIEW_NFT_ADDRESS=your_local_contract_address
```

**Önemli:**
- `.env.local` dosyası **git'e commit edilmez** (`.gitignore`'da)
- Sadece local development için kullanılır
- Production'u etkilemez

## 🚀 Production (Vercel Environment Variables)

Production'da Vercel dashboard'dan environment variables ayarlanır:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Şu değişkenleri ekleyin:
   - `GOOGLE_PLACES_KEY`
   - `GPT5_API_KEY` veya `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_COINBASE_DEVELOPER_PLATFORM_API_KEY`
   - `NEXT_PUBLIC_REVIEW_NFT_ADDRESS`

**Önemli:**
- Production environment variables local'i etkilemez
- Her environment bağımsız çalışır

## 🔄 API Base URL

### Local Development
- Base URL: `/api/proxy` (relative path)
- Port otomatik algılanır:
  - Port 3000: `http://localhost:3000/api/proxy`
  - Port 3001: `http://localhost:3001/api/proxy` (port 3000 doluysa)
  - Port 3002: `http://localhost:3002/api/proxy` (port 3000 ve 3001 doluysa)
- Next.js otomatik olarak boş port bulur

### Production
- Base URL: `/api/proxy` (relative path)
- Full URL: `https://your-domain.vercel.app/api/proxy`
- Otomatik olarak production domain'e istek atar

**Önemli:**
- Relative path kullanıldığı için port değişikliği otomatik algılanır
- Local test production'ı etkilemez
- Her environment kendi domain ve port'unu kullanır

### Port Ayarlama

Eğer belirli bir port kullanmak isterseniz:

```bash
# Port 3001'de başlat
npm run dev:3001

# Veya manuel olarak
next dev -p 3001
```

## 🛡️ CORS Configuration

### Development
- `Access-Control-Allow-Origin: *` (tüm origin'lere izin)
- Local test için esnek

### Production
- `Access-Control-Allow-Origin: [your-domain]` (sadece kendi domain)
- Güvenlik için kısıtlı

## ✅ Test Checklist

### Local Test
- [ ] `.env.local` dosyası var ve dolu
- [ ] `npm run dev` çalışıyor
- [ ] `http://localhost:3000` açılıyor
- [ ] API route'ları çalışıyor (`/api/proxy/google`)
- [ ] Arama ve filtreleme çalışıyor

### Production Test
- [ ] Vercel'de environment variables ayarlı
- [ ] Production URL çalışıyor
- [ ] API route'ları çalışıyor
- [ ] Arama ve filtreleme çalışıyor
- [ ] Local test production'ı etkilemiyor

## 🐛 Troubleshooting

### Local'de API çalışmıyor
1. `.env.local` dosyasını kontrol edin
2. Development server'ı yeniden başlatın (`npm run dev`)
3. Browser cache'ini temizleyin

### Production'da API çalışmıyor
1. Vercel dashboard'da environment variables'ı kontrol edin
2. Production'ı yeniden deploy edin
3. Vercel logs'u kontrol edin

### Local test production'ı etkiliyor
- ❌ **Yanlış:** Absolute URL kullanmak (`http://localhost:3000/api/proxy`)
- ✅ **Doğru:** Relative URL kullanmak (`/api/proxy`)

## 📝 Notlar

1. **Environment variables sadece server-side'da kullanılır**
   - Client-side'da görünmez (güvenlik)
   - `NEXT_PUBLIC_*` prefix'li olanlar client-side'da görünür

2. **Local ve production bağımsızdır**
   - Local'deki değişiklikler production'u etkilemez
   - Production'daki değişiklikler local'i etkilemez

3. **API key'ler asla git'e commit edilmez**
   - `.env.local` → `.gitignore`'da
   - Production → Vercel environment variables
