import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user=await getSession();
  if(!user||user.role!=="DOSEN"||!user.dosen||user.facultyId==null)return NextResponse.json({error:"Akses ditolak."},{status:403});
  const facultyId=user.facultyId;
  const jadwals=await prisma.jadwal.findMany({where:{facultyId,dosenId:user.dosen.id},include:{matakuliah:true,kelas:true},orderBy:[{hari:"asc"},{jamMulai:"asc"}]});
  return NextResponse.json(jadwals);
}

export async function POST(req:Request) {
  const user=await getSession();
  if(!user||user.role!=="DOSEN"||!user.dosen||user.facultyId==null)return NextResponse.json({error:"Akses ditolak."},{status:403});
  const facultyId=user.facultyId;
  const body=await req.json();const jadwalId=Number(body.jadwalId);
  const jadwal=await prisma.jadwal.findFirst({where:{id:jadwalId,facultyId:user.facultyId,dosenId:user.dosen.id},include:{matakuliah:true,kelas:true}});
  if(!jadwal)return NextResponse.json({error:"Jadwal tidak ditemukan atau bukan jadwal Anda."},{status:404});
  const active=await prisma.absensiSession.findFirst({where:{jadwalId,dosenId:user.dosen.id,closedAt:null,expiresAt:{gt:new Date()}}});
  if(active)return NextResponse.json({session:active,jadwal},{status:200});
  const session=await prisma.absensiSession.create({data:{jadwalId,dosenId:user.dosen.id,facultyId:user.facultyId,expiresAt:new Date(Date.now()+15*60*1000)}});
  return NextResponse.json({session,jadwal},{status:201});
}

export async function DELETE(req:Request){const user=await getSession();if(!user||user.role!=="DOSEN"||!user.dosen||user.facultyId==null)return NextResponse.json({error:"Akses ditolak."},{status:403});const facultyId=user.facultyId;const body=await req.json();const session=await prisma.absensiSession.findFirst({where:{id:Number(body.sessionId),dosenId:user.dosen.id,facultyId:user.facultyId}});if(!session)return NextResponse.json({error:"Sesi tidak ditemukan."},{status:404});await prisma.absensiSession.update({where:{id:session.id},data:{closedAt:new Date()}});return NextResponse.json({ok:true});}
