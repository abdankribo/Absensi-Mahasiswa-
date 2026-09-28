import Link from "next/link";
import { requireRole } from "@/lib/authorization";
import AdminClient from "../client";

type Tab = "mahasiswa" | "dosen" | "matakuliah" | "kelas" | "jadwal";

export default async function AdminManagePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireRole("ADMIN");
  const params = await searchParams;
  const allowed: Tab[] = ["mahasiswa", "dosen", "matakuliah", "kelas", "jadwal"];
  const tab = allowed.includes(params.tab as Tab) ? (params.tab as Tab) : "mahasiswa";

  return (
    <div>
      <div className="top admin-manage-heading">
        <div>
          <p className="eyebrow">ADMINISTRASI FAKULTAS</p>
          <h1 className="title">Manajemen Data</h1>
          <p className="muted">{user.faculty?.name ?? "Fakultas"} · Kelola data akademik dari satu halaman.</p>
        </div>
        <Link className="btn secondary" href="/admin">← Kembali ke Dashboard</Link>
      </div>
      <AdminClient initialTab={tab} />
    </div>
  );
}
