import React from "react";

function LoginForm({ username, password, loading, error, onUsernameChange, onPasswordChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        width: "100%",
        maxWidth: 380,
        padding: 36,
        borderRadius: 14,
        backgroundColor: "#0b1220",
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
      }}
    >
      <h2 style={{ color: "#e6eef8", margin: 0, marginBottom: 8, fontSize: 28 }}>
        Панель администратора
      </h2>
      <p style={{ color: "#9ca3af", margin: "0 0 24px 0", fontSize: 14 }}>
        Войдите в свою учётную запись
      </p>

      <label style={{ color: "#9ca3af", fontSize: 13 }}>Имя пользователя</label>
      <input
        value={username}
        onChange={onUsernameChange}
        placeholder="Введите имя пользователя"
        autoComplete="username"
        required
        style={{
          width: "100%",
          padding: "12px 14px",
          marginTop: 8,
          marginBottom: 12,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.04)",
          backgroundColor: "#071428",
          color: "#e6eef8",
          outline: "none",
          fontSize: 15,
          boxSizing: "border-box",
        }}
      />

      <label style={{ color: "#9ca3af", fontSize: 13 }}>Пароль</label>
      <input
        value={password}
        onChange={onPasswordChange}
        placeholder="Введите пароль"
        type="password"
        autoComplete="current-password"
        required
        style={{
          width: "100%",
          padding: "12px 14px",
          marginTop: 8,
          marginBottom: 18,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.04)",
          backgroundColor: "#071428",
          color: "#e6eef8",
          outline: "none",
          fontSize: 15,
          boxSizing: "border-box",
        }}
      />

      {error && (
        <div style={{ color: "#fecaca", marginBottom: 12, fontSize: 14 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "none",
          borderRadius: 10,
          backgroundColor: loading ? "#374151" : "#2563eb",
          color: "white",
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <svg width="18" height="18" viewBox="0 0 50 50" style={{ marginRight: 8 }}>
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        ) : null}
        {loading ? "Вход..." : "Войти"}
      </button>
    </form>
  );
}

export default LoginForm;
