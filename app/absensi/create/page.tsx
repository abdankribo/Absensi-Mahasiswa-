 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

type Item = { id?: number; nim?: string; nama?: string; namaMatakuliah?: string; sks?: number; hari?: string; jamMulai?: string; matakuliahId?: number };

export default function CreateAbsensi() {
  const [mahasiswa, setMahasiswa] = useState<Item[]>([]);
  const [matakuliah, setMatakuliah] = useState<Item[]>([]);
  const [jadwal, setJadwal] = useState<Item[]>([]);
  const [nim, setNim] = useState("");
  const [mk, setMk] = useState("");
  const [jadwalId, setJadwalId] = useState("");
  const [qr, setQr] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/master").then((r) => r.json()).then((d) => {
      setMahasiswa(d.mahasiswa); setMatakuliah(d.matakuliah); setJadwal(d.jadwal);
    });
  }, []);

  useEffect(() => {
    if (mk) {
      const first = jadwal.find((j) => String(j.matakuliahId) === mk);
      setJadwalId(first ? String(first.id) : "");
    } else setJadwalId("");
  }, [mk, jadwal]);

  async function create() {
    setMessage(""); setQr("");
    if (!nim || !mk || !jadwalId) { setMessage("Lengkapi semua pilihan."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mahasiswaId: nim, matakuliahId: Number(mk), jadwalId: Number(jadwalId), tanggalAbsensi: new Date().toISOString() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal membuat absensi");
      const url = location.origin + "/generate-absensi?id=" + d.id;
      setQr(await QRCode.toDataURL(url, { width: 260, margin: 2 }));
      setMessage("Sesi absensi dibuat. Scan QR ini untuk mengonfirmasi kehadiran.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  }

  const filtered = jadwal.filter((j) => String(j.matakuliahId) === mk);

  return (
    <>
      <div className="top">
        <div><h1 className="title">Buat Absensi</h1><p className="muted">Buat sesi kehadiran dan QR Code.</p></div>
        <Link className="btn secondary" href="/">Kembali</Link>
      </div>
      <div className="card">
        <div className="form-grid">
          <div className="field"><label>Mahasiswa</label><select value={nim} onChange={(e) => setNim(e.target.value)}><option value="">Pilih mahasiswa</option>{mahasiswa.map((m) => <option key={m.nim} value={m.nim}>{m.nim} — {m.nama}</option>)}</select></div>
          <div className="field"><label>Mata Kuliah</label><select value={mk} onChange={(e) => setMk(e.target.value)}><option value="">Pilih mata kuliah</option>{matakuliah.map((m) => <option key={m.id} value={m.id}>{m.namaMatakuliah} ({m.sks} SKS)</option>)}</select></div>
          <div className="field"><label>Jadwal</label><select value={jadwalId} onChange={(e) => setJadwalId(e.target.value)} disabled={!mk}><option value="">Pilih jadwal</option>{filtered.map((j) => <option key={j.id} value={j.id}>{j.hari} — {j.jamMulai}</option>)}</select></div>
          <div className="field"><label>Status awal</label><input value="Menunggu scan QR" readOnly /></div>
        </div>
        <div className="actions" style={{ marginTop: 20 }}>
          <button className="btn primary" onClick={create} disabled={loading}>{loading ? "Membuat..." : "Generate QR"}</button>
          <Link className="btn secondary" href="/absensi">Lihat Daftar Hadir</Link>
        </div>
        {message && <div className="notice">{message}</div>}
        {qr && <div className="qrbox" style={{ marginTop: 20 }}><img src={qr} alt="QR Code absensi" width={260} height={260} /><strong>Scan QR ini untuk mengubah status menjadi Hadir</strong></div>}
      </div>
    </>
  );
}
