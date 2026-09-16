import React, { useRef } from "react";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import CreateEmployeeForm from "../components/CreateEmployeeForm";
import EmployeesTable from "../components/EmployeesTable";
import Modal from "../components/Modal";
import PaginationControls from "../components/PaginationControls";

function EmployeesPage({
  employees,
  employeesLoading,
  employeesError,
  totalCount,
  page,
  pageSize,
  searchInput,
  sortBy,
  sortDirection,
  onSearchChange,
  onSortByChange,
  onSortDirectionChange,
  onPageChange,
  onPageSizeChange,
  createEmployeeForm,
  onCreateEmployeeFieldChange,
  onCreateEmployee,
  createEmployeeLoading,
  createEmployeeError,
  createEmployeeSuccess,
  onDeleteEmployee,
  employeeToDelete,
  onConfirmDeleteEmployee,
  onCloseDeleteEmployee,
  deleteEmployeeLoadingId,
  deleteEmployeeError,
  restaurantOptions,
  restaurantOptionsLoading,
  restaurantOptionsError,
  restaurantOptionsRetrying,
  onRetryRestaurantOptions,
  editEmployee,
  editEmployeeForm,
  editEmployeeRestaurantOptions,
  editEmployeeRestaurantError,
  onEditEmployee,
  onEditEmployeeFieldChange,
  onEditEmployeeSubmit,
  onCloseEditEmployee,
  editEmployeeLoading,
  editEmployeeError,
  permissions,
}) {
  const deleteTriggerRef = useRef(null);
  const listFocusRef = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {permissions.canCreate && (
        <CreateEmployeeForm
          formData={createEmployeeForm}
          onFieldChange={onCreateEmployeeFieldChange}
          onSubmit={onCreateEmployee}
          loading={createEmployeeLoading}
          error={createEmployeeError}
          success={createEmployeeSuccess}
          restaurants={restaurantOptions}
          restaurantsLoading={restaurantOptionsLoading}
          restaurantsError={restaurantOptionsError}
          restaurantsRetrying={restaurantOptionsRetrying}
          onRetryRestaurants={onRetryRestaurantOptions}
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
          <h3 style={{ color: "#e6eef8", margin: 0, fontSize: 20 }}>Сотрудники</h3>
          <p style={{ color: "#9ca3af", margin: "8px 0 0 0", fontSize: 14 }}>
            Управляйте сотрудниками и их распределением по ресторанам.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <label style={{ flex: "1 1 260px", color: "#9ca3af", fontSize: 13 }}>
            Поиск
            <input
              ref={listFocusRef}
              type="search"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Имя, должность или ресторан"
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0f172a",
                color: "#e6eef8",
                padding: "10px 12px",
              }}
            />
          </label>

          <label style={{ color: "#9ca3af", fontSize: 13 }}>
            Сортировка
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              style={{
                display: "block",
                marginTop: 6,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0f172a",
                color: "#e6eef8",
                padding: "10px 12px",
              }}
            >
              <option value="firstName">Имя</option>
              <option value="lastName">Фамилия</option>
              <option value="position">Должность</option>
              <option value="salary">Зарплата</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onSortDirectionChange}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "10px 14px",
              background: "#0f172a",
              color: "#e6eef8",
              cursor: "pointer",
            }}
          >
            {sortDirection === "asc" ? "По возрастанию ↑" : "По убыванию ↓"}
          </button>
        </div>

        <EmployeesTable
          employees={employees}
          loading={employeesLoading}
          error={employeesError}
          onEditEmployee={onEditEmployee}
          onDeleteEmployee={(record, trigger) => {
            deleteTriggerRef.current = trigger;
            onDeleteEmployee(record);
          }}
          deleteLoadingId={deleteEmployeeLoadingId}
          canEdit={permissions.canEditEmployees}
          canDelete={permissions.canDelete}
        />

        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          loading={employeesLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      {employeeToDelete && (
        <ConfirmDeleteDialog
          title="Удаление сотрудника"
          name={`${employeeToDelete.firstName} ${employeeToDelete.lastName}`}
          loading={deleteEmployeeLoadingId !== null}
          error={deleteEmployeeError}
          onConfirm={onConfirmDeleteEmployee}
          onClose={onCloseDeleteEmployee}
          returnFocusRef={deleteTriggerRef}
          fallbackFocusRef={listFocusRef}
        />
      )}

      {editEmployee && (
        <Modal
          title="Изменение сотрудника"
          loading={editEmployeeLoading}
          onClose={onCloseEditEmployee}
        >
          <CreateEmployeeForm
            mode="edit"
            embedded
            formData={editEmployeeForm}
            onFieldChange={onEditEmployeeFieldChange}
            onSubmit={onEditEmployeeSubmit}
            onCancel={onCloseEditEmployee}
            loading={editEmployeeLoading}
            error={editEmployeeError}
            restaurants={editEmployeeRestaurantOptions}
            restaurantsLoading={restaurantOptionsLoading}
            restaurantsError={editEmployeeRestaurantError}
            restaurantsRetrying={restaurantOptionsRetrying}
            onRetryRestaurants={onRetryRestaurantOptions}
            currentRestaurantId={editEmployee.restaurantId}
          />
        </Modal>
      )}
    </div>
  );
}

export default EmployeesPage;
