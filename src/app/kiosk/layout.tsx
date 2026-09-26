import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiosk Sirkulasi Mandiri — PustakaKita Ceria",
  description: "Terminal sirkulasi mandiri lobi perpustakaan untuk peminjaman dan pengembalian buku mandiri.",
};

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans select-none overflow-x-hidden">
      {/* Thermal Print Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #kiosk-receipt, #kiosk-receipt * {
            visibility: visible;
          }
          #kiosk-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm;
            padding: 8px;
            font-family: monospace;
            font-size: 11px;
            color: black !important;
            background: white !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>
      {children}
    </div>
  );
}
