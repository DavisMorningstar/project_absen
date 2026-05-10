"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../components/theme-provider";

type UserInfo = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
};

type AttendanceRecord = {
  id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
};

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [message, setMessage] = useState("");
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isDark } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchTodayAttendance = async (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("attendance")
      .select("id, attendance_date, check_in, check_out, status")
      .eq("user_id", userId)
      .eq("attendance_date", today)
      .limit(1);

    setTodayAttendance(data && data.length > 0 ? data[0] : null);
  };

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("attendance")
      .select("id, attendance_date, check_in, check_out, status")
      .eq("user_id", userId)
      .order("attendance_date", { ascending: false })
      .limit(7);

    setHistory(data ?? []);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url,
        });

        await fetchTodayAttendance(user.id);
        await fetchHistory(user.id);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTodayAttendance(null);
    setHistory([]);
    setMessage("");
    setDropdownOpen(false);
  };

  const handleCheckIn = async () => {
    if (!user || todayAttendance) return;

    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("attendance").insert([
      {
        user_id: user.id,
        attendance_date: today,
        check_in: new Date().toISOString(),
        status: "present",
      },
    ]);

    if (error) {
      setMessage("Gagal check in: " + error.message);
      return;
    }

    setMessage("✓ Check in berhasil!");
    await fetchTodayAttendance(user.id);
    await fetchHistory(user.id);
  };

  const handleCheckOut = async () => {
    if (!user || !todayAttendance || todayAttendance.check_out) return;

    const { error } = await supabase
      .from("attendance")
      .update({ check_out: new Date().toISOString() })
      .eq("id", todayAttendance.id);

    if (error) {
      setMessage("Gagal check out: " + error.message);
      return;
    }

    setMessage("✓ Check out berhasil!");
    await fetchTodayAttendance(user.id);
    await fetchHistory(user.id);
  };

  const getLast7Days = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      const found = history.find((h) => h.attendance_date === dateStr);
      return { dateStr, dayName, present: !!found };
    });
  };

  const weekDays = getLast7Days();
  const weeklyPercent = Math.round(
    (weekDays.filter((d) => d.present).length / 7) * 100
  );

  if (loading) {
    return (
      <main className={`flex min-h-screen items-center justify-center ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <p className={`text-lg animate-pulse ${isDark ? "text-slate-500" : "text-gray-400"}`}>
          Memuat...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={`min-h-screen px-6 flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-sky-50 via-white to-cyan-50"}`}>
        <div className={`w-full max-w-sm rounded-3xl p-10 text-center shadow-xl ${isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white"}`}>
          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${isDark ? "bg-teal-950/60" : "bg-teal-50"}`}>
            <svg className={`h-7 w-7 ${isDark ? "text-teal-300" : "text-teal-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className={`mb-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Web Absen</h1>
          <p className="mb-8 text-sm text-slate-400">Sistem absensi digital sederhana</p>

          <button
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login dengan Google
          </button>

          <p className="mt-5 text-xs text-slate-400">
            Powered by Google Auth · Supabase · Next.js
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
      <nav className={`sticky top-0 z-40 flex items-center justify-between border-b px-8 py-3 ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
        <div className="flex items-center gap-2">
          <svg className={`h-6 w-6 ${isDark ? "text-slate-300" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-8">
          <a href="#" className={`text-sm font-semibold transition ${isDark ? "text-white hover:text-teal-400" : "text-slate-800 hover:text-teal-600"}`}>Dashboard</a>
          <a href="/riwayat" className={`text-sm transition ${isDark ? "text-slate-400 hover:text-teal-400" : "text-slate-400 hover:text-teal-600"}`}>Riwayat</a>
          <a href="/laporan" className={`text-sm transition ${isDark ? "text-slate-400 hover:text-teal-400" : "text-slate-400 hover:text-teal-600"}`}>Laporan</a>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 rounded-full p-1 transition ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" className={`h-8 w-8 rounded-full object-cover ${isDark ? "ring-2 ring-slate-700" : "ring-2 ring-slate-100"}`} />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">
                {user.full_name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <svg className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className={`absolute right-0 top-12 z-50 w-52 rounded-2xl py-2 shadow-2xl ${isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white"}`}>
              <div className={`px-4 py-3 ${isDark ? "border-b border-slate-800" : "border-b border-slate-100"}`}>
                <p className={`truncate text-xs font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{user.full_name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>

              <a href="/settings" className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                <svg className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pengaturan
              </a>

              <button className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                <svg className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profil
              </button>

              <button className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}>
                <svg className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bantuan
              </button>

              <div className={`my-1 ${isDark ? "border-t border-slate-800" : "border-t border-slate-100"}`} />

              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${isDark ? "text-rose-300 hover:bg-rose-950/40" : "text-rose-500 hover:bg-rose-50"}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto grid max-w-5xl items-start gap-6 px-6 py-10 lg:grid-cols-[340px_1fr]">
        <div className={`overflow-hidden rounded-3xl shadow-sm ${isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white"}`}>
          <div className="h-24 bg-gradient-to-r from-teal-300 to-cyan-200" />
          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Foto profil"
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-teal-500 text-3xl font-bold text-white shadow">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {user.full_name || "User"}
            </h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            <p className="mt-0.5 text-xs text-slate-400">Karyawan</p>

            <div className={`mt-5 space-y-3 border-t pt-5 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Kehadiran Minggu Ini</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>{weeklyPercent}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Jam Kerja Bulan Ini</span>
                <span className={`font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status Hari Ini</span>
                <span className={`font-semibold text-sm ${todayAttendance ? "text-emerald-500" : "text-slate-400"}`}>
                  {todayAttendance
                    ? `Hadir (Check-in ${formatTime(todayAttendance.check_in)})`
                    : "Belum Absen"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className={`rounded-3xl p-6 shadow-sm ${isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white"}`}>
            <h3 className={`mb-1 text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              Kontrol Absensi Hari Ini
            </h3>
            <p className="mb-5 text-sm text-slate-400">
              Status Saat Ini:{" "}
              {todayAttendance ? (
                <span className="font-medium text-emerald-500">
                  Sudah Check-In (Pukul {formatTime(todayAttendance.check_in)})
                </span>
              ) : (
                <span className="text-slate-400">Belum Check-In</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCheckIn}
                disabled={!!todayAttendance}
                className="flex items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check In
              </button>

              <button
                onClick={handleCheckOut}
                disabled={!todayAttendance || !!todayAttendance.check_out}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Check Out
              </button>
            </div>

            {message && <p className="mt-3 text-xs text-slate-400">{message}</p>}
          </div>

          <div className={`rounded-3xl p-6 shadow-sm ${isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white"}`}>
            <h3 className={`mb-5 text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              Weekly Attendance Trends
            </h3>
            <div className="relative flex items-center justify-between px-2">
              <div className={`absolute left-4 right-4 top-[10px] h-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              {weekDays.map((day, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      day.present
                        ? "border-teal-500 bg-teal-500 shadow-sm shadow-teal-200"
                        : isDark
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  />
                  <span className="text-xs text-slate-400">{day.dayName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl p-6 shadow-sm ${isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white"}`}>
            <h2 className={`mb-2 text-2xl font-extrabold leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
              Absensi lebih cepat,
              <br />
              lebih rapi, lebih modern.
            </h2>
            <p className="mb-5 text-sm text-slate-400">
              Web absen sederhana untuk check in, check out, dan rekap kehadiran dengan Google yang praktis dan database yang aman.
            </p>
            <p className="text-xs text-slate-400">
              Powered by: <span className="font-medium">Google Auth</span> |{" "}
              <span className="font-medium">Supabase</span> |{" "}
              <span className="font-medium">Simple MVP</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
