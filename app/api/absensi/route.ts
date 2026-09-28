import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || !["ADMIN", "DOSEN"].includes(user.role) || user.facultyId == null) {
    return NextResponse.json({ error: "Hanya admin atau dosen yang dapat membuat sesi absensi." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const mahasiswaId = String(body.mahasiswaId || "");
    const matakuliahId = Number(body.matakuliahId);
    const jadwalId = Number(body.jadwalId);

    if (!mahasiswaId || !Number.isInteger(matakuliahId) || !Number.isInteger(jadwalId)) {
      return NextResponse.json({ error: "Data absensi tidak lengkap." }, { status: 400 });
    }

    const [m, mk, j] = await Promise.all([
      prisma.mahasiswa.findFirst({ where: { nim: mahasiswaId, facultyId: user.facultyId } }),
      prisma.matakuliah.findFirst({ where: { id: matakuliahId, facultyId: user.facultyId } }),
      prisma.jadwal.findFirst({ where: { id: jadwalId, facultyId: user.facultyId } }),
    ]);

    if (!m || !mk || !j) return NextResponse.json({ error: "Data master tidak ditemukan pada fakultas Anda." }, { status: 404 });
    if (j.matakuliahId !== mk.id) return NextResponse.json({ error: "Jadwal tidak sesuai mata kuliah." }, { status: 400 });

    if (user.role === "DOSEN" && user.dosen && j.dosenId !== user.dosen.id) {
      return NextResponse.json({ error: "Jadwal bukan jadwal mengajar Anda." }, { status: 403 });
    }

    const date = body.tanggalAbsensi ? new Date(body.tanggalAbsensi) : new Date();
    if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "Tanggal absensi tidak valid." }, { status: 400 });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const existing = await prisma.absensi.findFirst({
      where: { mahasiswaId, jadwalId, matakuliahId, tanggalAbsensi: { gte: start, lt: end } },
    });

    if (existing) {
      return NextResponse.json({ error: "Mahasiswa sudah memiliki sesi absensi untuk jadwal ini hari ini.", id: existing.id }, { status: 409 });
    }

    const created = await prisma.absensi.create({
      data: { mahasiswaId, jadwalId, matakuliahId, tanggalAbsensi: date, status: "Menunggu" },
    });

    return NextResponse.json({ id: created.id, token: created.qrToken }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan absensi." }, { status: 500 });
  }
}
