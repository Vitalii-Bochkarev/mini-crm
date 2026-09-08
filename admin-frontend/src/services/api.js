import { ROLES } from "../utils/formatters";

const API_URL = "http://localhost:5269";
const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";
const VALID_ROLES = new Set(Object.values(ROLES));

let unauthorizedHandler = null;
let unauthorizedHandled = false;

export class ApiError extends Error {
  constructor(message, status = 0, validationErrors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

function isStoredUserValid(user) {
  return Boolean(
    user &&
      typeof user === "object" &&
      typeof user.id === "string" && user.id.trim() &&
      typeof user.username === "string" && user.username.trim() &&
      typeof user.email === "string" && user.email.trim() &&
      typeof user.isActive === "boolean" &&
      typeof user.role === "string" && user.role.trim() &&
      VALID_ROLES.has(user.role),
  );
}

function isTokenValid(token) {
  return typeof token === "string" && Boolean(token.trim());
}

export function saveSession(session) {
  if (!isTokenValid(session?.token) || !isStoredUserValid(session?.user)) {
    throw new Error("Сервер вернул некорректные данные сессии.");
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
  unauthorizedHandled = false;
  return session;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getSavedSession() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (token === null && storedUser === null) return null;

  if (!isTokenValid(token) || !storedUser) {
    clearSession();
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    if (!isStoredUserValid(user)) {
      clearSession();
      return null;
    }

    return { token, user };
  } catch {
    clearSession();
    return null;
  }
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === "function" ? handler : null;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

function notifyUnauthorized(expectedToken = null) {
  if (unauthorizedHandled) return;

  if (expectedToken && getSavedSession()?.token !== expectedToken) {
    return;
  }

  unauthorizedHandled = true;
  clearSession();
  unauthorizedHandler?.();
}

function getValidationMessages(errors) {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return [];
  }

  return Object.values(errors)
    .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
    .filter((message) => typeof message === "string" && message.trim())
    .map((message) => message.trim());
}

function buildPagedUrl(path, { search, page, pageSize, sortBy, sortDirection }) {
  const query = new URLSearchParams();

  if (search?.trim()) query.set("search", search.trim());
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));
  if (sortBy) query.set("sortBy", sortBy);
  if (sortDirection) query.set("sortDirection", sortDirection);

  return `${API_URL}${path}?${query.toString()}`;
}

function toPagedResult(data, fallbackPage, fallbackPageSize) {
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totalCount: Number.isInteger(data?.totalCount) ? data.totalCount : 0,
    page: Number.isInteger(data?.page) ? data.page : fallbackPage,
    pageSize: Number.isInteger(data?.pageSize) ? data.pageSize : fallbackPageSize,
  };
}

async function request(url, options = {}, requiresAuth = true) {
  const headers = new Headers(options.headers);
  let requestToken = null;

  if (requiresAuth) {
    const session = getSavedSession();
    if (!session) {
      notifyUnauthorized();
      throw new ApiError("Токен авторизации не найден", 401);
    }

    requestToken = session.token;
    headers.set("Authorization", `Bearer ${requestToken}`);
  }

  let res;

  try {
    res = await fetch(url, { ...options, headers });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Не удалось связаться с сервером. Проверьте подключение.");
  }

  let data = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      data = {};
    }
  }

  if (!res.ok) {
    if (requiresAuth && res.status === 401) {
      notifyUnauthorized(requestToken);
    }

    const validationErrors =
      data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)
        ? data.errors
        : null;
    const validationMessages = getValidationMessages(validationErrors);
    const msg = validationMessages.length > 0
      ? validationMessages.join(" ")
      : data?.error ||
        data?.message ||
        `Не удалось выполнить запрос. Сервер вернул HTTP ${res.status}.`;
    throw new ApiError(msg, res.status, validationErrors);
  }

  return data;
}

export async function login(username, password) {
  const data = await request(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }, false);

  const token = data?.token || data?.access_token || data?.jwt || data?.accessToken;
  if (!token) throw new ApiError("Сервер не вернул токен");
  if (!isStoredUserValid(data?.user)) throw new ApiError("Сервер не вернул данные пользователя");

  return saveSession({ token, user: data.user });
}

export async function getUsers() {
  const data = await request(`${API_URL}/admin/users`, {
    method: "GET",
  });

  return Array.isArray(data) ? data : data?.users || [];
}

export async function createUser(userData) {
  const data = await request(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return data;
}

export async function deleteUser(userId) {
  const data = await request(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
  });

  return data;
}

export async function updateUser(userId, userData) {
  const data = await request(`${API_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return data;
}

export async function getRestaurants({
  search = "",
  page = 1,
  pageSize = 20,
  sortBy = "createdAt",
  sortDirection = "asc",
  signal,
} = {}) {
  const data = await request(buildPagedUrl("/restaurants", {
    search,
    page,
    pageSize,
    sortBy,
    sortDirection,
  }), {
    method: "GET",
    signal,
  });

  return toPagedResult(data, page, pageSize);
}

export async function createRestaurant(restaurantData) {
  const data = await request(`${API_URL}/restaurants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(restaurantData),
  });

  return data;
}

export async function deleteRestaurant(restaurantId) {
  const data = await request(`${API_URL}/restaurants/${restaurantId}`, {
    method: "DELETE",
  });

  return data;
}

export async function getEmployees({
  search = "",
  page = 1,
  pageSize = 20,
  sortBy = "lastName",
  sortDirection = "asc",
  signal,
} = {}) {
  const data = await request(buildPagedUrl("/employees", {
    search,
    page,
    pageSize,
    sortBy,
    sortDirection,
  }), {
    method: "GET",
    signal,
  });

  return toPagedResult(data, page, pageSize);
}

export async function getRestaurantEmployees(restaurantId) {
  const data = await request(`${API_URL}/restaurants/${restaurantId}/employees`, {
    method: "GET",
  });

  return Array.isArray(data) ? data : data?.employees || [];
}

export async function createEmployee(employeeData) {
  const data = await request(`${API_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employeeData),
  });

  return data;
}

export async function deleteEmployee(employeeId) {
  const data = await request(`${API_URL}/employees/${employeeId}`, {
    method: "DELETE",
  });

  return data;
}

export { API_URL };
