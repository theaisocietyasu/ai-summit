"use client";

import { useEffect, useRef, useState } from "react";

interface CheckInScannerProps {
  onRawScan: (text: string) => void;
}

export default function CheckInScanner({ onRawScan }: CheckInScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Ref so the callback always sees the latest onRawScan without being a dep
  const onRawScanRef = useRef(onRawScan);
  useEffect(() => { onRawScanRef.current = onRawScan; });

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [scanDetected, setScanDetected] = useState(false);
  const detectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let stopped = false;
    let controls: { stop: () => void } | null = null;
    let stream: MediaStream | null = null;

    async function startScanner() {
      console.log("[Scanner] startScanner called, selectedDeviceId:", selectedDeviceId);
      try {
        console.log("[Scanner] Importing @zxing/browser and @zxing/library...");
        const { BrowserQRCodeReader, BrowserCodeReader } = await import("@zxing/browser");
        const { DecodeHintType, BarcodeFormat, NotFoundException } = await import("@zxing/library");
        console.log("[Scanner] ZXing modules loaded");

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        hints.set(DecodeHintType.TRY_HARDER, true);

        const reader = new BrowserQRCodeReader(hints);

        if (stopped || !videoRef.current) {
          console.log("[Scanner] Aborted before decode — stopped:", stopped, "videoRef:", videoRef.current);
          return;
        }

        console.log("[Scanner] Calling decodeFromVideoDevice with deviceId:", selectedDeviceId);
        controls = await reader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const text = result.getText();
              console.log("[Scanner] QR detected:", text);
              if (detectedTimerRef.current) clearTimeout(detectedTimerRef.current);
              setScanDetected(true);
              detectedTimerRef.current = setTimeout(() => setScanDetected(false), 1500);
              onRawScanRef.current(text);
            }
            if (err) {
              if (err instanceof NotFoundException) return; // normal: no QR in frame
              console.error("[Scanner] Unexpected error:", err);
            }
          },
        );
        console.log("[Scanner] decodeFromVideoDevice resolved, controls:", controls);

        // Capture the stream for proper cleanup after controls are established
        if (videoRef.current?.srcObject instanceof MediaStream) {
          stream = videoRef.current.srcObject;
          console.log("[Scanner] Stream captured, tracks:", stream.getTracks().map(t => `${t.kind}:${t.label}`));
        }

        // Enumerate devices AFTER scanner starts (camera permission already granted)
        if (!stopped) {
          try {
            const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
            console.log("[Scanner] Enumerated devices:", videoInputDevices.map(d => `${d.label} (${d.deviceId.slice(0, 8)})`));
            if (!stopped) setDevices(videoInputDevices);
          } catch (enumErr) {
            console.warn("[Scanner] Device enumeration failed (non-fatal):", enumErr);
          }
        }
      } catch (err) {
        console.error("[Scanner] startScanner threw:", err);
        if (!stopped) {
          const msg = err instanceof Error ? err.message : "Camera access denied";
          setCameraError(msg);
        }
      }
    }

    startScanner();

    return () => {
      console.log("[Scanner] Cleanup — stopping controls and tracks");
      stopped = true;
      controls?.stop();
      stream?.getTracks().forEach((t) => t.stop());
      if (detectedTimerRef.current) {
        clearTimeout(detectedTimerRef.current);
      }
    };
  }, [selectedDeviceId]);

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
          {devices.length >= 1 && (
            <select
              value={selectedDeviceId ?? devices[0]?.deviceId ?? ""}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginBottom: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #7B73F0",
                background: "#1a1a2e",
                color: "#e2e8f0",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          )}
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
                border: scanDetected
                  ? "3px solid rgba(34,197,94,0.9)"
                  : "3px solid rgba(239,68,68,0.85)",
                borderRadius: 12,
                boxShadow: scanDetected
                  ? "0 0 0 9999px rgba(0,0,0,0.35), 0 0 24px rgba(34,197,94,0.5)"
                  : "0 0 0 9999px rgba(0,0,0,0.35)",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
