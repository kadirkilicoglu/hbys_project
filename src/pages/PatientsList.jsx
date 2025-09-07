import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import Navbar from "../components/NavbarOverlay";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await api.patients();
        setPatients(Array.isArray(list) ? list : [list].filter(Boolean));
      } catch (e) {
        alert("Hastalar alınamadı:\n" + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter(
      (p) => p.id?.includes(s) || p.adSoyad?.toLowerCase().includes(s)
    );
  }, [q, patients]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Hastalar</h1>
            <p className="text-white/70">Sistemdeki hasta kayıtları</p>
          </div>
          <Link
            to="/patients/new"
            className="px-6 py-3 bg-lime-500/80 backdrop-blur-sm border border-lime-400/50 rounded-full text-white font-medium hover:bg-lime-400/80 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Yeni Hasta
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
              placeholder="Ad Soyad veya TCKN ile ara..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left text-white/90 font-semibold text-sm">
                    TCKN
                  </th>
                  <th className="px-6 py-4 text-left text-white/90 font-semibold text-sm">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-4 text-left text-white/90 font-semibold text-sm">
                    Doğum
                  </th>
                  <th className="px-6 py-4 text-left text-white/90 font-semibold text-sm">
                    Cinsiyet
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-white/90">
                      {p.id}
                    </td>
                    <td className="px-6 py-4 text-white/90 font-medium">
                      {p.adSoyad}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {(p.dogum ?? "").slice(0, 10)}
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {p.cinsiyet ?? "-"}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td
                      className="px-6 py-12 text-center text-white/60"
                      colSpan={4}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                          <span className="ml-3">Yükleniyor...</span>
                        </div>
                      ) : (
                        "Kayıt bulunamadı."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loading && !filtered.length && (
            <div className="px-6 py-4">
              <div className="flex items-center text-white/60 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60 mr-2"></div>
                Yükleniyor...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
