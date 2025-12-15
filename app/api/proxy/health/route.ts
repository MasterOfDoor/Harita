import { NextRequest, NextResponse } from "next/server";

/**
 * Health check endpoint - API route'larının çalışıp çalışmadığını kontrol eder
 */
export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasGoogleKey: !!process.env.GOOGLE_PLACES_KEY,
    hasGptKey: !!process.env.GPT5_API_KEY && !!process.env.OPENAI_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    googleKeyPrefix: process.env.GOOGLE_PLACES_KEY?.slice(0, 10) || "none",
    // Development'ta daha fazla bilgi göster
    ...(isDevelopment && {
      envKeys: Object.keys(process.env)
        .filter(k => k.includes("GOOGLE") || k.includes("PLACES") || k.includes("GPT") || k.includes("GEMINI"))
        .map(k => ({ key: k, hasValue: !!process.env[k] })),
    }),
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
