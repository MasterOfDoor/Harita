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
    // Tüm argümanları string'e çevir ve kontrol et
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    }).join(' ');
    
    // Metamask ile ilgili herhangi bir log'u filtrele
    if (
      message.toLowerCase().includes("metamask") ||
      message.includes("metamask-provider") ||
      message.includes("metamask-inpage") ||
      message.includes("metamask_chainChanged") ||
      message.includes("chainChanged") ||
      (message.includes("target") && message.includes("metamask")) ||
      (message.includes('"target":"metamask-inpage"')) ||
      (message.includes('"name":"metamask-provider"'))
    ) {
      return; // Metamask loglarını gösterme
    }
    originalLog.apply(console, args);
  };
}
