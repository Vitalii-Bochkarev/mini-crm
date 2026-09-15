import { useId } from "react";

function CreateEmployeeForm({
  formData,
  onFieldChange,
  onSubmit,
  loading,
  error,
  success,
  restaurants = [],
  restaurantsLoading,
  restaurantsError,
  restaurantsRetrying,
  onRetryRestaurants,
  mode = "create",
  embedded = false,
  currentRestaurantId = "",
  onCancel,
}) {
  const isEdit = mode === "edit";
  const submitDisabled = loading || restaurantsLoading || Boolean(restaurantsError) || restaurants.length === 0;
  const formId = useId();
  const firstNameId = `${formId}-first-name`;
  const lastNameId = `${formId}-last-name`;
  const positionId = `${formId}-position`;
  const salaryId = `${formId}-salary`;
  const restaurantId = `${formId}-restaurant`;

  return (
    <div
      style={{
        backgroundColor: embedded ? "transparent" : "#111827",
        borderRadius: embedded ? 0 : 14,
        border: embedded ? "none" : "1px solid rgba(255,255,255,0.04)",
        boxShadow: embedded ? "none" : "0 8px 30px rgba(2,6,23,0.7)",
        padding: embedded ? 0 : 24,
      }}
    >
      {!embedded && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>
            {isEdit ? "Изменение сотрудника" : "Добавление сотрудника"}
          </h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            {isEdit ? "Измените данные сотрудника." : "Добавьте нового сотрудника ресторана."}
          </p>
        </div>
      )}

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

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div>
          <label htmlFor={firstNameId} style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Имя *
          </label>
          <input
            id={firstNameId}
            type="text"
            value={formData.firstName}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "12px 14px",
            }}
            required
          />
        </div>

        <div>
          <label htmlFor={lastNameId} style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Фамилия *
          </label>
          <input
            id={lastNameId}
            type="text"
            value={formData.lastName}
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "12px 14px",
            }}
            required
          />
        </div>

        <div>
          <label htmlFor={positionId} style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Должность *
          </label>
          <input
            id={positionId}
            type="text"
            value={formData.position}
            onChange={(e) => onFieldChange("position", e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "12px 14px",
            }}
            required
          />
        </div>

        <div>
          <label htmlFor={salaryId} style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Зарплата
          </label>
          <input
            id={salaryId}
            type="number"
            step="0.01"
            value={formData.salary}
            onChange={(e) => onFieldChange("salary", parseFloat(e.target.value) || 0)}
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

        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor={restaurantId} style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Ресторан *
          </label>
          <select
            id={restaurantId}
            value={formData.restaurantId}
            onChange={(e) => onFieldChange("restaurantId", e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#0f172a",
              color: "#e6eef8",
              padding: "12px 14px",
            }}
            required
            disabled={restaurantsLoading}
          >
            <option value="">
              {restaurantsLoading
                ? "Загрузка ресторанов..."
                : restaurants.length === 0
                  ? "Нет доступных активных ресторанов"
                  : "Выберите ресторан"}
            </option>
            {restaurants.map((restaurant) => (
              <option
                key={restaurant.id}
                value={restaurant.id}
                disabled={isEdit && !restaurant.isActive && restaurant.id !== currentRestaurantId}
              >
                {restaurant.name}{!restaurant.isActive ? " (неактивен)" : ""}
              </option>
            ))}
          </select>
          {(restaurantsError || restaurantsRetrying) && (
            <div style={{ marginTop: 8 }}>
              {restaurantsError && (
                <div style={{ color: "#fecaca", fontSize: 13 }}>
                  {restaurantsError}
                </div>
              )}
              <button
                type="button"
                onClick={onRetryRestaurants}
                disabled={restaurantsLoading}
                style={{
                  marginTop: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  background: "#0f172a",
                  color: "#e6eef8",
                  cursor: restaurantsLoading ? "not-allowed" : "pointer",
                  opacity: restaurantsLoading ? 0.6 : 1,
                }}
              >
                {restaurantsLoading ? "Повторная загрузка..." : "Повторить"}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, gridColumn: "1 / -1" }}>
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

        <div style={{ display: "flex", gap: 12, gridColumn: "1 / -1" }}>
          {isEdit && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "12px 24px",
                background: "#0f172a",
                color: "#e6eef8",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
              }}
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            disabled={submitDisabled}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "none",
              padding: "12px 24px",
              background: submitDisabled ? "rgba(107, 114, 128, 0.35)" : "#2563eb",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: submitDisabled ? "not-allowed" : "pointer",
              opacity: submitDisabled ? 0.75 : 1,
            }}
          >
            {loading
              ? isEdit ? "Сохранение..." : "Добавление..."
              : restaurantsLoading
                ? "Загрузка ресторанов..."
                : isEdit ? "Сохранить изменения" : "Добавить сотрудника"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEmployeeForm;
