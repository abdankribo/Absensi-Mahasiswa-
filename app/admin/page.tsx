import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const facultyId = user.facultyId;
  if (facultyId == null) throw new Error("Admin belum memiliki fakultas.");

  const [mahasiswa, dosen, matakuliah, kelas, jadwal, hadir, izin, sakit, alpha] =
    await Promise.all([
      prisma.mahasiswa.count({ where: { facultyId: facultyId } }),
      prisma.dosen.count({ where: { facultyId: facultyId } }),
      prisma.matakuliah.count({ where: { facultyId: facultyId } }),
      prisma.kelas.count({ where: { facultyId: facultyId } }),
      prisma.jadwal.count({ where: { facultyId: facultyId } }),
      prisma.absensi.count({ where: { facultyId: user.facultyId, status: "Hadir" } }),
      prisma.absensi.count({ where: { facultyId: user.facultyId, status: "Izin" } }),
      prisma.absensi.count({ where: { facultyId: user.facultyId, status: "Sakit" } }),
      prisma.absensi.count({ where: { facultyId: user.facultyId, status: "Alpha" } }),
    ]);

  const totalAttendance = hadir + izin + sakit + alpha;
  const attendancePercent = totalAttendance
    ? Math.round((hadir / totalAttendance) * 100)
    : 0;

  const stats = [
    { label: "Total Mahasiswa", value: mahasiswa, icon: "👥", tone: "blue", meta: "Data mahasiswa aktif", href: "/admin/manage?tab=mahasiswa" },
    { label: "Total Dosen", value: dosen, icon: "👤", tone: "purple", meta: "Dosen terdaftar", href: "/admin/manage?tab=dosen" },
    { label: "Total Mata Kuliah", value: matakuliah, icon: "📖", tone: "green", meta: "Mata kuliah fakultas", href: "/admin/manage?tab=matakuliah" },
    { label: "Total Kelas", value: kelas, icon: "🏫", tone: "orange", meta: "Kelas terdaftar", href: "/admin/manage?tab=kelas" },
    { label: "Total Jadwal", value: jadwal, icon: "📅", tone: "red", meta: "Jadwal perkuliahan", href: "/admin/manage?tab=jadwal" },
  ];

  const management = [
    { title: "Mahasiswa", description: "Lihat dan kelola data mahasiswa", icon: "👥", tone: "blue", href: "/admin/manage?tab=mahasiswa" },
    { title: "Dosen", description: "Lihat dan kelola data dosen", icon: "👤", tone: "purple", href: "/admin/manage?tab=dosen" },
    { title: "Mata Kuliah", description: "Kelola mata kuliah", icon: "📖", tone: "green", href: "/admin/manage?tab=matakuliah" },
    { title: "Kelas", description: "Kelola data kelas", icon: "🏫", tone: "orange", href: "/admin/manage?tab=kelas" },
    { title: "Jadwal", description: "Kelola jadwal kuliah", icon: "📅", tone: "red", href: "/admin/manage?tab=jadwal" },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-search">⌕ <span>Cari mahasiswa, dosen, mata kuliah...</span></div>
        <div className="admin-profile">
          <span className="notification">♢<b>3</b></span>
          <span className="avatar">AT</span>
          <span><strong>{user.name}</strong><small>{user.identifier}</small></span>
        </div>
      </header>

      <section className="admin-welcome">
        <div>
          <p className="eyebrow">SISTEM INFORMASI ABSENSI MAHASISWA</p>
          <h1>Selamat Datang, {user.name}</h1>
          <p>{user.faculty?.name ?? "Fakultas"} · Pantau aktivitas akademik dan kehadiran dari satu tempat.</p>
        </div>
        <div className="admin-date">📅<span>Hari ini<br /><strong>{new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date())}</strong></span></div>
      </section>

      <section className="admin-stat-grid">
        {stats.map((stat) => (
          <Link href={stat.href} className="admin-stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.tone}`}>{stat.icon}</div>
            <div><span>{stat.label}</span><strong>{formatNumber(stat.value)}</strong><small>{stat.meta}</small></div>
          </article>
        ))}
      </section>

      <section className="admin-main-grid">
        <article className="dashboard-panel attendance-panel">
          <div className="panel-heading">
            <div><h2>Ringkasan Kehadiran</h2><p>Rekapitulasi data absensi fakultas</p></div>
            <span className="panel-pill">Semua data</span>
          </div>
          <div className="attendance-overview">
            <div className="donut" style={{ "--progress": `${attendancePercent * 3.6}deg` } as React.CSSProperties}>
              <div><strong>{attendancePercent}%</strong><span>Hadir</span></div>
            </div>
            <div className="attendance-list">
              <div><span><i className="dot hadir" />Hadir</span><strong>{formatNumber(hadir)}</strong></div>
              <div><span><i className="dot izin" />Izin</span><strong>{formatNumber(izin)}</strong></div>
              <div><span><i className="dot sakit" />Sakit</span><strong>{formatNumber(sakit)}</strong></div>
              <div><span><i className="dot alpha" />Alpha</span><strong>{formatNumber(alpha)}</strong></div>
            </div>
          </div>
          <div className="attendance-total">Total pencatatan absensi: <strong>{formatNumber(totalAttendance)}</strong></div>
        </article>

        <article className="dashboard-panel quick-panel">
          <div className="panel-heading"><div><h2>Aksi Cepat</h2><p>Menu yang sering digunakan</p></div></div>
          <div className="quick-actions">
            <Link href="/absensi/create" className="quick-action blue"><b>📝</b><span><strong>Buat Absensi</strong><small>Mulai sesi absensi baru</small></span><em>›</em></Link>
            <Link href="/absensi/scan" className="quick-action green"><b>▣</b><span><strong>Scan QR</strong><small>Verifikasi QR kehadiran</small></span><em>›</em></Link>
            <Link href="/absensi" className="quick-action purple"><b>▤</b><span><strong>Daftar Hadir</strong><small>Lihat rekap kehadiran</small></span><em>›</em></Link>
            <Link href="/" className="quick-action navy"><b>⌂</b><span><strong>Dashboard Utama</strong><small>Kembali ke halaman utama</small></span><em>›</em></Link>
          </div>
        </article>
      </section>

      <section className="dashboard-panel management-panel">
        <div className="panel-heading"><div><h2>Menu Manajemen Data</h2><p>Ringkasan modul administrasi fakultas</p></div></div>
        <div className="management-grid">
          {management.map((item) => (
            <Link href={item.href} className="management-card" key={item.title}>
              <div className={`management-icon ${item.tone}`}>{item.icon}</div>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <small>Modul siap digunakan</small>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="panel-heading"><div><h2>Distribusi Kehadiran</h2><p>Perbandingan status absensi</p></div></div>
          <div className="bar-chart">
            {[
              ["Hadir", hadir, "green"],
              ["Izin", izin, "orange"],
              ["Sakit", sakit, "red"],
              ["Alpha", alpha, "gray"],
            ].map(([label, value, tone]) => {
              const width = totalAttendance ? Math.max(3, Math.round((Number(value) / totalAttendance) * 100)) : 3;
              return <div className="bar-row" key={label as string}><span>{label}</span><div><i className={tone as string} style={{ width: `${width}%` }} /></div><strong>{formatNumber(Number(value))}</strong></div>;
            })}
          </div>
        </article>

        <article className="dashboard-panel admin-info-panel">
          <div className="panel-heading"><div><h2>Status Sistem</h2><p>Informasi lingkungan aplikasi</p></div></div>
          <div className="system-item"><span className="system-ok">●</span><div><strong>Database</strong><small>Terhubung dan dapat diakses</small></div><b>Online</b></div>
          <div className="system-item"><span className="system-ok">●</span><div><strong>Autentikasi</strong><small>Sesi admin aktif</small></div><b>Aktif</b></div>
          <div className="system-item"><span className="system-ok">●</span><div><strong>Fakultas</strong><small>{user.faculty?.name ?? "Belum ditentukan"}</small></div><b>Aktif</b></div>
        </article>
      </section>
    </div>
  );
}
