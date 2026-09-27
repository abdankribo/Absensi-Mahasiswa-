import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [mahasiswa, matakuliah, jadwal, absensi] = await Promise.all([
    prisma.mahasiswa.count(),
    prisma.matakuliah.count(),
    prisma.jadwal.count(),
    prisma.absensi.count({ where: { status: "Hadir" } }),
  ]);

  return (
    <>
      <div className="top">
        <div><h1 className="title">Dashboard</h1><p className="muted">Ringkasan sistem absensi mahasiswa.</p></div>
        <Link className="btn primary" href="/absensi/create">+ Buat Absensi</Link>
      </div>
      <section className="grid">
        <div className="card"><span className="muted">Mahasiswa</span><div className="metric">{mahasiswa}</div></div>
        <div className="card"><span className="muted">Mata Kuliah</span><div className="metric">{matakuliah}</div></div>
        <div className="card"><span className="muted">Jadwal</span><div className="metric">{jadwal}</div></div>
        <div className="card"><span className="muted">Kehadiran Terkonfirmasi</span><div className="metric">{absensi}</div></div>
      </section>
      <section className="card" style={{ marginTop: 18 }}>
        <h2>Alur Absensi</h2>
        <p className="muted">Buat sesi absensi, tampilkan QR, lalu scan QR tersebut. Status berubah dari Menunggu menjadi Hadir setelah QR berhasil dipindai.</p>
      </section>
    </>
  );
}
