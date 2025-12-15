# AI Prompt ve Google Places API Bilgileri

## 1. AI Prompt Gönderimi

### Dosya: `app/hooks/usePlaceAnalysis.ts`

AI analizi için prompt gönderimi bu dosyada yapılıyor:

**Satır 228-247**: System prompt + few-shot örnekleri + user request formatı
```typescript
const input = [
  {
    role: "system",
    content: [
      { type: "input_text", text: systemPrompt || "Sen bir mekan analiz uzmanısın." }
    ]
  },
  ...FEW_SHOT_MESSAGES,  // few-shot örnekleri (satır 25-113)
  {
    role: "user",
    content: [
      ...imageInputs,  // Fotoğraflar (input_image type)
      {
        type: "input_text",
        text: `Tüm fotoğraflar "${place.name}" mekanına aittir. Kurallara birebir uyarak analiz et.`
      }
    ]
  }
];
```

**Satır 249-253**: OpenAI responses API formatına göre body
```typescript
const body = {
  model: "gpt-4o-2024-11-20",
  input,
};
```

**Satır 260**: AI proxy'ye gönderim
```typescript
const response = await aiChat(body, "responses");
```

**System Prompt Yükleme**: Satır 54-66
- System prompt `public/system prompt.txt` dosyasından yükleniyor
- Cache mekanizması var (bir kez yüklenir, sonra cache'den okunur)

**Few-shot Örnekleri**: Satır 25-113
- 3 örnek var (fewshot.js formatından)
- Her örnek: user (fotoğraflar + text) + assistant (JSON çıktı)

---

## 2. Google Places API Search Komutları

### Dosya: `app/api/proxy/google/route.ts`

#### A) Text Search (Yeni API - v1)

**Fonksiyon**: `textSearchNew` (Satır 32-138)

**Endpoint**: `https://places.googleapis.com/v1/places:searchText`

**Request Format**:
```typescript
const requestBody = {
  textQuery: q,  // Arama sorgusu (örn: "cafe")
  locationBias: {
    circle: {
      center: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
      radius: parseFloat(radius),  // Metre cinsinden (örn: 3000 = 3km)
    },
  },
  pageSize: 20,
  pageToken: pageToken,  // Sayfalama için (opsiyonel)
};
```

**Headers**:
```typescript
{
  "Content-Type": "application/json",
  "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
  "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.photos,places.websiteUri,places.priceLevel"
}
```

**Response Format**:
```typescript
{
  status: "OK" | "ZERO_RESULTS",
  results: [
    {
      place_id: string,
      name: string,
      formatted_address: string,
      geometry: { location: { lat, lng } },
      types: string[],
      rating: number,
      photos: [{ photo_reference: string, name: string }],
      website: string,
      price_level: number,
    }
  ],
  next_page_token: string | null,
}
```

#### B) Nearby Search (Yeni API - v1)

**Fonksiyon**: `nearbySearchNew` (Satır 141-238)

**Endpoint**: `https://places.googleapis.com/v1/places:searchNearby`

**Request Format**:
```typescript
const requestBody = {
  includedTypes: [type],  // Örn: ["cafe"]
  maxResultCount: 20,
  locationRestriction: {
    circle: {
      center: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      },
      radius: parseFloat(radius),
    },
  },
  pageToken: pageToken,
};
```

**Headers**: Text Search ile aynı

**Response Format**: Text Search ile aynı

---

### Dosya: `app/hooks/useMapPlaces.ts`

**Fonksiyon**: `loadPlaces` (Satır 87-298)

**Kullanım**:
```typescript
const response = await googleTextSearch({
  q: query,           // "cafe"
  lat: searchCenter.lat.toString(),
  lng: searchCenter.lng.toString(),
  radius: searchRadius.toString(),  // "3000" (3km)
  type: options.type,  // Opsiyonel
  pagetoken: nextPageToken,  // Sayfalama için
});
```

**Sayfalama**: 
- Maksimum 5 sayfa
- Her sayfa arasında 0.5 saniye bekleme (Google API token hazırlaması için)

**Mesafe Sıralaması**: 
- Satır 233-252: Sonuçlar mesafeye göre sıralanıyor (yakın olanlar önce)
- Haversine formülü kullanılıyor

---

## 3. Önemli Notlar

### Fotoğraf URL'leri
- Google Places API'den gelen fotoğraflar `photo_reference` veya `name` formatında
- Bunları URL'e çevirmek için: `/api/proxy/google?endpoint=photo&ref={photo_reference}&maxwidth=800`
- `useProxy.ts` dosyasında `googlePhoto()` fonksiyonu bu işi yapıyor

### Yakınlık Önceliği
- `locationBias` kullanılıyor (Text Search için)
- `locationRestriction` kullanılıyor (Nearby Search için)
- Sonuçlar mesafeye göre sıralanıyor (yakın olanlar önce)

### API Key
- Environment variable: `GOOGLE_PLACES_KEY`
- `.env.local` dosyasında tanımlı (local development)
- Vercel environment variables'da tanımlı (production)
