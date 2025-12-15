"use client";

import { useCallback, useRef } from "react";
import { useProxy } from "./useProxy";
import { Place } from "../components/DetailPanel";

interface AnalysisResult {
  placeId: string;
  labels: string[];
  features: string[];
  tags: string[];
}

// AI analizi çıktı formatı (test.js formatına göre)
interface AIAnalysisOutput {
  mekan_isiklandirma?: "los" | "canli" | "dogal";
  ambiyans?: { retro?: boolean; modern?: boolean };
  masada_priz_var_mi?: boolean;
  koltuk_var_mi?: boolean;
  sigara_iciliyor?: boolean;
  sigara_alani?: ("acik" | "kapali")[];
  deniz_manzarasi?: boolean;
}

// Few-shot örnekleri (fewshot.js'den)
const FEW_SHOT_MESSAGES = [
  {
    role: "user",
    content: [
      { type: "input_image", image_url: "https://ibb.co/gZR4GN9B" },
      { type: "input_image", image_url: "https://ibb.co/vxyjtkn4" },
      { type: "input_image", image_url: "https://ibb.co/FL616hP1" },
      { type: "input_image", image_url: "https://ibb.co/ZnjvVt4" },
      { type: "input_image", image_url: "https://ibb.co/3yJz6HcY" },
      { type: "input_image", image_url: "https://ibb.co/350kb2n1" },
      { type: "input_text", text: "Bu fotoğraf bir ÖĞRETİM örneğidir. Kurallara göre analiz et." }
    ]
  },
  {
    role: "assistant",
    content: [
      {
        type: "output_text",
        text: `{
  "mekan_isiklandirma": "los",
  "ambiyans": { "retro": true, "modern": false },
  "sigara_iciliyor": true,
  "sigara_alani": ["kapali"],
  "deniz_manzarasi": false
}`
      }
    ]
  },
  {
    role: "user",
    content: [
      { type: "input_image", image_url: "https://ibb.co/s9nMvFMx" },
      { type: "input_image", image_url: "https://ibb.co/ZpWGcP6g" },
      { type: "input_image", image_url: "https://ibb.co/bg1SM1C7" },
      { type: "input_image", image_url: "https://ibb.co/ksyMcsf4" },
      { type: "input_image", image_url: "https://ibb.co/wFVDcQGQ" },
      { type: "input_image", image_url: "https://ibb.co/4ZhbzpLf" },
      { type: "input_image", image_url: "https://ibb.co/0ySFQWbQ" },
      { type: "input_text", text: "Bu fotoğraf bir ÖĞRETİM örneğidir. Kurallara göre analiz et." }
    ]
  },
  {
    role: "assistant",
    content: [
      {
        type: "output_text",
        text: `{
  "mekan_isiklandirma": "canli",
  "ambiyans": { "retro": false, "modern": true },
  "masada_priz_var_mi": true,
  "sigara_iciliyor": true,
  "sigara_alani": ["acik"],
  "deniz_manzarasi": false
}`
      }
    ]
  },
  {
    role: "user",
    content: [
      { type: "input_image", image_url: "https://ibb.co/45Nr9kN" },
      { type: "input_image", image_url: "https://ibb.co/8VTJvf7" },
      { type: "input_image", image_url: "https://ibb.co/gbHvLW6x" },
      { type: "input_image", image_url: "https://ibb.co/HjpRZQ8" },
      { type: "input_image", image_url: "https://ibb.co/gb5wSXF2" },
      { type: "input_image", image_url: "https://ibb.co/2YpzMGBP" },
      { type: "input_text", text: "Bu fotoğraf bir ÖĞRETİM örneğidir. Kurallara göre analiz et." }
    ]
  },
  {
    role: "assistant",
    content: [
      {
        type: "output_text",
        text: `{
  "mekan_isiklandirma": "dogal",
  "ambiyans": { "retro": true, "modern": false },
  "masada_priz_var_mi": true,
  "koltuk_var_mi": true,
  "sigara_iciliyor": true,
  "sigara_alani": ["acik"],
  "deniz_manzarasi": true
}`
      }
    ]
  }
];

// AI çıktısını filtrelerle eşleştirme formatına çevir
function convertAIToLabels(aiOutput: AIAnalysisOutput, placeId: string): AnalysisResult {
  const labels: string[] = [];
  const features: string[] = [];
  const tags: string[] = [];

  // Işıklandırma
  if (aiOutput.mekan_isiklandirma === "los") {
    labels.push("Los");
  } else if (aiOutput.mekan_isiklandirma === "canli") {
    labels.push("Canli");
  } else if (aiOutput.mekan_isiklandirma === "dogal") {
    labels.push("Dogal");
  }

  // Ambiyans
  if (aiOutput.ambiyans) {
    if (aiOutput.ambiyans.retro) {
      labels.push("Retro");
    }
    if (aiOutput.ambiyans.modern) {
      labels.push("Modern");
    }
  }

  // Masada priz
  if (aiOutput.masada_priz_var_mi) {
    labels.push("Masada priz");
  }

  // Koltuk
  if (aiOutput.koltuk_var_mi) {
    labels.push("Koltuk var");
  } else {
    labels.push("Koltuk yok");
  }

  // Sigara
  if (aiOutput.sigara_iciliyor) {
    labels.push("Sigara icilebilir");
    if (aiOutput.sigara_alani) {
      if (aiOutput.sigara_alani.includes("kapali")) {
        labels.push("Kapali alanda sigara icilebilir");
      }
    }
  }

  // Deniz
  if (aiOutput.deniz_manzarasi) {
    labels.push("Deniz goruyor");
  } else {
    labels.push("Deniz gormuyor");
  }

  return {
    placeId,
    labels,
    features,
    tags,
  };
}

export function usePlaceAnalysis() {
  const { aiChat } = useProxy();
  const systemPromptCache = useRef<string | null>(null);
  const systemPromptPromise = useRef<Promise<string> | null>(null);

  const loadSystemPrompt = useCallback(async () => {
    if (systemPromptCache.current) return systemPromptCache.current;
    if (systemPromptPromise.current) return systemPromptPromise.current;
    systemPromptPromise.current = fetch("/system%20prompt.txt")
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => (text || "").trim())
      .catch(() => "")
      .finally(() => {
        systemPromptPromise.current = null;
      }) as Promise<string>;
    systemPromptCache.current = await systemPromptPromise.current;
    return systemPromptCache.current;
  }, []);

  const analyzePlaces = useCallback(
    async (places: Place[]): Promise<Map<string, AnalysisResult>> => {
      console.log("[analyzePlaces] Başlatılıyor, mekan sayısı:", places.length);
      if (places.length === 0) return new Map();

      const resultMap = new Map<string, AnalysisResult>();
      const systemPrompt = await loadSystemPrompt();
      console.log("[analyzePlaces] System prompt yüklendi, uzunluk:", systemPrompt.length);

      // Her mekan için ayrı ayrı analiz yap (test.js formatına göre)
      for (const place of places) {
        try {
          // Google Places API'den gelen fotoğrafları al
          const photoUrls = [
            ...(place.photos || []),
            ...(place.photo ? [place.photo] : []),
          ]
            .filter(Boolean)
            .slice(0, 6); // Maksimum 6 fotoğraf (test.js formatına göre)

          if (photoUrls.length === 0) {
            console.warn(`[analyzePlaces] ${place.name} için fotoğraf yok, atlanıyor`);
            continue;
          }

          console.log(`[analyzePlaces] ${place.name} analiz ediliyor, ${photoUrls.length} fotoğraf`);

          // test.js formatına göre input hazırla
          const imageInputs = photoUrls.map((url) => ({
            type: "input_image",
            image_url: url, // Google Places API'den gelen URL direkt kullanılır
          }));

          // System prompt + few-shot + user request
          const input = [
            {
              role: "system",
              content: [
                { type: "input_text", text: systemPrompt || "Sen bir mekan analiz uzmanısın." }
              ]
            },
            ...FEW_SHOT_MESSAGES,
            {
              role: "user",
              content: [
                ...imageInputs,
                {
                  type: "input_text",
                  text: `Tüm fotoğraflar "${place.name}" mekanına aittir. Kurallara birebir uyarak analiz et.`
                }
              ]
            }
          ];

          // OpenAI responses API formatına göre body
          const body = {
            model: "gpt-4o-2024-11-20",
            input,
          };

          const requestSize = JSON.stringify(body).length;
          console.log(`[analyzePlaces] ${place.name} için AI isteği gönderiliyor, boyut:`, Math.round(requestSize / 1024), "KB, foto:", photoUrls.length);

          const startTime = Date.now();
          const response = await aiChat(body, "responses");
          const duration = Date.now() - startTime;
          console.log(`[analyzePlaces] ${place.name} için AI yanıt alındı, süre:`, duration, "ms");

          // Response'dan JSON çıkar
          const outputText = response.output_text || response.output?.[0]?.content?.[0]?.text || "";
          console.log(`[analyzePlaces] ${place.name} AI yanıt:`, outputText.substring(0, 200));

          // JSON parse et
          let aiOutput: AIAnalysisOutput;
          try {
            // JSON nesnesini bul (süslü parantezler arası)
            const jsonMatch = outputText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.warn(`[analyzePlaces] ${place.name} için JSON bulunamadı!`);
              continue;
            }
            aiOutput = JSON.parse(jsonMatch[0]);
          } catch (error: any) {
            console.error(`[analyzePlaces] ${place.name} JSON parse hatası:`, error);
            continue;
          }

          // AI çıktısını filtrelerle eşleştirme formatına çevir
          const result = convertAIToLabels(aiOutput, place.id);
          console.log(`[analyzePlaces] ${place.name} sonuç:`, result.labels);
          resultMap.set(place.id, result);

        } catch (error: any) {
          console.error(`[analyzePlaces] ${place.name} için AI hatası:`, error.message || error);
          // Continue with next place
        }
      }

      return resultMap;
    },
    [aiChat, loadSystemPrompt]
  );

  return { analyzePlaces };
}
