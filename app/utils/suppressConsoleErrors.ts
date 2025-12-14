// Console hatalarını suppress et (development için)
if (typeof window !== "undefined") {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  console.error = (...args: any[]) => {
    // Coinbase Analytics ve ad blocker hatalarını ignore et
    const message = args[0]?.toString() || "";
    if (
      message.includes("Analytics SDK") ||
      message.includes("Failed to fetch") ||
      message.includes("ERR_BLOCKED_BY_CLIENT") ||
      message.includes("cca-lite.coinbase.com")
    ) {
      return; // Bu hataları gösterme
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    // Coinbase Analytics uyarılarını ignore et
    const message = args[0]?.toString() || "";
    if (
      message.includes("Analytics SDK") ||
      message.includes("cca-lite.coinbase.com")
    ) {
      return; // Bu uyarıları gösterme
    }
    originalWarn.apply(console, args);
  };

  // Metamask loglarını suppress et (Base Mini App'te Metamask kullanılmıyor)
  console.log = (...args: any[]) => {
    const message = JSON.stringify(args);
    if (
      message.includes("metamask") ||
      message.includes("metamask-provider") ||
      message.includes("metamask-inpage") ||
      message.includes("metamask_chainChanged")
    ) {
      return; // Metamask loglarını gösterme
    }
    originalLog.apply(console, args);
  };
}



