import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import Navbar from "../components/NavbarOverlay"; // <— MODERN OVERLAY NAVBAR

const CINSIYETLER = [
  { value: "KADIN", label: "Kadın" },
  { value: "ERKEK", label: "Erkek" },
  { value: "DIGER", label: "Diğer" },
];

export default function PatientsNew() {
  const [tckn, setTckn] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [dogum, setDogum] = useState(""); // YYYY-MM-DD
  const [cinsiyet, setCinsiyet] = useState(""); // enum: KADIN/ERKEK/DIGER
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function validate() {
    if (!/^\d{11}$/.test(tckn)) return "TCKN 11 haneli olmalı";
    if (adSoyad.trim().length < 3) return "Ad Soyad en az 3 karakter olmalı";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dogum))
      return "Doğum tarihi (YYYY-AA-GG) seçilmeli";
    if (!["KADIN", "ERKEK", "DIGER"].includes(cinsiyet))
      return "Cinsiyet seçilmeli";
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) return alert(errMsg);

    try {
      setSaving(true);
      await api.patientCreate({
        id: tckn,
        adSoyad: adSoyad.trim(),
        dogum,
        cinsiyet,
      });

      localStorage.setItem("hbys_last_patient_tckn", tckn);
      navigate("/");
    } catch (err) {
      alert("Kaydetme başarısız:\n" + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-600">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Hasta Ekle</h1>
          <p className="text-white/70">Sisteme yeni hasta kaydı oluşturun</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-white/90 font-medium mb-2">
                TCKN
              </label>
              <input
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                value={tckn}
                onChange={(e) =>
                  setTckn(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="11 hane"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="block text-white/90 font-medium mb-2">
                Ad Soyad
              </label>
              <input
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                placeholder="Örn: Ali Veli"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                  value={dogum}
                  onChange={(e) => setDogum(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">
                  Cinsiyet
                </label>
                <select
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent"
                  value={cinsiyet}
                  onChange={(e) => setCinsiyet(e.target.value)}
                >
                  <option value="" className="bg-green-800">
                    Seçiniz
                  </option>
                  {CINSIYETLER.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      className="bg-green-800"
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                disabled={saving}
                className="w-full px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </div>
                ) : (
                  "Kaydet"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
