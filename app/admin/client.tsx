"use client";

import { useEffect, useState } from "react";

type Tab = "mahasiswa" | "dosen" | "matakuliah" | "kelas" | "jadwal";
const tabs: [Tab, string][] = [["mahasiswa", "Mahasiswa"], ["dosen", "Dosen"], ["matakuliah", "Mata Kuliah"], ["kelas", "Kelas"], ["jadwal", "Jadwal"]];
const importTabs: Tab[] = ["mahasiswa", "dosen", "matakuliah", "jadwal"];
const blank: any = { nim: "", nama: "", kelasId: "", nidn: "", password: "", namaMatakuliah: "", sks: "3", kode: "", hari: "Senin", jamMulai: "08:00", jamSelesai: "10:30", matakuliahId: "", dosenId: "" };

const importHelp: Record<string, string> = {
  mahasiswa: "Kolom: nim, nama, kelas, password (opsional; default 12345678).",
  dosen: "Kolom: nidn, nama, password (opsional; default 12345678).",
  matakuliah: "Kolom: namaMatakuliah atau nama_mata_kuliah, sks.",
  jadwal: "Kolom: hari, jamMulai, jamSelesai, matakuliah, nidn, kelas. ID juga didukung.",
};

export default function AdminClient({ initialTab = "mahasiswa" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [rows, setRows] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [dosens, setDosens] = useState<any[]>([]);
  const [mks, setMks] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [editing, setEditing] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  async function load() {
    const r = await fetch("/api/admin?type=" + tab);
    if (r.ok) setRows(await r.json());
  }

  async function options() {
    const [a, b, c] = await Promise.all([
      fetch("/api/admin?type=kelas"),
      fetch("/api/admin?type=dosen"),
      fetch("/api/admin?type=matakuliah"),
    ]);
    setClasses(await a.json());
    setDosens(await b.json());
    setMks(await c.json());
  }

  useEffect(() => { load(); options(); }, [tab]);
  useEffect(() => { if (tabs.some(([key]) => key === initialTab)) setTab(initialTab); }, [initialTab]);

  const set = (k: string, v: string) => setForm((x: any) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = { ...form, type: tab };
    if (editing) payload.id = editing;
    const r = await fetch("/api/admin", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    setMsg(d.error || "Data berhasil disimpan.");
    if (r.ok) { setEditing(null); setForm(blank); load(); options(); }
  }

  async function remove(id: any) {
    if (!confirm("Hapus data ini?")) return;
    const r = await fetch("/api/admin", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: tab, id }) });
    const d = await r.json();
    setMsg(d.error || "Data dihapus.");
    if (r.ok) { load(); options(); }
  }

  function edit(r: any) {
    setEditing(tab === "mahasiswa" ? r.nim : r.id);
    setForm({ ...blank, ...r, kelasId: String(r.kelasId ?? ""), sks: String(r.sks ?? 3), matakuliahId: String(r.matakuliahId ?? ""), dosenId: String(r.dosenId ?? "") });
  }

  async function importData() {
    if (!importFile) { setMsg("Pilih file Excel atau CSV terlebih dahulu."); return; }
    setImporting(true);
    setMsg("");
    try {
      const data = new FormData();
      data.append("type", tab);
      data.append("file", importFile);
      const r = await fetch("/api/admin/import", { method: "POST", body: data });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || "Import gagal.");
      const detail = result.failed ? `Import selesai: ${result.imported} berhasil, ${result.failed} gagal.` : `Import selesai: ${result.imported} data berhasil ditambahkan.`;
      const errors = result.errors?.length ? " " + result.errors.map((x: any) => `Baris ${x.row}: ${x.message}`).join(" | ") : "";
      const passwordNote = result.defaultPasswordUsed ? ` Password kosong menggunakan default ${result.defaultPasswordUsed}.` : "";
      setMsg(detail + passwordNote + errors);
      setImportFile(null);
      const input = document.getElementById("admin-import-file") as HTMLInputElement | null;
      if (input) input.value = "";
      load();
      options();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Import gagal.");
    } finally {
      setImporting(false);
    }
  }

  function headers() {
    if (tab === "mahasiswa") return <><th>NIM</th><th>Nama</th><th>Kelas</th></>;
    if (tab === "dosen") return <><th>NIDN</th><th>Nama</th></>;
    if (tab === "matakuliah") return <><th>Nama</th><th>SKS</th></>;
    if (tab === "kelas") return <><th>Kode</th><th>Nama</th></>;
    return <><th>Hari</th><th>Jam</th><th>Mata Kuliah</th><th>Dosen</th><th>Kelas</th></>;
  }

  function cells(r: any) {
    if (tab === "mahasiswa") return <><td>{r.nim}</td><td>{r.nama}</td><td>{r.kelas?.kode || "-"}</td></>;
    if (tab === "dosen") return <><td>{r.nidn}</td><td>{r.nama}</td></>;
    if (tab === "matakuliah") return <><td>{r.namaMatakuliah}</td><td>{r.sks}</td></>;
    if (tab === "kelas") return <><td>{r.kode}</td><td>{r.nama}</td></>;
    return <><td>{r.hari}</td><td>{r.jamMulai}–{r.jamSelesai}</td><td>{r.matakuliah?.namaMatakuliah}</td><td>{r.dosen?.nama}</td><td>{r.kelas?.kode}</td></>;
  }

  return <div className="admin-shell">
    <div className="admin-tabs">
      {tabs.map(x => <button type="button" key={x[0]} className={tab === x[0] ? "tab active" : "tab"} onClick={() => { setTab(x[0]); setEditing(null); setForm(blank); setImportFile(null); setMsg(""); }}>{x[1]}</button>)}
    </div>

    <section className="card admin-form">
      <div className="section-head">
        <div>
          <h2>{editing ? "Edit" : "Tambah"} {tabs.find(x => x[0] === tab)?.[1]}</h2>
          <p className="muted">Data hanya berlaku untuk fakultas admin.</p>
          {editing && (tab === "mahasiswa" || tab === "dosen") && <p className="notice">Password baru bersifat opsional. Kosongkan jika password login tidak ingin diubah.</p>}
        </div>
        {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(blank); }}>Batal</button>}
      </div>

      <form onSubmit={save} className="admin-fields">
        {tab === "mahasiswa" && <><input placeholder="NIM" value={form.nim} disabled={!!editing} onChange={e => set("nim", e.target.value)} required /><input placeholder="Nama" value={form.nama} onChange={e => set("nama", e.target.value)} required /><select value={form.kelasId} onChange={e => set("kelasId", e.target.value)} required><option value="">Pilih kelas</option>{classes.map(x => <option key={x.id} value={x.id}>{x.kode} — {x.nama}</option>)}</select><input type="password" placeholder={editing ? "Password Baru (kosongkan jika tidak diubah)" : "Password"} value={form.password} onChange={e => set("password", e.target.value)} required={!editing} /></>}
        {tab === "dosen" && <><input placeholder="NIDN" value={form.nidn} disabled={!!editing} onChange={e => set("nidn", e.target.value)} required /><input placeholder="Nama" value={form.nama} onChange={e => set("nama", e.target.value)} required /><input type="password" placeholder={editing ? "Password Baru (kosongkan jika tidak diubah)" : "Password"} value={form.password} onChange={e => set("password", e.target.value)} required={!editing} /></>}
        {tab === "matakuliah" && <><input placeholder="Nama mata kuliah" value={form.namaMatakuliah} onChange={e => set("namaMatakuliah", e.target.value)} required /><input type="number" min="1" max="6" value={form.sks} onChange={e => set("sks", e.target.value)} required /></>}
        {tab === "kelas" && <><input placeholder="Kode kelas" value={form.kode} onChange={e => set("kode", e.target.value)} required /><input placeholder="Nama kelas" value={form.nama} onChange={e => set("nama", e.target.value)} required /></>}
        {tab === "jadwal" && <><select value={form.hari} onChange={e => set("hari", e.target.value)}>{["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map(x => <option key={x}>{x}</option>)}</select><input type="time" value={form.jamMulai} onChange={e => set("jamMulai", e.target.value)} required /><input type="time" value={form.jamSelesai} onChange={e => set("jamSelesai", e.target.value)} required /><select value={form.matakuliahId} onChange={e => set("matakuliahId", e.target.value)} required><option value="">Mata kuliah</option>{mks.map(x => <option key={x.id} value={x.id}>{x.namaMatakuliah}</option>)}</select><select value={form.dosenId} onChange={e => set("dosenId", e.target.value)} required><option value="">Dosen</option>{dosens.map(x => <option key={x.id} value={x.id}>{x.nama}</option>)}</select><select value={form.kelasId} onChange={e => set("kelasId", e.target.value)} required><option value="">Kelas</option>{classes.map(x => <option key={x.id} value={x.id}>{x.kode}</option>)}</select></>}
        <button className="btn primary">{editing ? "Simpan Perubahan" : "Tambah Data"}</button>
      </form>

      {importTabs.includes(tab) && <div className="admin-import-box">
        <div>
          <h3>Import Excel / CSV</h3>
          <p className="muted">{importHelp[tab]}</p>
        </div>
        <div className="admin-import-row">
          <input id="admin-import-file" type="file" accept=".xlsx,.xls,.csv" onChange={e => setImportFile(e.target.files?.[0] ?? null)} />
          <button type="button" className="btn secondary" onClick={importData} disabled={importing}>{importing ? "Mengimport..." : "Upload & Import"}</button>
        </div>
        <p className="import-note">Maksimal 5 MB. Untuk jadwal, nama mata kuliah, NIDN, dan kode kelas harus sudah tersedia di data master. Untuk mahasiswa/dosen, password kosong akan memakai <code>12345678</code>.</p>
      </div>}

      {msg && <p className="notice">{msg}</p>}
    </section>

    <section className="card">
      <div className="section-head"><h2>Daftar {tabs.find(x => x[0] === tab)?.[1]}</h2><span className="count">{rows.length} data</span></div>
      <div className="table-wrap"><table><thead><tr>{headers()}<th>Aksi</th></tr></thead><tbody>{rows.map(r => <tr key={tab === "mahasiswa" ? r.nim : r.id}>{cells(r)}<td><button type="button" className="btn small" onClick={() => edit(r)}>Edit</button>{" "}<button type="button" className="btn small danger" onClick={() => remove(tab === "mahasiswa" ? r.nim : r.id)}>Hapus</button></td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
