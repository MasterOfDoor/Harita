"use client";

import { useState, useCallback } from "react";
import { useMapPlaces } from "./useMapPlaces";

export function useMapSearch() {
  const { loadPlaces } = useMapPlaces();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"map" | "event">("map");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openSearch = useCallback((mode: "map" | "event" = "map") => {
    setSearchMode(mode);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  const performSearch = useCallback(
    async (query: string, options?: {
      lat?: number;
      lng?: number;
      radius?: number;
    }) => {
      if (!query.trim()) return [];

      setSearchQuery(query);
      setLoading(true);
      setError(null);
      
      try {
        // Eğer options verilmediyse, harita merkezinden veya kullanıcı konumundan al
        let searchOptions = options;
        
        if (!searchOptions) {
          // Önce kullanıcı konumunu al (MapComponent'ten - GPS'ten alınan)
          let searchCenter = null;
          if (typeof window !== "undefined" && (window as any).getUserLocation) {
            searchCenter = (window as any).getUserLocation();
            console.log("[performSearch] getUserLocation'dan alındı:", searchCenter);
          }
          
          // Eğer kullanıcı konumu yoksa, harita merkezini al
          if (!searchCenter && typeof window !== "undefined" && (window as any).getMapCenter) {
            searchCenter = (window as any).getMapCenter();
            console.log("[performSearch] getMapCenter'dan alındı:", searchCenter);
          }
          
          // Eğer hala yoksa, geolocation API'den al
          if (!searchCenter && navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                    maximumAge: 60000, // 1 dakika cache
                  });
                }
              );
              searchCenter = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              console.log("[performSearch] Geolocation API'den alındı:", searchCenter);
            } catch (err) {
              console.warn("[performSearch] Konum alınamadı:", err);
            }
          }
          
          // Son çare: İstanbul merkez
          if (!searchCenter) {
            searchCenter = { lat: 41.015137, lng: 28.97953 };
            console.warn("[performSearch] Varsayılan İstanbul merkezi kullanılıyor:", searchCenter);
          }
          
          searchOptions = {
            lat: searchCenter.lat,
            lng: searchCenter.lng,
            radius: 3000, // 3km yarıçap (yakın sonuçlar için)
          };
          
          console.log("[performSearch] Arama merkezi (final):", searchOptions);
        }

        const results = await loadPlaces(query, searchOptions);
        closeSearch();
        return results;
      } catch (err: any) {
        setError(err.message || "Arama başarısız");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [loadPlaces, closeSearch]
  );

  return {
    searchQuery,
    isSearchOpen,
    searchMode,
    openSearch,
    closeSearch,
    performSearch,
    loading,
    error,
  };
}




