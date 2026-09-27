import Link from "next/link";
import { requireRole } from "@/lib/authorization";
export default async function MahasiswaPage(){const user=await requireRole("MAHASISWA");return <div><div className="top"><div><h1 className="title">Dashboard Mahasiswa</h1><p className="muted">{user.name} · NIM {user.mahasiswa?.nim} · {user.faculty?.name}</p></div></div><section className="card"><h2>Absensi Hari Ini</h2><p className="muted">Scan QR yang ditampilkan dosen pada jadwal kuliah Anda.</p><Link className="btn primary" href="/mahasiswa/scan">Scan QR Absensi</Link></section></div>}
