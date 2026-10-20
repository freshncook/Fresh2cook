"use client";

export default function ProcessingLogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/processing/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
    >
      Logout
    </button>
  );
}




