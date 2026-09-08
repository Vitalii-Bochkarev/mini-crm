import React from "react";

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
}) {
  const submitDisabled = loading || restaurantsLoading || Boolean(restaurantsError) || restaurants.length === 0;

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
        <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Добавление сотрудника</h3>
        <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
          Добавьте нового сотрудника ресторана.
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

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div>
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Имя *
          </label>
          <input
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
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Фамилия *
          </label>
          <input
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
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Должность *
          </label>
          <input
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
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Зарплата
          </label>
          <input
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
          <label style={{ display: "block", color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Ресторан *
          </label>
          <select
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
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
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

        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            disabled={submitDisabled}
            style={{
              width: "100%",
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
            {loading ? "Добавление..." : restaurantsLoading ? "Загрузка ресторанов..." : "Добавить сотрудника"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEmployeeForm;
