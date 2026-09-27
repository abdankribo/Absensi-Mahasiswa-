import { createHmac, timingSafeEqual } from "node:crypto";
import { verifyPassword } from "@/lib/password";
export { verifyPassword };
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "absensi_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET harus memiliki minimal 32 karakter.");
  return value;
}
function sign(payload: string) { return createHmac("sha256", secret()).update(payload).digest("base64url"); }
export function createSessionToken(userId: number) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 43200000 })).toString("base64url");
  return payload + "." + sign(payload);
}
function decode(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const a = Buffer.from(signature), b = Buffer.from(sign(payload));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {userId:number; exp:number};
  return data.exp > Date.now() ? data : null;
}
export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const data = decode(token);
  if (!data) return null;
  return prisma.user.findUnique({ where: { id: data.userId }, include: { faculty: true, dosen: true, mahasiswa: true } });
}
export async function setSession(userId: number) {
  (await cookies()).set(COOKIE_NAME, createSessionToken(userId), { httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", path:"/", maxAge:43200 });
}
export async function clearSession() { (await cookies()).delete(COOKIE_NAME); }
