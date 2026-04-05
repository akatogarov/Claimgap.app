import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ClaimGap — Is Your Insurance Claim Underpaid?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1e3a5f",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(192,57,43,0.15)",
            border: "1.5px solid rgba(192,57,43,0.5)",
            borderRadius: "4px",
            padding: "6px 14px",
            marginBottom: "36px",
            width: "fit-content",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#e57373",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Free analysis · 90 seconds
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "58px",
            fontWeight: "600",
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "820px",
            marginBottom: "28px",
          }}
        >
          Is your insurance claim{" "}
          <span style={{ color: "#e57373" }}>underpaid?</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.4,
            maxWidth: "700px",
            fontFamily: "system-ui, sans-serif",
            fontWeight: "400",
          }}
        >
          Upload your policy and settlement letter. We compare them clause by clause and show you exactly what the insurer owes you.
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "36px",
          }}
        >
          {[
            { value: "$4,200", label: "Avg. gap found" },
            { value: "90 sec", label: "To first answer" },
            { value: "$149", label: "Full report" },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "system-ui, sans-serif",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
          ))}

          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginLeft: "auto",
              paddingBottom: "4px",
            }}
          >
            <span
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              ClaimGap
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "system-ui, sans-serif",
                marginLeft: "6px",
                paddingBottom: "3px",
              }}
            >
              claimgap.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
