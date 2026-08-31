import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import EmployeesPage from "./pages/EmployeesPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { login, getUsers, createUser, deleteUser, updateUser, getRestaurants, createRestaurant, deleteRestaurant, getEmployees, createEmployee, deleteEmployee } from "./services/api";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(null);
  const [deleteUserError, setDeleteUserError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    username: "",
    email: "",
    role: "Administrator",
  });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState("");
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Administrator",
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState(null);
  const [createUserSuccess, setCreateUserSuccess] = useState("");

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState(null);
  const [createRestaurantForm, setCreateRestaurantForm] = useState({
    name: "",
    city: "",
    isActive: true,
  });
  const [createRestaurantLoading, setCreateRestaurantLoading] = useState(false);
  const [createRestaurantError, setCreateRestaurantError] = useState(null);
  const [createRestaurantSuccess, setCreateRestaurantSuccess] = useState("");
  const [deleteRestaurantLoading, setDeleteRestaurantLoading] = useState(null);
  const [deleteRestaurantError, setDeleteRestaurantError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);
  const [createEmployeeForm, setCreateEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    position: "",
    salary: 0,
    restaurantId: "",
    isActive: true,
  });
  const [createEmployeeLoading, setCreateEmployeeLoading] = useState(false);
  const [createEmployeeError, setCreateEmployeeError] = useState(null);
  const [createEmployeeSuccess, setCreateEmployeeSuccess] = useState("");
  const [deleteEmployeeLoading, setDeleteEmployeeLoading] = useState(null);
  const [deleteEmployeeError, setDeleteEmployeeError] = useState("");

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const administrators = users.filter((user) => {
      const role = String(user.role || "").toLowerCase();
      return role === "administrator" || role === "superadmin";
    }).length;
    const editors = users.filter((user) => String(user.role || "").toLowerCase() === "editor").length;
    const viewers = users.filter((user) => String(user.role || "").toLowerCase() === "viewer").length;

    return [
      { label: "Всего пользователей", value: totalUsers, accent: "#60a5fa" },
      { label: "Администраторы", value: administrators, accent: "#f59e0b" },
      { label: "Редакторы", value: editors, accent: "#34d399" },
      { label: "Наблюдатели", value: viewers, accent: "#c084fc" },
    ];
  }, [users]);

  const pageTitle =
    location.pathname === "/users"
      ? "Пользователи"
      : location.pathname === "/restaurants"
        ? "Рестораны"
        : location.pathname === "/employees"
          ? "Сотрудники"
          : location.pathname === "/settings"
            ? "Настройки"
            : "Обзор";

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);

    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setUsersError(err.message || "Не удалось загрузить пользователей");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadRestaurants = async () => {
    setRestaurantsLoading(true);
    setRestaurantsError(null);

    try {
      const fetchedRestaurants = await getRestaurants();
      setRestaurants(fetchedRestaurants);
    } catch (err) {
      setRestaurantsError(err.message || "Не удалось загрузить рестораны");
    } finally {
      setRestaurantsLoading(false);
    }
  };

  const loadEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);

    try {
      const fetchedEmployees = await getEmployees();
      setEmployees(fetchedEmployees);
    } catch (err) {
      setEmployeesError(err.message || "Не удалось загрузить сотрудников");
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      setLoggedIn(true);
      navigate("/");
    } catch (err) {
      setError(err.message || "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserFieldChange = (field, value) => {
    setCreateUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateRestaurantFieldChange = (field, value) => {
    setCreateRestaurantForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateEmployeeFieldChange = (field, value) => {
    setCreateEmployeeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError(null);
    setCreateUserSuccess("");
    setCreateUserLoading(true);

    try {
      await createUser(createUserForm);
      setCreateUserSuccess("Пользователь успешно создан.");
      setCreateUserForm({
        username: "",
        email: "",
        password: "",
        role: "Administrator",
      });
      await loadUsers();
    } catch (err) {
      setCreateUserError(err.message || "Не удалось создать пользователя");
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setCreateRestaurantError(null);
    setCreateRestaurantSuccess("");
    setCreateRestaurantLoading(true);

    try {
      await createRestaurant(createRestaurantForm);
      setCreateRestaurantSuccess("Ресторан успешно создан.");
      setCreateRestaurantForm({
        name: "",
        city: "",
        isActive: true,
      });
      await loadRestaurants();
    } catch (err) {
      setCreateRestaurantError(err.message || "Не удалось создать ресторан");
    } finally {
      setCreateRestaurantLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.username === username) {
      setDeleteUserError("Нельзя удалить пользователя, под которым выполнен вход.");
      return;
    }

    setDeleteUserError("");
    setDeleteUserLoading(user.id);

    try {
      await deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setDeleteUserError(err.message || "Не удалось удалить пользователя");
    } finally {
      setDeleteUserLoading(null);
    }
  };

  const openEditUser = (user) => {
    setEditUserError("");
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email || "",
      role: user.role || "Administrator",
    });
    setEditUserForm({
      username: user.username,
      email: user.email || "",
      role: user.role || "Administrator",
    });
  };

  const handleDeleteRestaurant = async (restaurant) => {
    setDeleteRestaurantError("");
    setDeleteRestaurantLoading(restaurant.id);

    try {
      await deleteRestaurant(restaurant.id);
      await loadRestaurants();
    } catch (err) {
      setDeleteRestaurantError(err.message || "Не удалось удалить ресторан");
    } finally {
      setDeleteRestaurantLoading(null);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setCreateEmployeeError(null);
    setCreateEmployeeSuccess("");
    setCreateEmployeeLoading(true);

    try {
      await createEmployee(createEmployeeForm);
      setCreateEmployeeSuccess("Сотрудник успешно создан.");
      setCreateEmployeeForm({
        firstName: "",
        lastName: "",
        position: "",
        salary: 0,
        restaurantId: "",
        isActive: true,
      });
      await loadEmployees();
    } catch (err) {
      setCreateEmployeeError(err.message || "Не удалось создать сотрудника");
    } finally {
      setCreateEmployeeLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    setDeleteEmployeeError("");
    setDeleteEmployeeLoading(employee.id);

    try {
      await deleteEmployee(employee.id);
      await loadEmployees();
    } catch (err) {
      setDeleteEmployeeError(err.message || "Не удалось удалить сотрудника");
    } finally {
      setDeleteEmployeeLoading(null);
    }
  };

  const closeEditUser = () => {
    setEditUser(null);
    setEditUserError("");
    setEditUserForm({
      username: "",
      email: "",
      role: "Administrator",
    });
  };

  const handleEditUserFieldChange = (field, value) => {
    setEditUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    setEditUserError("");
    setEditUserLoading(true);

    try {
      await updateUser(editUser.id, editUserForm);
      closeEditUser();
      await loadUsers();
    } catch (err) {
      setEditUserError(err.message || "Не удалось изменить пользователя");
    } finally {
      setEditUserLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;
    loadUsers();
    loadRestaurants();
    loadEmployees();
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUsers([]);
    setRestaurants([]);
    setEmployees([]);
    setUsername("");
    setPassword("");
    setDeleteUserLoading(null);
    setDeleteUserError("");
    setDeleteRestaurantLoading(null);
    setDeleteRestaurantError("");
    setDeleteEmployeeLoading(null);
    setDeleteEmployeeError("");
    setEditUser(null);
    setEditUserForm({
      username: "",
      email: "",
      role: "Administrator",
    });
    setEditUserLoading(false);
    setEditUserError("");
    setCreateUserForm({
      username: "",
      email: "",
      password: "",
      role: "Administrator",
    });
    setCreateUserError(null);
    setCreateUserSuccess("");
    setCreateRestaurantForm({
      name: "",
      city: "",
      isActive: true,
    });
    setCreateRestaurantError(null);
    setCreateRestaurantSuccess("");
    setCreateEmployeeForm({
      firstName: "",
      lastName: "",
      position: "",
      salary: 0,
      restaurantId: "",
      isActive: true,
    });
    setCreateEmployeeError(null);
    setCreateEmployeeSuccess("");
    navigate("/login");
  };

  if (!loggedIn) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              username={username}
              password={password}
              loading={loading}
              error={error}
              onUsernameChange={(e) => setUsername(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              onSubmit={handleSubmit}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
        display: "flex",
      }}
    >
      <Sidebar onLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 64,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(11, 18, 32, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ color: "#e6eef8", margin: 0, fontSize: 18 }}>{pageTitle}</h2>
          </div>

          <div style={{ color: "#9ca3af", fontSize: 14 }}>
            Добро пожаловать, <span style={{ color: "#e6eef8", fontWeight: 600 }}>{username}</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <Routes>
            <Route
              path="/"
              element={<DashboardPage stats={stats} username={username} />}
            />
            <Route
              path="/users"
              element={
                <UsersPage
                  users={users}
                  usersLoading={usersLoading}
                  usersError={usersError}
                  currentUsername={username}
                  onDeleteUser={handleDeleteUser}
                  onEditUser={openEditUser}
                  deleteUserLoadingId={deleteUserLoading}
                  deleteUserError={deleteUserError}
                  createUserForm={createUserForm}
                  onCreateUserFieldChange={handleCreateUserFieldChange}
                  onCreateUser={handleCreateUser}
                  createUserLoading={createUserLoading}
                  createUserError={createUserError}
                  createUserSuccess={createUserSuccess}
                  editUser={editUser}
                  editUserForm={editUserForm}
                  onEditUserFieldChange={handleEditUserFieldChange}
                  onEditUserSubmit={handleEditUserSubmit}
                  editUserLoading={editUserLoading}
                  editUserError={editUserError}
                  onCloseEditUser={closeEditUser}
                />
              }
            />
            <Route
              path="/restaurants"
              element={
                <RestaurantsPage
                  restaurants={restaurants}
                  restaurantsLoading={restaurantsLoading}
                  restaurantsError={restaurantsError}
                  createRestaurantForm={createRestaurantForm}
                  onCreateRestaurantFieldChange={handleCreateRestaurantFieldChange}
                  onCreateRestaurant={handleCreateRestaurant}
                  createRestaurantLoading={createRestaurantLoading}
                  createRestaurantError={createRestaurantError}
                  createRestaurantSuccess={createRestaurantSuccess}
                  onDeleteRestaurant={handleDeleteRestaurant}
                  deleteRestaurantLoadingId={deleteRestaurantLoading}
                  deleteRestaurantError={deleteRestaurantError}
                />
              }
            />
            <Route
              path="/employees"
              element={
                <EmployeesPage
                  employees={employees}
                  employeesLoading={employeesLoading}
                  employeesError={employeesError}
                  createEmployeeForm={createEmployeeForm}
                  onCreateEmployeeFieldChange={handleCreateEmployeeFieldChange}
                  onCreateEmployee={handleCreateEmployee}
                  createEmployeeLoading={createEmployeeLoading}
                  createEmployeeError={createEmployeeError}
                  createEmployeeSuccess={createEmployeeSuccess}
                  onDeleteEmployee={handleDeleteEmployee}
                  deleteEmployeeLoadingId={deleteEmployeeLoading}
                  deleteEmployeeError={deleteEmployeeError}
                  restaurants={restaurants}
                />
              }
            />
            <Route
              path="/settings"
              element={<SettingsPage username={username} />}
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
