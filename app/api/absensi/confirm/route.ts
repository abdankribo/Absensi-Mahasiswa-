import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const qrToken = String(token || "").trim();
    if (!qrToken) return NextResponse.json({ error: "QR absensi tidak valid." }, { status: 400 });

    const record = await prisma.absensi.findUnique({ where: { qrToken } });
    if (!record) return NextResponse.json({ error: "Sesi absensi tidak ditemukan." }, { status: 404 });
    if (record.status === "Hadir") return NextResponse.json({ status: "already-recorded" });

    await prisma.absensi.update({ where: { id: record.id }, data: { status: "Hadir" } });
    return NextResponse.json({ status: "confirmed" });
  } catch {
    return NextResponse.json({ error: "Gagal mengonfirmasi absensi." }, { status: 500 });
  }
}
