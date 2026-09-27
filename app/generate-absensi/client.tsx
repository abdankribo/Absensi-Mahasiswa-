"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function GenerateAbsensiClient() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Memverifikasi QR absensi...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMessage("QR absensi tidak valid.");
      return;
    }

    fetch("/api/absensi/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memproses absensi.");
        setDone(true);
        setMessage(
          data.status === "already-recorded"
            ? "Absensi sudah tercatat sebelumnya."
            : "Absensi berhasil dikonfirmasi."
        );
      })
      .catch((error) =>
        setMessage(
          error instanceof Error ? error.message : "Gagal memproses absensi."
        )
      );
  }, [params]);

  return (
    <div className="card confirm-card">
      <div className="confirm-icon">{done ? "✓" : "…"}</div>
      <h1>{done ? "Absensi Berhasil" : "Konfirmasi Absensi"}</h1>
      <p className="muted">{message}</p>
      <a className="btn primary" href="/absensi">
        Kembali ke Daftar Hadir
      </a>
    </div>
  );
}
