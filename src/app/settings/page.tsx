"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../components/theme-provider";

type UserInfo = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
};

type ThemeMode = "light" | "dark";

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme, isDark } = useTheme();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url,
        };
        setUser(userData);
        setEditName(userData.full_name || "");
      }
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return;

    setSaving(true);
    setSaveMsg(null);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: editName.trim() })
      .eq("id", user.id);

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: editName.trim() },
    });

    if (profileError || authError) {
      setSaveMsg({ type: "error", text: "Gagal menyimpan nama. Coba lagi." });
    } else {
      setUser((prev) =>
        prev ? { ...prev, full_name: editName.trim() } : prev
      );
      setSaveMsg({ type: "success", text: "Nama berhasil diperbarui!" });
    }

    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleThemeChange = (nextTheme: ThemeMode) => {
    if (nextTheme === theme) return;
    setTheme(nextTheme);
    setThemeOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          isDark ? "bg-slate-950" : "bg-gray-50"
        }`}
      >
        <p
          className={`text-lg animate-pulse ${
            isDark ? "text-slate-500" : "text-gray-400"
          }`}
        >
          Memuat settings...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center px-6 ${
          isDark ? "bg-slate-950" : "bg-gray-50"
        }`}
      >
        <div
          className={`w-full max-w-sm rounded-3xl p-10 text-center shadow-sm ${
            isDark
              ? "border border-slate-800 bg-slate-900"
              : "border border-slate-100 bg-white"
          }`}
        >
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
              isDark ? "bg-rose-950/60" : "bg-rose-50"
            }`}
          >
            <svg
              className={`h-6 w-6 ${isDark ? "text-rose-300" : "text-rose-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9m0 0V7m0 2h2m-2 0H10"
              />
            </svg>
          </div>

          <h1
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Akses Ditolak
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Login dulu untuk membuka pengaturan.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
      <nav
        className={`sticky top-0 z-40 flex items-center justify-between border-b px-8 py-3 ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-slate-100 bg-white"
        }`}
      >
        <a
          href="/"
          className={`flex items-center gap-2 transition ${
            isDark
              ? "text-slate-300 hover:text-teal-400"
              : "text-slate-600 hover:text-teal-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Kembali ke Dashboard</span>
        </a>

        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="avatar"
              className={`h-8 w-8 rounded-full object-cover ${
                isDark ? "ring-2 ring-slate-700" : "ring-2 ring-slate-100"
              }`}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-600"}`}>
            {user.full_name}
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p
            className={`mb-1 text-xs font-medium uppercase tracking-widest ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Pengaturan Akun
          </p>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Settings
          </h1>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
          <div
            className={`overflow-hidden rounded-3xl shadow-sm ${
              isDark
                ? "border border-slate-800 bg-slate-900"
                : "border border-slate-100 bg-white"
            }`}
          >
            <div className="h-20 bg-gradient-to-r from-teal-300 to-cyan-200" />

            <div className="px-6 pb-6">
              <div className="-mt-10 mb-4">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Foto profil"
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-teal-500 text-2xl font-bold text-white shadow">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {user.full_name || "User"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">{user.email}</p>

              <div
                className={`mt-5 space-y-3 border-t pt-5 ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Role</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isDark
                        ? "bg-slate-800 text-slate-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Karyawan
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isDark
                        ? "bg-emerald-950/60 text-emerald-300"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Login via</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isDark
                        ? "bg-sky-950/60 text-sky-300"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    Google
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className={`rounded-3xl p-7 shadow-sm ${
                isDark
                  ? "border border-slate-800 bg-slate-900"
                  : "border border-slate-100 bg-white"
              }`}
            >
              <div className="mb-1 flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isDark ? "bg-teal-950/60" : "bg-teal-50"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${isDark ? "text-teal-300" : "text-teal-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>

                <div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Edit Profil
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ubah nama tampilan akun kamu
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Nama Lengkap
                  </label>

                  <div className="relative">
                    <input
                      ref={inputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      placeholder="Masukkan nama kamu"
                      className={`w-full rounded-2xl border px-4 py-3 pr-10 text-sm outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-950"
                          : "border-slate-200 bg-white text-slate-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      }`}
                    />
                    <button
                      onClick={() => inputRef.current?.focus()}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                        isDark ? "text-slate-500 hover:text-teal-300" : "text-slate-300 hover:text-teal-500"
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`mb-2 block text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Email <span className={isDark ? "font-normal text-slate-500" : "font-normal text-slate-300"}>(tidak bisa diubah)</span>
                  </label>

                  <input
                    value={user.email || ""}
                    readOnly
                    className={`w-full cursor-not-allowed rounded-2xl border px-4 py-3 text-sm outline-none ${
                      isDark
                        ? "border-slate-800 bg-slate-950 text-slate-500"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <button
                  onClick={handleSaveName}
                  disabled={saving || editName.trim() === user.full_name}
                  className="flex items-center gap-2 rounded-2xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>

                {saveMsg && (
                  <p
                    className={`text-sm font-medium ${
                      saveMsg.type === "success" ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {saveMsg.type === "success" ? "✓" : "✗"} {saveMsg.text}
                  </p>
                )}
              </div>

              <p className={`mt-3 text-xs ${isDark ? "text-slate-500" : "text-slate-300"}`}>
                Tekan Enter atau klik "Simpan Perubahan" untuk menyimpan.
              </p>
            </div>

            <div
              className={`rounded-3xl p-7 shadow-sm ${
                isDark
                  ? "border border-slate-800 bg-slate-900"
                  : "border border-slate-100 bg-white"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isDark ? "bg-sky-950/60" : "bg-sky-50"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${isDark ? "text-sky-300" : "text-sky-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Preferensi Aplikasi
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fitur tambahan di versi berikutnya
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between rounded-2xl px-5 py-4 ${
                    isDark
                      ? "border border-slate-800 bg-slate-950"
                      : "border border-slate-100 bg-slate-50"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      Notifikasi Pengingat
                    </p>
                    <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      Pengingat absensi harian
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isDark
                        ? "bg-amber-950/60 text-amber-300"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    Segera
                  </span>
                </div>

                <div
                  ref={themeRef}
                  className={`relative flex items-center justify-between rounded-2xl px-5 py-4 ${
                    isDark
                      ? "border border-slate-800 bg-slate-950"
                      : "border border-slate-100 bg-slate-50"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      Tema Tampilan
                    </p>
                    <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      Pilih mode terang atau gelap
                    </p>
                  </div>

                  <button
                    onClick={() => setThemeOpen((prev) => !prev)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition ${
                      isDark
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {theme === "dark" ? "Dark" : "Light"}
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {themeOpen && (
                    <div
                      className={`absolute right-0 top-[calc(100%+10px)] z-20 w-40 rounded-2xl p-2 shadow-xl ${
                        isDark
                          ? "border border-slate-800 bg-slate-900"
                          : "border border-slate-100 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => handleThemeChange("light")}
                        disabled={theme === "light"}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                          theme === "light"
                            ? isDark
                              ? "cursor-not-allowed bg-slate-800 text-slate-500"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                            : isDark
                            ? "text-slate-200 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>Light</span>
                        {theme === "light" && <span>✓</span>}
                      </button>

                      <button
                        onClick={() => handleThemeChange("dark")}
                        disabled={theme === "dark"}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                          theme === "dark"
                            ? isDark
                              ? "cursor-not-allowed bg-slate-800 text-slate-500"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                            : isDark
                            ? "text-slate-200 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>Dark</span>
                        {theme === "dark" && <span>✓</span>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl p-7 shadow-sm ${
                isDark
                  ? "border border-rose-950/60 bg-slate-900"
                  : "border border-rose-100 bg-white"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isDark ? "bg-rose-950/60" : "bg-rose-50"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${isDark ? "text-rose-300" : "text-rose-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>

                <div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Aksi Akun
                  </h3>
                  <p className="text-xs text-slate-400">
                    Keluar dari sesi login aktif
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout dari Akun
              </button>

              <p className={`mt-2 text-xs ${isDark ? "text-slate-500" : "text-slate-300"}`}>
                Kamu akan diarahkan kembali ke halaman login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
