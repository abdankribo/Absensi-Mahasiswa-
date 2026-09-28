import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata={title:"Absensi Mahasiswa",description:"Sistem absensi mahasiswa berbasis Next.js"};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const user=await getSession();
  const dashboard=user?.role==="ADMIN"?"/admin":user?.role==="DOSEN"?"/dosen":user?.role==="MAHASISWA"?"/mahasiswa":"/";
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">🎓 Absensi Mahasiswa</div>
      <nav className="nav">
        <Link href={dashboard}>{user?"Dashboard":"Beranda"}</Link>
        {user?.role==="ADMIN"&&<Link href="/admin/manage">Manajemen Data</Link>}
        {user?.role==="DOSEN"&&<Link href="/dosen">Buat QR Absensi</Link>}
        {user?.role==="MAHASISWA"&&<Link href="/mahasiswa/scan">Scan QR</Link>}
        <Link href="/absensi">Daftar Hadir</Link>
      </nav>
      {user&&<div className="sidebar-account">
        <div className="sidebar-user">
          <span className="sidebar-avatar">{user.name?.slice(0,1).toUpperCase() ?? "U"}</span>
          <span><strong>{user.name}</strong><small>{user.role}</small></span>
        </div>
        <LogoutButton />
      </div>}
    </aside>
    <main className="main">{children}</main>
  </div>
}
