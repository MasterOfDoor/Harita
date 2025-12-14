"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { useState, useEffect } from "react";

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  // QueryClient oluştur (her render'da yeni instance oluşturmamak için)
  const [queryClient] = useState(() => new QueryClient());

  // Wagmi config - Base chain için
  // Base App içinde açıldığında Base Account otomatik olarak bağlanır
  const [config] = useState(() =>
    createConfig({
      chains: [base],
      connectors: [
        coinbaseWallet({
          appName: "Harita Uygulamasi",
          appLogoUrl: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "",
        }),
      ],
      transports: {
        [base.id]: http(),
      },
    })
  );

  // Base Mini App ortamında doğru provider'ı seç ve MetaMask'i ignore et
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Base Mini App ortamında mıyız kontrol et
    const isBaseMiniApp = 
      (window as any).miniKit || 
      (window as any).coinbaseSDK ||
      window.location.href.includes("base.org") ||
      window.location.href.includes("coinbase.com");

    if (!isBaseMiniApp) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    // Provider bilgilerini logla (debug için)
    console.log("[Provider Selection] Detected providers:", {
      isMetaMask: ethereum.isMetaMask,
      isCoinbaseWallet: ethereum.isCoinbaseWallet,
      isCoinbaseBrowser: ethereum.isCoinbaseBrowser,
      hasProvidersArray: Array.isArray(ethereum.providers),
      providersCount: Array.isArray(ethereum.providers) ? ethereum.providers.length : 0,
    });

    // Eğer providers array varsa, Coinbase Wallet'ı tercih et
    if (Array.isArray(ethereum.providers)) {
      const coinbaseProvider = ethereum.providers.find(
        (p: any) => p.isCoinbaseWallet || p.isCoinbaseBrowser || p.isCoinbase
      );
      
      if (coinbaseProvider) {
        console.log("[Provider Selection] Using Coinbase Wallet provider from providers array");
        (window as any).ethereum = coinbaseProvider;
        return;
      }
    }

    // Eğer direkt MetaMask ise ve Coinbase Wallet yoksa, uyar
    if (ethereum.isMetaMask && !ethereum.isCoinbaseWallet && !ethereum.isCoinbaseBrowser) {
      console.warn("[Provider Selection] MetaMask detected in Base Mini App. This may cause chain issues.");
      // Base Mini App'te MetaMask kullanılmamalı, ama zorla değiştiremeyiz
      // Sadece uyarı veriyoruz
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

