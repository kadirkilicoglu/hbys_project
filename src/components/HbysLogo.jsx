// components/HbysLogo.jsx
export default function HbysLogo() {
  return (
    <div className="fixed top-4 left-6 z-[1001] flex items-center gap-3 select-none">
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
        <div className="w-6 h-6 rounded-md bg-emerald-600" />
      </div>
      <div className="text-white">
        <h1 className="text-lg font-bold leading-tight">HBYS</h1>
        <p className="text-xs opacity-80">Randevu &amp; Sıra Takip</p>
      </div>
    </div>
  );
}
