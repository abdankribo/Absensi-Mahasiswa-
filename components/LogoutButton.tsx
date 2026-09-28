"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout gagal");
      window.location.href = "/login";
    } catch {
      setLoading(false);
      window.alert("Logout gagal. Silakan coba lagi.");
    }
  }

  return (
    <button type="button" className="logout-button" onClick={logout} disabled={loading}>
      <span aria-hidden="true">↪</span>
      {loading ? "Keluar..." : "Logout"}
    </button>
  );
}
