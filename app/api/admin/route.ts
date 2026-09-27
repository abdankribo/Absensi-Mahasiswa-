import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

async function admin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN" || !user.facultyId) return null;
  return user;
}

export async function GET(req: Request) {
  const user = await admin();
  if (!user) return NextResponse.json({ error: "Akses admin ditolak." }, { status: 403 });
  const type = new URL(req.url).searchParams.get("type");
  if (type === "mahasiswa") return NextResponse.json(await prisma.mahasiswa.findMany({ where:{facultyId:user.facultyId}, include:{kelas:true}, orderBy:{nim:"asc"} }));
  if (type === "dosen") return NextResponse.json(await prisma.dosen.findMany({ where:{facultyId:user.facultyId}, include:{user:true}, orderBy:{nidn:"asc"} }));
  if (type === "matakuliah") return NextResponse.json(await prisma.matakuliah.findMany({ where:{facultyId:user.facultyId}, orderBy:{id:"asc"} }));
  if (type === "kelas") return NextResponse.json(await prisma.kelas.findMany({ where:{facultyId:user.facultyId}, orderBy:{kode:"asc"} }));
  if (type === "jadwal") return NextResponse.json(await prisma.jadwal.findMany({ where:{facultyId:user.facultyId}, include:{matakuliah:true,dosen:true,kelas:true}, orderBy:[{hari:"asc"},{jamMulai:"asc"}] }));
  return NextResponse.json({ error:"Tipe data tidak valid." }, {status:400});
}

export async function POST(req: Request) {
  const user = await admin();
  if (!user) return NextResponse.json({error:"Akses admin ditolak."},{status:403});
  const body = await req.json();
  try {
    if (body.type === "mahasiswa") {
      const nim=String(body.nim||"").trim(), nama=String(body.nama||"").trim(), kelasId=Number(body.kelasId), password=String(body.password||"");
      if(!nim||!nama||!Number.isInteger(kelasId)||!password) return NextResponse.json({error:"NIM, nama, kelas, dan password wajib diisi."},{status:400});
      const kelas=await prisma.kelas.findFirst({where:{id:kelasId,facultyId:user.facultyId}}); if(!kelas) return NextResponse.json({error:"Kelas bukan milik fakultas admin."},{status:400});
      const mahasiswa=await prisma.mahasiswa.create({data:{nim,nama,facultyId:user.facultyId,kelasId}});
      await prisma.user.create({data:{name:nama,identifier:nim,passwordHash:hashPassword(password),role:"MAHASISWA",facultyId:user.facultyId,mahasiswa:{connect:{nim}}}});
      return NextResponse.json(mahasiswa,{status:201});
    }
    if (body.type === "dosen") {
      const nidn=String(body.nidn||"").trim(), nama=String(body.nama||"").trim(), password=String(body.password||"");
      if(!nidn||!nama||!password) return NextResponse.json({error:"NIDN, nama, dan password wajib diisi."},{status:400});
      const userCreated=await prisma.user.create({data:{name:nama,identifier:nidn,passwordHash:hashPassword(password),role:"DOSEN",facultyId:user.facultyId}});
      const dosen=await prisma.dosen.create({data:{nidn,nama,userId:userCreated.id,facultyId:user.facultyId}});
      return NextResponse.json(dosen,{status:201});
    }
    if (body.type === "matakuliah") {
      const namaMatakuliah=String(body.namaMatakuliah||"").trim(), sks=Number(body.sks);
      if(!namaMatakuliah||!Number.isInteger(sks)||sks<1) return NextResponse.json({error:"Nama mata kuliah dan SKS valid wajib diisi."},{status:400});
      return NextResponse.json(await prisma.matakuliah.create({data:{namaMatakuliah,sks,facultyId:user.facultyId}}),{status:201});
    }
    if (body.type === "kelas") {
      const kode=String(body.kode||"").trim(), nama=String(body.nama||"").trim();
      if(!kode||!nama) return NextResponse.json({error:"Kode dan nama kelas wajib diisi."},{status:400});
      return NextResponse.json(await prisma.kelas.create({data:{kode,nama,facultyId:user.facultyId}}),{status:201});
    }
    if (body.type === "jadwal") {
      const hari=String(body.hari||"").trim(), jamMulai=String(body.jamMulai||"").trim(), jamSelesai=String(body.jamSelesai||"").trim();
      const matakuliahId=Number(body.matakuliahId), dosenId=Number(body.dosenId), kelasId=Number(body.kelasId);
      const [mk,dosen,kelas]=await Promise.all([
        prisma.matakuliah.findFirst({where:{id:matakuliahId,facultyId:user.facultyId}}),
        prisma.dosen.findFirst({where:{id:dosenId,facultyId:user.facultyId}}),
        prisma.kelas.findFirst({where:{id:kelasId,facultyId:user.facultyId}})
      ]);
      if(!hari||!jamMulai||!Number.isInteger(matakuliahId)||!Number.isInteger(dosenId)||!Number.isInteger(kelasId)||!mk||!dosen||!kelas) return NextResponse.json({error:"Data jadwal tidak lengkap atau lintas fakultas."},{status:400});
      const assigned=await prisma.dosenMatakuliah.findUnique({where:{dosenId_matakuliahId:{dosenId,matakuliahId}}});
      if(!assigned) await prisma.dosenMatakuliah.create({data:{dosenId,matakuliahId}});
      return NextResponse.json(await prisma.jadwal.create({data:{hari,jamMulai,jamSelesai:jamSelesai||null,matakuliahId,facultyId:user.facultyId,dosenId,kelasId}}),{status:201});
    }
    return NextResponse.json({error:"Tipe data tidak valid."},{status:400});
  } catch { return NextResponse.json({error:"Data tidak dapat disimpan. Periksa data unik atau relasi."},{status:400}); }
}

export async function PATCH(req: Request) {
  const user=await admin(); if(!user)return NextResponse.json({error:"Akses admin ditolak."},{status:403});
  const body=await req.json(); const id=Number(body.id);
  try {
    if(body.type==="mahasiswa"){const old=await prisma.mahasiswa.findFirst({where:{nim:String(body.nim),facultyId:user.facultyId}});if(!old)return NextResponse.json({error:"Mahasiswa tidak ditemukan."},{status:404});const nama=String(body.nama||"").trim(),kelasId=Number(body.kelasId);if(!nama||!Number.isInteger(kelasId))return NextResponse.json({error:"Data tidak lengkap."},{status:400});const kelas=await prisma.kelas.findFirst({where:{id:kelasId,facultyId:user.facultyId}});if(!kelas)return NextResponse.json({error:"Kelas tidak valid."},{status:400});const m=await prisma.mahasiswa.update({where:{nim:old.nim},data:{nama,kelasId}});await prisma.user.updateMany({where:{identifier:old.nim,facultyId:user.facultyId},data:{name:nama}});return NextResponse.json(m);}
    if(body.type==="dosen"){const dosen=await prisma.dosen.findFirst({where:{id,facultyId:user.facultyId}});if(!dosen)return NextResponse.json({error:"Dosen tidak ditemukan."},{status:404});const nama=String(body.nama||"").trim();if(!nama)return NextResponse.json({error:"Nama wajib diisi."},{status:400});const d=await prisma.dosen.update({where:{id},data:{nama}});await prisma.user.update({where:{id:dosen.userId},data:{name:nama}});return NextResponse.json(d);}
    if(body.type==="matakuliah"){const mk=await prisma.matakuliah.findFirst({where:{id,facultyId:user.facultyId}});if(!mk)return NextResponse.json({error:"Mata kuliah tidak ditemukan."},{status:404});return NextResponse.json(await prisma.matakuliah.update({where:{id},data:{namaMatakuliah:String(body.namaMatakuliah||"").trim(),sks:Number(body.sks)}}));}
    if(body.type==="kelas"){const k=await prisma.kelas.findFirst({where:{id,facultyId:user.facultyId}});if(!k)return NextResponse.json({error:"Kelas tidak ditemukan."},{status:404});return NextResponse.json(await prisma.kelas.update({where:{id},data:{kode:String(body.kode||"").trim(),nama:String(body.nama||"").trim()}}));}
    if(body.type==="jadwal"){const j=await prisma.jadwal.findFirst({where:{id,facultyId:user.facultyId}});if(!j)return NextResponse.json({error:"Jadwal tidak ditemukan."},{status:404});const [mk,dosen,kelas]=await Promise.all([prisma.matakuliah.findFirst({where:{id:Number(body.matakuliahId),facultyId:user.facultyId}}),prisma.dosen.findFirst({where:{id:Number(body.dosenId),facultyId:user.facultyId}}),prisma.kelas.findFirst({where:{id:Number(body.kelasId),facultyId:user.facultyId}})]);if(!mk||!dosen||!kelas)return NextResponse.json({error:"Relasi jadwal tidak valid."},{status:400});await prisma.dosenMatakuliah.upsert({where:{dosenId_matakuliahId:{dosenId:dosen.id,matakuliahId:mk.id}},update:{},create:{dosenId:dosen.id,matakuliahId:mk.id}});return NextResponse.json(await prisma.jadwal.update({where:{id},data:{hari:String(body.hari||"").trim(),jamMulai:String(body.jamMulai||"").trim(),jamSelesai:String(body.jamSelesai||"").trim()||null,matakuliahId:Number(body.matakuliahId),dosenId:Number(body.dosenId),kelasId:Number(body.kelasId)}}));}
    return NextResponse.json({error:"Tipe data tidak valid."},{status:400});
  } catch { return NextResponse.json({error:"Data gagal diperbarui."},{status:400}); }
}

export async function DELETE(req: Request) {
  const user=await admin();if(!user)return NextResponse.json({error:"Akses admin ditolak."},{status:403});
  const body=await req.json();const id=String(body.id);try{
    if(body.type==="mahasiswa"){const m=await prisma.mahasiswa.findFirst({where:{nim:id,facultyId:user.facultyId}});if(!m)return NextResponse.json({error:"Mahasiswa tidak ditemukan."},{status:404});await prisma.user.deleteMany({where:{identifier:m.nim,facultyId:user.facultyId}});await prisma.mahasiswa.delete({where:{nim:m.nim}});}
    else if(body.type==="dosen"){const d=await prisma.dosen.findFirst({where:{id:Number(id),facultyId:user.facultyId}});if(!d)return NextResponse.json({error:"Dosen tidak ditemukan."},{status:404});await prisma.dosen.delete({where:{id:d.id}});await prisma.user.delete({where:{id:d.userId}});}
    else if(body.type==="matakuliah"){const mk=await prisma.matakuliah.findFirst({where:{id:Number(id),facultyId:user.facultyId}});if(!mk)return NextResponse.json({error:"Mata kuliah tidak ditemukan."},{status:404});await prisma.matakuliah.delete({where:{id:mk.id}});}
    else if(body.type==="kelas"){const k=await prisma.kelas.findFirst({where:{id:Number(id),facultyId:user.facultyId}});if(!k)return NextResponse.json({error:"Kelas tidak ditemukan."},{status:404});await prisma.kelas.delete({where:{id:k.id}});}
    else if(body.type==="jadwal"){const j=await prisma.jadwal.findFirst({where:{id:Number(id),facultyId:user.facultyId}});if(!j)return NextResponse.json({error:"Jadwal tidak ditemukan."},{status:404});await prisma.jadwal.delete({where:{id:j.id}});}
    else return NextResponse.json({error:"Tipe data tidak valid."},{status:400});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:"Data tidak dapat dihapus. Kemungkinan masih dipakai oleh jadwal/absensi."},{status:409});}
}
