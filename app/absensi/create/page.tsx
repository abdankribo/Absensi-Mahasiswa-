import { requireRole } from "@/lib/authorization";
import CreateAbsensiClient from "./client";

export default async function CreateAbsensiPage() {
  await requireRole("ADMIN", "DOSEN");
  return <CreateAbsensiClient />;
}
