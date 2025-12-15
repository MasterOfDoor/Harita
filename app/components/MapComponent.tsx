"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { Place } from "./DetailPanel";

export interface MapComponentRef {
  getMap: () => L.Map | null;
  addMarker: (coords: [number, number], popup: string) => L.Marker;
  clearMarkers: () => void;
  setView: (coords: [number, number], zoom?: number) => void;
  fitBounds: (coords: [number, number][]) => void;
}

interface MapComponentProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceClick: (place: Place) => void;
  onLocationClick?: () => void;
}

function MapComponent({
  places,
  selectedPlace,
  onPlaceClick,
  onLocationClick,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Fix Leaflet default icon issue
  useEffect(() => {
    // Fix for Leaflet default icon in Next.js
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([41.0082, 28.9784], 13); // İstanbul

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;
    
    // Map instance'ını window'a expose et (ResultsPanel'den erişim için)
    if (typeof window !== "undefined") {
      (window as any).mapInstance = map;
    }

    // Get user location - map hazır olduktan sonra
    if (navigator.geolocation) {
      // Map'in tamamen yüklenmesini bekle
      map.whenReady(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 15);
            }
          },
          (error) => {
            console.warn("Geolocation error:", error);
          }
        );
      });
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      // Window'dan da temizle
      if (typeof window !== "undefined") {
        delete (window as any).mapInstance;
      }
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each place
    if (!places || !Array.isArray(places)) return;
    
    places.forEach((place) => {
      if (!place.coords || place.coords.length !== 2) return;

      // Create marker with explicit icon
      const marker = L.marker([place.coords[0], place.coords[1]], {
        icon: L.icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).addTo(mapInstanceRef.current!);

      const popupContent = `
        <div style="min-width: 150px;">
          <strong>${place.name}</strong><br/>
          <span style="color: #666; font-size: 0.9em;">${place.type}</span>
          ${place.rating ? `<br/>⭐ ${place.rating}` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        onPlaceClick(place);
        // Google Maps gibi zoom yap
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([place.coords[0], place.coords[1]], 16, {
            animate: true,
            duration: 0.5,
          });
          // Marker'ı highlight et
          marker.openPopup();
        }
      });

      markersRef.current.push(marker);
    });

    // Google Maps gibi: Yeni sonuçlar geldiğinde tüm marker'ları göster (fitBounds)
    // Ama sadece birden fazla marker varsa ve kullanıcı zoom yapmamışsa
    if (places.length > 0 && mapInstanceRef.current && places.length > 1) {
      const bounds = L.latLngBounds(
        places.map((p) => [p.coords[0], p.coords[1]] as [number, number])
      );
      // Sadece tek bir marker varsa zoom yapma, birden fazla varsa fitBounds yap
      mapInstanceRef.current.fitBounds(bounds, { 
        padding: [100, 100],
        maxZoom: 15, // Maksimum zoom seviyesi (çok yakınlaşmasın)
      });
    } else if (places.length === 1 && mapInstanceRef.current) {
      // Tek sonuç varsa o yere zoom yap
      const place = places[0];
      mapInstanceRef.current.setView([place.coords[0], place.coords[1]], 15, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [places, onPlaceClick]);

  // Focus on selected place - Google Maps gibi zoom yap ve marker'ı highlight et
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current) {
      const [lat, lng] = selectedPlace.coords;
      mapInstanceRef.current.setView([lat, lng], 16, {
        animate: true,
        duration: 0.5,
      });
      
      // İlgili marker'ı bul ve popup'ını aç
      const relatedMarker = markersRef.current.find((marker) => {
        const markerLat = (marker.getLatLng() as any).lat;
        const markerLng = (marker.getLatLng() as any).lng;
        return (
          Math.abs(markerLat - lat) < 0.0001 &&
          Math.abs(markerLng - lng) < 0.0001
        );
      });
      
      if (relatedMarker) {
        relatedMarker.openPopup();
      }
    }
  }, [selectedPlace]);

  // User location marker'ı güncelle
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Eski marker'ı kaldır
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
    }

    // Yeni marker ekle (mavi renkli, kullanıcı konumu için)
    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: `<div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #4285F4;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([userLocation[0], userLocation[1]], {
      icon: userIcon,
      zIndexOffset: 1000, // Diğer marker'ların üstünde
    }).addTo(mapInstanceRef.current);

    marker.bindPopup("<strong>Konumunuz</strong>");
    userLocationMarkerRef.current = marker;
  }, [userLocation]);

  // Expose location function and map center globally
  useEffect(() => {
    const handleLocationRequest = () => {
      if (!mapInstanceRef.current) return;

      if (userLocation && mapInstanceRef.current) {
        mapInstanceRef.current.setView(userLocation, 15);
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.openPopup();
        }
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 15);
            }
          },
          (error) => {
            console.warn("Geolocation error:", error);
            alert("Konum alınamadı. Lütfen tarayıcı ayarlarınızdan konum iznini açın.");
          }
        );
      }
    };

    // Map center'ı almak için function
    const getMapCenter = () => {
      if (!mapInstanceRef.current) {
        console.warn("[MapComponent] getMapCenter: Harita instance yok, varsayılan İstanbul kullanılıyor");
        return { lat: 41.015137, lng: 28.97953 };
      }
      const center = mapInstanceRef.current.getCenter();
      console.log("[MapComponent] getMapCenter:", center);
      return { lat: center.lat, lng: center.lng };
    };

    // Kullanıcı konumunu almak için function
    const getUserLocation = () => {
      // Öncelik: kullanıcı konumu (GPS'ten alınan)
      if (userLocation) {
        console.log("[MapComponent] getUserLocation: Kullanıcı konumu kullanılıyor", userLocation);
        return { lat: userLocation[0], lng: userLocation[1] };
      }
      // Fallback: harita merkezi
      const center = getMapCenter();
      console.log("[MapComponent] getUserLocation: Harita merkezi kullanılıyor (kullanıcı konumu yok)", center);
      return center;
    };
    
    // Store handlers globally
    (window as any).handleMapLocation = handleLocationRequest;
    (window as any).getMapCenter = getMapCenter;
    (window as any).getUserLocation = getUserLocation;
    
    return () => {
      delete (window as any).handleMapLocation;
      delete (window as any).getMapCenter;
      delete (window as any).getUserLocation;
      delete (window as any).getMapCenter;
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }
    };
  }, [userLocation]);

  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: 1 }}>
      <div ref={mapRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

MapComponent.displayName = "MapComponent";

export default MapComponent;
