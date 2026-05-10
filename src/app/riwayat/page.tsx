"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../components/theme-provider";

type AttendanceRecord = {
  id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string | null;
};

type UserInfo = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
};

export default function RiwayatPage() {
  const { isDark } = useTheme();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filtered, setFiltered] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [searchDate, setSearchDate] = useState("");

  const formatTime = (iso: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusStyle = (status: string | null, checkIn: string | null) => {
    if (!checkIn) return {
      label: "Tidak Hadir",
      bg: isDark ? "bg-rose-950/40" : "bg-rose-50",
      text: isDark ? "text-rose-300" : "text-rose-500",
      dot: "bg-rose-400",
    };
    if (status === "late") return {
      label: "Telat",
      bg: isDark ? "bg-amber-950/40" : "bg-amber-50",
      text: isDark ? "text-amber-300" : "text-amber-600",
      dot: "bg-amber-400",
    };
    return {
      label: "Hadir",
      bg: isDark ? "bg-emerald-950/40" : "bg-emerald-50",
      text: isDark ? "text-emerald-300" : "text-emerald-600",
      dot: "bg-emerald-400",
    };
  };

  const fetchRecords = async (userId: string, year: number, month: number) => {
    setLoading(true);
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    const { data } = await supabase
      .from("attendance")
      .select("id, attendance_date, check_in, check_out, status")
      .eq("user_id", userId)
      .gte("attendance_date", from)
      .lte("attendance_date", to)
      .order("attendance_date", { ascending: false });

    setRecords(data ?? []);
    setFiltered(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url,
        });
        await fetchRecords(user.id, selectedYear, selectedMonth);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchRecords(user.id, selectedYear, selectedMonth);
    setSearchDate("");
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!searchDate) { setFiltered(records); return; }
    setFiltered(records.filter((r) => r.attendance_date.includes(searchDate)));
  }, [searchDate, records]);

  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const totalHadir = filtered.filter((r) => r.check_in).length;
  const totalTidakHadir = filtered.filter((r) => !r.check_in).length;
  const persenHadir = filtered.length > 0 ? Math.round((totalHadir / filtered.length) * 100) : 0;

  const card = isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white";
  const input = isDark
    ? "border-slate-700 bg-slate-800 text-slate-200 focus:border-teal-500 focus:ring-teal-900"
    : "border-slate-200 bg-slate-50 text-slate-700 focus:border-teal-400 focus:ring-teal-100";

  if (!loading && !user) {
    return (
      <main className={`flex min-h-screen items-center justify-center px-6 ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className={`w-full max-w-sm rounded-3xl p-10 text-center shadow-sm ${card}`}>
          <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Akses Ditolak</h1>
          <p className="mt-2 text-sm text-slate-400">Login dulu untuk melihat riwayat.</p>
          <a href="/" className="mt-6 inline-flex rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
            Kembali ke Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>

      {/* Navbar */}
      <nav className={`sticky top-0 z-40 flex items-center justify-between border-b px-8 py-3 ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"}`}>
        <a href="/" className={`flex items-center gap-2 text-sm font-medium transition ${isDark ? "text-slate-400 hover:text-teal-400" : "text-slate-600 hover:text-teal-600"}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Dashboard
        </a>

        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className={`w-8 h-8 rounded-full object-cover ${isDark ? "ring-2 ring-slate-700" : "ring-2 ring-slate-100"}`} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{user?.full_name}</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Absensi Saya</p>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Riwayat Kehadiran</h1>
        </div>

        {/* Filter bar */}
        <div className={`rounded-3xl p-5 mb-6 flex flex-wrap gap-4 items-end shadow-sm ${card}`}>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={`rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${input}`}
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${input}`}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cari Tanggal</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${input}`}
            />
          </div>

          {searchDate && (
            <button
              onClick={() => setSearchDate("")}
              className={`rounded-2xl border px-4 py-2.5 text-sm transition ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              Reset
            </button>
          )}
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Hadir", value: totalHadir, color: "text-emerald-500" },
            { label: "Tidak Hadir", value: totalTidakHadir, color: "text-rose-400" },
            { label: "Persentase Hadir", value: `${persenHadir}%`, color: "text-sky-500" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-3xl p-5 text-center shadow-sm ${card}`}>
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {stat.label === "Persentase Hadir" ? "dari data tercatat" : "hari"}
              </p>
            </div>
          ))}
        </div>

        {/* Tabel */}
        <div className={`rounded-3xl overflow-hidden shadow-sm ${card}`}>
          {/* Header tabel */}
          <div className={`grid grid-cols-4 px-6 py-3 border-b text-xs font-semibold uppercase tracking-wider text-slate-400 ${isDark ? "bg-slate-800/60 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
            <span>Tanggal</span>
            <span className="text-center">Check In</span>
            <span className="text-center">Check Out</span>
            <span className="text-center">Status</span>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-slate-400 animate-pulse">Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-400"}`}>Tidak ada data absensi</p>
              <p className="text-xs text-slate-400 mt-1">Coba pilih bulan lain atau reset pencarian</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-50"}`}>
              {filtered.map((item) => {
                const s = getStatusStyle(item.status, item.check_in);
                return (
                  <div key={item.id} className={`grid grid-cols-4 px-6 py-4 items-center transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/50"}`}>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {new Date(item.attendance_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.attendance_date).toLocaleDateString("id-ID", { weekday: "long" })}
                      </p>
                    </div>

                    <div className="text-center">
                      <span className={`text-sm font-semibold ${item.check_in ? "text-emerald-500" : "text-slate-400"}`}>
                        {formatTime(item.check_in)}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className={`text-sm font-semibold ${item.check_out ? "text-amber-400" : "text-slate-400"}`}>
                        {formatTime(item.check_out)}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Menampilkan {filtered.length} data · {months[selectedMonth - 1]} {selectedYear}
        </p>
      </div>
    </main>
  );
}