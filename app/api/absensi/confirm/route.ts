import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const attendanceId = Number(id);
    if (!Number.isInteger(attendanceId) || attendanceId < 1) return NextResponse.json({ error: "QR absensi tidak valid." }, { status: 400 });
    const record = await prisma.absensi.findUnique({ where: { id: attendanceId } });
    if (!record) return NextResponse.json({ error: "Data absensi tidak ditemukan." }, { status: 404 });
    if (record.status === "Hadir") return NextResponse.json({ status: "already-recorded" });
    await prisma.absensi.update({ where: { id: attendanceId }, data: { status: "Hadir" } });
    return NextResponse.json({ status: "confirmed" });
  } catch { return NextResponse.json({ error: "Gagal mengonfirmasi absensi." }, { status: 500 }); }
}
