import React from "react";

function DashboardPage({ stats, username }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#93c5fd", margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
          Overview
        </p>
        <h2 style={{ color: "#e6eef8", margin: "8px 0 6px", fontSize: 28 }}>
          Welcome back, {username || "Admin"}
        </h2>
        <p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>
          Monitor access, review user activity, and manage admin permissions from one place.
        </p>
      </div>

      <style>{`
        .stat-card {
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.65);
          border-color: rgba(96, 165, 250, 0.35);
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              background: "linear-gradient(180deg, rgba(17,24,39,0.98), rgba(15,23,42,0.96))",
              borderRadius: 18,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(2, 6, 23, 0.5)",
            }}
          >
            <div
              style={{
                color: stat.accent,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                marginTop: 14,
                color: "#f8fafc",
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
            padding: 24,
          }}
        >
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Quick actions</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 18px 0", fontSize: 14 }}>
            Jump into user management or review settings for the admin portal.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(37, 99, 235, 0.18)",
                color: "#bfdbfe",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              JWT-protected routes
            </span>
            <span
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(16, 185, 129, 0.14)",
                color: "#86efac",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              CRUD preserved
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
            padding: 24,
          }}
        >
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>System notes</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 18px 0", fontSize: 14 }}>
            All API calls remain routed through the existing service layer, including login, create, update, and delete operations.
          </p>
          <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>
            • Auth state is still driven by the JWT in localStorage
            <br />
            • Sidebar navigation is now backed by React Router
            <br />
            • The dark admin theme is preserved across all pages
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
