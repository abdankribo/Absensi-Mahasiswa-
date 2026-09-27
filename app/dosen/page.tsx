import { requireRole } from "@/lib/authorization";
import DosenClient from "./client";
export default async function DosenPage(){const user=await requireRole("DOSEN");return <div><div className="top"><div><h1 className="title">Dashboard Dosen</h1><p className="muted">{user.name} · NIDN {user.dosen?.nidn} · {user.faculty?.name}</p></div></div><DosenClient/></div>}
