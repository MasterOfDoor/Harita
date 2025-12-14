"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useMapPlaces } from "./hooks/useMapPlaces";
import { useMapSearch } from "./hooks/useMapSearch";
import { useMapFilters } from "./hooks/useMapFilters";
import { usePlaceAnalysis } from "./hooks/usePlaceAnalysis";
import { Place } from "./components/DetailPanel";
import { buildQueryFromFilters } from "./utils/filterHelpers";
import TopBar from "./components/TopBar";
import SearchOverlay from "./components/SearchOverlay";
import ResultsPanel from "./components/ResultsPanel";
import DetailPanel from "./components/DetailPanel";
import FilterPanel, { FilterState } from "./components/FilterPanel";
import ProfilePanel from "./components/ProfilePanel";
import WalletConnectModal from "./components/WalletConnectModal";

// Leaflet haritasını dinamik olarak yükle (SSR sorunlarını önlemek için)
const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isMounted, setIsMounted] = useState(false);

  // Client-side hydration için
  useEffect(() => {
    setIsMounted(true);
    
    // Base Mini App ready callback
    if (typeof window !== "undefined") {
      // Base Mini App SDK ready callback
      if ((window as any).miniKit) {
        (window as any).miniKit.ready?.();
      }
      
      // Alternative: Coinbase SDK ready callback
      if ((window as any).coinbaseSDK) {
        (window as any).coinbaseSDK.ready?.();
      }
      
      // Fallback: Dispatch ready event
      window.dispatchEvent(new Event("minikit:ready"));
    }
  }, []);

  // Provider kontrolü ve Base chain'e geçiş
  useEffect(() => {
    if (!isConnected || !isMounted) return;

    // Provider bilgilerini kontrol et
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      console.log("[Provider Check] Current provider:", {
        isMetaMask: ethereum.isMetaMask,
        isCoinbaseWallet: ethereum.isCoinbaseWallet,
        isCoinbaseBrowser: ethereum.isCoinbaseBrowser,
        chainId: chainId,
      });
    }

    // Base Sepolia chain ID: 84532 (0x14a34)
    const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id; // 84532
    const BASE_SEPOLIA_CHAIN_ID_HEX = `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`; // 0x14a34

    console.log(`[Chain Switch] Target: Base Sepolia (${BASE_SEPOLIA_CHAIN_ID} / ${BASE_SEPOLIA_CHAIN_ID_HEX})`);

    // Eğer Base Sepolia chain'de değilsek, switch et
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      console.log(`[Chain Switch] Current chain: ${chainId} (0x${chainId.toString(16)}), switching to Base Sepolia: ${BASE_SEPOLIA_CHAIN_ID} (${BASE_SEPOLIA_CHAIN_ID_HEX})`);
      
      // Base Sepolia chain'e geçiş yap
      const switchToBaseSepolia = async () => {
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          console.error("[Chain Switch] Ethereum provider not found");
          return;
        }

        try {
          // Önce switch denemesi yap
          await switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
          console.log("[Chain Switch] Successfully switched to Base Sepolia");
        } catch (error: any) {
          console.log("[Chain Switch] Switch failed, error:", error);
          
          // Eğer chain tanınmıyorsa, ekle
          if (error?.code === 4902 || error?.message?.includes("Unrecognized chain") || error?.message?.includes("not found")) {
            console.log("[Chain Switch] Base Sepolia chain not found, adding chain...");
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
                    chainName: "Base Sepolia",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia.base.org"],
                    blockExplorerUrls: ["https://sepolia.basescan.org"],
                  },
                ],
              });
              console.log("[Chain Switch] Base Sepolia chain added successfully");
              
              // Chain eklendikten sonra tekrar switch et
              try {
                await switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
                console.log("[Chain Switch] Successfully switched to Base Sepolia after adding");
              } catch (switchError) {
                console.error("[Chain Switch] Error switching after adding chain:", switchError);
              }
            } catch (addError: any) {
              console.error("[Chain Switch] Error adding Base Sepolia chain:", addError);
            }
          } else {
            console.error("[Chain Switch] Error switching to Base Sepolia:", error);
          }
        }
      };

      switchToBaseSepolia();
    } else {
      console.log(`[Chain Switch] Already on Base Sepolia chain: ${chainId}`);
    }
  }, [isConnected, isMounted, chainId, switchChain]);

  // chainChanged listener'ını ekle (MetaMask loglarını önlemek için)
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    // Base Mini App ortamında mıyız kontrol et
    const isBaseMiniApp = 
      (window as any).miniKit || 
      (window as any).coinbaseSDK ||
      window.location.href.includes("base.org") ||
      window.location.href.includes("coinbase.com");

    // Base Mini App'te MetaMask chainChanged event'lerini ignore et
    const handleChainChanged = (chainId: string | number) => {
      const chainIdNum = typeof chainId === "string" ? parseInt(chainId, 16) : chainId;
      const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id; // 84532

      // Eğer Base Mini App'teysek ve MetaMask provider'ı kullanılıyorsa
      if (isBaseMiniApp && ethereum.isMetaMask && !ethereum.isCoinbaseWallet) {
        console.log(`[Chain Changed] MetaMask chain changed to ${chainIdNum} in Base Mini App - ignoring`);
        // Base Sepolia chain'e geri geç
        if (chainIdNum !== BASE_SEPOLIA_CHAIN_ID) {
          try {
            switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
          } catch (err: any) {
            console.error("[Chain Changed] Error switching back to Base Sepolia:", err);
          }
        }
        return;
      }

      // Normal chain changed handling (Base Wallet için)
      console.log(`[Chain Changed] Chain changed to: ${chainIdNum} (0x${chainIdNum.toString(16)})`);
    };

    // Listener'ı ekle
    ethereum.on?.("chainChanged", handleChainChanged);

    // Cleanup: Listener'ı kaldır
    return () => {
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [isMounted, switchChain]);
  const { places, loading: placesLoading, loadPlaces, setPlaces } = useMapPlaces();
  const {
    isSearchOpen,
    searchMode,
    openSearch,
    closeSearch,
    performSearch,
  } = useMapSearch();
  const { filterPlaces, applyFilters, resetFilters } = useMapFilters();
  const { analyzePlaces } = usePlaceAnalysis();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    main: [],
    sub: {},
  });
  // Filter places based on current filters
  const filteredPlaces = useMemo(() => {
    return filterPlaces(places || [], currentFilters);
  }, [places, currentFilters, filterPlaces]);

  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    setIsDetailOpen(true);
    setIsResultsOpen(false);
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      console.log("[handleSearch] Arama başlatılıyor:", query);
      const results = await performSearch(query);
      console.log("[handleSearch] Sonuç sayısı:", results.length);
      
      // Reset filters when new search is performed
      setCurrentFilters({ main: [], sub: {} });
      resetFilters();
      
      if (results.length > 0) {
        setIsResultsOpen(true);
        
        // AI analizi yap
        console.log("[handleSearch] AI analizi başlatılıyor...");
        try {
          const analysisResults = await analyzePlaces(results);
          console.log("[handleSearch] AI analizi tamamlandı, sonuç:", analysisResults.size);
          
          // Sonuçları zenginleştir
          const enrichedResults = results.map((place) => {
            const analysis = analysisResults.get(place.id);
            if (analysis) {
              console.log("[handleSearch] Zenginleştirildi:", place.name, "Labels:", analysis.labels);
              return {
                ...place,
                tags: [...(place.tags || []), ...analysis.tags],
                features: [...(place.features || []), ...analysis.features],
                labels: analysis.labels,
              };
            }
            return place;
          });
          
          setPlaces(enrichedResults);
        } catch (error) {
          console.error("[handleSearch] AI analizi hatası:", error);
          // Hata durumunda orijinal sonuçları göster
          setPlaces(results);
        }
      }
    },
    [performSearch, resetFilters, analyzePlaces, setPlaces]
  );

  const handleApplyFilters = useCallback(
    async (filters: FilterState) => {
      // Kategori kontrolü
      const kategoriFilters = filters.sub.Kategori || [];
      if (kategoriFilters.length === 0) {
        alert("En az bir kategori seçmelisiniz.");
        return;
      }

      // Kullanıcı konumunu al
      let userLocation = { lat: 41.015137, lng: 28.97953 }; // Varsayılan İstanbul
      if ((window as any).getUserLocation) {
        const loc = (window as any).getUserLocation();
        if (loc) {
          userLocation = loc;
        }
      } else if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
              });
            }
          );
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (err) {
          console.warn("Konum alınamadı, varsayılan konum kullanılıyor:", err);
        }
      }

      // Kategori filtrelerini al
      const kategoriOptions = filters.sub.Kategori || [];
      if (kategoriOptions.length === 0) {
        alert("En az bir kategori seçmelisiniz.");
        return;
      }

      setIsFilterOpen(false);
      setCurrentFilters(filters);
      applyFilters(filters);

      try {
        // 1. Her kategori için ayrı ayrı arama yap ve sonuçları birleştir
        const allResults: Place[] = [];
        const seenIds = new Set<string>();

        for (const kategori of kategoriOptions) {
          let categoryQuery = "";
          let categoryType = "";
          
          if (kategori === "Kafe") {
            categoryQuery = "cafe";
            categoryType = "cafe";
          } else if (kategori === "Restoran") {
            categoryQuery = "restaurant";
            categoryType = "restaurant";
          } else if (kategori === "Bar") {
            categoryQuery = "bar";
            categoryType = "bar";
          } else {
            categoryQuery = kategori.toLowerCase();
            categoryType = kategori.toLowerCase();
          }

          const categoryResults = await loadPlaces(categoryQuery, {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 3000, // 3km
            type: categoryType, // Yeni API için type parametresi
          });

          // Duplicate'leri filtrele ve ekle
          categoryResults.forEach((place) => {
            if (!seenIds.has(place.id)) {
              seenIds.add(place.id);
              allResults.push(place);
            }
          });
        }

        const results = allResults;

        // 2. Diğer filtreler var mı kontrol et (Kategori dışında)
        const otherFilters = Object.keys(filters.sub).filter(
          (key) => key !== "Kategori" && filters.sub[key].length > 0
        );

        // AI analizi her zaman yap (sadece kategori seçilse bile)
        if (results.length > 0) {
          console.log("[handleApplyFilters] AI analizi başlatılıyor...", results.length, "mekan için");
          const analysisResults = await analyzePlaces(results);
          console.log("[handleApplyFilters] AI analizi tamamlandı, sonuç:", analysisResults.size);

          // AI sonuçlarını places'lere uygula
          const enrichedResults = results.map((place) => {
            const analysis = analysisResults.get(place.id);
            if (analysis) {
              console.log("[handleApplyFilters] Mekan zenginleştirildi:", place.name, "Labels:", analysis.labels);
              return {
                ...place,
                tags: [...(place.tags || []), ...analysis.tags],
                features: [...(place.features || []), ...analysis.features],
                labels: analysis.labels,
              };
            }
            return place;
          });

          // Diğer filtreler varsa AI analizi sonrası filtreleme yap
          if (otherFilters.length > 0) {
            const filteredAfterAnalysis = filterPlaces(enrichedResults, filters);
            setPlaces(filteredAfterAnalysis);
            
            if (filteredAfterAnalysis.length > 0) {
              setIsResultsOpen(true);
            } else {
              alert("Seçtiğiniz filtrelerle eşleşen mekan bulunamadı.");
            }
          } else {
            // Sadece kategori filtresi var, tüm sonuçları göster
            setPlaces(enrichedResults);
            setIsResultsOpen(true);
          }
        }
      } catch (error: any) {
        console.error("Filtre uygulama hatası:", error);
        alert("Filtre uygulanırken bir hata oluştu: " + error.message);
      }
    },
    [loadPlaces, analyzePlaces, applyFilters]
  );

  const handleResetFilters = useCallback(() => {
    setCurrentFilters({ main: [], sub: {} });
    resetFilters();
  }, [resetFilters]);

  // Wallet bağlı değilse uygulamayı gösterme, wallet connect modal göster
  if (!isMounted) {
    return null; // SSR için
  }

  if (!isConnected) {
    return (
      <main className="relative w-full h-screen overflow-hidden">
        <WalletConnectModal isOpen={true} onClose={() => {}} />
      </main>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Wallet bağlı - uygulama gösteriliyor */}
      {address && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm">
          Wallet: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}

      <TopBar
        onMenuToggle={() => setIsFilterOpen(!isFilterOpen)}
        onSearchClick={() => openSearch("map")}
        onLocationClick={() => {
          if ((window as any).handleMapLocation) {
            (window as any).handleMapLocation();
          }
        }}
        onProfileClick={() => setIsProfileOpen(true)}
        onEventsClick={() => openSearch("event")}
      />

      <MapComponent
        places={filteredPlaces}
        selectedPlace={selectedPlace}
        onPlaceClick={handlePlaceClick}
        onLocationClick={() => {
          if ((window as any).handleMapLocation) {
            (window as any).handleMapLocation();
          }
        }}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSearch={handleSearch}
        searchMode={searchMode}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      <ResultsPanel
        isOpen={isResultsOpen}
        places={filteredPlaces}
        onClose={() => setIsResultsOpen(false)}
        onPlaceClick={handlePlaceClick}
      />

      <DetailPanel
        isOpen={isDetailOpen}
        place={selectedPlace}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPlace(null);
        }}
      />

      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </main>
  );
}

