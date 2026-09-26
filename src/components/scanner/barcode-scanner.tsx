"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw, Barcode, Flashlight, SwitchCamera } from "lucide-react";
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
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async (mode: "environment" | "user" = facingMode) => {
    setErrorMessage(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerId);
      }

      // If already running, stop first
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      await html5QrCodeRef.current.start(
        { facingMode: mode },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.floor(minEdge * 0.75);
            return { width: Math.max(qrEdge, 220), height: Math.max(qrEdge, 220) };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Trigger smartphone haptic vibration feedback
          if (typeof window !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate(100);
            } catch {
              // ignore vibration error
            }
          }
          onScan(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsScanning(true);

      // Check for torch capability
      try {
        const capabilities = (html5QrCodeRef.current as any)?.getRunningTrackCapabilities?.();
        if (capabilities && "torch" in capabilities) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn("Could not start html5-qrcode camera:", err);
      setErrorMessage(
        "Kamera tidak tersedia atau izin akses ditolak. Pastikan mengizinkan akses kamera browser, atau gunakan input manual / tombol simulasi di bawah."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
        setTorchOn(false);
      }
    } catch (err) {
      console.warn("Error stopping scanner:", err);
    }
  };

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !isScanning) return;
    try {
      const nextState = !torchOn;
      await (html5QrCodeRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn("Torch not supported:", err);
    }
  };

  const toggleFacingMode = async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    await startScanner(nextMode);
  };

  useEffect(() => {
    startScanner("environment");
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border-2 border-border bg-slate-950 text-white shadow-2xl">
      {/* Video Container Target */}
      <div id={scannerId} className="w-full aspect-square sm:aspect-[4/3] flex items-center justify-center relative">
        {/* Scanner Overlay UI */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="relative h-60 w-60 sm:h-64 sm:w-80 border-2 border-primary/50 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(27,163,150,0.25)]">
            <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#1ba396] animate-scanline" />
            <div className="text-center space-y-1 text-slate-300">
              <Barcode className="h-10 w-10 mx-auto opacity-70 animate-pulse" />
              <p className="text-[11px] font-mono font-semibold tracking-wide">Arahkan Barcode ke Sini</p>
            </div>
          </div>
        </div>

        {/* Fallback Camera message if permission not granted */}
        {errorMessage && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <CameraOff className="h-12 w-12 text-amber-500 animate-bounce" />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startScanner(facingMode)}
              className="text-xs font-bold gap-1.5 text-white border-white/20 hover:bg-white/10 rounded-xl"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Nyalakan Ulang Kamera
            </Button>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isScanning ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-[11px] font-medium">
            {isScanning
              ? facingMode === "environment"
                ? "Kamera Belakang Aktif"
                : "Kamera Depan Aktif"
              : "Menyiapkan Kamera..."}
          </span>
        </span>

        <div className="flex items-center gap-1.5">
          {hasTorch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleTorch}
              className={`h-8 px-2.5 text-[11px] rounded-lg gap-1 ${
                torchOn ? "bg-amber-500/20 text-amber-300" : "text-slate-300 hover:text-white"
              }`}
              title="Lampu Kilat / Senter"
            >
              <Flashlight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{torchOn ? "Matikan Flash" : "Flash"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleFacingMode}
            className="h-8 px-2.5 text-[11px] text-slate-300 hover:text-white rounded-lg gap-1"
            title="Ganti Kamera"
          >
            <SwitchCamera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Balik Kamera</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={isScanning ? stopScanner : () => startScanner(facingMode)}
            className="h-8 px-2.5 text-[11px] text-slate-300 hover:text-white rounded-lg"
          >
            {isScanning ? "Matikan" : "Aktifkan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
