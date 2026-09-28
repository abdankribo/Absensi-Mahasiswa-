import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier ?? "").trim();
    const password = String(body.password ?? "");
    if (!identifier || !password) return NextResponse.json({error:"ID/NIM/NIDN dan password wajib diisi."},{status:400});
    const user = await prisma.user.findUnique({where:{identifier},include:{faculty:true}});
    if (!user || !verifyPassword(password,user.passwordHash)) return NextResponse.json({error:"ID atau password salah."},{status:401});
    await setSession(user.id);
    return NextResponse.json({ok:true,role:user.role,name:user.name,faculty:user.faculty?.name ?? null});
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("AUTH_SECRET")) {
      return NextResponse.json({error:"Konfigurasi session server bermasalah (AUTH_SECRET)."}, {status:500});
    }
    if (message.includes("Prisma") || message.includes("database") || message.includes("DATABASE_URL")) {
      return NextResponse.json({error:"Koneksi database server bermasalah."}, {status:500});
    }
    return NextResponse.json({error:"Terjadi kesalahan pada server saat login."},{status:500});
  }
}
