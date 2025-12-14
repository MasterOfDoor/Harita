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

  // Base Mini App ortamında MetaMask provider'ını ignore et
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Base Mini App ortamında mıyız kontrol et
    const isBaseMiniApp = 
      (window as any).miniKit || 
      (window as any).coinbaseSDK ||
      window.location.href.includes("base.org") ||
      window.location.href.includes("coinbase.com");

    if (isBaseMiniApp && (window as any).ethereum) {
      // MetaMask provider'ını geçici olarak gizle (Base Wallet'ı tercih et)
      const originalEthereum = (window as any).ethereum;
      
      // Eğer MetaMask ise ve Base Wallet varsa, MetaMask'i ignore et
      if (originalEthereum.isMetaMask && !originalEthereum.isCoinbaseWallet) {
        // providers array varsa, Coinbase Wallet'ı tercih et
        if (Array.isArray(originalEthereum.providers)) {
          const coinbaseProvider = originalEthereum.providers.find(
            (p: any) => p.isCoinbaseWallet || p.isCoinbaseBrowser
          );
          if (coinbaseProvider) {
            (window as any).ethereum = coinbaseProvider;
          }
        }
      }
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

