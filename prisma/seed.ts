import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "ChangeMe123!";

async function main() {
  const teknik = await prisma.faculty.upsert({where:{code:"FT"},update:{name:"Fakultas Teknik"},create:{code:"FT",name:"Fakultas Teknik"}});
  await prisma.faculty.upsert({where:{code:"FE"},update:{name:"Fakultas Ekonomi"},create:{code:"FE",name:"Fakultas Ekonomi"}});

  const admin = await prisma.user.upsert({where:{identifier:"admin.teknik"},update:{name:"Admin Fakultas Teknik",role:"ADMIN",facultyId:teknik.id},create:{name:"Admin Fakultas Teknik",identifier:"admin.teknik",passwordHash:hashPassword(DEFAULT_PASSWORD),role:"ADMIN",facultyId:teknik.id}});
  const dosenUser = await prisma.user.upsert({where:{identifier:"0123456789"},update:{name:"Dr. Budi Santoso",role:"DOSEN",facultyId:teknik.id},create:{name:"Dr. Budi Santoso",identifier:"0123456789",passwordHash:hashPassword(DEFAULT_PASSWORD),role:"DOSEN",facultyId:teknik.id}});
  const dosen = await prisma.dosen.upsert({where:{nidn:"0123456789"},update:{nama:"Dr. Budi Santoso",userId:dosenUser.id,facultyId:teknik.id},create:{nidn:"0123456789",nama:"Dr. Budi Santoso",userId:dosenUser.id,facultyId:teknik.id}});
  const kelas = await prisma.kelas.upsert({where:{kode:"TI-4A"},update:{nama:"Teknik Informatika 4A",facultyId:teknik.id},create:{kode:"TI-4A",nama:"Teknik Informatika 4A",facultyId:teknik.id}});

  const m1=await prisma.mahasiswa.upsert({where:{nim:"20240001"},update:{nama:"Ahmad Fauzan",facultyId:teknik.id,kelasId:kelas.id},create:{nim:"20240001",nama:"Ahmad Fauzan",facultyId:teknik.id,kelasId:kelas.id}});
  const m2=await prisma.mahasiswa.upsert({where:{nim:"20240002"},update:{nama:"Siti Rahma",facultyId:teknik.id,kelasId:kelas.id},create:{nim:"20240002",nama:"Siti Rahma",facultyId:teknik.id,kelasId:kelas.id}});
  for (const m of [m1,m2]) {
    const u=await prisma.user.upsert({where:{identifier:m.nim},update:{name:m.nama,role:"MAHASISWA",facultyId:teknik.id},create:{name:m.nama,identifier:m.nim,passwordHash:hashPassword(DEFAULT_PASSWORD),role:"MAHASISWA",facultyId:teknik.id}});
    await prisma.mahasiswa.update({where:{nim:m.nim},data:{userId:u.id}});
  }

  const mk=await prisma.matakuliah.upsert({where:{id:1},update:{namaMatakuliah:"Pemrograman Web",sks:3,facultyId:teknik.id},create:{id:1,namaMatakuliah:"Pemrograman Web",sks:3,facultyId:teknik.id}});
  const mk2=await prisma.matakuliah.upsert({where:{id:2},update:{namaMatakuliah:"Basis Data",sks:3,facultyId:teknik.id},create:{id:2,namaMatakuliah:"Basis Data",sks:3,facultyId:teknik.id}});
  await prisma.dosenMatakuliah.upsert({where:{dosenId_matakuliahId:{dosenId:dosen.id,matakuliahId:mk.id}},update:{},create:{dosenId:dosen.id,matakuliahId:mk.id}});
  await prisma.dosenMatakuliah.upsert({where:{dosenId_matakuliahId:{dosenId:dosen.id,matakuliahId:mk2.id}},update:{},create:{dosenId:dosen.id,matakuliahId:mk2.id}});

  const j1=await prisma.jadwal.upsert({where:{id:1},update:{hari:"Senin",jamMulai:"08:00",jamSelesai:"10:30",matakuliahId:mk.id,facultyId:teknik.id,dosenId:dosen.id,kelasId:kelas.id},create:{id:1,hari:"Senin",jamMulai:"08:00",jamSelesai:"10:30",matakuliahId:mk.id,facultyId:teknik.id,dosenId:dosen.id,kelasId:kelas.id}});
  await prisma.jadwal.upsert({where:{id:2},update:{hari:"Rabu",jamMulai:"10:00",jamSelesai:"12:30",matakuliahId:mk2.id,facultyId:teknik.id,dosenId:dosen.id,kelasId:kelas.id},create:{id:2,hari:"Rabu",jamMulai:"10:00",jamSelesai:"12:30",matakuliahId:mk2.id,facultyId:teknik.id,dosenId:dosen.id,kelasId:kelas.id}});

  const session=await prisma.absensiSession.upsert({where:{id:1},update:{jadwalId:j1.id,dosenId:dosen.id,facultyId:teknik.id,expiresAt:new Date(Date.now()+3600000)},create:{id:1,jadwalId:j1.id,dosenId:dosen.id,facultyId:teknik.id,expiresAt:new Date(Date.now()+3600000)}});
  await prisma.absensi.upsert({where:{id:1},update:{mahasiswaId:m1.nim,jadwalId:j1.id,matakuliahId:mk.id,sessionId:session.id,facultyId:teknik.id,tanggalAbsensi:new Date(),status:"Hadir"},create:{id:1,mahasiswaId:m1.nim,jadwalId:j1.id,matakuliahId:mk.id,sessionId:session.id,facultyId:teknik.id,tanggalAbsensi:new Date(),status:"Hadir"}});
  console.log("Seed multi-role selesai",admin.identifier);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
