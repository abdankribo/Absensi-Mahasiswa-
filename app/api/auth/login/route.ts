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
  } catch { return NextResponse.json({error:"Login gagal."},{status:500}); }
}
