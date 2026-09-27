import { PrismaClient } from "@prisma/client";
const prisma=new PrismaClient();
async function main(){
  const m1=await prisma.mahasiswa.upsert({where:{nim:"20240001"},update:{},create:{nim:"20240001",nama:"Ahmad Fauzan"}});
  const m2=await prisma.mahasiswa.upsert({where:{nim:"20240002"},update:{},create:{nim:"20240002",nama:"Siti Rahma"}});
  const mk=await prisma.matakuliah.upsert({where:{id:1},update:{},create:{id:1,namaMatakuliah:"Pemrograman Web",sks:3}});
  const mk2=await prisma.matakuliah.upsert({where:{id:2},update:{},create:{id:2,namaMatakuliah:"Basis Data",sks:3}});
  await prisma.jadwal.upsert({where:{id:1},update:{},create:{id:1,hari:"Senin",jamMulai:"08:00",matakuliahId:mk.id}});
  await prisma.jadwal.upsert({where:{id:2},update:{},create:{id:2,hari:"Rabu",jamMulai:"10:00",matakuliahId:mk2.id}});
  await prisma.absensi.upsert({where:{id:1},update:{},create:{id:1,mahasiswaId:m1.nim,jadwalId:1,matakuliahId:mk.id,tanggalAbsensi:new Date(),status:"Hadir"}});
  console.log("Seed selesai");
}
main().finally(()=>prisma.$disconnect());