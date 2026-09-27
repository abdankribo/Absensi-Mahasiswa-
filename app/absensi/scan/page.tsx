"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function ScanPage() {
  const scannerRef = useRef<any>(null);
  const [message, setMessage] = useState("Meminta akses kamera...");

  useEffect(() => {
    let active = true;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!active) return;

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decoded: string) => {
            if (!decoded || !active) return;

            try {
              const url = new URL(decoded, window.location.origin);
              if (url.origin !== window.location.origin || url.pathname !== "/generate-absensi") {
                setMessage("QR tidak dikenali sebagai QR absensi aplikasi ini.");
                return;
              }

              await scanner.stop().catch(() => {});
              window.location.assign(url.toString());
            } catch {
              setMessage("QR Code tidak valid.");
            }
          },
          () => {}
        );

        if (active) setMessage("Arahkan kamera ke QR Code absensi.");
      } catch {
        if (active) {
          setMessage(
            "Kamera tidak dapat diakses. Pastikan izin kamera diberikan dan gunakan HTTPS."
          );
        }
      }
    })();

    return () => {
      active = false;
      scannerRef.current?.stop?.().catch(() => {});
    };
  }, []);

  return (
    <>
      <div className="top">
        <div>
          <h1 className="title">Scan QR</h1>
          <p className="muted">{message}</p>
        </div>
        <Link className="btn secondary" href="/">
          Kembali
        </Link>
      </div>

      <div className="card">
        <div id="reader" style={{ maxWidth: 520, margin: "0 auto" }} />
      </div>
    </>
  );
}
