"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router=useRouter(); const [identifier,setIdentifier]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();setError("");setLoading(true);try{const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Login gagal.");router.push(data.role==="ADMIN"?"/admin":data.role==="DOSEN"?"/dosen":"/mahasiswa");router.refresh();}catch(e){setError(e instanceof Error?e.message:"Login gagal.");}finally{setLoading(false);}}
  return <main className="login-page"><div className="login-card"><div className="login-badge">SISTEM ABSENSI</div><h1>Masuk ke Akun</h1><p className="muted">Admin, dosen, dan mahasiswa menggunakan halaman login yang sama.</p><form onSubmit={submit} className="form-stack"><label>ID Admin / NIDN / NIM<input value={identifier} onChange={e=>setIdentifier(e.target.value)} autoComplete="username" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{error&&<div className="error-box">{error}</div>}<button className="btn primary" disabled={loading}>{loading?"Memproses...":"Masuk"}</button></form></div></main>;
}
