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

function MoodCharacter({ hadirCount, isDark }: { hadirCount: number; isDark: boolean }) {
  const isSad = hadirCount < 7;
  const faceColor = isDark ? "#1e293b" : "#fef9c3";
  const strokeColor = isDark ? "#94a3b8" : "#78716c";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="90"
        height="110"
        viewBox="0 0 90 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isSad ? "animate-bounce" : ""}
        style={{ animationDuration: isSad ? "2s" : undefined }}
      >
        {/* Badan */}
        <rect
          x="22" y="62" width="46" height="38" rx="12"
          fill={isSad ? (isDark ? "#7f1d1d" : "#fecaca") : (isDark ? "#14532d" : "#bbf7d0")}
          stroke={isSad ? "#ef4444" : "#22c55e"}
          strokeWidth="2"
        />

        {/* Tangan kiri - sedih turun, senang naik */}
        <line
          x1="22" y1="75"
          x2={isSad ? "6" : "5"}
          y2={isSad ? "90" : "65"}
          stroke={isSad ? "#ef4444" : "#22c55e"}
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
        {/* Tangan kanan */}
        <line
          x1="68" y1="75"
          x2={isSad ? "84" : "85"}
          y2={isSad ? "90" : "65"}
          stroke={isSad ? "#ef4444" : "#22c55e"}
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />

        {/* Kaki kiri */}
        <line x1="35" y1="100" x2="28" y2="110" stroke={isSad ? "#ef4444" : "#22c55e"} strokeWidth="3.5" strokeLinecap="round" />
        {/* Kaki kanan */}
        <line x1="55" y1="100" x2="62" y2="110" stroke={isSad ? "#ef4444" : "#22c55e"} strokeWidth="3.5" strokeLinecap="round" />

        {/* Kepala */}
        <circle cx="45" cy="38" r="26" fill={faceColor} stroke={strokeColor} strokeWidth="2" />

        {/* Mata kiri */}
        {isSad ? (
          /* Mata sedih: setengah lingkaran ke bawah */
          <path d="M32 34 Q36 30 40 34" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          /* Mata senang: lengkung ke atas */
          <path d="M32 33 Q36 28 40 33" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Mata kanan */}
        {isSad ? (
          <path d="M50 34 Q54 30 58 34" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M50 33 Q54 28 58 33" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Mulut */}
        {isSad ? (
          /* Cemberut */
          <path d="M34 50 Q45 44 56 50" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ transition: "all 0.6s ease" }} />
        ) : (
          /* Senyum */
          <path d="M34 46 Q45 56 56 46" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ transition: "all 0.6s ease" }} />
        )}

        {/* Air mata kalau sedih */}
        {isSad && (
          <>
            <ellipse cx="34" cy="40" rx="2" ry="3" fill="#93c5fd" opacity="0.8">
              <animate attributeName="cy" values="40;50;40" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="56" cy="40" rx="2" ry="3" fill="#93c5fd" opacity="0.8">
              <animate attributeName="cy" values="40;50;40" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </ellipse>
          </>
        )}

        {/* Bintang kalau senang */}
        {!isSad && (
          <>
            <text x="8" y="30" fontSize="14" style={{ animation: "spin 3s linear infinite" }}>⭐</text>
            <text x="68" y="25" fontSize="12">✨</text>
          </>
        )}
      </svg>

      <p className={`text-sm font-semibold text-center ${isSad
        ? (isDark ? "text-rose-300" : "text-rose-500")
        : (isDark ? "text-emerald-300" : "text-emerald-600")
      }`}>
        {isSad
          ? hadirCount === 0
            ? "Tidak hadir sama sekali 😭"
            : `Baru ${hadirCount} hari... ayo semangat! 😢`
          : `Keren! Sudah ${hadirCount} hari hadir! 🎉`
        }
      </p>
    </div>
  );
}

function BarChart({ data, isDark }: { data: { label: string; value: number }[]; isDark: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {d.value > 0 ? d.value : ""}
          </span>
          <div className="w-full flex items-end" style={{ height: "80px" }}>
            <div
              className={`w-full rounded-t-xl transition-all duration-700 ${
                d.value === 0
                  ? isDark ? "bg-slate-800" : "bg-slate-100"
                  : "bg-teal-500"
              }`}
              style={{
                height: `${Math.max((d.value / max) * 80, d.value > 0 ? 8 : 4)}px`,
              }}
            />
          </div>
          <span className="text-xs text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function LaporanPage() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

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
      .order("attendance_date", { ascending: true });

    setRecords(data ?? []);
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
  }, [selectedMonth, selectedYear]);

  // Hitung statistik
  const totalHadir = records.filter((r) => r.check_in).length;
  const totalTelat = records.filter((r) => r.status === "late").length;
  const totalAbsen = records.filter((r) => !r.check_in).length;

  const totalMenitKerja = records.reduce((acc, r) => {
    if (!r.check_in || !r.check_out) return acc;
    const masuk = new Date(r.check_in).getTime();
    const keluar = new Date(r.check_out).getTime();
    return acc + (keluar - masuk) / 60000;
  }, 0);
  const totalJam = Math.floor(totalMenitKerja / 60);
  const sisaMenit = Math.floor(totalMenitKerja % 60);

  // Hari tidak hadir (hari kerja yang tidak ada record)
  const hariTidakHadir = () => {
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const result: string[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(dateStr).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip sabtu minggu
      const found = records.find((r) => r.attendance_date === dateStr);
      if (!found) result.push(dateStr);
    }
    return result;
  };

  const tidakHadirList = hariTidakHadir();

  // Data grafik: per minggu dalam bulan
  const chartData = () => {
    const weeks: { label: string; value: number }[] = [];
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    let weekNum = 1;
    let weekStart = 1;

    while (weekStart <= lastDay) {
      const weekEnd = Math.min(weekStart + 6, lastDay);
      const count = records.filter((r) => {
        const d = parseInt(r.attendance_date.split("-")[2]);
        return d >= weekStart && d <= weekEnd && r.check_in;
      }).length;
      weeks.push({ label: `Mg ${weekNum}`, value: count });
      weekStart += 7;
      weekNum++;
    }
    return weeks;
  };

  const card = isDark ? "border border-slate-800 bg-slate-900" : "border border-slate-100 bg-white";
  const selectClass = isDark
    ? "border-slate-700 bg-slate-800 text-slate-200"
    : "border-slate-200 bg-slate-50 text-slate-700";

  if (!loading && !user) {
    return (
      <main className={`flex min-h-screen items-center justify-center px-6 ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className={`w-full max-w-sm rounded-3xl p-10 text-center shadow-sm ${card}`}>
          <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Akses Ditolak</h1>
          <p className="mt-2 text-sm text-slate-400">Login dulu untuk melihat laporan.</p>
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

        {/* Header + filter */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-1">Rekap Absensi</p>
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Laporan</h1>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={`rounded-2xl border px-4 py-2.5 text-sm outline-none transition ${selectClass}`}
            >
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`rounded-2xl border px-4 py-2.5 text-sm outline-none transition ${selectClass}`}
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 animate-pulse">Memuat laporan...</p>
          </div>
        ) : (
          <div className="grid gap-5">

            {/* Baris atas: karakter + statistik */}
            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">

              {/* Karakter mood */}
              <div className={`rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm ${card}`}>
                <MoodCharacter hadirCount={totalHadir} isDark={isDark} />
              </div>

              {/* Statistik 4 kotak */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Hadir", value: totalHadir, unit: "hari", color: "text-emerald-500", bg: isDark ? "bg-emerald-950/30" : "bg-emerald-50" },
                  { label: "Total Absen", value: totalAbsen, unit: "hari", color: "text-rose-400", bg: isDark ? "bg-rose-950/30" : "bg-rose-50" },
                  { label: "Total Telat", value: totalTelat, unit: "hari", color: "text-amber-400", bg: isDark ? "bg-amber-950/30" : "bg-amber-50" },
                  { label: "Total Jam Kerja", value: `${totalJam}j ${sisaMenit}m`, unit: "bulan ini", color: "text-sky-400", bg: isDark ? "bg-sky-950/30" : "bg-sky-50" },
                ].map((s) => (
                  <div key={s.label} className={`rounded-3xl p-5 shadow-sm border ${isDark ? "border-slate-800" : "border-slate-100"} ${s.bg}`}>
                    <p className="text-xs text-slate-400 mb-2">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grafik kehadiran per minggu */}
            <div className={`rounded-3xl p-6 shadow-sm ${card}`}>
              <h3 className={`text-base font-semibold mb-6 ${isDark ? "text-white" : "text-slate-800"}`}>
                Grafik Kehadiran — {months[selectedMonth - 1]} {selectedYear}
              </h3>
              <BarChart data={chartData()} isDark={isDark} />
              <p className="text-xs text-slate-400 mt-3 text-center">Jumlah hari hadir per minggu</p>
            </div>

            {/* Daftar hari tidak hadir */}
            <div className={`rounded-3xl p-6 shadow-sm ${card}`}>
              <h3 className={`text-base font-semibold mb-1 ${isDark ? "text-white" : "text-slate-800"}`}>
                Hari Tidak Hadir
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Hari kerja (Senin–Jumat) tanpa data absensi di bulan ini
              </p>

              {tidakHadirList.length === 0 ? (
                <div className={`rounded-2xl p-5 text-center ${isDark ? "bg-emerald-950/30" : "bg-emerald-50"}`}>
                  <p className="text-2xl mb-1">🎉</p>
                  <p className={`text-sm font-semibold ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                    Tidak ada hari yang terlewat!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {tidakHadirList.map((dateStr) => (
                    <div
                      key={dateStr}
                      className={`rounded-2xl px-4 py-3 text-center border ${
                        isDark ? "border-rose-900/50 bg-rose-950/30" : "border-rose-100 bg-rose-50"
                      }`}
                    >
                      <p className={`text-xs font-semibold ${isDark ? "text-rose-300" : "text-rose-500"}`}>
                        {new Date(dateStr).toLocaleDateString("id-ID", { weekday: "short" })}
                      </p>
                      <p className={`text-sm font-bold mt-0.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}