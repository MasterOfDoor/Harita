"use client";

import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { useMemo, useEffect, useState, useRef } from "react";
import { readContract } from "@wagmi/core";

// ReviewNFT Contract ABI (sadece kullanılan fonksiyonlar)
const REVIEW_NFT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "placeId", type: "string" },
      { internalType: "uint8", name: "rating", type: "uint8" },
      { internalType: "string", name: "comment", type: "string" },
      { internalType: "string[]", name: "photos", type: "string[]" },
    ],
    name: "mintReview",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "placeId", type: "string" }],
    name: "getPlaceReviews",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getReview",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "string", name: "placeId", type: "string" },
          { internalType: "uint8", name: "rating", type: "uint8" },
          { internalType: "string", name: "comment", type: "string" },
          { internalType: "string[]", name: "photos", type: "string[]" },
          { internalType: "address", name: "reviewer", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct ReviewNFT.Review",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Contract address - environment variable'dan alınacak veya default değer
const REVIEW_NFT_ADDRESS = (process.env.NEXT_PUBLIC_REVIEW_NFT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export interface BlockchainReview {
  tokenId: bigint;
  placeId: string;
  rating: number;
  comment: string;
  photos: string[];
  reviewer: `0x${string}`;
  createdAt: bigint;
}

export function useReviews(placeId: string | null) {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const [reviews, setReviews] = useState<BlockchainReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Place'in review token ID'lerini oku
  const { data: tokenIds, refetch: refetchTokenIds } = useReadContract({
    address: REVIEW_NFT_ADDRESS,
    abi: REVIEW_NFT_ABI,
    functionName: "getPlaceReviews",
    args: placeId ? [placeId] : undefined,
    query: {
      enabled: !!placeId && REVIEW_NFT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Token ID'ler değiştiğinde review detaylarını oku
  useEffect(() => {
    const loadReviews = async () => {
      if (!tokenIds || tokenIds.length === 0) {
        setReviews([]);
        return;
      }

      setIsLoadingReviews(true);
      try {
        // Tüm review'leri paralel olarak oku
        const reviewPromises = tokenIds.map(async (tokenId) => {
          try {
            const review = await readContract(config, {
              address: REVIEW_NFT_ADDRESS,
              abi: REVIEW_NFT_ABI,
              functionName: "getReview",
              args: [tokenId],
            }) as any;

            return {
              tokenId: review.tokenId,
              placeId: review.placeId,
              rating: Number(review.rating),
              comment: review.comment,
              photos: review.photos || [],
              reviewer: review.reviewer,
              createdAt: review.createdAt,
            } as BlockchainReview;
          } catch (error) {
            console.error(`Review ${tokenId} okunamadı:`, error);
            return null;
          }
        });

        const loadedReviews = await Promise.all(reviewPromises);
        const validReviews = loadedReviews.filter((r): r is BlockchainReview => r !== null);
        
        // En yeni önce sırala
        validReviews.sort((a, b) => Number(b.createdAt - a.createdAt));
        setReviews(validReviews);
      } catch (error) {
        console.error("Review'ler yüklenirken hata:", error);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
  }, [tokenIds]);

  // Review yazma işlemi
  const {
    writeContract,
    data: hash,
    isPending: isSubmitting,
    error: submitError,
  } = useWriteContract();

  // Transaction onayını bekle
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Pending submission'ları takip et
  const pendingSubmissionRef = useRef<{
    resolve: () => void;
    reject: (error: any) => void;
    hash: `0x${string}` | null;
  } | null>(null);

  // Hash set olduğunda pending submission'ı güncelle
  useEffect(() => {
    if (hash && pendingSubmissionRef.current && !pendingSubmissionRef.current.hash) {
      pendingSubmissionRef.current.hash = hash;
    }
  }, [hash]);

  // Transaction başarılı olduğunda review listesini yenile ve promise'i resolve et
  useEffect(() => {
    if (isConfirmed && hash && pendingSubmissionRef.current) {
      // Hash eşleşiyorsa veya ref'te hash yoksa (yeni transaction) resolve et
      if (!pendingSubmissionRef.current.hash || pendingSubmissionRef.current.hash === hash) {
        setTimeout(() => {
          refetchTokenIds();
        }, 2000); // 2 saniye bekle (blockchain'de işlem tamamlanması için)
        
        pendingSubmissionRef.current.resolve();
        pendingSubmissionRef.current = null;
      }
    }
  }, [isConfirmed, hash, refetchTokenIds]);

  // Transaction hatası olduğunda promise'i reject et
  useEffect(() => {
    if (submitError && pendingSubmissionRef.current) {
      pendingSubmissionRef.current.reject(submitError);
      pendingSubmissionRef.current = null;
    }
  }, [submitError]);

  // Yorum gönder
  const submitReview = async (rating: number, comment: string, photos: string[] = []) => {
    if (!placeId || !isConnected) {
      throw new Error("Place ID gerekli veya wallet bağlı değil");
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating 1-5 arasında olmalı");
    }

    if (!comment.trim()) {
      throw new Error("Yorum boş olamaz");
    }

    if (REVIEW_NFT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      throw new Error("Review contract adresi yapılandırılmamış");
    }

    // Eğer zaten bir submission varsa, önceki promise'i reject et
    if (pendingSubmissionRef.current) {
      pendingSubmissionRef.current.reject(new Error("Yeni bir yorum gönderiliyor, önceki işlem iptal edildi"));
    }

    // Yeni promise oluştur
    return new Promise<void>((resolve, reject) => {
      pendingSubmissionRef.current = {
        resolve,
        reject,
        hash: null,
      };

      try {
        // writeContract promise döndürmez, sadece transaction'ı başlatır
        writeContract({
          address: REVIEW_NFT_ADDRESS,
          abi: REVIEW_NFT_ABI,
          functionName: "mintReview",
          args: [placeId, rating as 1 | 2 | 3 | 4 | 5, comment, photos],
        });
        // Transaction hash hook state'inden takip edilecek ve promise resolve edilecek
      } catch (error: any) {
        console.error("Review gönderme hatası:", error);
        pendingSubmissionRef.current = null;
        reject(error);
      }
    });
  };

  return {
    reviews,
    submitReview,
    isSubmitting: isSubmitting || isConfirming,
    isConfirmed,
    submitError,
    isConnected,
    address,
    isLoadingReviews,
    refetch: refetchTokenIds,
  };
}


