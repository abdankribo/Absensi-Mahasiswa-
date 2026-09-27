import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [mahasiswa, matakuliah, jadwal] = await Promise.all([
    prisma.mahasiswa.findMany({ orderBy: { nim: "asc" } }),
    prisma.matakuliah.findMany({ orderBy: { id: "asc" } }),
    prisma.jadwal.findMany({ include: { matakuliah: true }, orderBy: [{ hari: "asc" }, { jamMulai: "asc" }] }),
  ]);
  return NextResponse.json({ mahasiswa, matakuliah, jadwal });
}
