import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ onLogout }) {
  const navItems = [
    { label: "Dashboard", icon: "📊", to: "/" },
    { label: "Users", icon: "👥", to: "/users" },
    { label: "Restaurants", icon: "🍽️", to: "/restaurants" },
    { label: "Employees", icon: "👨‍💼", to: "/employees" },
    { label: "Settings", icon: "⚙️", to: "/settings" },
  ];

  return (
    <div
      style={{
        width: 260,
        background: "linear-gradient(180deg, #051018 0%, #0a1620 100%)",
        borderRight: "1px solid rgba(255,255,255,0.04)",
        padding: "24px 0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "0 20px", marginBottom: 32 }}>
        <h1 style={{ color: "#e6eef8", margin: 0, fontSize: 18 }}>Admin</h1>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div
                style={{
                  padding: "12px 20px",
                  color: isActive ? "#eff6ff" : "#9ca3af",
                  cursor: "pointer",
                  borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                  backgroundColor: isActive ? "rgba(37, 99, 235, 0.1)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {item.icon} {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "0 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "10px 14px",
            marginTop: 16,
            border: "none",
            borderRadius: 10,
            backgroundColor: "#dc2626",
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
