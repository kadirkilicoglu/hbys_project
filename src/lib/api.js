const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const t = await res.text();
      if (t) msg += `\n${t}`;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

function qsFrom(obj = {}) {
  const qs = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") qs.set(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export const api = {
  clinics: () => request("/api/clinics"),
  doctors: (clinicId) =>
    request(clinicId ? `/api/doctors?clinicId=${clinicId}` : "/api/doctors"),

  // Hastalar
  patients: () => request("/api/patients"),

  patientCreate: ({ id, tckn, adSoyad, dogum, cinsiyet }) =>
    request("/api/patients", {
      method: "POST",
      body: JSON.stringify({ id: id ?? tckn, adSoyad, dogum, cinsiyet }),
    }),

  patientSearchByTckn: (tckn) =>
    request(`/api/patients/search${qsFrom({ tckn })}`),
  patientsCreate: (data) =>
    request("/api/patients", { method: "POST", body: JSON.stringify(data) }),
  // Randevular
  apptsList: (params = {}) =>
    request(
      `/api/appointments${qsFrom({
        date: params.date,
        clinicId: params.clinicId,
        doctorId: params.doctorId,
        status: params.status,
      })}`
    ),
  apptCreate: (data) =>
    request(`/api/appointments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  apptUpdate: (id, data) =>
    request(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  apptStatus: (id, durum) =>
    request(`/api/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ durum }),
    }),
  apptDelete: (id) => request(`/api/appointments/${id}`, { method: "DELETE" }),
};
