import React, { useId, useRef } from "react";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import CreateUserForm from "../components/CreateUserForm";
import Modal from "../components/Modal";
import UsersTable from "../components/UsersTable";
import { ROLE_OPTIONS } from "../utils/formatters";

function UsersPage({
  users,
  usersLoading,
  usersError,
  currentUserId,
  permissions,
  onDeleteUser,
  userToDelete,
  onConfirmDeleteUser,
  onCloseDeleteUser,
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
  const editFormId = useId();
  const editTriggerRef = useRef(null);
  const deleteTriggerRef = useRef(null);
  const listFocusRef = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {permissions.canCreate && (
        <CreateUserForm
          formData={createUserForm}
          onFieldChange={onCreateUserFieldChange}
          onSubmit={onCreateUser}
          loading={createUserLoading}
          error={createUserError}
          success={createUserSuccess}
        />
      )}

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
          <h3 ref={listFocusRef} tabIndex={-1} style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Пользователи системы</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            Управляйте пользователями системы и их доступом.
          </p>
        </div>

        <UsersTable
          users={users}
          loading={usersLoading}
          error={usersError}
          currentUserId={currentUserId}
          canEdit={permissions.canEditUsers}
          canDelete={permissions.canDelete}
          onDeleteUser={(user, trigger) => {
            deleteTriggerRef.current = trigger;
            onDeleteUser(user);
          }}
          onEditUser={(user, trigger) => {
            editTriggerRef.current = trigger;
            onEditUser(user);
          }}
          deleteUserLoadingId={deleteUserLoadingId}
        />
      </div>

      {userToDelete && (
        <ConfirmDeleteDialog
          title="Удаление пользователя"
          name={userToDelete.username}
          loading={deleteUserLoadingId !== null}
          error={deleteUserError}
          onConfirm={onConfirmDeleteUser}
          onClose={onCloseDeleteUser}
          returnFocusRef={deleteTriggerRef}
          fallbackFocusRef={listFocusRef}
        />
      )}

      {editUser && (
        <Modal
          title="Изменение пользователя"
          loading={editUserLoading}
          onClose={onCloseEditUser}
          returnFocusRef={editTriggerRef}
          fallbackFocusRef={listFocusRef}
        >
          {editUserError && (
            <div
              role="alert"
              aria-live="assertive"
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
            <fieldset disabled={editUserLoading} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label
                    htmlFor={`${editFormId}-username`}
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Имя пользователя
                  </label>
                  <input
                    id={`${editFormId}-username`}
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
                    htmlFor={`${editFormId}-email`}
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Электронная почта
                  </label>
                  <input
                    id={`${editFormId}-email`}
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
                    htmlFor={`${editFormId}-role`}
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Роль
                  </label>
                  <select
                    id={`${editFormId}-role`}
                    value={editUserForm.role}
                    onChange={(e) => onEditUserFieldChange("role", e.target.value)}
                    disabled={editUser.id === currentUserId}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "#0f172a",
                      color: "#e6eef8",
                      padding: "12px 14px",
                      cursor: editUser.id === currentUserId ? "not-allowed" : "pointer",
                      opacity: editUser.id === currentUserId ? 0.75 : 1,
                    }}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`${editFormId}-is-active`}
                    style={{ display: "flex", alignItems: "center", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}
                  >
                    <input
                      id={`${editFormId}-is-active`}
                      type="checkbox"
                      checked={editUserForm.isActive}
                      onChange={(e) => onEditUserFieldChange("isActive", e.target.checked)}
                      style={{ marginRight: 10 }}
                    />
                    Активен
                  </label>
                </div>

                <div>
                  <label
                    htmlFor={`${editFormId}-password`}
                    style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}
                  >
                    Новый пароль
                  </label>
                  <input
                    id={`${editFormId}-password`}
                    type="password"
                    value={editUserForm.password}
                    onChange={(e) => onEditUserFieldChange("password", e.target.value)}
                    autoComplete="new-password"
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
                  <p style={{ color: "#9ca3af", margin: "6px 0 0", fontSize: 12 }}>
                    Оставьте поле пустым, чтобы сохранить текущий пароль.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={onCloseEditUser}
                  disabled={editUserLoading}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    background: "transparent",
                    color: "#e6eef8",
                    cursor: editUserLoading ? "not-allowed" : "pointer",
                    opacity: editUserLoading ? 0.75 : 1,
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
            </fieldset>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default UsersPage;
