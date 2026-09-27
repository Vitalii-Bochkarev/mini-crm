import React, { useEffect, useId, useRef } from "react";
import FieldErrorMessages from "./FieldErrorMessages";
import { ROLE_OPTIONS } from "../utils/formatters";

function CreateUserForm({
  formData,
  onFieldChange,
  onSubmit,
  loading,
  error,
  fieldErrors = {},
  success,
}) {
  const formId = useId();
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);
  useEffect(() => {
    const firstInvalidField = [
      ["username", usernameRef],
      ["email", emailRef],
      ["password", passwordRef],
      ["role", roleRef],
    ].find(([field, ref]) => fieldErrors[field]?.length && !ref.current?.disabled);
    firstInvalidField?.[1].current?.focus();
  }, [fieldErrors]);

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
        <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Создание пользователя</h3>
        <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
          Добавьте нового пользователя с необходимым уровнем доступа.
        </p>
      </div>

      {error && (
        <div role="alert" style={{ color: "#fecaca", marginBottom: 12, fontSize: 14 }}>
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
            <label htmlFor={`${formId}-username`} style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Имя пользователя
            </label>
            <input
              ref={usernameRef}
              id={`${formId}-username`}
              value={formData.username}
              onChange={(e) => onFieldChange("username", e.target.value)}
              placeholder="Введите имя пользователя"
              required
              aria-invalid={fieldErrors.username?.length ? "true" : undefined}
              aria-describedby={fieldErrors.username?.length ? `${formId}-username-errors` : undefined}
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
            <FieldErrorMessages id={`${formId}-username-errors`} messages={fieldErrors.username} />
          </div>

          <div>
            <label htmlFor={`${formId}-email`} style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Электронная почта
            </label>
            <input
              ref={emailRef}
              id={`${formId}-email`}
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="Введите электронную почту"
              required
              aria-invalid={fieldErrors.email?.length ? "true" : undefined}
              aria-describedby={fieldErrors.email?.length ? `${formId}-email-errors` : undefined}
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
            <FieldErrorMessages id={`${formId}-email-errors`} messages={fieldErrors.email} />
          </div>

          <div>
            <label htmlFor={`${formId}-password`} style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Пароль
            </label>
            <input
              ref={passwordRef}
              id={`${formId}-password`}
              type="password"
              value={formData.password}
              onChange={(e) => onFieldChange("password", e.target.value)}
              placeholder="Введите пароль"
              required
              aria-invalid={fieldErrors.password?.length ? "true" : undefined}
              aria-describedby={fieldErrors.password?.length ? `${formId}-password-errors` : undefined}
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
            <FieldErrorMessages id={`${formId}-password-errors`} messages={fieldErrors.password} />
          </div>

          <div>
            <label htmlFor={`${formId}-role`} style={{ color: "#9ca3af", fontSize: 13, display: "block", marginBottom: 8 }}>
              Роль
            </label>
            <select
              ref={roleRef}
              id={`${formId}-role`}
              value={formData.role}
              onChange={(e) => onFieldChange("role", e.target.value)}
              aria-invalid={fieldErrors.role?.length ? "true" : undefined}
              aria-describedby={fieldErrors.role?.length ? `${formId}-role-errors` : undefined}
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
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <FieldErrorMessages id={`${formId}-role-errors`} messages={fieldErrors.role} />
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
            {loading ? "Создание пользователя..." : "Создать пользователя"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateUserForm;
