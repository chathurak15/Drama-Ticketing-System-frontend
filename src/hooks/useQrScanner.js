import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export const useQrScanner = (config, onSuccess, onError) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-scanner-container", // DOM element ID
      config || { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onSuccess, onError);

    return () => {
      scanner.clear().catch((error) => {
        console.error("Scanner cleanup error:", error);
      });
    };
  }, []);
};