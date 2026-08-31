import React from "react";

function SettingsPage({ username }) {
  const settingsCards = [
    {
      title: "Безопасность",
      description: "JWT-аутентификация выполняется существующим сервисом API с помощью Bearer-токена.",
      details: ["Токен хранится в localStorage", "Для защищённых маршрутов нужна активная сессия", "При выходе текущая сессия завершается"],
    },
    {
      title: "Настройки панели",
      description: `Текущая сессия администратора: ${username || "Неизвестный пользователь"}`,
      details: ["Используется тёмное оформление", "Боковое меню использует ссылки маршрутизатора", "Все страницы используют общий макет панели администратора"],
    },
    {
      title: "Состояние системы",
      description: "Frontend подключён к прежним endpoint’ам backend для операций CRUD и авторизации.",
      details: ["Endpoint входа: /auth/login", "Endpoint управления пользователями: /admin/users", "Маршруты настроены в React Router"],
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#93c5fd", margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>
          Настройки
        </p>
        <h2 style={{ color: "#e6eef8", margin: "8px 0 6px", fontSize: 28 }}>
          Настройки администратора
        </h2>
        <p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>
          Просмотрите текущую конфигурацию панели и параметры безопасности.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {settingsCards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: "#111827",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 8px 30px rgba(2,6,23,0.7)",
              padding: 24,
            }}
          >
            <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>{card.title}</h3>
            <p style={{ color: "#9ca3af", margin: "10px 0 16px 0", fontSize: 14, lineHeight: 1.6 }}>
              {card.description}
            </p>
            <ul style={{ paddingLeft: 18, margin: 0, color: "#cbd5e1", fontSize: 14, lineHeight: 1.8 }}>
              {card.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
