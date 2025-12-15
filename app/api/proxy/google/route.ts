import { NextRequest, NextResponse } from "next/server";

// Environment-based API key loading
// Local'de .env.local, production'da Vercel environment variables
const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_KEY || "";

// Environment detection
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// CORS headers - environment-aware
function setCorsHeaders(response: NextResponse) {
  // Local development için daha esnek CORS
  if (isDevelopment) {
    response.headers.set("Access-Control-Allow-Origin", "*");
  } else {
    // Production'da sadece kendi domain'den gelen isteklere izin ver
    const origin = process.env.NEXT_PUBLIC_APP_URL || "*";
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Goog-Api-Key, X-Goog-FieldMask");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// Google Places API (New) - Text Search
async function textSearchNew(q: string, lat: string, lng: string, radius: string, pageToken?: string) {
  // API key validation
  if (!GOOGLE_PLACES_KEY || GOOGLE_PLACES_KEY.trim() === "") {
    throw new Error("GOOGLE_PLACES_KEY is not configured");
  }

  const requestBody: any = {
    textQuery: q,
    locationBias: {
      circle: {
        center: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        radius: parseFloat(radius),
      },
    },
    pageSize: 20,
  };

  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.photos,places.websiteUri,places.priceLevel",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData: any;
      let errorText: string = "";
      
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: response.statusText || "Unknown error" } };
      }
      
      const errorMessage = errorData.error?.message || errorData.message || `Text Search failed: ${response.status} ${response.statusText}`;
      
      console.error("[Google API] Text Search error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        errorText: errorText.substring(0, 500), // İlk 500 karakter
        apiKeyPrefix: GOOGLE_PLACES_KEY?.slice(0, 10) || "none",
        requestBody: { textQuery: q, locationBias: requestBody.locationBias },
      });
      
      // Google API hatalarını daha anlaşılır hale getir
      if (response.status === 403) {
        throw new Error("Google Places API key is invalid or API is not enabled. Check Google Cloud Console.");
      } else if (response.status === 400) {
        throw new Error(`Invalid request: ${errorMessage}`);
      } else if (response.status === 429) {
        throw new Error("Google Places API quota exceeded. Please try again later.");
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Network errors veya diğer hatalar
    if (error.message.includes("fetch")) {
      console.error("[Google API] Network error:", error);
      throw new Error("Failed to connect to Google Places API. Check your internet connection.");
    }
    throw error;
  }

  const data = await response.json();
  
  // Yeni API formatını eski formata çevir (backward compatibility)
  return {
    status: data.places?.length > 0 ? "OK" : "ZERO_RESULTS",
    results: (data.places || []).map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || "",
      formatted_address: place.formattedAddress || "",
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
      },
      types: place.types || [],
      rating: place.rating || null,
      user_ratings_total: place.userRatingCount || 0,
      photos: (place.photos || []).map((photo: any) => ({
        photo_reference: photo.name, // Yeni API'de name kullanılıyor
        name: photo.name,
        width: photo.widthPx,
        height: photo.heightPx,
      })),
      website: place.websiteUri || "",
      price_level: place.priceLevel ? ["FREE", "INEXPENSIVE", "MODERATE", "EXPENSIVE", "VERY_EXPENSIVE"].indexOf(place.priceLevel) : null,
    })),
    next_page_token: data.nextPageToken || null,
  };
}

// Google Places API (New) - Nearby Search
async function nearbySearchNew(type: string, lat: string, lng: string, radius: string, pageToken?: string) {
  // API key validation
  if (!GOOGLE_PLACES_KEY || GOOGLE_PLACES_KEY.trim() === "") {
    throw new Error("GOOGLE_PLACES_KEY is not configured");
  }
  const requestBody: any = {
    includedTypes: [type],
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
  };

  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.photos,places.websiteUri,places.priceLevel",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData: any;
      let errorText: string = "";
      
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: response.statusText || "Unknown error" } };
      }
      
      const errorMessage = errorData.error?.message || errorData.message || `Nearby Search failed: ${response.status} ${response.statusText}`;
      
      console.error("[Google API] Nearby Search error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        errorText: errorText.substring(0, 500),
        apiKeyPrefix: GOOGLE_PLACES_KEY?.slice(0, 10) || "none",
      });
      
      if (response.status === 403) {
        throw new Error("Google Places API key is invalid or API is not enabled. Check Google Cloud Console.");
      } else if (response.status === 400) {
        throw new Error(`Invalid request: ${errorMessage}`);
      } else if (response.status === 429) {
        throw new Error("Google Places API quota exceeded. Please try again later.");
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.message.includes("fetch")) {
      console.error("[Google API] Network error:", error);
      throw new Error("Failed to connect to Google Places API. Check your internet connection.");
    }
    throw error;
  }

  const data = await response.json();
  
  // Yeni API formatını eski formata çevir (backward compatibility)
  return {
    status: data.places?.length > 0 ? "OK" : "ZERO_RESULTS",
    results: (data.places || []).map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || "",
      formatted_address: place.formattedAddress || "",
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
      },
      types: place.types || [],
      rating: place.rating || null,
      user_ratings_total: place.userRatingCount || 0,
      photos: (place.photos || []).map((photo: any) => ({
        photo_reference: photo.name, // Yeni API'de name kullanılıyor
        name: photo.name,
        width: photo.widthPx,
        height: photo.heightPx,
      })),
      website: place.websiteUri || "",
      price_level: place.priceLevel ? ["FREE", "INEXPENSIVE", "MODERATE", "EXPENSIVE", "VERY_EXPENSIVE"].indexOf(place.priceLevel) : null,
    })),
    next_page_token: data.nextPageToken || null,
  };
}

export async function GET(request: NextRequest) {
  // Request logging (development only)
  if (isDevelopment) {
    console.log("[Google API] Request received:", {
      url: request.url,
      method: request.method,
      hasApiKey: !!GOOGLE_PLACES_KEY,
      apiKeyPrefix: GOOGLE_PLACES_KEY?.slice(0, 10) || "none",
      nodeEnv: process.env.NODE_ENV,
    });
  }

  // Early validation - API key kontrolü
  if (!GOOGLE_PLACES_KEY) {
    const errorMessage = isDevelopment
      ? "GOOGLE_PLACES_KEY environment variable is missing. Check .env.local file and restart server."
      : "Google Places API key is not configured.";
    
    console.error(`[Google API] ${errorMessage}`, {
      environment: process.env.NODE_ENV,
      hasKey: !!GOOGLE_PLACES_KEY,
      envKeys: Object.keys(process.env).filter(k => k.includes("GOOGLE") || k.includes("PLACES")),
    });
    
    return setCorsHeaders(
      NextResponse.json(
        { 
          error: "missing_google_key",
          message: errorMessage,
          hint: isDevelopment ? "Make sure .env.local exists and contains GOOGLE_PLACES_KEY. Then restart the dev server." : undefined
        },
        { status: 500 }
      )
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get("endpoint");
  
  // Endpoint validation
  if (!endpoint) {
    return setCorsHeaders(
      NextResponse.json(
        { error: "missing_endpoint", message: "endpoint parameter is required" },
        { status: 400 }
      )
    );
  }

  try {
    if (endpoint === "textsearch") {
      const q = searchParams.get("q") || "";
      const lat = searchParams.get("lat");
      const lng = searchParams.get("lng");
      const radius = searchParams.get("radius") || "3000";
      const type = searchParams.get("type") || "";
      const nextPageToken = searchParams.get("pagetoken") || "";

      if (!lat || !lng) {
        return setCorsHeaders(NextResponse.json(
          { error: "missing_coords" },
          { status: 400 }
        ));
      }

      // Tek kelimelik query ve type varsa -> Nearby Search (New)
      const queryWords = q.trim().split(/\s+/).filter(Boolean);
      const isSingleWord = queryWords.length === 1;
      
      if (isDevelopment) {
        console.log("[Google API] Text search params:", {
          q,
          lat,
          lng,
          radius,
          type,
          isSingleWord,
          hasPageToken: !!nextPageToken,
        });
      }
      
      if (isSingleWord && type) {
        if (isDevelopment) {
          console.log("[Google API] Using Nearby Search (New API)");
        }
        const data = await nearbySearchNew(type, lat, lng, radius, nextPageToken || undefined);
        return setCorsHeaders(NextResponse.json(data));
      }

      // Query yoksa ve type varsa -> Nearby Search (New)
      if (!q.trim() && type) {
        const data = await nearbySearchNew(type, lat, lng, radius, nextPageToken || undefined);
        return setCorsHeaders(NextResponse.json(data));
      }

      // Query varsa -> Text Search (New)
      if (!q.trim()) {
        return setCorsHeaders(NextResponse.json(
          { error: "missing_query" },
          { status: 400 }
        ));
      }

      if (isDevelopment) {
        console.log("[Google API] Using Text Search (New API)");
      }
      const data = await textSearchNew(q, lat, lng, radius, nextPageToken || undefined);
      return setCorsHeaders(NextResponse.json(data));
    } else if (endpoint === "details") {
      const placeId = searchParams.get("place_id");
      if (!placeId) {
        return setCorsHeaders(NextResponse.json({ error: "missing_place_id" }, { status: 400 }));
      }

      // Place Details (New) - GET request
      // Place ID formatını düzelt: Eğer zaten "places/" ile başlıyorsa olduğu gibi kullan
      // Eğer "ChIJ" ile başlıyorsa (eski format) "places/" ekle
      // Eğer başka bir format ise kontrol et
      let normalizedId = placeId;
      if (!normalizedId.startsWith("places/")) {
        // Eğer "ChIJ" ile başlıyorsa (eski Google Places ID formatı)
        if (normalizedId.startsWith("ChIJ")) {
          normalizedId = `places/${normalizedId}`;
        } else {
          // Diğer durumlarda da "places/" ekle
          normalizedId = `places/${normalizedId}`;
        }
      }
      
      const fieldMask = "id,displayName,formattedAddress,formattedPhoneNumber,websiteUri,regularOpeningHours,photos,location,types,rating,userRatingCount,reviews";
      const url = `https://places.googleapis.com/v1/${normalizedId}`;
      
      console.log("[Google Details] Request:", {
        placeId,
        normalizedId,
        url: url.substring(0, 100) + "...",
      });
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
          "X-Goog-FieldMask": fieldMask,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        console.error("[Google Details] Error:", {
          status: response.status,
          error: error.error || error,
          placeId,
          normalizedId,
        });
        return setCorsHeaders(NextResponse.json(
          { error: error.error?.message || error.message || "Place details failed" },
          { status: response.status }
        ));
      }

      const data = await response.json();
      
      // Yeni API formatını eski formata çevir (backward compatibility)
      const result = {
        result: {
          place_id: data.id,
          name: data.displayName?.text || "",
          formatted_address: data.formattedAddress || "",
          formatted_phone_number: data.formattedPhoneNumber || "",
          website: data.websiteUri || "",
          opening_hours: data.regularOpeningHours ? {
            weekday_text: data.regularOpeningHours.weekdayDescriptions || [],
          } : null,
          photos: (data.photos || []).map((photo: any) => ({
            photo_reference: photo.name, // Yeni API'de name kullanılıyor
            name: photo.name,
            width: photo.widthPx,
            height: photo.heightPx,
          })),
          geometry: {
            location: {
              lat: data.location?.latitude || 0,
              lng: data.location?.longitude || 0,
            },
          },
          types: data.types || [],
          rating: data.rating || null,
          user_ratings_total: data.userRatingCount || 0,
          reviews: (data.reviews || []).map((review: any) => ({
            author_name: review.authorAttribution?.displayName || "Ziyaretçi",
            text: review.text?.text || "",
            rating: review.rating || null,
            relative_time_description: review.publishTime || "",
          })),
        },
      };

      return setCorsHeaders(NextResponse.json(result));
    } else if (endpoint === "photo") {
      const ref = searchParams.get("ref");
      const maxwidth = searchParams.get("maxwidth") || "800";
      if (!ref) {
        return setCorsHeaders(NextResponse.json(
          { error: "missing_photo_reference" },
          { status: 400 }
        ));
      }

      // Place Photos (New) - photo name format: places/PLACE_ID/photos/PHOTO_RESOURCE
      // Yeni API'den gelen photo.name direkt kullanılabilir
      // Query param olarak geldiği için önce decode et (aksi halde '%2F' içeren path bozulur)
      const decoded = decodeURIComponent(ref);
      const photoName = decoded.startsWith("places/") ? decoded : decoded;
      
      const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxwidth}&key=${GOOGLE_PLACES_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return NextResponse.json(
          { error: "google_photo_failed" },
          { status: response.status }
        );
      }

      // Fotoğrafı proxy üzerinden döndür
      const imageBuffer = await response.arrayBuffer();
      const photoResponse = new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        },
      });
      return setCorsHeaders(photoResponse);
    }

    return setCorsHeaders(NextResponse.json({ error: "invalid_endpoint" }, { status: 400 }));
  } catch (error: any) {
    // Detaylı error logging
    const errorDetails = {
      message: error?.message || "Unknown error",
      stack: error?.stack?.split("\n").slice(0, 5).join("\n"), // İlk 5 satır
      endpoint,
      environment: process.env.NODE_ENV,
      hasApiKey: !!GOOGLE_PLACES_KEY,
      apiKeyLength: GOOGLE_PLACES_KEY?.length || 0,
      apiKeyPrefix: GOOGLE_PLACES_KEY?.slice(0, 10) || "none",
    };
    
    console.error("[Google API] Proxy error:", errorDetails);
    console.error("[Google API] Full error:", error);
    
    // Hata tipine göre status code belirle
    let statusCode = 502;
    let errorMessage = "Google Places API request failed";
    
    if (error?.message?.includes("not configured") || error?.message?.includes("GOOGLE_PLACES_KEY")) {
      statusCode = 500;
      errorMessage = isDevelopment
        ? "GOOGLE_PLACES_KEY environment variable is missing. Check .env.local file and restart server."
        : "Google Places API key is not configured.";
    } else if (error?.message?.includes("invalid") || error?.message?.includes("403")) {
      statusCode = 403;
      errorMessage = "Google Places API key is invalid or API is not enabled.";
    } else if (error?.message?.includes("quota") || error?.message?.includes("429")) {
      statusCode = 429;
      errorMessage = "Google Places API quota exceeded. Please try again later.";
    } else if (error?.message?.includes("Network") || error?.message?.includes("fetch")) {
      statusCode = 503;
      errorMessage = "Failed to connect to Google Places API. Please try again later.";
    } else if (isDevelopment) {
      errorMessage = `API route error: ${error?.message || "Unknown error"}. Check server logs.`;
    }
    
    return setCorsHeaders(
      NextResponse.json(
        { 
          error: "proxy_failed",
          message: errorMessage,
          detail: isDevelopment ? error?.message : undefined,
          status: statusCode,
        },
        { status: statusCode }
      )
    );
  }
}
