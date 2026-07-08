import React from "react";

function CreateUserForm({
  formData,
  onFieldChange,
  onSubmit,
  loading,
  error,
  success,
}) {
  return (
    <div
      style={{
        backgroundColor: "#111827",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Create User</h3>
        <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
          Add a new admin user with the required access level
        </p>
      </div>

      {error && (
        <div style={{ color: "#fecaca", marginBottom: 12, fontSize: 14 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: "#9ae6b4", marginBottom: 12, fontSize: 14 }}>
          {success}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Username
            </label>
            <input
              value={formData.username}
              onChange={(e) => onFieldChange("username", e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
                backgroundColor: "#071428",
                color: "#e6eef8",
                outline: "none",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="Enter email"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
                backgroundColor: "#071428",
                color: "#e6eef8",
                outline: "none",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => onFieldChange("password", e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
                backgroundColor: "#071428",
                color: "#e6eef8",
                outline: "none",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => onFieldChange("role", e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
                backgroundColor: "#071428",
                color: "#e6eef8",
                outline: "none",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            >
              <option>Administrator</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: 10,
              backgroundColor: loading ? "#374151" : "#2563eb",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating user..." : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserForm;
