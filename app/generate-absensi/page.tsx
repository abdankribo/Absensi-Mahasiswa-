import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GenerateAbsensi({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const attendanceId = Number(id);

  if (!Number.isInteger(attendanceId) || attendanceId < 1) redirect("/absensi?error=invalid-qr");

  const record = await prisma.absensi.findUnique({ where: { id: attendanceId } });
  if (!record) redirect("/absensi?error=qr-not-found");
  if (record.status === "Hadir") redirect("/absensi?success=already-recorded");

  await prisma.absensi.update({ where: { id: attendanceId }, data: { status: "Hadir" } });
  redirect("/absensi?success=attendance-recorded");
}
