import { Suspense } from "react";
import GenerateAbsensiClient from "./client";

export default function GenerateAbsensiPage() {
  return (
    <main className="confirm-page">
      <Suspense
        fallback={
          <div className="card confirm-card">
            <div className="confirm-icon">…</div>
            <h1>Konfirmasi Absensi</h1>
            <p className="muted">Memuat halaman konfirmasi...</p>
          </div>
        }
      >
        <GenerateAbsensiClient />
      </Suspense>
    </main>
  );
}
