import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req:Request){
  const user=await getSession();
  if(!user||user.role!=="MAHASISWA"||!user.mahasiswa||!user.facultyId)return NextResponse.json({error:"Akses mahasiswa ditolak."},{status:403});
  const body=await req.json();const token=String(body.token||"").trim();
  if(!token)return NextResponse.json({error:"Token QR tidak ditemukan."},{status:400});
  const session=await prisma.absensiSession.findUnique({where:{qrToken:token},include:{jadwal:{include:{matakuliah:true,kelas:true}},dosen:true}});
  if(!session)return NextResponse.json({error:"QR absensi tidak valid."},{status:404});
  if(session.facultyId!==user.facultyId||session.jadwal.facultyId!==user.facultyId)return NextResponse.json({error:"QR berasal dari fakultas yang berbeda."},{status:403});
  if(session.closedAt||session.expiresAt<=new Date())return NextResponse.json({error:"Sesi absensi sudah ditutup atau kedaluwarsa."},{status:410});
  if(!session.jadwal.kelasId||!user.mahasiswa.kelasId||session.jadwal.kelasId!==user.mahasiswa.kelasId)return NextResponse.json({error:"Anda bukan mahasiswa pada kelas jadwal ini."},{status:403});
  if(session.jadwal.matakuliahId!==session.jadwal.matakuliah.id)return NextResponse.json({error:"Jadwal dan mata kuliah tidak sesuai."},{status:400});
  const existing=await prisma.absensi.findUnique({where:{sessionId_mahasiswaId:{sessionId:session.id,mahasiswaId:user.mahasiswa.nim}}});
  if(existing)return NextResponse.json({error:"Anda sudah melakukan absensi pada sesi ini.",absensi:existing},{status:409});
  const absensi=await prisma.absensi.create({data:{mahasiswaId:user.mahasiswa.nim,jadwalId:session.jadwalId,matakuliahId:session.jadwal.matakuliahId,sessionId:session.id,facultyId:user.facultyId,tanggalAbsensi:new Date(),status:"Hadir"}});
  return NextResponse.json({ok:true,absensi},{status:201});
}
