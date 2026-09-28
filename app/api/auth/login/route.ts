import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession, verifyPassword } from "@/lib/auth";

function errorResponse(category: string, error: unknown) {
  console.error("LOGIN_ERROR", category, error);
  return NextResponse.json(
    { error: "Login gagal.", diagnostic: category },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier ?? "").trim();
    const password = String(body.password ?? "");

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "ID/NIM/NIDN dan password wajib diisi." },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { identifier },
        include: { faculty: true },
      });
    } catch (error) {
      return errorResponse("DATABASE_ERROR", error);
    }

    if (!user) {
      return NextResponse.json(
        { error: "ID atau password salah." },
        { status: 401 }
      );
    }

    let validPassword = false;
    try {
      validPassword = verifyPassword(password, user.passwordHash);
    } catch (error) {
      return errorResponse("PASSWORD_ERROR", error);
    }

    if (!validPassword) {
      return NextResponse.json(
        { error: "ID atau password salah." },
        { status: 401 }
      );
    }

    try {
      await setSession(user.id);
    } catch (error) {
      return errorResponse("SESSION_ERROR", error);
    }

    return NextResponse.json({
      ok: true,
      role: user.role,
      name: user.name,
      faculty: user.faculty?.name ?? null,
    });
  } catch (error) {
    return errorResponse("UNKNOWN_ERROR", error);
  }
}
