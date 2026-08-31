const API_URL = "http://localhost:5269";

function getValidationMessages(errors) {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return [];
  }

  return Object.values(errors)
    .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
    .filter((message) => typeof message === "string" && message.trim())
    .map((message) => message.trim());
}

async function request(url, options = {}) {
  let res;

  try {
    res = await fetch(url, options);
  } catch {
    throw new Error("Не удалось связаться с сервером. Проверьте подключение.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const validationMessages = getValidationMessages(data?.errors);
    const msg = validationMessages.length > 0
      ? validationMessages.join(" ")
      : data?.error ||
        data?.message ||
        `Не удалось выполнить запрос. Сервер вернул HTTP ${res.status}.`;
    throw new Error(msg);
  }

  return data;
}

export async function login(username, password) {
  const data = await request(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const token = data?.token || data?.access_token || data?.jwt || data?.accessToken;
  if (!token) throw new Error("Сервер не вернул токен");

  localStorage.setItem("token", token);
  return token;
}

export async function getUsers() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/admin/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return Array.isArray(data) ? data : data?.users || [];
}

export async function createUser(userData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  return data;
}

export async function deleteUser(userId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateUser(userId, userData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  return data;
}

export async function getRestaurants() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/restaurants`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return Array.isArray(data) ? data : data?.items || [];
}

export async function createRestaurant(restaurantData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/restaurants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(restaurantData),
  });

  return data;
}

export async function deleteRestaurant(restaurantId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/restaurants/${restaurantId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getEmployees() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/employees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return Array.isArray(data) ? data : data?.items || [];
}

export async function getRestaurantEmployees(restaurantId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/restaurants/${restaurantId}/employees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return Array.isArray(data) ? data : data?.employees || [];
}

export async function createEmployee(employeeData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(employeeData),
  });

  return data;
}

export async function deleteEmployee(employeeId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Токен авторизации не найден");

  const data = await request(`${API_URL}/employees/${employeeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export { API_URL };
