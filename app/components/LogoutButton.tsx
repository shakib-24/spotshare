"use client";

import { createClient } from "@/lib/supabase";

export default function LogoutButton() {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="
        absolute right-4 top-4
        rounded-lg border border-slate-600 bg-slate-800/70 px-4 py-2
        text-xs font-semibold text-slate-300
        backdrop-blur-sm
        transition-colors duration-200
        hover:border-slate-500 hover:bg-slate-700 hover:text-slate-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
        sm:right-6 sm:top-5
      "
    >
      ログアウト
    </button>
  );
}
