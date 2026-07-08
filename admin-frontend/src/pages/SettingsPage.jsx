import React from "react";

function SettingsPage({ username }) {
  const settingsCards = [
    {
      title: "Security",
      description: "JWT authentication is enforced through the existing API service and Bearer token flow.",
      details: ["Token stored in localStorage", "Protected routes require an active session", "Logout clears the current session"],
    },
    {
      title: "Portal preferences",
      description: `Current admin session: ${username || "Unknown user"}`,
      details: ["Dark UI preserved", "Sidebar navigation uses router links", "All pages share the same admin layout"],
    },
    {
      title: "System status",
      description: "The frontend remains connected to the same backend endpoints for CRUD and auth operations.",
      details: ["Login endpoint: /auth/login", "User management endpoint: /admin/users", "Routes configured in React Router"],
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#93c5fd", margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
          Settings
        </p>
        <h2 style={{ color: "#e6eef8", margin: "8px 0 6px", fontSize: 28 }}>
          Admin settings
        </h2>
        <p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>
          Review the current portal configuration and security details.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {settingsCards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: "#111827",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
              padding: 24,
            }}
          >
            <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>{card.title}</h3>
            <p style={{ color: "#9ca3af", margin: "10px 0 16px 0", fontSize: 14, lineHeight: 1.6 }}>
              {card.description}
            </p>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#cbd5e1", fontSize: 14, lineHeight: 1.8 }}>
              {card.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
