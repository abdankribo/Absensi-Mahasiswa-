import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function AbsensiPage() {
  const user = await requireRole("ADMIN", "DOSEN", "MAHASISWA");

  const rows = await prisma.absensi.findMany({
    where: user.role === "MAHASISWA"
      ? { mahasiswaId: user.mahasiswa?.nim ?? "__none__" }
      : { facultyId: user.facultyId ?? -1 },
    include: { mahasiswa: true, matakuliah: true, jadwal: true },
    orderBy: { tanggalAbsensi: "desc" },
  });

  const canCreate = user.role === "ADMIN" || user.role === "DOSEN";

  return <>
    <div className="top">
      <div>
        <h1 className="title">Daftar Hadir</h1>
        <p className="muted">
          {user.role === "MAHASISWA"
            ? "Riwayat kehadiran Anda sendiri."
            : "Riwayat absensi pada lingkup fakultas."}
        </p>
      </div>
      {canCreate && <Link className="btn primary" href="/absensi/create">+ Buat Absensi</Link>}
    </div>

    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            {user.role !== "MAHASISWA" && <><th>NIM</th><th>Mahasiswa</th></>}
            <th>Mata Kuliah</th>
            <th>Jadwal</th>
            <th>Tanggal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map(r => <tr key={r.id}>
            {user.role !== "MAHASISWA" && <><td>{r.mahasiswa.nim}</td><td>{r.mahasiswa.nama}</td></>}
            <td>{r.matakuliah.namaMatakuliah}</td>
            <td>{r.jadwal.hari} · {r.jadwal.jamMulai}</td>
            <td>{new Date(r.tanggalAbsensi).toLocaleString("id-ID")}</td>
            <td><span className="badge">{r.status}</span></td>
          </tr>) : <tr><td colSpan={user.role === "MAHASISWA" ? 4 : 6}>Belum ada data kehadiran.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
