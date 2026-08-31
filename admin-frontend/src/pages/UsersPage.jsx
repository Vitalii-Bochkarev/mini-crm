import React from "react";
import CreateUserForm from "../components/CreateUserForm";
import UsersTable from "../components/UsersTable";
import { ROLE_OPTIONS } from "../utils/formatters";

function UsersPage({
  users,
  usersLoading,
  usersError,
  currentUsername,
  onDeleteUser,
  onEditUser,
  deleteUserLoadingId,
  deleteUserError,
  createUserForm,
  onCreateUserFieldChange,
  onCreateUser,
  createUserLoading,
  createUserError,
  createUserSuccess,
  editUser,
  editUserForm,
  onEditUserFieldChange,
  onEditUserSubmit,
  editUserLoading,
  editUserError,
  onCloseEditUser,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CreateUserForm
        formData={createUserForm}
        onFieldChange={onCreateUserFieldChange}
        onSubmit={onCreateUser}
        loading={createUserLoading}
        error={createUserError}
        success={createUserSuccess}
      />

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
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Пользователи системы</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            Управляйте пользователями системы и их доступом.
          </p>
        </div>

        <UsersTable
          users={users}
          loading={usersLoading}
          error={usersError}
          currentUsername={currentUsername}
          onDeleteUser={onDeleteUser}
          onEditUser={onEditUser}
          deleteUserLoadingId={deleteUserLoadingId}
          deleteUserError={deleteUserError}
        />
      </div>

      {editUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 30,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              borderRadius: 20,
              background: "linear-gradient(180deg, #111827 0%, #0b1220 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.7)",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Изменение пользователя</h3>
                <p style={{ color: "#9ca3af", margin: "6px 0 0 0", fontSize: 14 }}>
                  Измените имя пользователя, электронную почту и роль.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseEditUser}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#cbd5e1",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {editUserError && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 10,
                  color: "#fecaca",
                  backgroundColor: "rgba(220, 38, 38, 0.12)",
                }}
              >
                {editUserError}
              </div>
            )}

            <form onSubmit={onEditUserSubmit}>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={editUserForm.username}
                    onChange={(e) => onEditUserFieldChange("username", e.target.value)}
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
                  <label
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Электронная почта
                  </label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => onEditUserFieldChange("email", e.target.value)}
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
                  <label
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Роль
                  </label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => onEditUserFieldChange("role", e.target.value)}
                    disabled={editUser.username === currentUsername}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#0f172a",
                      color: "#e6eef8",
                      padding: "12px 14px",
                      cursor: editUser.username === currentUsername ? "not-allowed" : "pointer",
                      opacity: editUser.username === currentUsername ? 0.75 : 1,
                    }}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={onCloseEditUser}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    background: "transparent",
                    color: "#e6eef8",
                    cursor: "pointer",
                  }}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={editUserLoading}
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 16px",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: editUserLoading ? "not-allowed" : "pointer",
                    opacity: editUserLoading ? 0.75 : 1,
                  }}
                >
                  {editUserLoading ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
