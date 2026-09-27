"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GenerateAbsensi({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const [message, setMessage] = useState("Memverifikasi QR absensi...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    searchParams.then(async ({ id }) => {
      const attendanceId = Number(id);
      if (!Number.isInteger(attendanceId) || attendanceId < 1) { setMessage("QR absensi tidak valid."); return; }
      try {
        const res = await fetch("/api/absensi/confirm", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: attendanceId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memproses absensi.");
        setDone(true);
        setMessage(data.status === "already-recorded" ? "Absensi sudah tercatat sebelumnya." : "Absensi berhasil dikonfirmasi.");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal memproses absensi."); }
    });
  }, [searchParams]);

  return <main className="confirm-page"><div className="card confirm-card">
    <div className="confirm-icon">{done ? "✓" : "…"}</div>
    <h1>{done ? "Absensi Berhasil" : "Konfirmasi Absensi"}</h1>
    <p className="muted">{message}</p>
    <Link className="btn primary" href="/absensi">Kembali ke Daftar Hadir</Link>
  </div></main>;
}
