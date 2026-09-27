import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { Role } from "@prisma/client";
export async function requireRole(...roles: Role[]) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
