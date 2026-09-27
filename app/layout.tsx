import "./globals.css";
import Link from "next/link";
export const metadata={title:"Absensi Mahasiswa",description:"Sistem absensi mahasiswa berbasis Next.js"};
export default function RootLayout({children}:{children:React.ReactNode}){return <div className="shell"><aside className="sidebar"><div className="brand">🎓 Absensi Mahasiswa</div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/absensi">Daftar Hadir</Link><Link href="/absensi/create">Buat Absensi</Link><Link href="/absensi/scan">Scan QR</Link></nav></aside><main className="main">{children}</main></div>}