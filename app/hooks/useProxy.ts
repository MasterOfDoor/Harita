"use client";

/**
 * Proxy API hook'u - Google Maps ve AI API'leri için
 * API key'ler server-side'da saklanır, client-side'da görünmez
 * 
 * Environment-based configuration:
 * - Local development: /api/proxy (relative path, otomatik port algılama)
 *   - Port 3000: http://localhost:3000/api/proxy
 *   - Port 3001: http://localhost:3001/api/proxy (port 3000 doluysa)
 * - Production: /api/proxy (relative path, production domain)
 * 
 * ÖNEMLİ: Relative path kullanıldığı için port değişikliği otomatik algılanır.
 * Local test production'ı etkilemez.
 */
export function useProxy() {
  // Environment-based base URL
  // Relative path kullan - otomatik olarak mevcut domain ve port'u kullanır
  // Local'de ve production'da aynı şekilde çalışır
  // Port değişikliği (3000 → 3001) otomatik algılanır
  const getProxyBase = () => {
    // Her zaman relative path kullan
    // Browser otomatik olarak mevcut domain ve port'u kullanır
    // Örnek: localhost:3001'de çalışıyorsa → localhost:3001/api/proxy
    // Örnek: production'da → production-domain/api/proxy
    return "/api/proxy";
  };

  const PROXY_BASE = getProxyBase();

  const googleTextSearch = async (params: {
    q: string;
    lat: string;
    lng: string;
    radius?: string;
    type?: string;
    pagetoken?: string;
  }) => {
    const searchParams = new URLSearchParams({
      endpoint: "textsearch",
      lat: params.lat,
      lng: params.lng,
      radius: params.radius || "3000",
    });
    if (params.q) searchParams.set("q", params.q);
    if (params.type) searchParams.set("type", params.type);
    if (params.pagetoken) searchParams.set("pagetoken", params.pagetoken);

    const response = await fetch(`${PROXY_BASE}/google?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Google search failed: ${response.statusText}`);
    }
    return response.json();
  };

  const googlePlaceDetails = async (placeId: string) => {
    const searchParams = new URLSearchParams({
      endpoint: "details",
      place_id: placeId,
    });

    const response = await fetch(`${PROXY_BASE}/google?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Google details failed: ${response.statusText}`);
    }
    return response.json();
  };

  const googlePhoto = (ref: string, maxwidth: string = "800") => {
    const searchParams = new URLSearchParams({
      endpoint: "photo",
      ref,
      maxwidth,
    });
    return `${PROXY_BASE}/google?${searchParams.toString()}`;
  };

  const fetchContent = async (url: string) => {
    const searchParams = new URLSearchParams({
      url,
    });

    const response = await fetch(`${PROXY_BASE}/fetch-content?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Content fetch failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data?.content || "";
  };

  const aiChat = async (body: any, provider: "openai" | "gemini" | "responses" = "openai") => {
    const searchParams = new URLSearchParams({
      provider,
    });

    const bodySize = JSON.stringify(body).length;
    console.log("[aiChat] İstek gönderiliyor, provider:", provider, "boyut:", Math.round(bodySize / 1024), "KB");

    const response = await fetch(`${PROXY_BASE}/ai?${searchParams.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("[aiChat] Yanıt alındı, status:", response.status, response.ok ? "✅" : "❌");

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[aiChat] Hata detayı:", errorText);
      throw new Error(`AI chat failed: ${response.statusText}`);
    }
    return response.json();
  };

  return {
    googleTextSearch,
    googlePlaceDetails,
    googlePhoto,
    aiChat,
    fetchContent,
  };
}

