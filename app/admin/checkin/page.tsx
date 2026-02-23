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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // 3-second debounce on repeated scans of same token
      if (token === lastTokenRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      lastTokenRef.current = token;
      debounceRef.current = setTimeout(() => {
        lastTokenRef.current = "";
      }, 3000);

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
    processToken(token);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0716", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
        Loading...
      </div>
    );
  }

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

        {/* Scanner */}
        <div style={{ marginBottom: 24 }}>
          {scanStatus.type === "idle" || scanStatus.type === "loading" ? (
            <CheckInScanner onRawScan={handleRawScan} />
          ) : (
            <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", aspectRatio: "4/3", background: "#12082a", borderRadius: 12, border: "2px solid #2d1b69", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b5b9e" }}>
              Scanner paused — resetting shortly...
            </div>
          )}
        </div>

        {/* Status Banner */}
        {scanStatus.type !== "idle" && (
          <div
            style={{
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 24,
              border: "1px solid",
              ...(scanStatus.type === "loading"
                ? { background: "rgba(123,115,240,0.1)", borderColor: "#7B73F0", color: "#a78bfa" }
                : scanStatus.type === "success"
                  ? { background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.4)", color: "#86efac" }
                  : scanStatus.type === "already"
                    ? { background: "rgba(96,165,250,0.1)", borderColor: "rgba(96,165,250,0.4)", color: "#93c5fd" }
                    : { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.4)", color: "#fca5a5" }),
            }}
          >
            {scanStatus.type === "loading" && (
              <p style={{ margin: 0, fontWeight: 600 }}>Processing...</p>
            )}

            {scanStatus.type === "success" && (
              <>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 18 }}>✓ CHECK-IN SUCCESSFUL</p>
                <p style={{ margin: "0 0 4px" }}>{scanStatus.attendee.first_name} {scanStatus.attendee.last_name}</p>
                <p style={{ margin: "0 0 4px", fontSize: 14, opacity: 0.8 }}>{scanStatus.attendee.email}</p>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>{scanStatus.attendee.academic_year}</p>
              </>
            )}

            {scanStatus.type === "already" && (
              <>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 18 }}>ℹ ALREADY CHECKED IN</p>
                <p style={{ margin: "0 0 4px" }}>{scanStatus.attendee.first_name} {scanStatus.attendee.last_name}</p>
                <p style={{ margin: "0 0 4px", fontSize: 14, opacity: 0.8 }}>{scanStatus.attendee.email}</p>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>
                  Checked in at: {new Date(scanStatus.checked_in_at * 1000).toLocaleTimeString()}
                </p>
              </>
            )}

            {scanStatus.type === "not_approved" && (
              <>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 18 }}>✗ NOT APPROVED</p>
                <p style={{ margin: "0 0 4px" }}>{scanStatus.attendee.first_name} {scanStatus.attendee.last_name}</p>
                <p style={{ margin: "0 0 4px", fontSize: 14, opacity: 0.8 }}>{scanStatus.attendee.email}</p>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>Status: {scanStatus.status}</p>
              </>
            )}

            {scanStatus.type === "error" && (
              <>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 18 }}>✗ ERROR</p>
                <p style={{ margin: 0, fontSize: 14 }}>{scanStatus.message}</p>
              </>
            )}
          </div>
        )}

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
