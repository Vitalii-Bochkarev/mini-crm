import React from "react";

function CreateRestaurantForm({ formData, onFieldChange, onSubmit, loading, error, success }) {
  return (
    <div
      style={{
        backgroundColor: "#111827",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Добавление ресторана</h3>
        <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
          Добавьте новый ресторан в CRM.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            color: "#fecaca",
            backgroundColor: "rgba(220, 38, 38, 0.12)",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            color: "#bbf7d0",
            backgroundColor: "rgba(34, 197, 94, 0.12)",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Название ресторана
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "12px 14px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Город
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onFieldChange("city", e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "12px 14px",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onFieldChange("isActive", e.target.checked)}
              style={{ marginRight: 10 }}
            />
            Активен
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "12px 16px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? "Добавление..." : "Добавить ресторан"}
        </button>
      </form>
    </div>
  );
}

export default CreateRestaurantForm;
