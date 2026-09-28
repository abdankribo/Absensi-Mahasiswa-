import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const DEFAULT_PASSWORD = "12345678";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function text(value: unknown) {
  return String(value ?? "").trim();
}

function normalize(value: unknown) {
  return text(value).toLowerCase().replace(/[\s_-]+/g, "");
}

function first(row: Record<string, unknown>, names: string[]) {
  const entries = Object.entries(row);
  for (const name of names) {
    const wanted = normalize(name);
    const hit = entries.find(([key]) => normalize(key) === wanted);
    if (hit) return text(hit[1]);
  }
  return "";
}

function rowsFromWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("File tidak memiliki sheet.");
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN" || user.facultyId == null) {
    return NextResponse.json({ error: "Akses admin ditolak." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const type = text(formData.get("type"));
    const file = formData.get("file");

    if (!["mahasiswa", "dosen", "matakuliah", "jadwal"].includes(type)) {
      return NextResponse.json({ error: "Jenis import tidak valid." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File Excel atau CSV wajib dipilih." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 400 });
    }

    const rows = rowsFromWorkbook(Buffer.from(await file.arrayBuffer()));
    if (!rows.length) {
      return NextResponse.json({ error: "File tidak memiliki data." }, { status: 400 });
    }

    let imported = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let index = 0; index < rows.length; index++) {
      const rowNumber = index + 2;
      const row = rows[index];

      try {
        if (type === "mahasiswa") {
          const nim = first(row, ["nim"]);
          const nama = first(row, ["nama", "nama_mahasiswa"]);
          const kelasKode = first(row, ["kelas", "kode_kelas"]);
          const password = first(row, ["password"]) || DEFAULT_PASSWORD;

          if (!nim || !nama || !kelasKode) throw new Error("NIM, nama, dan kelas wajib diisi.");
          if (password.length < 6) throw new Error("Password minimal 6 karakter.");

          const kelas = await prisma.kelas.findFirst({
            where: { kode: kelasKode, facultyId: user.facultyId },
          });
          if (!kelas) throw new Error(`Kelas "${kelasKode}" tidak ditemukan pada fakultas admin.`);

          await prisma.$transaction(async (tx) => {
            const existing = await tx.mahasiswa.findUnique({ where: { nim } });
            if (existing) throw new Error(`NIM "${nim}" sudah terdaftar.`);

            const mahasiswa = await tx.mahasiswa.create({
              data: { nim, nama, facultyId: user.facultyId!, kelasId: kelas.id },
            });

            await tx.user.create({
              data: {
                name: nama,
                identifier: nim,
                passwordHash: hashPassword(password),
                role: "MAHASISWA",
                facultyId: user.facultyId!,
                mahasiswa: { connect: { nim: mahasiswa.nim } },
              },
            });
          });
        }

        if (type === "dosen") {
          const nidn = first(row, ["nidn"]);
          const nama = first(row, ["nama", "nama_dosen"]);
          const password = first(row, ["password"]) || DEFAULT_PASSWORD;

          if (!nidn || !nama) throw new Error("NIDN dan nama wajib diisi.");
          if (password.length < 6) throw new Error("Password minimal 6 karakter.");

          await prisma.$transaction(async (tx) => {
            const existing = await tx.dosen.findUnique({ where: { nidn } });
            if (existing) throw new Error(`NIDN "${nidn}" sudah terdaftar.`);

            const createdUser = await tx.user.create({
              data: {
                name: nama,
                identifier: nidn,
                passwordHash: hashPassword(password),
                role: "DOSEN",
                facultyId: user.facultyId!,
              },
            });

            await tx.dosen.create({
              data: { nidn, nama, userId: createdUser.id, facultyId: user.facultyId! },
            });
          });
        }

        if (type === "matakuliah") {
          const namaMatakuliah = first(row, ["namaMatakuliah", "nama_mata_kuliah", "mata_kuliah", "nama"]);
          const sks = Number(first(row, ["sks"]));

          if (!namaMatakuliah || !Number.isInteger(sks) || sks < 1 || sks > 6) {
            throw new Error("Nama mata kuliah dan SKS 1-6 wajib diisi.");
          }

          await prisma.matakuliah.create({
            data: { namaMatakuliah, sks, facultyId: user.facultyId },
          });
        }

        if (type === "jadwal") {
          const hari = first(row, ["hari"]);
          const jamMulai = first(row, ["jamMulai", "jam_mulai"]);
          const jamSelesai = first(row, ["jamSelesai", "jam_selesai"]);
          const matakuliahNama = first(row, ["matakuliah", "mata_kuliah", "nama_matakuliah"]);
          const matakuliahId = Number(first(row, ["matakuliahId", "mata_kuliah_id"]));
          const nidn = first(row, ["nidn", "dosen"]);
          const dosenId = Number(first(row, ["dosenId", "dosen_id"]));
          const kelasKode = first(row, ["kelas", "kode_kelas"]);
          const kelasId = Number(first(row, ["kelasId", "kelas_id"]));

          if (!hari || !jamMulai) throw new Error("Hari dan jam mulai wajib diisi.");

          const matakuliah = Number.isInteger(matakuliahId) && matakuliahId > 0
            ? await prisma.matakuliah.findFirst({ where: { id: matakuliahId, facultyId: user.facultyId } })
            : await prisma.matakuliah.findFirst({ where: { namaMatakuliah: matakuliahNama, facultyId: user.facultyId } });

          const dosen = Number.isInteger(dosenId) && dosenId > 0
            ? await prisma.dosen.findFirst({ where: { id: dosenId, facultyId: user.facultyId } })
            : await prisma.dosen.findFirst({ where: { nidn, facultyId: user.facultyId } });

          const kelas = Number.isInteger(kelasId) && kelasId > 0
            ? await prisma.kelas.findFirst({ where: { id: kelasId, facultyId: user.facultyId } })
            : await prisma.kelas.findFirst({ where: { kode: kelasKode, facultyId: user.facultyId } });

          if (!matakuliah) throw new Error("Mata kuliah tidak ditemukan pada fakultas admin.");
          if (!dosen) throw new Error("Dosen tidak ditemukan pada fakultas admin.");
          if (!kelas) throw new Error("Kelas tidak ditemukan pada fakultas admin.");

          await prisma.dosenMatakuliah.upsert({
            where: { dosenId_matakuliahId: { dosenId: dosen.id, matakuliahId: matakuliah.id } },
            update: {},
            create: { dosenId: dosen.id, matakuliahId: matakuliah.id },
          });

          await prisma.jadwal.create({
            data: {
              hari,
              jamMulai,
              jamSelesai: jamSelesai || null,
              matakuliahId: matakuliah.id,
              facultyId: user.facultyId,
              dosenId: dosen.id,
              kelasId: kelas.id,
            },
          });
        }

        imported++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Data tidak dapat diimport.",
        });
      }
    }

    return NextResponse.json({
      ok: errors.length === 0,
      imported,
      failed: errors.length,
      errors: errors.slice(0, 50),
      defaultPasswordUsed: type === "mahasiswa" || type === "dosen" ? DEFAULT_PASSWORD : null,
    });
  } catch (error) {
    console.error("ADMIN_IMPORT_ERROR", error);
    return NextResponse.json({ error: "File tidak dapat diproses. Pastikan format Excel/CSV benar." }, { status: 400 });
  }
}
