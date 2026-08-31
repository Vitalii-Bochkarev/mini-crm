import React from "react";
import { formatDate } from "../utils/formatters";

function RestaurantsTable({ restaurants, loading, error, onDeleteRestaurant, deleteLoadingId, deleteError }) {
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          color: "#9ca3af",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 50 50" style={{ marginRight: 12 }}>
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#2563eb"
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
        Загрузка ресторанов...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "#fecaca", padding: 12, backgroundColor: "rgba(220, 38, 38, 0.1)", borderRadius: 8 }}>
        Ошибка: {error}
      </div>
    );
  }

  const showDeleteError = Boolean(deleteError);

  if (restaurants.length === 0) {
    return (
      <div>
        {showDeleteError && (
          <div style={{ marginBottom: 16, color: "#fecaca", padding: 12, backgroundColor: "rgba(220, 38, 38, 0.1)", borderRadius: 8 }}>
            Ошибка: {deleteError}
          </div>
        )}
        <div style={{ color: "#9ca3af", padding: 12 }}>Рестораны не найдены.</div>
      </div>
    );
  }

  return (
    <div>
      {showDeleteError && (
        <div style={{ marginBottom: 16, color: "#fecaca", padding: 12, backgroundColor: "rgba(220, 38, 38, 0.1)", borderRadius: 8 }}>
          Ошибка: {deleteError}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>ID</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>Название</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>Город</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>Активен</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>Создан</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant, idx) => {
              const isDeleting = deleteLoadingId === restaurant.id;

              return (
                <tr key={restaurant.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 16px", color: "#e6eef8" }}>{restaurant.id}</td>
                  <td style={{ padding: "12px 16px", color: "#e6eef8" }}>{restaurant.name}</td>
                  <td style={{ padding: "12px 16px", color: "#e6eef8" }}>{restaurant.city}</td>
                  <td style={{ padding: "12px 16px", color: restaurant.isActive ? "#34d399" : "#fca5a5" }}>
                    {restaurant.isActive ? "Да" : "Нет"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 13 }}>
                    {formatDate(restaurant.createdAt)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      onClick={() => onDeleteRestaurant(restaurant)}
                      disabled={isDeleting}
                      style={{
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 12px",
                        background: isDeleting ? "rgba(107, 114, 128, 0.35)" : "#dc2626",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        opacity: isDeleting ? 0.75 : 1,
                      }}
                    >
                      {isDeleting ? "Удаление..." : "Удалить"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RestaurantsTable;
