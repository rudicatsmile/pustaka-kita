"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  scannerId?: string;
}

export function BarcodeScanner({
  onScan,
  scannerId = "html5-qr-reader",
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setErrorMessage(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn("Could not start html5-qrcode camera:", err);
      setErrorMessage(
        "Kamera tidak tersedia atau izin akses ditolak. Silakan gunakan opsi input manual atau klik tombol barcode simulasi di bawah."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.warn("Error stopping scanner:", err);
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-2 border-border bg-slate-950 text-white shadow-2xl">
      {/* Video Container Target */}
      <div id={scannerId} className="w-full aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center relative">
        {/* Scanner Overlay UI */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative h-56 w-72 sm:w-80 border-2 border-primary/40 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(27,163,150,0.2)]">
            <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#1ba396] animate-scanline" />
            <div className="text-center space-y-1 text-slate-300">
              <Barcode className="h-10 w-10 mx-auto opacity-70 animate-pulse" />
              <p className="text-xs font-mono font-semibold">Arahkan Barcode ke Sini</p>
            </div>
          </div>
        </div>

        {/* Fallback Camera message if permission not granted */}
        {errorMessage && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <CameraOff className="h-12 w-12 text-amber-500" />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startScanner}
              className="text-xs font-bold gap-1.5 text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Nyalakan Ulang Kamera
            </Button>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isScanning ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
          {isScanning ? "html5-qrcode Kamera Aktif" : "Menunggu Inisialisasi Kamera"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={isScanning ? stopScanner : startScanner}
          className="h-7 text-[11px] text-slate-300 hover:text-white"
        >
          {isScanning ? "Matikan Kamera" : "Aktifkan Kamera"}
        </Button>
      </div>
    </div>
  );
}
