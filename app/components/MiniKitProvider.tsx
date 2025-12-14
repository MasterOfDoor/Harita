"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { useState, useEffect } from "react";

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  // QueryClient oluştur (her render'da yeni instance oluşturmamak için)
  const [queryClient] = useState(() => new QueryClient());

  // Wagmi config - Base Sepolia chain için
  // Base App içinde açıldığında Base Account otomatik olarak bağlanır
  const [config] = useState(() =>
    createConfig({
      chains: [baseSepolia],
      connectors: [
        coinbaseWallet({
          appName: "Harita Uygulamasi",
          appLogoUrl: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "",
        }),
      ],
      transports: {
        [baseSepolia.id]: http(),
      },
    })
  );

  // Base Mini App ortamında doğru provider'ı seç ve MetaMask'i kesinlikle ignore et
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    // Base Mini App ortamında mıyız kontrol et
    const isBaseMiniApp = 
      (window as any).miniKit || 
      (window as any).coinbaseSDK ||
      window.location.href.includes("base.org") ||
      window.location.href.includes("coinbase.com");

    // Provider bilgilerini logla (debug için)
    console.log("[Provider Selection] Detected providers:", {
      isBaseMiniApp,
      isMetaMask: ethereum.isMetaMask,
      isCoinbaseWallet: ethereum.isCoinbaseWallet,
      isCoinbaseBrowser: ethereum.isCoinbaseBrowser,
      hasProvidersArray: Array.isArray(ethereum.providers),
      providersCount: Array.isArray(ethereum.providers) ? ethereum.providers.length : 0,
    });

    // Base Mini App'te değilsek, provider seçimini yapma
    if (!isBaseMiniApp) {
      console.log("[Provider Selection] Not in Base Mini App, skipping provider selection");
      return;
    }

    // 1. Öncelik: providers array varsa, Coinbase Wallet'ı seç
    if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
      // Önce Coinbase Wallet'ı ara
      const coinbaseProvider = ethereum.providers.find(
        (p: any) => p.isCoinbaseWallet || p.isCoinbaseBrowser || p.isCoinbase
      );
      
      if (coinbaseProvider) {
        console.log("[Provider Selection] Using Coinbase Wallet provider from providers array");
        (window as any).ethereum = coinbaseProvider;
        return;
      }
      
      // Coinbase Wallet yoksa, MetaMask olmayan ilk provider'ı seç
      const nonMetaMaskProvider = ethereum.providers.find(
        (p: any) => !p.isMetaMask
      );
      
      if (nonMetaMaskProvider) {
        console.log("[Provider Selection] Using non-MetaMask provider from providers array");
        (window as any).ethereum = nonMetaMaskProvider;
        return;
      }
    }

    // 2. Eğer direkt Coinbase Wallet ise, kullan (providers array yoksa)
    if (ethereum.isCoinbaseWallet || ethereum.isCoinbaseBrowser) {
      console.log("[Provider Selection] Using Coinbase Wallet provider (direct)");
      return;
    }

    // 3. Fallback: Eğer direkt MetaMask ise, uyar
    if (ethereum.isMetaMask && !ethereum.isCoinbaseWallet && !ethereum.isCoinbaseBrowser) {
      console.warn("[Provider Selection] MetaMask detected in Base Mini App. MetaMask should not be used in Base Mini App.");
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

