import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import EmployeesPage from "./pages/EmployeesPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { login, getUsers, createUser, deleteUser, updateUser, getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, getEmployees, createEmployee, updateEmployee, deleteEmployee, clearSession, getSavedSession, saveSession, setUnauthorizedHandler } from "./services/api";
import { ROLES } from "./utils/formatters";
import { getUiPermissions } from "./utils/permissions";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(() => getSavedSession());
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(null);
  const [deleteUserError, setDeleteUserError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    username: "",
    email: "",
    isActive: true,
    role: ROLES.ADMINISTRATOR,
    password: "",
  });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState("");
  const [createUserForm, setCreateUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: ROLES.ADMINISTRATOR,
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState(null);
  const [createUserSuccess, setCreateUserSuccess] = useState("");

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsTotalCount, setRestaurantsTotalCount] = useState(0);
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const [restaurantsPageSize, setRestaurantsPageSize] = useState(20);
  const [restaurantsSearchInput, setRestaurantsSearchInput] = useState("");
  const [restaurantsDebouncedSearch, setRestaurantsDebouncedSearch] = useState("");
  const [restaurantsSortBy, setRestaurantsSortBy] = useState("createdAt");
  const [restaurantsSortDirection, setRestaurantsSortDirection] = useState("asc");
  const [restaurantsLoading, setRestaurantsLoading] = useState(Boolean(session));
  const [restaurantsError, setRestaurantsError] = useState(null);
  const [restaurantsRefreshKey, setRestaurantsRefreshKey] = useState(0);
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
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [editRestaurantForm, setEditRestaurantForm] = useState({
    name: "",
    city: "",
    isActive: true,
  });
  const [editRestaurantLoading, setEditRestaurantLoading] = useState(false);
  const [editRestaurantError, setEditRestaurantError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [employeesTotalCount, setEmployeesTotalCount] = useState(0);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [employeesPageSize, setEmployeesPageSize] = useState(20);
  const [employeesSearchInput, setEmployeesSearchInput] = useState("");
  const [employeesDebouncedSearch, setEmployeesDebouncedSearch] = useState("");
  const [employeesSortBy, setEmployeesSortBy] = useState("lastName");
  const [employeesSortDirection, setEmployeesSortDirection] = useState("asc");
  const [employeesLoading, setEmployeesLoading] = useState(Boolean(session));
  const [employeesError, setEmployeesError] = useState(null);
  const [employeesRefreshKey, setEmployeesRefreshKey] = useState(0);
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
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editEmployeeForm, setEditEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    position: "",
    salary: 0,
    restaurantId: "",
    isActive: true,
  });
  const [editEmployeeLoading, setEditEmployeeLoading] = useState(false);
  const [editEmployeeError, setEditEmployeeError] = useState("");

  const currentUser = session?.user || null;
  const loggedIn = Boolean(session);
  const permissions = useMemo(
    () => getUiPermissions(currentUser?.role),
    [currentUser?.role],
  );
  const sessionTokenRef = useRef(session?.token || null);
  const restaurantsRequestGenerationRef = useRef(0);
  const employeesRequestGenerationRef = useRef(0);
  const restaurantOptionsRequestGenerationRef = useRef(0);
  const restaurantsSearchChangePendingRef = useRef(false);
  const employeesSearchChangePendingRef = useRef(false);
  const deleteRestaurantRequestRef = useRef(null);
  const deleteEmployeeRequestRef = useRef(null);
  const updateRestaurantRequestRef = useRef(null);
  const updateEmployeeRequestRef = useRef(null);

  const [allRestaurantOptions, setAllRestaurantOptions] = useState([]);
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [restaurantOptionsLoading, setRestaurantOptionsLoading] = useState(
    Boolean(session && permissions.canCreate),
  );
  const [restaurantOptionsError, setRestaurantOptionsError] = useState(null);
  const [restaurantOptionsRetrying, setRestaurantOptionsRetrying] = useState(false);
  const [restaurantOptionsRefreshKey, setRestaurantOptionsRefreshKey] = useState(0);

  const editEmployeeRestaurantOptions = useMemo(() => {
    if (!editEmployee) return [];

    return allRestaurantOptions.filter((restaurant) =>
      restaurant.isActive || restaurant.id === editEmployee.restaurantId);
  }, [allRestaurantOptions, editEmployee]);

  const editEmployeeRestaurantError = restaurantOptionsError || (
    editEmployee &&
    !restaurantOptionsLoading &&
    !allRestaurantOptions.some((restaurant) =>
      restaurant.id === editEmployeeForm.restaurantId &&
      (restaurant.isActive || restaurant.id === editEmployee.restaurantId))
      ? editEmployeeForm.restaurantId === editEmployee.restaurantId
        ? "Текущий ресторан сотрудника больше не существует. Выберите доступный активный ресторан."
        : "Выбранный ресторан недоступен. Выберите активный ресторан."
      : null
  );

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const administrators = users.filter((user) => {
      const role = String(user.role || "").toLowerCase();
      return role === ROLES.ADMINISTRATOR.toLowerCase() || role === "superadmin";
    }).length;
    const editors = users.filter((user) => String(user.role || "").toLowerCase() === ROLES.EDITOR.toLowerCase()).length;
    const viewers = users.filter((user) => String(user.role || "").toLowerCase() === ROLES.VIEWER.toLowerCase()).length;

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

  const loadUsers = async (expectedToken = sessionTokenRef.current) => {
    if (!expectedToken) return;

    setUsersLoading(true);
    setUsersError(null);

    try {
      const fetchedUsers = await getUsers();
      if (sessionTokenRef.current !== expectedToken) return;
      setUsers(fetchedUsers);
    } catch (err) {
      if (sessionTokenRef.current !== expectedToken) return;
      setUsersError(err.message || "Не удалось загрузить пользователей");
    } finally {
      if (sessionTokenRef.current === expectedToken) {
        setUsersLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authenticatedSession = await login(username, password);
      sessionTokenRef.current = authenticatedSession.token;
      deleteRestaurantRequestRef.current = null;
      deleteEmployeeRequestRef.current = null;
      setRestaurantToDelete(null);
      setEmployeeToDelete(null);
      setDeleteRestaurantLoading(null);
      setDeleteEmployeeLoading(null);
      setDeleteRestaurantError("");
      setDeleteEmployeeError("");
      restaurantsRequestGenerationRef.current += 1;
      employeesRequestGenerationRef.current += 1;
      restaurantOptionsRequestGenerationRef.current += 1;
      setRestaurantsLoading(true);
      setRestaurantsError(null);
      setEmployeesLoading(true);
      setEmployeesError(null);
      setRestaurantOptionsLoading(getUiPermissions(authenticatedSession.user.role).canCreate);
      setRestaurantOptionsError(null);
      setRestaurantOptionsRetrying(false);
      setSession(authenticatedSession);
      setPassword("");
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
    const requestToken = sessionTokenRef.current;
    setCreateUserError(null);
    setCreateUserSuccess("");
    setCreateUserLoading(true);

    try {
      await createUser(createUserForm);
      if (sessionTokenRef.current !== requestToken) return;
      setCreateUserSuccess("Пользователь успешно создан.");
      setCreateUserForm({
        username: "",
        email: "",
        password: "",
        role: ROLES.ADMINISTRATOR,
      });
      await loadUsers();
    } catch (err) {
      if (sessionTokenRef.current !== requestToken) return;
      setCreateUserError(err.message || "Не удалось создать пользователя");
    } finally {
      if (sessionTokenRef.current === requestToken) {
        setCreateUserLoading(false);
      }
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    const requestToken = sessionTokenRef.current;
    setCreateRestaurantError(null);
    setCreateRestaurantSuccess("");
    setCreateRestaurantLoading(true);

    try {
      await createRestaurant(createRestaurantForm);
      if (sessionTokenRef.current !== requestToken) return;
      setCreateRestaurantSuccess("Ресторан успешно создан.");
      setCreateRestaurantForm({
        name: "",
        city: "",
        isActive: true,
      });
      restaurantsRequestGenerationRef.current += 1;
      setRestaurantsLoading(true);
      setRestaurantsRefreshKey((value) => value + 1);
      restaurantOptionsRequestGenerationRef.current += 1;
      setAllRestaurantOptions([]);
      setRestaurantOptions([]);
      setRestaurantOptionsLoading(true);
      setRestaurantOptionsError(null);
      setRestaurantOptionsRetrying(false);
      setRestaurantOptionsRefreshKey((value) => value + 1);
    } catch (err) {
      if (sessionTokenRef.current !== requestToken) return;
      setCreateRestaurantError(err.message || "Не удалось создать ресторан");
    } finally {
      if (sessionTokenRef.current === requestToken) {
        setCreateRestaurantLoading(false);
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      setDeleteUserError("Нельзя удалить пользователя, под которым выполнен вход.");
      return;
    }

    const requestToken = sessionTokenRef.current;
    setDeleteUserError("");
    setDeleteUserLoading(user.id);

    try {
      await deleteUser(user.id);
      if (sessionTokenRef.current !== requestToken) return;
      await loadUsers();
    } catch (err) {
      if (sessionTokenRef.current !== requestToken) return;
      setDeleteUserError(err.message || "Не удалось удалить пользователя");
    } finally {
      if (sessionTokenRef.current === requestToken) {
        setDeleteUserLoading(null);
      }
    }
  };

  const openEditUser = (user) => {
    setEditUserError("");
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email || "",
      isActive: user.isActive,
      role: user.role || ROLES.ADMINISTRATOR,
      password: "",
    });
    setEditUserForm({
      username: user.username,
      email: user.email || "",
      isActive: user.isActive,
      role: user.role || ROLES.ADMINISTRATOR,
      password: "",
    });
  };

  const openEditRestaurant = (restaurant) => {
    setEditRestaurantError("");
    setEditRestaurant({
      id: restaurant.id,
      name: restaurant.name,
      city: restaurant.city,
      isActive: restaurant.isActive,
    });
    setEditRestaurantForm({
      name: restaurant.name,
      city: restaurant.city,
      isActive: restaurant.isActive,
    });
  };

  const handleEditRestaurantFieldChange = (field, value) => {
    setEditRestaurantForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeEditRestaurant = () => {
    if (updateRestaurantRequestRef.current !== null) return;

    setEditRestaurant(null);
    setEditRestaurantForm({ name: "", city: "", isActive: true });
    setEditRestaurantError("");
  };

  const handleEditRestaurantSubmit = async (event) => {
    event.preventDefault();
    if (!editRestaurant || updateRestaurantRequestRef.current !== null) return;

    const updateRequest = Symbol("updateRestaurant");
    const requestToken = sessionTokenRef.current;
    updateRestaurantRequestRef.current = updateRequest;
    setEditRestaurantError("");
    setEditRestaurantLoading(true);

    try {
      await updateRestaurant(editRestaurant.id, {
        name: editRestaurantForm.name,
        city: editRestaurantForm.city,
        isActive: editRestaurantForm.isActive,
      });

      if (
        sessionTokenRef.current !== requestToken ||
        updateRestaurantRequestRef.current !== updateRequest
      ) return;

      setEditRestaurant(null);
      setEditRestaurantForm({ name: "", city: "", isActive: true });
      setEditRestaurantError("");

      restaurantsRequestGenerationRef.current += 1;
      setRestaurantsLoading(true);
      setRestaurantsRefreshKey((value) => value + 1);

      restaurantOptionsRequestGenerationRef.current += 1;
      setAllRestaurantOptions([]);
      setRestaurantOptions([]);
      setRestaurantOptionsLoading(true);
      setRestaurantOptionsError(null);
      setRestaurantOptionsRetrying(false);
      setRestaurantOptionsRefreshKey((value) => value + 1);
    } catch (err) {
      if (
        sessionTokenRef.current !== requestToken ||
        updateRestaurantRequestRef.current !== updateRequest
      ) return;

      setEditRestaurantError(err.message || "Не удалось изменить ресторан");
    } finally {
      const currentUpdateIsCurrent =
        sessionTokenRef.current === requestToken &&
        updateRestaurantRequestRef.current === updateRequest;

      if (currentUpdateIsCurrent) {
        updateRestaurantRequestRef.current = null;
        setEditRestaurantLoading(false);
      }
    }
  };

  const openDeleteRestaurant = (restaurant) => {
    if (!permissions.canDelete || !sessionTokenRef.current || deleteRestaurantRequestRef.current !== null) return;
    setDeleteRestaurantError("");
    setRestaurantToDelete({ id: restaurant.id, name: restaurant.name });
  };

  const closeDeleteRestaurant = () => {
    if (deleteRestaurantRequestRef.current !== null) return;
    setRestaurantToDelete(null);
    setDeleteRestaurantError("");
  };

  const handleDeleteRestaurant = async () => {
    if (!permissions.canDelete || !sessionTokenRef.current || !restaurantToDelete || deleteRestaurantRequestRef.current !== null) return;
    const restaurant = restaurantToDelete;

    const deleteRequest = Symbol("deleteRestaurant");
    deleteRestaurantRequestRef.current = deleteRequest;
    const requestToken = sessionTokenRef.current;
    setDeleteRestaurantError("");
    setDeleteRestaurantLoading(restaurant.id);

    try {
      await deleteRestaurant(restaurant.id);
      if (
        sessionTokenRef.current !== requestToken ||
        deleteRestaurantRequestRef.current !== deleteRequest
      ) return;

      setRestaurantToDelete(null);
      setDeleteRestaurantError("");
      restaurantsRequestGenerationRef.current += 1;
      setRestaurantsLoading(true);
      setRestaurantsRefreshKey((value) => value + 1);
      restaurantOptionsRequestGenerationRef.current += 1;
      setAllRestaurantOptions([]);
      setRestaurantOptions([]);
      setRestaurantOptionsLoading(true);
      setRestaurantOptionsError(null);
      setRestaurantOptionsRetrying(false);
      setRestaurantOptionsRefreshKey((value) => value + 1);
    } catch (err) {
      if (
        sessionTokenRef.current !== requestToken ||
        deleteRestaurantRequestRef.current !== deleteRequest
      ) return;
      setDeleteRestaurantError(err.message || "Не удалось удалить ресторан");
    } finally {
      const currentDeleteIsCurrent =
        sessionTokenRef.current === requestToken &&
        deleteRestaurantRequestRef.current === deleteRequest;

      if (currentDeleteIsCurrent) {
        deleteRestaurantRequestRef.current = null;
        setDeleteRestaurantLoading(null);
      }
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const requestToken = sessionTokenRef.current;
    setCreateEmployeeError(null);
    setCreateEmployeeSuccess("");
    setCreateEmployeeLoading(true);

    try {
      await createEmployee(createEmployeeForm);
      if (sessionTokenRef.current !== requestToken) return;
      setCreateEmployeeSuccess("Сотрудник успешно создан.");
      setCreateEmployeeForm({
        firstName: "",
        lastName: "",
        position: "",
        salary: 0,
        restaurantId: "",
        isActive: true,
      });
      employeesRequestGenerationRef.current += 1;
      setEmployeesLoading(true);
      setEmployeesRefreshKey((value) => value + 1);
    } catch (err) {
      if (sessionTokenRef.current !== requestToken) return;
      setCreateEmployeeError(err.message || "Не удалось создать сотрудника");
    } finally {
      if (sessionTokenRef.current === requestToken) {
        setCreateEmployeeLoading(false);
      }
    }
  };

  const openEditEmployee = (employee) => {
    setEditEmployeeError("");
    setEditEmployee({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      salary: employee.salary,
      restaurantId: employee.restaurantId,
      isActive: employee.isActive,
    });
    setEditEmployeeForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      salary: employee.salary,
      restaurantId: employee.restaurantId,
      isActive: employee.isActive,
    });
  };

  const handleEditEmployeeFieldChange = (field, value) => {
    setEditEmployeeForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeEditEmployee = () => {
    if (updateEmployeeRequestRef.current !== null) return;

    setEditEmployee(null);
    setEditEmployeeForm({
      firstName: "",
      lastName: "",
      position: "",
      salary: 0,
      restaurantId: "",
      isActive: true,
    });
    setEditEmployeeError("");
  };

  const handleEditEmployeeSubmit = async (event) => {
    event.preventDefault();
    if (!editEmployee || updateEmployeeRequestRef.current !== null) return;

    const selectedRestaurant = allRestaurantOptions.find(
      (restaurant) => restaurant.id === editEmployeeForm.restaurantId,
    );
    if (
      !selectedRestaurant ||
      (!selectedRestaurant.isActive && selectedRestaurant.id !== editEmployee.restaurantId)
    ) {
      setEditEmployeeError("Выбранный ресторан недоступен. Выберите активный ресторан.");
      return;
    }

    const updateRequest = Symbol("updateEmployee");
    const requestToken = sessionTokenRef.current;
    updateEmployeeRequestRef.current = updateRequest;
    setEditEmployeeError("");
    setEditEmployeeLoading(true);

    try {
      await updateEmployee(editEmployee.id, {
        firstName: editEmployeeForm.firstName,
        lastName: editEmployeeForm.lastName,
        position: editEmployeeForm.position,
        salary: editEmployeeForm.salary,
        restaurantId: editEmployeeForm.restaurantId,
        isActive: editEmployeeForm.isActive,
      });

      if (
        sessionTokenRef.current !== requestToken ||
        updateEmployeeRequestRef.current !== updateRequest
      ) return;

      setEditEmployee(null);
      setEditEmployeeForm({
        firstName: "",
        lastName: "",
        position: "",
        salary: 0,
        restaurantId: "",
        isActive: true,
      });
      setEditEmployeeError("");

      employeesRequestGenerationRef.current += 1;
      setEmployeesLoading(true);
      setEmployeesRefreshKey((value) => value + 1);
    } catch (err) {
      if (
        sessionTokenRef.current !== requestToken ||
        updateEmployeeRequestRef.current !== updateRequest
      ) return;

      setEditEmployeeError(err.message || "Не удалось изменить сотрудника");
    } finally {
      const currentUpdateIsCurrent =
        sessionTokenRef.current === requestToken &&
        updateEmployeeRequestRef.current === updateRequest;

      if (currentUpdateIsCurrent) {
        updateEmployeeRequestRef.current = null;
        setEditEmployeeLoading(false);
      }
    }
  };

  const openDeleteEmployee = (employee) => {
    if (!permissions.canDelete || !sessionTokenRef.current || deleteEmployeeRequestRef.current !== null) return;
    setDeleteEmployeeError("");
    setEmployeeToDelete({ id: employee.id, firstName: employee.firstName, lastName: employee.lastName });
  };

  const closeDeleteEmployee = () => {
    if (deleteEmployeeRequestRef.current !== null) return;
    setEmployeeToDelete(null);
    setDeleteEmployeeError("");
  };

  const handleDeleteEmployee = async () => {
    if (!permissions.canDelete || !sessionTokenRef.current || !employeeToDelete || deleteEmployeeRequestRef.current !== null) return;
    const employee = employeeToDelete;

    const deleteRequest = Symbol("deleteEmployee");
    deleteEmployeeRequestRef.current = deleteRequest;
    const requestToken = sessionTokenRef.current;
    setDeleteEmployeeError("");
    setDeleteEmployeeLoading(employee.id);

    try {
      await deleteEmployee(employee.id);
      if (
        sessionTokenRef.current !== requestToken ||
        deleteEmployeeRequestRef.current !== deleteRequest
      ) return;

      setEmployeeToDelete(null);
      setDeleteEmployeeError("");
      employeesRequestGenerationRef.current += 1;
      setEmployeesLoading(true);
      setEmployeesRefreshKey((value) => value + 1);
    } catch (err) {
      if (
        sessionTokenRef.current !== requestToken ||
        deleteEmployeeRequestRef.current !== deleteRequest
      ) return;
      setDeleteEmployeeError(err.message || "Не удалось удалить сотрудника");
    } finally {
      const currentDeleteIsCurrent =
        sessionTokenRef.current === requestToken &&
        deleteEmployeeRequestRef.current === deleteRequest;

      if (currentDeleteIsCurrent) {
        deleteEmployeeRequestRef.current = null;
        setDeleteEmployeeLoading(null);
      }
    }
  };

  const closeEditUser = () => {
    setEditUser(null);
    setEditUserError("");
    setEditUserForm({
      username: "",
      email: "",
      isActive: true,
      role: ROLES.ADMINISTRATOR,
      password: "",
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
    const requestToken = sessionTokenRef.current;

    setEditUserError("");
    setEditUserLoading(true);

    try {
      await updateUser(editUser.id, {
        username: editUserForm.username,
        email: editUserForm.email,
        isActive: editUserForm.isActive,
        role: editUserForm.role,
        password: editUserForm.password || null,
      });
      if (sessionTokenRef.current !== requestToken) return;

      if (editUser.id === currentUser.id) {
        const updatedSession = saveSession({
          token: session.token,
          user: {
            ...currentUser,
            username: editUserForm.username.trim(),
            email: editUserForm.email.trim(),
            isActive: editUserForm.isActive,
          },
        });
        setSession(updatedSession);
      }

      closeEditUser();
      await loadUsers();
    } catch (err) {
      if (sessionTokenRef.current !== requestToken) return;
      setEditUserError(err.message || "Не удалось изменить пользователя");
    } finally {
      if (sessionTokenRef.current === requestToken) {
        setEditUserLoading(false);
      }
    }
  };

  const handleRestaurantsSearchChange = (value) => {
    restaurantsRequestGenerationRef.current += 1;
    restaurantsSearchChangePendingRef.current = true;
    setRestaurantsSearchInput(value);
  };

  const handleRestaurantsSortByChange = (value) => {
    restaurantsRequestGenerationRef.current += 1;
    setRestaurantsPage(1);
    setRestaurantsSortBy(value);
    setRestaurantsLoading(true);
    setRestaurantsError(null);
  };

  const handleRestaurantsSortDirectionChange = () => {
    restaurantsRequestGenerationRef.current += 1;
    setRestaurantsPage(1);
    setRestaurantsSortDirection((value) => value === "asc" ? "desc" : "asc");
    setRestaurantsLoading(true);
    setRestaurantsError(null);
  };

  const handleRestaurantsPageChange = (value) => {
    restaurantsRequestGenerationRef.current += 1;
    setRestaurantsPage(Math.max(1, value));
    setRestaurantsLoading(true);
    setRestaurantsError(null);
  };

  const handleRestaurantsPageSizeChange = (value) => {
    restaurantsRequestGenerationRef.current += 1;
    setRestaurantsPage(1);
    setRestaurantsPageSize(value);
    setRestaurantsLoading(true);
    setRestaurantsError(null);
  };

  const handleEmployeesSearchChange = (value) => {
    employeesRequestGenerationRef.current += 1;
    employeesSearchChangePendingRef.current = true;
    setEmployeesSearchInput(value);
  };

  const handleEmployeesSortByChange = (value) => {
    employeesRequestGenerationRef.current += 1;
    setEmployeesPage(1);
    setEmployeesSortBy(value);
    setEmployeesLoading(true);
    setEmployeesError(null);
  };

  const handleEmployeesSortDirectionChange = () => {
    employeesRequestGenerationRef.current += 1;
    setEmployeesPage(1);
    setEmployeesSortDirection((value) => value === "asc" ? "desc" : "asc");
    setEmployeesLoading(true);
    setEmployeesError(null);
  };

  const handleEmployeesPageChange = (value) => {
    employeesRequestGenerationRef.current += 1;
    setEmployeesPage(Math.max(1, value));
    setEmployeesLoading(true);
    setEmployeesError(null);
  };

  const handleEmployeesPageSizeChange = (value) => {
    employeesRequestGenerationRef.current += 1;
    setEmployeesPage(1);
    setEmployeesPageSize(value);
    setEmployeesLoading(true);
    setEmployeesError(null);
  };

  const handleRetryRestaurantOptions = () => {
    if (restaurantOptionsLoading) return;

    restaurantOptionsRequestGenerationRef.current += 1;
    setRestaurantOptionsError(null);
    setRestaurantOptionsLoading(true);
    setRestaurantOptionsRetrying(true);
    setRestaurantOptionsRefreshKey((value) => value + 1);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextSearch = restaurantsSearchInput.trim();
      if (nextSearch === restaurantsDebouncedSearch) {
        if (restaurantsSearchChangePendingRef.current) {
          restaurantsSearchChangePendingRef.current = false;
          restaurantsRequestGenerationRef.current += 1;
          setRestaurantsLoading(true);
          setRestaurantsError(null);
          setRestaurantsRefreshKey((value) => value + 1);
        }
        return;
      }

      restaurantsSearchChangePendingRef.current = false;
      restaurantsRequestGenerationRef.current += 1;
      setRestaurantsPage(1);
      setRestaurantsDebouncedSearch(nextSearch);
      setRestaurantsLoading(true);
      setRestaurantsError(null);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [restaurantsSearchInput, restaurantsDebouncedSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextSearch = employeesSearchInput.trim();
      if (nextSearch === employeesDebouncedSearch) {
        if (employeesSearchChangePendingRef.current) {
          employeesSearchChangePendingRef.current = false;
          employeesRequestGenerationRef.current += 1;
          setEmployeesLoading(true);
          setEmployeesError(null);
          setEmployeesRefreshKey((value) => value + 1);
        }
        return;
      }

      employeesSearchChangePendingRef.current = false;
      employeesRequestGenerationRef.current += 1;
      setEmployeesPage(1);
      setEmployeesDebouncedSearch(nextSearch);
      setEmployeesLoading(true);
      setEmployeesError(null);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [employeesSearchInput, employeesDebouncedSearch]);

  useEffect(() => setUnauthorizedHandler(() => {
    setRestaurantToDelete(null);
    setEmployeeToDelete(null);
    setDeleteRestaurantError("");
    setDeleteEmployeeError("");
    sessionTokenRef.current = null;
    restaurantsRequestGenerationRef.current += 1;
    employeesRequestGenerationRef.current += 1;
    restaurantOptionsRequestGenerationRef.current += 1;
    restaurantsSearchChangePendingRef.current = false;
    employeesSearchChangePendingRef.current = false;
    deleteRestaurantRequestRef.current = null;
    deleteEmployeeRequestRef.current = null;
    updateRestaurantRequestRef.current = null;
    updateEmployeeRequestRef.current = null;
    setSession(null);
    setUsers([]);
    setUsersLoading(false);
    setRestaurants([]);
    setRestaurantsTotalCount(0);
    setRestaurantsPage(1);
    setRestaurantsPageSize(20);
    setRestaurantsSearchInput("");
    setRestaurantsDebouncedSearch("");
    setRestaurantsSortBy("createdAt");
    setRestaurantsSortDirection("asc");
    setRestaurantsLoading(false);
    setRestaurantsError(null);
    setEmployees([]);
    setEmployeesTotalCount(0);
    setEmployeesPage(1);
    setEmployeesPageSize(20);
    setEmployeesSearchInput("");
    setEmployeesDebouncedSearch("");
    setEmployeesSortBy("lastName");
    setEmployeesSortDirection("asc");
    setEmployeesLoading(false);
    setEmployeesError(null);
    setAllRestaurantOptions([]);
    setRestaurantOptions([]);
    setRestaurantOptionsLoading(false);
    setRestaurantOptionsError(null);
    setRestaurantOptionsRetrying(false);
    setCreateUserLoading(false);
    setDeleteUserLoading(null);
    setEditUserLoading(false);
    setCreateRestaurantLoading(false);
    setDeleteRestaurantLoading(null);
    setEditRestaurantLoading(false);
    setCreateEmployeeLoading(false);
    setDeleteEmployeeLoading(null);
    setEditEmployeeLoading(false);
    setEditUser(null);
    setEditRestaurant(null);
    setEditRestaurantForm({ name: "", city: "", isActive: true });
    setEditRestaurantError("");
    setEditEmployee(null);
    setEditEmployeeForm({
      firstName: "",
      lastName: "",
      position: "",
      salary: 0,
      restaurantId: "",
      isActive: true,
    });
    setEditEmployeeError("");
    setPassword("");
    navigate("/login", { replace: true });
  }), [navigate]);

  useEffect(() => {
    if (!loggedIn) return;
    loadUsers(session.token);
  }, [loggedIn, session?.token]);

  useEffect(() => {
    const requestToken = session?.token;
    if (!requestToken) return;

    const requestGeneration = ++restaurantsRequestGenerationRef.current;
    const controller = new AbortController();
    let active = true;

    getRestaurants({
      search: restaurantsDebouncedSearch,
      page: restaurantsPage,
      pageSize: restaurantsPageSize,
      sortBy: restaurantsSortBy,
      sortDirection: restaurantsSortDirection,
      signal: controller.signal,
    }).then((result) => {
      if (
        !active ||
        sessionTokenRef.current !== requestToken ||
        restaurantsRequestGenerationRef.current !== requestGeneration
      ) return;

      const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
      if (result.page > totalPages || restaurantsPage > totalPages) {
        restaurantsRequestGenerationRef.current += 1;
        setRestaurantsTotalCount(result.totalCount);
        setRestaurantsPageSize(result.pageSize);
        setRestaurantsPage(Math.max(1, totalPages));
        setRestaurantsLoading(true);
        setRestaurantsError(null);
        return;
      }

      setRestaurants(result.items);
      setRestaurantsTotalCount(result.totalCount);
      setRestaurantsError(null);
      setRestaurantsPage(result.page);
      setRestaurantsPageSize(result.pageSize);
    }).catch((err) => {
      if (
        err?.name === "AbortError" ||
        !active ||
        sessionTokenRef.current !== requestToken ||
        restaurantsRequestGenerationRef.current !== requestGeneration
      ) return;
      setRestaurantsError(err.message || "Не удалось загрузить рестораны");
    }).finally(() => {
      if (
        active &&
        sessionTokenRef.current === requestToken &&
        restaurantsRequestGenerationRef.current === requestGeneration
      ) {
        setRestaurantsLoading(false);
      }
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [session?.token, restaurantsDebouncedSearch, restaurantsPage, restaurantsPageSize, restaurantsSortBy, restaurantsSortDirection, restaurantsRefreshKey]);

  useEffect(() => {
    const requestToken = session?.token;
    if (!requestToken) return;

    const requestGeneration = ++employeesRequestGenerationRef.current;
    const controller = new AbortController();
    let active = true;

    getEmployees({
      search: employeesDebouncedSearch,
      page: employeesPage,
      pageSize: employeesPageSize,
      sortBy: employeesSortBy,
      sortDirection: employeesSortDirection,
      signal: controller.signal,
    }).then((result) => {
      if (
        !active ||
        sessionTokenRef.current !== requestToken ||
        employeesRequestGenerationRef.current !== requestGeneration
      ) return;

      const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
      if (result.page > totalPages || employeesPage > totalPages) {
        employeesRequestGenerationRef.current += 1;
        setEmployeesTotalCount(result.totalCount);
        setEmployeesPageSize(result.pageSize);
        setEmployeesPage(Math.max(1, totalPages));
        setEmployeesLoading(true);
        setEmployeesError(null);
        return;
      }

      setEmployees(result.items);
      setEmployeesTotalCount(result.totalCount);
      setEmployeesError(null);
      setEmployeesPage(result.page);
      setEmployeesPageSize(result.pageSize);
    }).catch((err) => {
      if (
        err?.name === "AbortError" ||
        !active ||
        sessionTokenRef.current !== requestToken ||
        employeesRequestGenerationRef.current !== requestGeneration
      ) return;
      setEmployeesError(err.message || "Не удалось загрузить сотрудников");
    }).finally(() => {
      if (
        active &&
        sessionTokenRef.current === requestToken &&
        employeesRequestGenerationRef.current === requestGeneration
      ) {
        setEmployeesLoading(false);
      }
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [session?.token, employeesDebouncedSearch, employeesPage, employeesPageSize, employeesSortBy, employeesSortDirection, employeesRefreshKey]);

  useEffect(() => {
    const requestToken = session?.token;
    if (!requestToken || !permissions.canCreate) return;

    const requestGeneration = ++restaurantOptionsRequestGenerationRef.current;
    const controller = new AbortController();
    let active = true;

    const loadRestaurantOptions = async () => {
      const restaurantsById = new Map();
      let lookupPage = 1;
      let totalCount;

      do {
        const result = await getRestaurants({
          page: lookupPage,
          pageSize: 100,
          sortBy: "name",
          sortDirection: "asc",
          signal: controller.signal,
        });

        if (
          !active ||
          sessionTokenRef.current !== requestToken ||
          restaurantOptionsRequestGenerationRef.current !== requestGeneration
        ) return;

        result.items.forEach((restaurant) => {
          restaurantsById.set(restaurant.id, restaurant);
        });
        totalCount = result.totalCount;
        lookupPage += 1;

        if (result.items.length === 0) break;
      } while (restaurantsById.size < totalCount);

      if (
        !active ||
        sessionTokenRef.current !== requestToken ||
        restaurantOptionsRequestGenerationRef.current !== requestGeneration
      ) return;

      const allOptions = Array.from(restaurantsById.values());
      const activeRestaurantOptions = allOptions.filter((restaurant) => restaurant.isActive);

      setAllRestaurantOptions(allOptions);
      setRestaurantOptions(activeRestaurantOptions);
      setCreateEmployeeForm((currentForm) => {
        if (
          !currentForm.restaurantId ||
          activeRestaurantOptions.some((restaurant) => restaurant.id === currentForm.restaurantId)
        ) {
          return currentForm;
        }

        return { ...currentForm, restaurantId: "" };
      });
      setRestaurantOptionsError(null);
    };

    loadRestaurantOptions().catch((err) => {
      if (
        err?.name === "AbortError" ||
        !active ||
        sessionTokenRef.current !== requestToken ||
        restaurantOptionsRequestGenerationRef.current !== requestGeneration
      ) return;
      setRestaurantOptionsError(err.message || "Не удалось загрузить список ресторанов");
    }).finally(() => {
      if (
        active &&
        sessionTokenRef.current === requestToken &&
        restaurantOptionsRequestGenerationRef.current === requestGeneration
      ) {
        setRestaurantOptionsLoading(false);
        setRestaurantOptionsRetrying(false);
      }
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [session?.token, permissions.canCreate, restaurantOptionsRefreshKey]);

  const handleLogout = () => {
    setRestaurantToDelete(null);
    setEmployeeToDelete(null);
    sessionTokenRef.current = null;
    restaurantsRequestGenerationRef.current += 1;
    employeesRequestGenerationRef.current += 1;
    restaurantOptionsRequestGenerationRef.current += 1;
    restaurantsSearchChangePendingRef.current = false;
    employeesSearchChangePendingRef.current = false;
    deleteRestaurantRequestRef.current = null;
    deleteEmployeeRequestRef.current = null;
    updateRestaurantRequestRef.current = null;
    updateEmployeeRequestRef.current = null;
    clearSession();
    setSession(null);
    setUsers([]);
    setUsersLoading(false);
    setRestaurants([]);
    setRestaurantsTotalCount(0);
    setRestaurantsPage(1);
    setRestaurantsPageSize(20);
    setRestaurantsSearchInput("");
    setRestaurantsDebouncedSearch("");
    setRestaurantsSortBy("createdAt");
    setRestaurantsSortDirection("asc");
    setRestaurantsLoading(false);
    setRestaurantsError(null);
    setEmployees([]);
    setEmployeesTotalCount(0);
    setEmployeesPage(1);
    setEmployeesPageSize(20);
    setEmployeesSearchInput("");
    setEmployeesDebouncedSearch("");
    setEmployeesSortBy("lastName");
    setEmployeesSortDirection("asc");
    setEmployeesLoading(false);
    setEmployeesError(null);
    setAllRestaurantOptions([]);
    setRestaurantOptions([]);
    setRestaurantOptionsLoading(false);
    setRestaurantOptionsError(null);
    setRestaurantOptionsRetrying(false);
    setCreateUserLoading(false);
    setCreateRestaurantLoading(false);
    setCreateEmployeeLoading(false);
    setEditRestaurantLoading(false);
    setEditEmployeeLoading(false);
    setUsername("");
    setPassword("");
    setDeleteUserLoading(null);
    setDeleteUserError("");
    setDeleteRestaurantLoading(null);
    setDeleteRestaurantError("");
    setDeleteEmployeeLoading(null);
    setDeleteEmployeeError("");
    setEditRestaurant(null);
    setEditRestaurantForm({ name: "", city: "", isActive: true });
    setEditRestaurantError("");
    setEditEmployee(null);
    setEditEmployeeForm({
      firstName: "",
      lastName: "",
      position: "",
      salary: 0,
      restaurantId: "",
      isActive: true,
    });
    setEditEmployeeError("");
    setEditUser(null);
    setEditUserForm({
      username: "",
      email: "",
      isActive: true,
      role: ROLES.ADMINISTRATOR,
      password: "",
    });
    setEditUserLoading(false);
    setEditUserError("");
    setCreateUserForm({
      username: "",
      email: "",
      password: "",
      role: ROLES.ADMINISTRATOR,
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
    navigate("/login", { replace: true });
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
            Добро пожаловать, <span style={{ color: "#e6eef8", fontWeight: 600 }}>{currentUser.username}</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <Routes>
            <Route
              path="/"
              element={<DashboardPage stats={stats} username={currentUser.username} />}
            />
            <Route
              path="/users"
              element={
                <UsersPage
                  users={users}
                  usersLoading={usersLoading}
                  usersError={usersError}
                  currentUserId={currentUser.id}
                  permissions={permissions}
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
                  totalCount={restaurantsTotalCount}
                  page={restaurantsPage}
                  pageSize={restaurantsPageSize}
                  searchInput={restaurantsSearchInput}
                  sortBy={restaurantsSortBy}
                  sortDirection={restaurantsSortDirection}
                  onSearchChange={handleRestaurantsSearchChange}
                  onSortByChange={handleRestaurantsSortByChange}
                  onSortDirectionChange={handleRestaurantsSortDirectionChange}
                  onPageChange={handleRestaurantsPageChange}
                  onPageSizeChange={handleRestaurantsPageSizeChange}
                  createRestaurantForm={createRestaurantForm}
                  onCreateRestaurantFieldChange={handleCreateRestaurantFieldChange}
                  onCreateRestaurant={handleCreateRestaurant}
                  createRestaurantLoading={createRestaurantLoading}
                  createRestaurantError={createRestaurantError}
                  createRestaurantSuccess={createRestaurantSuccess}
                  onDeleteRestaurant={openDeleteRestaurant}
                  restaurantToDelete={restaurantToDelete}
                  onConfirmDeleteRestaurant={handleDeleteRestaurant}
                  onCloseDeleteRestaurant={closeDeleteRestaurant}
                  deleteRestaurantLoadingId={deleteRestaurantLoading}
                  deleteRestaurantError={deleteRestaurantError}
                  editRestaurant={editRestaurant}
                  editRestaurantForm={editRestaurantForm}
                  onEditRestaurant={openEditRestaurant}
                  onEditRestaurantFieldChange={handleEditRestaurantFieldChange}
                  onEditRestaurantSubmit={handleEditRestaurantSubmit}
                  onCloseEditRestaurant={closeEditRestaurant}
                  editRestaurantLoading={editRestaurantLoading}
                  editRestaurantError={editRestaurantError}
                  permissions={permissions}
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
                  totalCount={employeesTotalCount}
                  page={employeesPage}
                  pageSize={employeesPageSize}
                  searchInput={employeesSearchInput}
                  sortBy={employeesSortBy}
                  sortDirection={employeesSortDirection}
                  onSearchChange={handleEmployeesSearchChange}
                  onSortByChange={handleEmployeesSortByChange}
                  onSortDirectionChange={handleEmployeesSortDirectionChange}
                  onPageChange={handleEmployeesPageChange}
                  onPageSizeChange={handleEmployeesPageSizeChange}
                  createEmployeeForm={createEmployeeForm}
                  onCreateEmployeeFieldChange={handleCreateEmployeeFieldChange}
                  onCreateEmployee={handleCreateEmployee}
                  createEmployeeLoading={createEmployeeLoading}
                  createEmployeeError={createEmployeeError}
                  createEmployeeSuccess={createEmployeeSuccess}
                  onDeleteEmployee={openDeleteEmployee}
                  employeeToDelete={employeeToDelete}
                  onConfirmDeleteEmployee={handleDeleteEmployee}
                  onCloseDeleteEmployee={closeDeleteEmployee}
                  deleteEmployeeLoadingId={deleteEmployeeLoading}
                  deleteEmployeeError={deleteEmployeeError}
                  restaurantOptions={restaurantOptions}
                  restaurantOptionsLoading={restaurantOptionsLoading}
                  restaurantOptionsError={restaurantOptionsError}
                  restaurantOptionsRetrying={restaurantOptionsRetrying}
                  onRetryRestaurantOptions={handleRetryRestaurantOptions}
                  editEmployee={editEmployee}
                  editEmployeeForm={editEmployeeForm}
                  editEmployeeRestaurantOptions={editEmployeeRestaurantOptions}
                  editEmployeeRestaurantError={editEmployeeRestaurantError}
                  onEditEmployee={openEditEmployee}
                  onEditEmployeeFieldChange={handleEditEmployeeFieldChange}
                  onEditEmployeeSubmit={handleEditEmployeeSubmit}
                  onCloseEditEmployee={closeEditEmployee}
                  editEmployeeLoading={editEmployeeLoading}
                  editEmployeeError={editEmployeeError}
                  permissions={permissions}
                />
              }
            />
            <Route
              path="/settings"
              element={<SettingsPage username={currentUser.username} />}
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
