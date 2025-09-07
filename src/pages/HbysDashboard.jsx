// src/pages/HbysDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import Navbar from "../components/NavbarOverlay"; // ✅ Hamburger overlay navbar geri eklendi

const DURUM = ["BEKLIYOR", "MUAYENEDE", "TAMAMLANDI", "IPTAL"];
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function HbysDashboard() {
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState([]);

  // Filtreler
  const [date, setDate] = useState(todayISO());
  const [clinicId, setClinicId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form
  const [form, setForm] = useState({
    patientId: "",
    clinicId: "",
    doctorId: "",
    randevuTarih: todayISO(),
    randevuSaat: "09:00",
    durum: "BEKLIYOR",
    note: "",
  });
  const [editingId, setEditingId] = useState("");

  // Referanslar
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [c, p] = await Promise.all([api.clinics(), api.patients()]);
        setClinics(c || []);
        const list = Array.isArray(p) ? p : [p].filter(Boolean);
        setPatients(list);

        const params = new URLSearchParams(window.location.search);
        const preselect = params.get("selectPatient");
        if (preselect) {
          const found = list.find(
            (x) => x.id === preselect || x.tckn === preselect
          );
          if (found) setForm((f) => ({ ...f, patientId: found.id }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        api.patients().then((p) => {
          const list = Array.isArray(p) ? p : [p].filter(Boolean);
          setPatients(list);
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Klinik -> Doktor
  useEffect(() => {
    (async () => {
      if (!clinicId) {
        setDoctors([]);
        setDoctorId("");
        setForm((f) => ({ ...f, clinicId: "", doctorId: "" }));
        return;
      }
      const d = await api.doctors(clinicId);
      setDoctors(d || []);
      setDoctorId("");
      setForm((f) => ({ ...f, clinicId, doctorId: "" }));
    })();
  }, [clinicId]);

  // Günlük liste
  const loadAppts = async () => {
    setLoading(true);
    try {
      const list = await api.apptsList({
        date,
        clinicId: clinicId || undefined,
        doctorId: doctorId || undefined,
        status: statusFilter || undefined,
      });
      setAppts(list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, doctorId, date, statusFilter]);

  // Son 7 gün grafiği
  useEffect(() => {
    (async () => {
      const trDays = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          dateISO: d.toISOString().slice(0, 10),
          label: trDays[d.getDay()],
        };
      });
      const results = await Promise.all(
        days.map(({ dateISO }) =>
          api
            .apptsList({
              date: dateISO,
              clinicId: clinicId || undefined,
              doctorId: doctorId || undefined,
              status: statusFilter || undefined,
            })
            .catch(() => [])
        )
      );
      setWeek(
        days.map((d, i) => ({
          date: d.dateISO,
          label: d.label,
          count: Array.isArray(results[i]) ? results[i].length : 0,
        }))
      );
    })();
  }, [clinicId, doctorId, statusFilter]);

  // İstatistikler
  const stats = useMemo(() => {
    const by = (s) => appts.filter((a) => a.durum === s).length;
    return {
      total: appts.length,
      waiting: by("BEKLIYOR"),
      inExam: by("MUAYENEDE"),
      done: by("TAMAMLANDI"),
      canceled: by("IPTAL"),
    };
  }, [appts]);

  // Submit
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.clinicId || !form.doctorId) {
      alert("Hasta, klinik ve hekim seçimi zorunludur.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(form.randevuSaat)) {
      alert("Saat HH:MM formatında olmalı.");
      return;
    }
    try {
      if (editingId) {
        await api.apptUpdate(editingId, form);
        setEditingId("");
      } else {
        await api.apptCreate(form);
      }
      await loadAppts();
      setForm((f) => ({
        ...f,
        patientId: f.patientId,
        clinicId,
        doctorId,
        randevuTarih: date,
        randevuSaat: "09:00",
        durum: "BEKLIYOR",
        note: "",
      }));
    } catch (err) {
      const msg = String(err?.message || err);
      if (msg.includes("409")) {
        alert(
          "Randevu çakışması: Bu hekim için aynı tarih ve saatte randevu var."
        );
      } else {
        alert("Kaydetme başarısız:\n" + msg);
      }
    }
  };

  const onEdit = (a) => {
    setEditingId(a.id);
    setClinicId(a.clinicId);
    setDoctorId(a.doctorId);
    setDate(a.randevuTarih?.slice(0, 10));
    setForm({
      patientId: a.patientId,
      clinicId: a.clinicId,
      doctorId: a.doctorId,
      randevuTarih: a.randevuTarih?.slice(0, 10) ?? todayISO(),
      randevuSaat: a.randevuSaat ?? "09:00",
      durum: a.durum ?? "BEKLIYOR",
      note: a.note ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("Kaydı silmek istiyor musunuz?")) return;
    await api.apptDelete(id);
    await loadAppts();
  };

  const setApptStatus = async (id, durum) => {
    await api.apptStatus(id, durum);
    setAppts((prev) => prev.map((x) => (x.id === id ? { ...x, durum } : x)));
  };

  // Görsel yardımcılar
  const badgeCls = (s) =>
    ({
      BEKLIYOR: "bg-amber-500/20 text-amber-100 border border-amber-500/30",
      MUAYENEDE: "bg-blue-500/20 text-blue-100 border border-blue-500/30",
      TAMAMLANDI:
        "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30",
      IPTAL: "bg-red-500/20 text-red-100 border border-red-500/30",
    }[s] ?? "bg-slate-500/20 text-slate-100 border border-slate-500/30");

  const btn =
    "px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all duration-200";
  const btnBlue = `${btn} bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/30`;
  const btnGray = `${btn} bg-slate-600/30 hover:bg-slate-600/50 border border-slate-500/30`;
  const btnRose = `${btn} bg-red-600/30 hover:bg-red-600/50 border border-red-500/30`;
  const btnGreen = `${btn} bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30`;
  const btnAmber = `${btn} bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/30`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600">
      <Navbar /> {/* ✅ Hamburger çizgi menü burada */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-white">
        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white grid place-items-center shadow-lg">
              <div className="w-7 h-7 rounded-md bg-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
                HBYS — Randevu &amp; Sıra Takip
              </h1>
              <p className="text-white/80 text-sm">
                Günlük randevuları takip edin, hızlıca yeni kayıt oluşturun.
              </p>
            </div>
          </div>

          {/* Sağ üst "Yeni Hasta / Hastalar" butonları YOK */}
        </div>

        {/* Filtreler + İstatistik + Graf */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-5">
            <h2 className="text-lg font-semibold mb-4">Filtreler</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 text-sm mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">
                  Durum
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="" className="bg-green-800">
                    Tümü
                  </option>
                  {DURUM.map((s) => (
                    <option key={s} value={s} className="bg-green-800">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">
                  Klinik
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                >
                  <option value="" className="bg-green-800">
                    Tümü
                  </option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id} className="bg-green-800">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/90 text-sm mb-2">
                  Hekim
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  disabled={!clinicId}
                >
                  <option value="" className="bg-green-800">
                    Tümü
                  </option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id} className="bg-green-800">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat title="Toplam" value={stats.total} />
              <Stat title="Bekleyen" value={stats.waiting} />
              <Stat title="Muayenede" value={stats.inExam} />
              <Stat title="Tamamlandı" value={stats.done} />
            </div>

            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Son 7 Gün Gelen Hasta</div>
                <div className="text-white/70 text-xs">Filtrelere göre</div>
              </div>
              <WeeklyChart data={week} />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? "Randevu Düzenle" : "Yeni Randevu"}
          </h2>
          <form onSubmit={onSubmit}>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Hasta
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={form.patientId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patientId: e.target.value }))
                  }
                >
                  <option value="" className="bg-green-800">
                    Seçiniz
                  </option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="bg-green-800">
                      {p.adSoyad} · {p.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Klinik
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={form.clinicId}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, clinicId: e.target.value }));
                    setClinicId(e.target.value);
                  }}
                >
                  <option value="" className="bg-green-800">
                    Seçiniz
                  </option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id} className="bg-green-800">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Hekim
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={form.doctorId}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, doctorId: e.target.value }));
                    setDoctorId(e.target.value);
                  }}
                  disabled={!form.clinicId}
                >
                  <option value="" className="bg-green-800">
                    Seçiniz
                  </option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id} className="bg-green-800">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={form.randevuTarih}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, randevuTarih: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Saat
                </label>
                <input
                  type="time"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={form.randevuSaat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, randevuSaat: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Durum
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50"
                  value={form.durum}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durum: e.target.value }))
                  }
                >
                  {DURUM.map((s) => (
                    <option key={s} value={s} className="bg-green-800">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-white/90 font-medium mb-2">
                Not
              </label>
              <input
                type="text"
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                placeholder="Örn: kontrol"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-3">
              <button className={btnGreen} type="submit">
                {editingId ? "Kaydı Güncelle" : "Randevu Oluştur"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className={btnGray}
                  onClick={() => {
                    setEditingId("");
                    setForm((f) => ({
                      ...f,
                      randevuTarih: date,
                      randevuSaat: "09:00",
                      durum: "BEKLIYOR",
                      note: "",
                    }));
                  }}
                >
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Randevular</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <Th>Hasta</Th>
                  <Th>Klinik</Th>
                  <Th>Hekim</Th>
                  <Th>Tarih</Th>
                  <Th>Saat</Th>
                  <Th>Durum</Th>
                  <Th className="text-right">Aksiyon</Th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <Td>
                      <div className="font-medium text-white">
                        {a.patient?.adSoyad ?? "-"}
                      </div>
                      <div className="text-xs text-white/70">
                        {a.patient?.id ?? ""}
                      </div>
                    </Td>
                    <Td className="text-white/90">{a.clinic?.name ?? "-"}</Td>
                    <Td className="text-white/90">{a.doctor?.name ?? "-"}</Td>
                    <Td className="text-white/90">
                      {(a.randevuTarih ?? "").slice(0, 10)}
                    </Td>
                    <Td className="text-white/90">{a.randevuSaat}</Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs ${badgeCls(
                          a.durum
                        )}`}
                      >
                        {a.durum}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex gap-1 justify-end">
                        <button className={btnBlue} onClick={() => onEdit(a)}>
                          Düzenle
                        </button>
                        <button
                          className={btnRose}
                          onClick={() => onDelete(a.id)}
                        >
                          Sil
                        </button>
                        <button
                          className={btnAmber}
                          onClick={() => setApptStatus(a.id, "MUAYENEDE")}
                        >
                          Muayene
                        </button>
                        <button
                          className={btnGreen}
                          onClick={() => setApptStatus(a.id, "TAMAMLANDI")}
                        >
                          Tamam
                        </button>
                        <button
                          className={btnGray}
                          onClick={() => setApptStatus(a.id, "IPTAL")}
                        >
                          İptal
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
                {!appts.length && (
                  <tr>
                    <Td className="py-12 text-center text-white/60" colSpan={7}>
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60 mr-3"></div>
                          Yükleniyor...
                        </div>
                      ) : (
                        "Kayıt bulunamadı."
                      )}
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-xs text-white/60">
          HBYS Dashboard • haftalık hasta grafiği
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-3 text-left text-white/90 font-semibold text-sm ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "", ...rest }) {
  return (
    <td className={`px-3 py-3 align-top ${className}`} {...rest}>
      {children}
    </td>
  );
}
function Stat({ title, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-lg">
      <div className="text-sm text-white/70 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
function WeeklyChart({ data = [] }) {
  const W = 600,
    H = 120,
    P = 12;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = (W - P * 2) / Math.max(1, data.length - 1);
  const scaleY = (v) => H - P - (v / max) * (H - P * 2);
  const points = data
    .map((d, i) => `${P + i * stepX},${scaleY(d.count)}`)
    .join(" ");
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="120">
        <defs>
          <linearGradient id="hbysLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke="url(#hbysLine)"
            strokeWidth="3"
            strokeLinecap="round"
            points={points}
          />
        )}
        {data.map((d, i) => (
          <circle
            key={d.date}
            cx={P + i * stepX}
            cy={scaleY(d.count)}
            r="3.5"
            fill="#a7f3d0"
          />
        ))}
        {data.map((d, i) => (
          <text
            key={d.date + "-lbl"}
            x={P + i * stepX}
            y={H - 2}
            textAnchor="middle"
            fontSize="10"
            fill="#d1fae5"
          >
            {d.label}
          </text>
        ))}
        <text x={W - P} y={12} textAnchor="end" fontSize="10" fill="#d1fae5">
          max: {max}
        </text>
      </svg>
    </div>
  );
}
