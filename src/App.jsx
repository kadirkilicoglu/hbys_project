import { BrowserRouter, Routes, Route } from "react-router-dom";
import HbysDashboard from "./pages/HbysDashboard";
import PatientsList from "./pages/PatientsList";
import PatientsNew from "./pages/PatientsNew";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HbysDashboard />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/new" element={<PatientsNew />} />
      </Routes>
    </BrowserRouter>
  );
}
