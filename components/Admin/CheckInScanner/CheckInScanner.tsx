"use client";

import { useEffect, useRef, useState } from "react";

interface CheckInScannerProps {
  onRawScan: (text: string) => void;
}

export default function CheckInScanner({ onRawScan }: CheckInScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let controls: { stop: () => void } | null = null;

    async function startScanner() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();

        if (stopped || !videoRef.current) return;

        controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              onRawScan(result.getText());
            }
            if (err && !(err instanceof Error && err.message.includes("No QR code found"))) {
              // Ignore continuous "no QR" errors — they happen on every frame
            }
          },
        );
      } catch (err) {
        if (!stopped) {
          const msg =
            err instanceof Error ? err.message : "Camera access denied";
          setCameraError(msg);
        }
      }
    }

    startScanner();

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [onRawScan]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, margin: "0 auto" }}>
      {cameraError ? (
        <div
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 8,
            padding: 20,
            color: "#fca5a5",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>Camera Error</p>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>{cameraError}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "2px solid #7B73F0",
              display: "block",
            }}
          />
          {/* Crosshair overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                border: "3px solid rgba(123,115,240,0.8)",
                borderRadius: 12,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
