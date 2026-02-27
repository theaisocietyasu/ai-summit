"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const CheckInScanner = dynamic(
  () => import("@/components/Admin/CheckInScanner/CheckInScanner"),
  { ssr: false },
);

type ScanStatus =
  | { type: "idle" }
  | { type: "loading" }
  | {
      type: "success";
      attendee: { first_name: string; last_name: string; email: string; academic_year: string };
    }
  | {
      type: "already";
      checked_in_at: number;
      attendee: { first_name: string; last_name: string; email: string; academic_year: string };
    }
  | {
      type: "not_approved";
      status: string;
      attendee: { first_name: string; last_name: string; email: string; academic_year: string };
    }
  | { type: "error"; message: string };

function extractToken(raw: string): string | null {
  const trimmed = raw.trim();

  // Try parsing as URL to pull ?token= param
  try {
    const url = new URL(trimmed);
    const t = url.searchParams.get("token");
    if (t) return t;
  } catch {
    // not a URL — fall through
  }

  // Check if it looks like a raw UUID
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (UUID_RE.test(trimmed)) return trimmed;

  return null;
}

export default function CheckInPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({ type: "idle" });
  const [manualToken, setManualToken] = useState("");
  const [showManual, setShowManual] = useState(false);
  const lastTokenRef = useRef<string>("");
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup reset timer on unmount
  useEffect(() => {
    return () => { if (resetRef.current) clearTimeout(resetRef.current); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { method: "GET" });
        if (!res.ok) { router.push("/login"); return; }
        if (!cancelled) setIsAuthenticated(true);
      } catch {
        router.push("/login");
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const processToken = useCallback(async (token: string) => {
    setScanStatus({ type: "loading" });

    if (resetRef.current) clearTimeout(resetRef.current);

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (res.ok) {
        setScanStatus({ type: "success", attendee: data.attendee });
      } else if (res.status === 409) {
        setScanStatus({ type: "already", checked_in_at: data.checked_in_at, attendee: data.attendee });
      } else if (res.status === 403) {
        setScanStatus({ type: "not_approved", status: data.status, attendee: data.attendee });
      } else {
        setScanStatus({ type: "error", message: data.error ?? "Unknown error" });
      }
    } catch {
      setScanStatus({ type: "error", message: "Network error — please try again" });
    }

    // Auto-reset after 4 seconds
    resetRef.current = setTimeout(() => {
      setScanStatus({ type: "idle" });
      lastTokenRef.current = "";
    }, 4000);
  }, []);

  const handleRawScan = useCallback(
    (raw: string) => {
      const token = extractToken(raw);
      if (!token) return;

      if (token === lastTokenRef.current) return;
      lastTokenRef.current = token;
      processToken(token);
    },
    [processToken],
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = extractToken(manualToken);
    if (!token) {
      setScanStatus({ type: "error", message: "Invalid token or URL" });
      return;
    }
    setManualToken("");
    lastTokenRef.current = token;
    processToken(token);
  };

  const dismissModal = () => {
    if (resetRef.current) clearTimeout(resetRef.current);
    setScanStatus({ type: "idle" });
    lastTokenRef.current = "";
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0716", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
        Loading...
      </div>
    );
  }

  const modalConfig = (() => {
    if (scanStatus.type === "success") return {
      accent: "#22c55e",
      accentBg: "rgba(34,197,94,0.12)",
      accentBorder: "rgba(34,197,94,0.35)",
      textColor: "#86efac",
      icon: "✓",
      iconBg: "rgba(34,197,94,0.2)",
      title: "Check-In Successful",
    };
    if (scanStatus.type === "already") return {
      accent: "#60a5fa",
      accentBg: "rgba(96,165,250,0.12)",
      accentBorder: "rgba(96,165,250,0.35)",
      textColor: "#93c5fd",
      icon: "ℹ",
      iconBg: "rgba(96,165,250,0.2)",
      title: "Already Checked In",
    };
    if (scanStatus.type === "not_approved") return {
      accent: "#f97316",
      accentBg: "rgba(249,115,22,0.12)",
      accentBorder: "rgba(249,115,22,0.35)",
      textColor: "#fdba74",
      icon: "✗",
      iconBg: "rgba(249,115,22,0.2)",
      title: "Not Approved",
    };
    if (scanStatus.type === "error") return {
      accent: "#ef4444",
      accentBg: "rgba(239,68,68,0.12)",
      accentBorder: "rgba(239,68,68,0.35)",
      textColor: "#fca5a5",
      icon: "✗",
      iconBg: "rgba(239,68,68,0.2)",
      title: "Error",
    };
    return null;
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0716",
        color: "#e2d9f3",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "32px 16px",
      }}
    >
      {/* Status Modal Overlay */}
      {scanStatus.type !== "idle" && (
        <div
          onClick={dismissModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(13,7,22,0.75)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            cursor: "pointer",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(400px, 90vw)",
              borderRadius: 16,
              padding: "32px 28px",
              cursor: "default",
              ...(scanStatus.type === "loading"
                ? {
                    background: "rgba(123,115,240,0.1)",
                    border: "1px solid rgba(123,115,240,0.35)",
                    color: "#a78bfa",
                    textAlign: "center" as const,
                  }
                : {
                    background: modalConfig!.accentBg,
                    border: `1px solid ${modalConfig!.accentBorder}`,
                    color: modalConfig!.textColor,
                  }),
            }}
          >
            {scanStatus.type === "loading" && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "3px solid rgba(123,115,240,0.2)",
                    borderTop: "3px solid #7B73F0",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>Processing...</p>
              </div>
            )}

            {scanStatus.type !== "loading" && modalConfig && (
              <>
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: modalConfig.iconBg,
                        border: `1px solid ${modalConfig.accentBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {modalConfig.icon}
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 18, color: modalConfig.accent }}>
                      {modalConfig.title}
                    </p>
                  </div>
                  {/* Close button */}
                  <button
                    onClick={dismissModal}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: modalConfig.textColor,
                      cursor: "pointer",
                      fontSize: 20,
                      lineHeight: 1,
                      opacity: 0.6,
                      padding: "2px 6px",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: modalConfig.accentBorder, marginBottom: 20 }} />

                {/* Attendee details */}
                {"attendee" in scanStatus && (
                  <div style={{ marginBottom: scanStatus.type === "already" ? 12 : 0 }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 17 }}>
                      {scanStatus.attendee.first_name} {scanStatus.attendee.last_name}
                    </p>
                    <p style={{ margin: "0 0 4px", fontSize: 14, opacity: 0.8 }}>{scanStatus.attendee.email}</p>
                    <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>{scanStatus.attendee.academic_year}</p>
                  </div>
                )}

                {scanStatus.type === "already" && (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7, paddingTop: 8, borderTop: `1px solid ${modalConfig.accentBorder}` }}>
                    Checked in at: {new Date(scanStatus.checked_in_at * 1000).toLocaleTimeString()}
                  </p>
                )}

                {scanStatus.type === "not_approved" && (
                  <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.7 }}>
                    Status: {scanStatus.status}
                  </p>
                )}

                {scanStatus.type === "error" && (
                  <p style={{ margin: 0, fontSize: 14 }}>{scanStatus.message}</p>
                )}

                {/* Dismiss hint */}
                <p style={{ margin: "20px 0 0", fontSize: 12, opacity: 0.45, textAlign: "center" }}>
                  Auto-dismisses in 4s · tap anywhere to close
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#a78bfa" }}>Check-In Scanner</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#8b7cc8" }}>Scan attendee QR codes to mark check-in</p>
          </div>
          <Link
            href="/admin"
            style={{ fontSize: 14, color: "#7B73F0", textDecoration: "none", border: "1px solid #2d1b69", padding: "6px 14px", borderRadius: 6 }}
          >
            ← Admin Panel
          </Link>
        </div>

        {/* Scanner — always mounted so the camera stream never restarts between scans */}
        <div style={{ marginBottom: 24, position: "relative" }}>
          <CheckInScanner onRawScan={handleRawScan} />
        </div>

        {/* Manual entry toggle */}
        <button
          onClick={() => setShowManual((v) => !v)}
          style={{
            background: "transparent",
            border: "1px solid #2d1b69",
            borderRadius: 8,
            color: "#8b7cc8",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 14,
            width: "100%",
            marginBottom: showManual ? 12 : 0,
          }}
        >
          {showManual ? "Hide Manual Entry" : "Manual Token Entry"}
        </button>

        {showManual && (
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste token or full URL..."
              style={{
                flex: 1,
                background: "#12082a",
                border: "1px solid #2d1b69",
                borderRadius: 8,
                color: "#e2d9f3",
                padding: "8px 12px",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#7B73F0",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                padding: "8px 20px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Check In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
