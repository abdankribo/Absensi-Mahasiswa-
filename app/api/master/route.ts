import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || !["ADMIN", "DOSEN"].includes(user.role) || user.facultyId == null) {
    return NextResponse.json({ error: "Akses data master ditolak." }, { status: 403 });
  }

  const [mahasiswa, matakuliah, jadwal] = await Promise.all([
    prisma.mahasiswa.findMany({ where: { facultyId: user.facultyId }, orderBy: { nim: "asc" } }),
    prisma.matakuliah.findMany({ where: { facultyId: user.facultyId }, orderBy: { id: "asc" } }),
    prisma.jadwal.findMany({
      where: { facultyId: user.facultyId },
      include: { matakuliah: true },
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    }),
  ]);

  return NextResponse.json({ mahasiswa, matakuliah, jadwal });
}
