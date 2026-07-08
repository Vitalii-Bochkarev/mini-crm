import React from "react";
import LoginForm from "../components/LoginForm";

function LoginPage({
  username,
  password,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#071026 0%,#07162a 40%,#0b1220 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
        padding: "20px",
      }}
    >
      <LoginForm
        username={username}
        password={password}
        loading={loading}
        error={error}
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default LoginPage;
